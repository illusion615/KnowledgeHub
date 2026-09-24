#!/usr/bin/env python3
"""Local, shared feedback inbox. Does not read chats, edit rules, or merge code."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import uuid
from datetime import datetime, timezone


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], text=True).strip()


def store(root):
    return Path(git(root, 'rev-parse', '--path-format=absolute', '--git-common-dir')) / 'workflow-feedback'


def stamp():
    return datetime.now(timezone.utc).isoformat()


def save(path, value, exclusive=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, prefix='.write-')
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(value, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        if exclusive:
            os.link(name, path)
        else:
            os.replace(name, path)
    finally:
        Path(name).unlink(missing_ok=True)


def pending(base):
    return [p for p in sorted((base / 'inbox').glob('*.json'))
            if not (base / 'decisions' / p.name).exists()]


def require_owner(base, owner):
    if not owner or (base / 'lock' / 'owner').read_text().strip() != owner:
        raise ValueError('Lock owner mismatch; do not clear another process/session lock')


def submit(root, payload):
    if not isinstance(payload, dict):
        raise ValueError('Expected JSON object')
    required = ('quote', 'problem', 'proposal', 'scope', 'evidence')
    for key in required:
        if not isinstance(payload.get(key), str) or not payload[key].strip():
            raise ValueError('Missing text field: ' + key)
        if len(payload[key]) > 5000:
            raise ValueError('Field too large: ' + key)
    # Bound the entire entry; never accept binary screenshots or full transcripts.
    if len(json.dumps(payload).encode()) > 40000:
        raise ValueError('Entry too large; submit a short summary, not a transcript')
    source = git(root, 'rev-parse', '--show-toplevel')
    content = {key: payload[key] for key in required}
    key = hashlib.sha256(json.dumps([source, content], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:24]
    entry = dict(content, id=key, source=source, branch=git(root, 'branch', '--show-current'),
                 base=git(root, 'rev-parse', 'HEAD'), created_at=stamp())
    try:
        save(store(root) / 'inbox' / (key + '.json'), entry, exclusive=True)
        return key, True
    except FileExistsError:
        return key, False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', default='.')
    sub = parser.add_subparsers(dest='action', required=True)
    cmd = sub.add_parser('submit')
    cmd.add_argument('--file', required=True, help='Short JSON entry, or - for stdin')
    cmd.add_argument('--no-wake', action='store_true')
    sub.add_parser('precheck')
    sub.add_parser('list')
    sub.add_parser('acquire')
    cmd = sub.add_parser('release'); cmd.add_argument('--owner', required=True)
    cmd = sub.add_parser('decide')
    cmd.add_argument('--owner', required=True)
    cmd.add_argument('--id', required=True)
    cmd.add_argument('--status', required=True, choices=['applied', 'article-only', 'duplicate', 'needs-confirmation', 'blocked', 'rejected'])
    cmd.add_argument('--evidence', required=True, help='Decision reason, test/commit and per-worktree sync evidence')
    args = parser.parse_args()
    root = Path(args.root).resolve()
    base = store(root)
    if args.action == 'submit':
        text = sys.stdin.read(40001) if args.file == '-' else Path(args.file).read_text()
        if len(text.encode()) > 40000: raise ValueError('Entry too large')
        key, created = submit(root, json.loads(text))
        print(json.dumps({'id': key, 'created': created, 'durable': True}))
        config = base / 'runtime.json'
        if created and not args.no_wake and config.exists() and not (base / 'lock').exists():
            runtime = json.loads(config.read_text())
            try:
                result = subprocess.run([runtime['orca'], 'automations', 'run', runtime['automation'], '--json'],
                                        capture_output=True, text=True, timeout=20)
                # This is only a dispatch receipt, not processing evidence.
                print(json.dumps({'wake_requested': True, 'cli_exit': result.returncode}))
            except (OSError, subprocess.TimeoutExpired):
                print(json.dumps({'wake_requested': False, 'fallback': 'scheduled precheck'}))
    elif args.action == 'precheck':
        return 0 if pending(base) and not (base / 'lock').exists() else 1
    elif args.action == 'list':
        print(json.dumps({'locked': (base / 'lock').exists(), 'pending': [json.loads(p.read_text()) for p in pending(base)[:20]],
                          'pending_count': len(pending(base))}, ensure_ascii=False, indent=2))
    elif args.action == 'acquire':
        base.mkdir(parents=True, exist_ok=True)
        lock = base / 'lock'
        lock.mkdir()  # Atomic single-writer claim. A stale lock is never auto-stolen.
        owner = uuid.uuid4().hex
        (lock / 'owner').write_text(owner)
        print(owner)
    elif args.action == 'release':
        require_owner(base, args.owner)
        (base / 'lock' / 'owner').unlink()
        (base / 'lock').rmdir()
    elif args.action == 'decide':
        require_owner(base, args.owner)
        if len(args.id) != 24 or any(c not in '0123456789abcdef' for c in args.id):
            raise ValueError('Invalid id')
        if not (base / 'inbox' / (args.id + '.json')).is_file():
            raise ValueError('Unknown entry')
        if not args.evidence.strip(): raise ValueError('Decision evidence is required')
        save(base / 'decisions' / (args.id + '.json'), dict(id=args.id, status=args.status,
             evidence=args.evidence, at=stamp()), exclusive=True)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, subprocess.CalledProcessError) as e:
        print('STOP:', str(e), file=sys.stderr)
        sys.exit(2)

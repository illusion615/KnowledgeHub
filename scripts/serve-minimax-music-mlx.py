#!/usr/bin/env python3
"""Loopback-only HTTP service (127.0.0.1:18790) for local MiniMax-Music3-mxfp8 MLX."""
from __future__ import annotations

import argparse
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import signal
import tempfile
import threading
from urllib.parse import urlsplit

from minimax_music_mlx.engine import (
    DEFAULT_CACHE_ROOT,
    DEFAULT_MODEL_ID,
    DEFAULT_OUTPUT_DIR,
    MiniMaxMusicEngine,
    ensure_mlx_runtime,
    parse_json,
)

DEFAULT_PORT = 18790
STATE_DIR = Path.home() / '.cache/study-room/minimax-music3-mlx'
TOKEN_HEADER = 'X-MiniMax-Music-Token'


def write_connection(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_symlink():
        raise ValueError('Connection file must not be a symlink')
    fd, temporary = tempfile.mkstemp(prefix='.connection-', dir=path.parent)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            json.dump(data, handle)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def _valid_token(supplied: str, expected: str | None) -> bool:
    if expected is None:
        return True
    return bool(re.fullmatch(r'[a-f0-9]{64}', supplied)) and hmac.compare_digest(supplied, expected)


def _read_json_payload(handler: BaseHTTPRequestHandler):
    try:
        length = int(handler.headers.get('Content-Length', '0'))
    except ValueError:
        return None, (400, {'error': {'code': 'invalid_content_length'}})
    if not 0 < length <= 65536:
        return None, (413, {'error': {'code': 'body_too_large'}})
    try:
        return parse_json(handler.rfile.read(length).decode('utf-8')), None
    except (ValueError, TypeError, UnicodeError, RecursionError):
        return None, (400, {'error': {'code': 'local_invalid_input'}})


def _run_gated_generation(engine, gate: threading.Lock, payload: dict):
    if not gate.acquire(blocking=False):
        return 429, {'error': {'code': 'busy'}}
    try:
        return 200, engine.generate(payload)
    except ValueError as exc:
        return 400, {'error': {'code': 'invalid_generation_request', 'message': str(exc)}}
    except Exception as exc:
        print(json.dumps({'event': 'generation_failed', 'error_type': type(exc).__name__}), flush=True)
        return 500, {'error': {'code': 'local_generation_failed'}}
    finally:
        gate.release()


def _handle_get_request(handler, engine, token: str | None):
    if not handler.trusted_host():
        return 403, {'error': {'code': 'invalid_host'}}
    if urlsplit(handler.path).path != '/api/health':
        return 404, {'error': {'code': 'not_found'}}
    body = {
        **engine.health(),
        'auth_required': token is not None,
        'limits': {'max_calls_per_minute': None, 'max_concurrent_generations': 1},
    }
    return 200, body


def _handle_post_request(handler, engine, gate: threading.Lock, token: str | None, token_header: str):
    if not handler.trusted_host():
        return 403, {'error': {'code': 'invalid_host'}}
    if handler.headers.get('Origin'):
        return 403, {'error': {'code': 'use_local_backend'}}
    if urlsplit(handler.path).path != '/api/generate':
        return 404, {'error': {'code': 'not_found'}}
    if not _valid_token(handler.headers.get(token_header, ''), token):
        return 401, {'error': {'code': 'local_auth_failed'}}
    if handler.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
        return 415, {'error': {'code': 'json_required'}}
    payload, body_error = _read_json_payload(handler)
    if body_error is not None:
        return body_error
    return _run_gated_generation(engine, gate, payload)


def create_server(
    engine,
    port: int = DEFAULT_PORT,
    token: str | None = None,
    *,
    token_header: str = TOKEN_HEADER,
) -> ThreadingHTTPServer:
    gate = threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            super().setup()
            self.connection.settimeout(30)

        def trusted_host(self) -> bool:
            actual = self.server.server_address[1]
            return self.headers.get('Host') in (f'127.0.0.1:{actual}', f'localhost:{actual}')

        def respond(self, status: int, payload: dict) -> None:
            body = json.dumps(payload, allow_nan=False).encode('utf-8')
            try:
                self.send_response(status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def do_GET(self):
            status, payload = _handle_get_request(self, engine, token)
            self.respond(status, payload)

        def do_POST(self):
            status, payload = _handle_post_request(self, engine, gate, token, token_header)
            self.respond(status, payload)

        def do_OPTIONS(self):
            self.respond(405, {'error': {'code': 'cross_origin_not_supported'}})

        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    server.daemon_threads = True
    return server


def _prepare_connection_path(connection: Path) -> None:
    if connection.is_symlink():
        raise ValueError('Connection file must not be a symlink')
    if not connection.exists():
        return
    existing = parse_json(connection.read_text(encoding='utf-8'))
    try:
        os.kill(int(existing['pid']), 0)
    except (ProcessLookupError, ValueError, KeyError):
        return
    raise RuntimeError('A recorded MiniMax-Music3 service process is still running; stop it before restarting')


def _cleanup_connection_file(connection: Path) -> None:
    try:
        if parse_json(connection.read_text(encoding='utf-8')).get('pid') == os.getpid():
            connection.unlink()
    except (OSError, ValueError):
        pass


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=DEFAULT_PORT)
    parser.add_argument('--model', default=DEFAULT_MODEL_ID)
    parser.add_argument('--cache-root', type=Path, default=DEFAULT_CACHE_ROOT)
    parser.add_argument('--output-dir', type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument('--connection-file', type=Path, default=STATE_DIR / 'connection.json')
    parser.add_argument('--eager-load', action='store_true', help='Load MLX weights into Metal memory on startup')
    parser.add_argument('--require-token', action='store_true', help='Enforce X-MiniMax-Music-Token on POST /api/generate')
    args = parser.parse_args(argv)
    if not 1 <= args.port <= 65535:
        parser.error('Invalid port')
    ensure_mlx_runtime()
    connection = args.connection_file.expanduser()
    _prepare_connection_path(connection)
    engine = MiniMaxMusicEngine(
        args.model,
        cache_root=args.cache_root,
        output_dir=args.output_dir,
        lazy_load=not args.eager_load,
    )
    token = secrets.token_hex(32) if args.require_token else None
    server = create_server(engine, args.port, token)
    record = {
        'schema': 'study-room.minimax-music3-connection.v1',
        'host': '127.0.0.1',
        'port': args.port,
        'token': token,
        'pid': os.getpid(),
        'model': engine.model_id,
        'snapshot_dir': str(engine.snapshot_dir),
    }
    write_connection(connection, record)
    print(json.dumps({'event': 'ready', 'url': f'http://127.0.0.1:{args.port}', 'connection_file': str(connection), **engine.health()}), flush=True)

    def _stop(_signum, _frame):
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, _stop)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        _cleanup_connection_file(connection)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

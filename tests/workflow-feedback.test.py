"""Isolated tests; no Orca calls, real project edits, or model requests."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/workflow-feedback.py'
spec = importlib.util.spec_from_file_location('feedback', SCRIPT)
feedback = importlib.util.module_from_spec(spec)
spec.loader.exec_module(feedback)


class FeedbackTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'repo'
        self.root.mkdir()
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)
        subprocess.run(['git', '-C', str(self.root), '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '--allow-empty', '-qm', 'base'], check=True)
        self.payload = dict(quote='Block formulas should be centered', problem='Misaligned math', proposal='Scope display math alignment', scope='article rendering', evidence='fixture screenshot; no model calls')

    def tearDown(self):
        self.temp.cleanup()

    def command(self, *args):
        return subprocess.run(['python3', str(SCRIPT), '--root', str(self.root), *args], capture_output=True, text=True)

    def test_submit_is_durable_and_deduplicated(self):
        key, fresh = feedback.submit(self.root, self.payload)
        self.assertTrue(fresh)
        self.assertEqual((key, False), feedback.submit(self.root, self.payload))
        row = json.loads((feedback.store(self.root) / 'inbox' / (key + '.json')).read_text())
        self.assertEqual(row['quote'], self.payload['quote'])
        self.assertEqual(len(feedback.pending(feedback.store(self.root))), 1)

    def test_all_worktrees_share_inbox(self):
        sibling = Path(self.temp.name) / 'sibling'
        subprocess.run(['git', '-C', str(self.root), 'worktree', 'add', '-qb', 'sibling', str(sibling)], check=True)
        feedback.submit(self.root, self.payload)
        self.assertEqual(feedback.store(self.root), feedback.store(sibling))
        self.assertEqual(len(feedback.pending(feedback.store(sibling))), 1)

    def test_invalid_payload_rejected(self):
        for value in ({}, dict(self.payload, quote=''), dict(self.payload, quote='x' * 5001), []):
            with self.assertRaises(ValueError): feedback.submit(self.root, value)

    def test_exclusive_lock_and_owned_release(self):
        owner = self.command('acquire')
        self.assertEqual(owner.returncode, 0)
        self.assertNotEqual(self.command('acquire').returncode, 0)
        self.assertNotEqual(self.command('release', '--owner', 'wrong').returncode, 0)
        self.assertEqual(self.command('release', '--owner', owner.stdout.strip()).returncode, 0)

    def test_precheck_skips_empty_locked_and_decided(self):
        self.assertEqual(self.command('precheck').returncode, 1)
        key, _ = feedback.submit(self.root, self.payload)
        self.assertEqual(self.command('precheck').returncode, 0)
        owner = self.command('acquire').stdout.strip()
        self.assertEqual(self.command('precheck').returncode, 1)
        result = self.command('decide', '--owner', owner, '--id', key, '--status', 'needs-confirmation', '--evidence', 'No general claim from one example')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.command('release', '--owner', owner).returncode, 0)
        self.assertEqual(self.command('precheck').returncode, 1)
        self.assertTrue((feedback.store(self.root) / 'inbox' / (key + '.json')).exists())

    def test_decision_requires_lock_and_known_id(self):
        key, _ = feedback.submit(self.root, self.payload)
        self.assertNotEqual(self.command('decide', '--owner', 'wrong', '--id', key, '--status', 'applied', '--evidence', 'x').returncode, 0)
        owner = self.command('acquire').stdout.strip()
        self.assertNotEqual(self.command('decide', '--owner', owner, '--id', '../escape', '--status', 'applied', '--evidence', 'x').returncode, 0)


if __name__ == '__main__': unittest.main()

"""Loopback service security checks with a fake engine; never load model weights."""
import http.client
import importlib.util
import json
from pathlib import Path
import stat
import sys
import tempfile
import threading
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('nano_service', SCRIPTS / 'serve-nanojev-mlx.py')
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)
TOKEN = 'b' * 64
INPUT = {'states': [{'id': 'test', 'state': 'synthetic test input', 'questions': {'a': {'type': 'boolean', 'instructions': 'Is this a test?'}}}]}


class FakeEngine:
    def __init__(self):
        self.calls = 0
    def health(self):
        return {'ready': True, 'inference_count': self.calls}
    def predict(self, payload):
        self.calls += 1
        return {'test_engine': True}


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.engine = FakeEngine()
        self.server = service.create_server(self.engine, 0, TOKEN)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.port = self.server.server_address[1]

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=2)

    def request(self, route='/api/evaluate', method='POST', body=None, headers=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=2)
        h = {'Content-Type': 'application/json', 'X-NanoJev-Token': TOKEN}
        h.update(headers or {})
        conn.request(method, route, body or json.dumps(INPUT), h)
        result = conn.getresponse()
        status, payload = result.status, json.loads(result.read())
        conn.close()
        return status, payload

    def test_authentication_and_health_do_not_run_inference(self):
        self.assertEqual(self.request('/api/health', 'GET')[0], 200)
        self.assertEqual(self.request('/api/auth-check', 'GET')[0], 200)
        self.assertEqual(self.request('/api/auth-check', 'GET', headers={'X-NanoJev-Token': 'wrong'})[0], 401)
        self.assertEqual(self.engine.calls, 0)

    def test_external_hosts_browser_origins_and_missing_tokens_fail_before_inference(self):
        for headers, expected in [({'Host': 'evil.example'}, 403), ({'Origin': 'http://127.0.0.1:8000'}, 403), ({'X-NanoJev-Token': ''}, 401), ({'Content-Type': 'text/plain'}, 415)]:
            self.assertEqual(self.request(headers=headers)[0], expected)
        self.assertEqual(self.engine.calls, 0)

    def test_invalid_json_and_excessive_nesting_fail_safely(self):
        for body in ('{"states":[],"states":[]}', '{"x":NaN}', '[' * 2000 + ']' * 2000):
            self.assertEqual(self.request(body=body)[0], 400)
        self.assertEqual(self.engine.calls, 0)
        self.assertEqual(self.request()[0], 200)
        self.assertEqual(self.engine.calls, 1)

    def test_auth_error_does_not_echo_input_or_token(self):
        status, payload = self.request(headers={'X-NanoJev-Token': 'wrong'})
        self.assertEqual(status, 401)
        self.assertNotIn('synthetic test input', json.dumps(payload))
        self.assertNotIn(TOKEN, json.dumps(payload))

    def test_connection_record_is_private_and_symlinks_are_not_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'connection.json'
            service.write_connection(target, {'token': TOKEN})
            self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)
            link = Path(directory) / 'link.json'; link.symlink_to(target)
            with self.assertRaises(ValueError):
                service.write_connection(link, {})
            self.assertEqual(json.loads(target.read_text())['token'], TOKEN)


if __name__ == '__main__':
    unittest.main()

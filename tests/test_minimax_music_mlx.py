"""Fast contract and loopback server tests for MiniMax-Music3 MLX; never loads real weights."""
from __future__ import annotations

import http.client
import importlib.util
import json
import math
from pathlib import Path
import stat
import sys
import tempfile
import threading
import types
import unittest
import wave

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from minimax_music_mlx import (
    MiniMaxMusicEngine,
    parse_json,
    resolve_cached_snapshot,
    validate_generation_request,
)


def _load_script_module(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


cli_module = _load_script_module('minimax_cli', 'generate-minimax-music-mlx.py')
server_module = _load_script_module('minimax_server', 'serve-minimax-music-mlx.py')


def _build_fake_hub_cache(root: Path, repo_id: str = 'mlx-community/MiniMax-Music3-mxfp8', rev: str = 'abc1234') -> Path:
    repo_dir = root / f"models--{repo_id.replace('/', '--')}"
    snap = repo_dir / 'snapshots' / rev
    snap.mkdir(parents=True, exist_ok=True)
    (repo_dir / 'refs').mkdir(parents=True, exist_ok=True)
    (repo_dir / 'refs' / 'main').write_text(rev, encoding='utf-8')
    for fname in (
        'config.json',
        'model.safetensors.index.json',
        'model-00001-of-00003.safetensors',
        'model-00002-of-00003.safetensors',
        'model-00003-of-00003.safetensors',
    ):
        (snap / fname).write_bytes(b'{}')
    return snap


class FakeMLXModel:
    def __init__(self, sample_rate: int = 32000):
        self.sample_rate = sample_rate
        self.calls: list[dict] = []

    def generate(self, **kwargs):
        self.calls.append(kwargs)
        duration = float(kwargs.get('duration') or 2.0)
        count = max(64, int(self.sample_rate * min(duration, 0.25)))
        stereo = [
            [0.25 * math.sin(2.0 * math.pi * 440.0 * i / self.sample_rate), 0.20 * math.cos(2.0 * math.pi * 660.0 * i / self.sample_rate)]
            for i in range(count)
        ]
        yield types.SimpleNamespace(audio=stereo, sample_rate=self.sample_rate)


class EngineAndCliTests(unittest.TestCase):
    def test_snapshot_resolution_and_validation_contracts(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            snap = _build_fake_hub_cache(root)
            self.assertEqual(resolve_cached_snapshot(cache_root=root), snap.resolve())

            valid = validate_generation_request(
                {'prompt': 'Genre: indie pop. BPM: 96.', 'lyrics': '[verse]\nhello world', 'duration': 8, 'steps': 12},
                output_dir=root / 'out',
            )
            self.assertEqual(valid['duration'], 8.0)
            self.assertEqual(valid['steps'], 12)

            for bad in (
                {'prompt': '', 'lyrics': '[instrumental]'},
                {'prompt': 'pop', 'lyrics': '   '},
                {'prompt': 'pop', 'duration': 0},
                {'prompt': 'pop', 'duration': 400},
                {'prompt': 'pop', 'steps': 31},
                {'prompt': 'pop', 'output_path': '/etc/passwd.wav'},
                {'prompt': 'pop', 'unknown': 1},
            ):
                with self.assertRaises(ValueError):
                    validate_generation_request(bad, output_dir=root / 'out')

            with self.assertRaises(ValueError):
                parse_json('{"prompt":"a","prompt":"b"}')
            with self.assertRaises(ValueError):
                parse_json('{"duration":NaN}')

    def test_engine_and_cli_write_verified_pcm16_wav(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _build_fake_hub_cache(root)
            fake_model = FakeMLXModel()

            def factory(model_id, *, cache_root, output_dir, lazy_load=True):
                return MiniMaxMusicEngine(
                    model_id,
                    cache_root=cache_root,
                    output_dir=output_dir,
                    lazy_load=lazy_load,
                    loader=lambda _snap: fake_model,
                )

            wav_out = root / 'song.wav'
            rc = cli_module.main(
                [
                    '--prompt', 'Genre: Mandarin indie pop. BPM: 96.',
                    '--lyrics', '[verse]\n晚风吹过街口',
                    '--duration', '5',
                    '--steps', '10',
                    '--output', str(wav_out),
                    '--cache-root', str(root),
                    '--json',
                ],
                engine_factory=factory,
            )
            self.assertEqual(rc, 0)
            self.assertTrue(wav_out.is_file())
            with wave.open(str(wav_out), 'rb') as wf:
                self.assertEqual(wf.getnchannels(), 2)
                self.assertEqual(wf.getsampwidth(), 2)
                self.assertEqual(wf.getframerate(), 32000)
                self.assertGreater(wf.getnframes(), 1000)
            self.assertEqual(fake_model.calls[0]['steps'], 10)
            self.assertEqual(fake_model.calls[0]['duration'], 5.0)


class LoopbackServiceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        _build_fake_hub_cache(self.root)
        self.fake_model = FakeMLXModel()
        self.engine = MiniMaxMusicEngine(
            cache_root=self.root,
            output_dir=self.root / 'outputs',
            lazy_load=True,
            loader=lambda _snap: self.fake_model,
        )
        self.token = 'a' * 64
        self.server = server_module.create_server(self.engine, 0, self.token)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.port = self.server.server_address[1]

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.tmp.cleanup()

    def request(self, route: str = '/api/generate', method: str = 'POST', body: str | None = None, headers: dict | None = None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=3)
        hdrs = {'Content-Type': 'application/json', 'X-MiniMax-Music-Token': self.token}
        if headers:
            hdrs.update(headers)
        payload = body if body is not None else json.dumps({'prompt': 'Genre: synthwave.', 'lyrics': '[instrumental]', 'duration': 5, 'steps': 8})
        conn.request(method, route, None if method == 'GET' else payload, hdrs)
        resp = conn.getresponse()
        status, data = resp.status, json.loads(resp.read().decode('utf-8'))
        conn.close()
        return status, data

    def test_health_and_security_boundaries(self):
        status, health = self.request('/api/health', method='GET')
        self.assertEqual(status, 200)
        self.assertTrue(health['ready'])
        self.assertFalse(health['model_loaded'])
        self.assertEqual(len(self.fake_model.calls), 0)

        for hdrs, code in (
            ({'Host': 'evil.example'}, 403),
            ({'Origin': 'http://127.0.0.1:8000'}, 403),
            ({'X-MiniMax-Music-Token': 'bad'}, 401),
            ({'Content-Type': 'text/plain'}, 415),
        ):
            self.assertEqual(self.request(headers=hdrs)[0], code)
        self.assertEqual(len(self.fake_model.calls), 0)

        status, generated = self.request(
            body=json.dumps({'prompt': 'Genre: ambient.', 'lyrics': '[instrumental]', 'duration': 5, 'steps': 6, 'return_audio_base64': True})
        )
        self.assertEqual(status, 200)
        self.assertGreater(generated['rms_amplitude'], 0.05)
        self.assertIn('audio_base64', generated)
        self.assertEqual(self.engine.inference_count, 1)

    def test_single_flight_concurrency_and_connection_file_hygiene(self):
        entered, release = threading.Event(), threading.Event()
        orig_generate = self.engine.generate

        def slow_generate(payload):
            entered.set()
            release.wait(timeout=3)
            return orig_generate(payload)

        self.engine.generate = slow_generate
        holder: list[tuple[int, dict]] = []
        worker = threading.Thread(target=lambda: holder.append(self.request()))
        worker.start()
        try:
            self.assertTrue(entered.wait(timeout=1))
            busy_status, busy_body = self.request()
            self.assertEqual(busy_status, 429)
            self.assertEqual(busy_body['error']['code'], 'busy')
        finally:
            release.set()
            worker.join(timeout=3)
        self.assertEqual(holder[0][0], 200)

        conn_file = self.root / 'connection.json'
        server_module.write_connection(conn_file, {'token': self.token})
        self.assertEqual(stat.S_IMODE(conn_file.stat().st_mode), 0o600)
        symlink_file = self.root / 'symlink.json'
        symlink_file.symlink_to(conn_file)
        with self.assertRaises(ValueError):
            server_module.write_connection(symlink_file, {})


if __name__ == '__main__':
    unittest.main()

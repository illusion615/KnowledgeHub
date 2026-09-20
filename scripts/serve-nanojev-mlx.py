#!/usr/bin/env python3
"""Loopback-only, authenticated decision service for the downloaded NanoJev models.

No oMLX application/model modifications, cloud inference, or chat generation.
Connection tokens are stored in a private cache for the local website backend.
"""
import argparse
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import secrets
import re
import signal
import tempfile
import threading
import time
from urllib.parse import urlsplit

from nanojev_mlx.contract import parse_json, validate_request

CACHE = Path.home() / '.cache/study-room/nanojev-mlx'
PROFILES = {
    '4bit': Path.home() / '.omlx/models/ZeroDegress/NanoJev-mlx-4bit',
    'fp32': Path.home() / '.omlx/models/C-Tianyu/NanoJev',
}


def write_connection(path, data):
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


def create_server(engine, port, token):
    gate = threading.Lock()
    calls = []

    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            super().setup()
            self.connection.settimeout(10)

        def respond(self, status, payload):
            body = json.dumps(payload, allow_nan=False).encode()
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

        def trusted_host(self):
            actual = self.server.server_address[1]
            return self.headers.get('Host') in (f'127.0.0.1:{actual}', f'localhost:{actual}')

        def do_GET(self):
            if not self.trusted_host():
                return self.respond(403, {'error': {'code': 'invalid_host'}})
            route = urlsplit(self.path).path
            if route == '/api/auth-check':
                supplied = self.headers.get('X-NanoJev-Token', '')
                if not re.fullmatch('[a-f0-9]{64}', supplied) or not hmac.compare_digest(supplied, token):
                    return self.respond(401, {'error': {'code': 'local_auth_failed'}})
                return self.respond(200, {'backend': 'study-room-nanojev-mlx-v1', 'authenticated': True, 'model_loaded': True})
            if route != '/api/health':
                return self.respond(404, {'error': {'code': 'not_found'}})
            self.respond(200, engine.health())

        def do_POST(self):
            if not self.trusted_host():
                return self.respond(403, {'error': {'code': 'invalid_host'}})
            if self.headers.get('Origin'):
                return self.respond(403, {'error': {'code': 'use_local_backend'}})
            if urlsplit(self.path).path != '/api/evaluate':
                return self.respond(404, {'error': {'code': 'not_found'}})
            supplied = self.headers.get('X-NanoJev-Token', '')
            if not re.fullmatch('[a-f0-9]{64}', supplied) or not hmac.compare_digest(supplied, token):
                return self.respond(401, {'error': {'code': 'local_auth_failed'}})
            if self.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
                return self.respond(415, {'error': {'code': 'json_required'}})
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if not 0 < length <= 65536:
                    return self.respond(413, {'error': {'code': 'body_too_large'}})
                payload = parse_json(self.rfile.read(length).decode('utf-8'))
                validate_request(payload)
            except (ValueError, TypeError, KeyError, UnicodeError, RecursionError):
                return self.respond(400, {'error': {'code': 'local_invalid_input'}})
            if not gate.acquire(blocking=False):
                return self.respond(429, {'error': {'code': 'busy'}})
            try:
                now = time.monotonic()
                calls[:] = [t for t in calls if now - t < 60]
                if len(calls) >= 30:
                    return self.respond(429, {'error': {'code': 'local_rate_limit'}})
                calls.append(now)
                result = engine.predict(payload)
                self.respond(200, result)
            except ValueError:
                self.respond(400, {'error': {'code': 'local_input_limit_or_contract'}})
            except Exception as error:
                # Log only an exception class, never inputs, tokens, or full traces.
                print(json.dumps({'event': 'inference_failed', 'error_type': type(error).__name__}), flush=True)
                self.respond(500, {'error': {'code': 'local_inference_failed'}})
            finally:
                gate.release()

        def do_OPTIONS(self):
            self.respond(405, {'error': {'code': 'cross_origin_not_supported'}})

        def log_message(self, *args):
            pass  # No request bodies, credentials, or state text in access logs.

    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    server.daemon_threads = True
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--variant', choices=PROFILES, default='4bit')
    parser.add_argument('--model-dir', type=Path)
    parser.add_argument('--port', type=int)
    parser.add_argument('--dtype', choices=['float32', 'float16', 'bfloat16'], default='float32')
    parser.add_argument('--path-batch-size', type=int, default=16)
    parser.add_argument('--connection-file', type=Path)
    args = parser.parse_args()
    port = args.port if args.port is not None else (8766 if args.variant == '4bit' else 8767)
    if not 1 <= port <= 65535:
        parser.error('Invalid port')
    connection = (args.connection_file or CACHE / f'connection-{args.variant}.json').expanduser()
    if connection.is_symlink():
        raise ValueError('Connection file must not be a symlink')
    if connection.exists():
        existing = parse_json(connection.read_text())
        try:
            os.kill(int(existing['pid']), 0)
        except (ProcessLookupError, ValueError, KeyError):
            pass
        else:
            raise RuntimeError('A recorded service process is still running; stop it explicitly before replacing its connection file')
    from nanojev_mlx.engine import DecisionEngine
    engine = DecisionEngine(args.model_dir or PROFILES[args.variant], dtype=args.dtype, path_batch_size=args.path_batch_size)
    if (engine.weights_bits == 4) != (args.variant == '4bit'):
        raise ValueError('Variant and verified weight profile disagree')
    token = secrets.token_hex(32)
    server = create_server(engine, port, token)
    record = {'schema': 'study-room.nanojev-connection.v1', 'host': '127.0.0.1', 'port': port, 'token': token,
              'pid': os.getpid(), 'model': engine.model_id, 'weights_sha256': engine.weight_sha, 'variant': args.variant}
    write_connection(connection, record)
    print(json.dumps({'event': 'ready', 'url': f'http://127.0.0.1:{port}', 'connection_file': str(connection), **engine.health()}), flush=True)
    # Signals stop only this new service, never oMLX or other model processes.
    def stop(signum, frame):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, stop)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        try:
            if parse_json(connection.read_text()).get('pid') == os.getpid():
                connection.unlink()
        except (OSError, ValueError):
            pass


if __name__ == '__main__':
    main()

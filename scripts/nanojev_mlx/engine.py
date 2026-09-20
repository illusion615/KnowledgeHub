"""Persistent, offline MLX inference using local NanoJev checkpoint files only."""
import hashlib
import json
import math
import os
from pathlib import Path
import time

# No downloads, Hub authentication, or remote-code execution during inference.
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

import mlx.core as mx
from transformers import AutoTokenizer
from .contract import prepare_examples, answer_from_probabilities, parse_json
from .model import NanoJevMLX, backbone_args, install_weights

DEFAULT_MODEL = Path.home() / '.omlx/models/ZeroDegress/NanoJev-mlx-4bit'
EXPECTED_WEIGHT_SHA = '332d47eb23c81b0370f580e87e0e55ef737ba1baa206a8d300eadf9617307b62'
MODEL_ID = 'ZeroDegress/NanoJev-mlx-4bit'
ORIGINAL_SHA = 'fff62d1412685c1714eaa386acb603f9690371fb3cc8ad03dc41319302597c28'


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


class DecisionEngine:
    def __init__(self, model_dir=DEFAULT_MODEL, dtype='float32', path_batch_size=16):
        before = time.perf_counter()
        if dtype not in ('float32', 'float16', 'bfloat16'):
            raise ValueError('Unsupported activation dtype')
        if type(path_batch_size) is not int or not 1 <= path_batch_size <= 32:
            raise ValueError('Path batch size must be 1..32')
        if not mx.metal.is_available():
            raise RuntimeError('Apple Metal GPU is required for this validated runtime')
        self.model_dir = Path(model_dir).expanduser().resolve(strict=True)
        # Require this audited artifact, including tokenizer/config hashes. This
        # does not load arbitrary remote Python or overwrite the download.
        import importlib.util
        audit_path = Path(__file__).resolve().parents[1] / 'audit-nanojev-mlx.py'
        spec = importlib.util.spec_from_file_location('nanojev_artifact_audit', audit_path)
        audit_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(audit_module)
        original = (self.model_dir / 'best.safetensors').stat().st_size == 2385039280
        reference_path = (Path(__file__).resolve().parents[2] / 'posts/jev-system-one-research/examples/nanojev-fp32-reference.json') if original else audit_module.REFERENCE
        audit = audit_module.audit(self.model_dir, reference_path)
        if not audit['file_integrity_matches_pinned_release']:
            raise ValueError('Local model differs from the pinned audited artifact; inspect the audit before inference')
        self.model_id = 'C-Tianyu/NanoJev' if original else MODEL_ID
        self.weight_sha = ORIGINAL_SHA if original else EXPECTED_WEIGHT_SHA
        self.weights_bits = 32 if original else 4
        run_config = parse_json((self.model_dir / 'config.json').read_text())
        config = parse_json((self.model_dir / 'backbone_config/config.json').read_text())
        if not original:
            manifest = parse_json((self.model_dir / 'MANIFEST.json').read_text())
            if manifest.get('bits') != 4 or manifest.get('group_size') != 64:
                raise ValueError('Expected affine 4-bit/group-64 weights')
        self.max_length = run_config['max_length']
        self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_dir / 'tokenizer'), local_files_only=True, trust_remote_code=False)
        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        self.model = NanoJevMLX(backbone_args(config), run_config['set_head'])
        weights = mx.load(str(self.model_dir / 'best.safetensors'))
        self.load_record = install_weights(self.model, weights, getattr(mx, dtype))
        del weights
        self.dtype = dtype
        self.path_batch_size = path_batch_size
        self.inference_count = 0
        self.load_seconds = time.perf_counter() - before
        self.model_memory_bytes = mx.get_active_memory()

    def health(self):
        return {
            'backend': 'study-room-nanojev-mlx-v1', 'ready': True, 'model_loaded': True,
            'model': self.model_id, 'weights_sha256': self.weight_sha,
            'device': 'mlx-metal-gpu', 'activation_dtype': self.dtype,
            'quantization': {'bits': self.weights_bits, 'group_size': 64 if self.weights_bits == 4 else None, 'heads_quantized': False},
            'max_length': self.max_length, 'model_load_count': 1,
            'inference_count': self.inference_count,
            'load_seconds': round(self.load_seconds, 3),
            'model_memory_bytes': self.model_memory_bytes,
            'network_model_calls': 0
        }

    def predict(self, payload):
        before = time.perf_counter()
        examples = prepare_examples(payload, self.tokenizer, self.max_length)
        paths = [ids for ex in examples for ids in ex['leaf_tokens']]
        mx.reset_peak_memory()
        logits = self.model(examples, self.tokenizer.pad_token_id, self.path_batch_size)
        probabilities = [mx.softmax(values.astype(mx.float32), axis=-1) for values in logits]
        mx.eval(*probabilities)
        answers = {row['id']: {'id': row['id'], 'answers': {}} for row in payload['states']}
        for example, vector in zip(examples, probabilities):
            answers[example['state_id']]['answers'][example['qid']] = answer_from_probabilities(example, vector.tolist())
        self.inference_count += 1
        result = {
            'schema_version': 'study-room-nanojev-mlx-v1',
            'model': self.model_id,
            'checkpoint': {'weights_sha256': self.weight_sha, 'upstream': 'C-Tianyu/NanoJev', 'strict_loading': True},
            'states': list(answers.values()),
            'execution': {
                'runtime': 'mlx', 'device': 'metal-gpu', 'activation_dtype': self.dtype,
                'weights_bits': self.weights_bits, 'quantization_group_size': 64 if self.weights_bits == 4 else None,
                'states': len(payload['states']), 'questions': len(examples),
                'candidate_paths': len(paths), 'candidate_path_tokens': sum(map(len, paths)),
                'token_count_scope': 'sum of actual encoded candidate paths, including repeated state prefixes; not cloud-billed tokens',
                'forward_passes': math.ceil(len(paths) / self.path_batch_size),
                'path_batch_size': self.path_batch_size,
                'prefix_sharing': False, 'autoregressive_decode_steps': 0,
                'network_model_calls': 0, 'persistent_model_load_count': 1,
                'inference_call_index': self.inference_count,
                'evaluation_ms': round((time.perf_counter() - before) * 1000, 3),
                'peak_memory_bytes': mx.get_peak_memory(), 'max_length': self.max_length
            },
            'calibration': {'native_confidence': None, 'temperature': 1.0, 'fitted_by_this_runtime': False},
            'billing_usd': 0,
            'billing_scope': 'no external inference API charge; excludes local hardware, electricity, and maintenance'
        }
        json.dumps(result, allow_nan=False)
        return result

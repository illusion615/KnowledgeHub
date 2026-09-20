#!/usr/bin/env python3
"""Compare native MLX inference against the pinned, original PyTorch DecisionModel.

No cloud inference. Optional --fetch-reference downloads three pinned MIT source
files only, into a cache outside the repository. Model weights are never downloaded
or changed. This is numerical parity testing, NOT business-accuracy evaluation.
"""
import argparse
import hashlib
import importlib.util
import importlib.metadata
from datetime import datetime, timezone
import platform
import json
import os
from pathlib import Path
import time
import urllib.request

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

REFERENCE_COMMIT = '71a513bb0163b5634467842b523ee0c0ed6fb1c7'
REFERENCE_FILES = {
    'train_toy_decisions.py': ('scripts/train_toy_decisions.py', '4f39babd5575e43d7acf3eca357329a93c60041f334bc2bd7424929bf9c0da86'),
    'predict_toy_decisions.py': ('scripts/predict_toy_decisions.py', '6eedc49aaf9a81763677e3cff4e87fc4e499bfc5decf0bb4678f452f578dd92b'),
    'LICENSE': ('LICENSE', 'c69c1bb0b33112f68f9e8ef7e91dd38ec59066fcba3f62f70cbc8c9c83cf6a8e'),
}


def reference_sources(directory, fetch=False):
    directory.mkdir(parents=True, exist_ok=True)
    for name, (remote, expected) in REFERENCE_FILES.items():
        target = directory / name
        if not target.is_file() and fetch:
            address = f'https://raw.githubusercontent.com/TianyuCodings/NanoJev/{REFERENCE_COMMIT}/{remote}'
            data = urllib.request.urlopen(address, timeout=30).read()
            if hashlib.sha256(data).hexdigest() != expected:
                raise ValueError('Reference source hash mismatch')
            target.write_bytes(data)
        if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != expected:
            raise ValueError('Pinned reference source missing or changed; use --fetch-reference in a fresh cache')
    modules = []
    for name in ('train_toy_decisions.py', 'predict_toy_decisions.py'):
        spec = importlib.util.spec_from_file_location('reference_' + name[:-3], directory / name)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        modules.append(module)
    return modules


def metrics(left, right):
    if len(left) != len(right):
        raise AssertionError('Different number of questions')
    max_error = 0.0
    tv = []
    flips = 0
    for a, b in zip(left, right):
        if len(a) != len(b):
            raise AssertionError('Different candidate set')
        max_error = max(max_error, max(abs(x - y) for x, y in zip(a, b)))
        tv.append(sum(abs(x - y) for x, y in zip(a, b)) / 2)
        flips += max(range(len(a)), key=a.__getitem__) != max(range(len(b)), key=b.__getitem__)
    return {'questions': len(left), 'max_absolute_probability_error': max_error,
            'mean_total_variation': sum(tv) / len(tv), 'argmax_flips': flips}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model-dir', type=Path, default=Path.home() / '.omlx/models/ZeroDegress/NanoJev-mlx-4bit')
    parser.add_argument('--reference-dir', type=Path, default=Path.home() / '.cache/study-room/nanojev-reference')
    parser.add_argument('--fetch-reference', action='store_true')
    parser.add_argument('--original-dir', type=Path, help='Optionally compare quantization to the original fp32 checkpoint')
    parser.add_argument('--input', type=Path, default=Path(__file__).resolve().parents[1] / 'tests/fixtures/nanojev-runtime.json')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    model_dirs = [p.resolve() for p in (args.model_dir, args.original_dir) if p is not None]
    if args.output.exists() or args.output.is_symlink() or any(args.output.resolve().is_relative_to(p) for p in model_dirs):
        parser.error('Output must be a new file outside both model directories')
    if any(args.reference_dir.resolve().is_relative_to(p) for p in model_dirs):
        parser.error('Reference source cache must be outside both model directories')
    import mlx.core as mx
    import numpy as np
    import torch
    from transformers import AutoConfig
    from nanojev_mlx.engine import DecisionEngine, sha256
    from nanojev_mlx.contract import parse_json, prepare_examples
    torch.set_num_threads(8)
    torch.set_default_dtype(torch.float32)
    started = time.perf_counter()
    upstream, upstream_predict = reference_sources(args.reference_dir, args.fetch_reference)
    payload = parse_json(args.input.read_text())
    engine = DecisionEngine(args.model_dir, dtype='float32')
    examples = prepare_examples(payload, engine.tokenizer, engine.max_length)
    reference_examples = upstream_predict.prepare_examples(payload, engine.tokenizer, engine.max_length)
    assert [x['leaf_tokens'] for x in examples] == [x['leaf_tokens'] for x in reference_examples]
    ml = engine.model(examples, engine.tokenizer.pad_token_id, engine.path_batch_size)
    ml_probs = [mx.softmax(x.astype(mx.float32)).tolist() for x in ml]
    # Convert the same 4-bit artifact into a float32 state dict for the UNMODIFIED
    # upstream PyTorch head/backbone. This isolates port/arithmetic differences
    # from quantization versus the original trained weights.
    packed = mx.load(str(args.model_dir / 'best.safetensors'))
    state = {}
    for name, value in packed.items():
        if name.endswith(('.weight.scales', '.weight.biases')):
            continue
        if name + '.scales' in packed:
            value = mx.dequantize(value, scales=packed[name + '.scales'].astype(mx.float32), biases=packed[name + '.biases'].astype(mx.float32), bits=4, group_size=64, mode='affine')
        value = value.astype(mx.float32)
        mx.eval(value)
        state[name] = torch.from_numpy(np.array(value))
    from transformers import AutoModel
    cfg = AutoConfig.from_pretrained(str(args.model_dir / 'backbone_config'), local_files_only=True, trust_remote_code=False)
    cfg.use_cache = False
    body = AutoModel.from_config(cfg, attn_implementation='sdpa', trust_remote_code=False).float()
    reference = upstream.DecisionModel(body, 'attention').float().eval()
    reference.load_state_dict(state, strict=True)
    del state, packed
    def predict_reference():
        probabilities = []
        with torch.inference_mode():
            for start in range(0, len(reference_examples), 3):
                group = reference_examples[start:start + 3]
                logits, _ = reference(group, engine.tokenizer.pad_token_id)
                probabilities.extend(row[:len(ex['candidate_ids'])].softmax(-1).tolist() for row, ex in zip(logits, group))
        return probabilities
    ref_probs = predict_reference()
    parity = metrics(ml_probs, ref_probs)
    # Acceptance criterion fixed before observing results, not tuned to hide errors.
    passed = parity['max_absolute_probability_error'] <= 1e-4 and parity['argmax_flips'] == 0
    original_comparison = None
    original_runtime_parity = None
    if args.original_dir:
        from safetensors.torch import load_file
        original_file = args.original_dir / 'best.safetensors'
        if sha256(original_file) != 'fff62d1412685c1714eaa386acb603f9690371fb3cc8ad03dc41319302597c28':
            raise ValueError('Original checkpoint does not match the pinned reference')
        reference.load_state_dict(load_file(str(original_file)), strict=True)
        original_probs = predict_reference()
        original_comparison = metrics(ml_probs, original_probs)
        original_engine = DecisionEngine(args.original_dir, dtype='float32')
        original_logits = original_engine.model(examples, original_engine.tokenizer.pad_token_id, original_engine.path_batch_size)
        original_mlx_probs = [mx.softmax(x.astype(mx.float32)).tolist() for x in original_logits]
        original_runtime_parity = metrics(original_mlx_probs, original_probs)
        passed = passed and original_runtime_parity['max_absolute_probability_error'] <= 1e-4 and original_runtime_parity['argmax_flips'] == 0
        del original_engine, original_logits
    # Metamorphic checks use real weights, not expected-answer fixtures.
    isolated = []
    for ex in examples:
        logits = engine.model([ex], engine.tokenizer.pad_token_id, 1)[0]
        isolated.append(mx.softmax(logits.astype(mx.float32)).tolist())
    batching = metrics(ml_probs, isolated)
    passed = passed and batching['max_absolute_probability_error'] <= 1e-4 and batching['argmax_flips'] == 0
    report = {
        'schema': 'study-room.nanojev-mlx-numerical-validation.v1',
        'executed_at_utc': datetime.now(timezone.utc).isoformat(),
        'runtime_versions': {name: importlib.metadata.version(name) for name in ('mlx', 'mlx-lm', 'transformers', 'torch', 'numpy', 'safetensors')},
        'python_version': platform.python_version(), 'architecture': platform.machine(),
        'implementation_sha256': {name: sha256(Path(__file__).parent / name) for name in ('nanojev_mlx/model.py', 'nanojev_mlx/contract.py', 'nanojev_mlx/engine.py', 'validate-nanojev-mlx.py')},
        'upstream_source_commit': REFERENCE_COMMIT,
        'weights_sha256': engine.weight_sha,
        'input_sha256': sha256(args.input),
        'scope': 'Real local MLX weights versus pinned upstream PyTorch computation; numerical fidelity, not semantic accuracy or calibration',
        'reference_compute': 'PyTorch CPU float32 using dequantized 4-bit artifact',
        'mlx_compute': 'Metal GPU, affine 4-bit weights, float32 activations',
        'candidate_encoding_equal': True,
        'mlx_vs_upstream_same_weights': parity,
        'mlx_batched_vs_isolated': batching,
        'quantized_mlx_vs_original_fp32': original_comparison,
        'original_fp32_mlx_vs_original_fp32_torch': original_runtime_parity,
        'acceptance': {'max_probability_error': 1e-4, 'argmax_flips': 0},
        'passed': passed,
        'input_states': len(payload['states']), 'questions': len(examples),
        'candidate_paths': sum(len(x['leaf_tokens']) for x in examples),
        'network_model_calls': 0,
        'seconds': round(time.perf_counter() - started, 3)
    }
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return 0 if passed else 1


if __name__ == '__main__':
    raise SystemExit(main())

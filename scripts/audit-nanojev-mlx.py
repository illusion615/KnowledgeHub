#!/usr/bin/env python3
"""Read-only audit of a NanoJev MLX weight package; no ML imports or network.

Checks local files against a pinned public Hugging Face inventory, examines the
safetensors header, and distinguishes download integrity from runtime readiness.
It never renames weights, edits model configuration, loads a model, or calls oMLX.
"""
import argparse
import collections
import hashlib
import json
import math
from pathlib import Path
import struct

REFERENCE = Path(__file__).resolve().parents[1] / 'posts/jev-system-one-research/examples/nanojev-mlx-reference.json'
DEFAULT_MODEL = Path.home() / '.omlx/models/ZeroDegress/NanoJev-mlx-4bit'
DTYPE_BYTES = {'U32': 4, 'F16': 2, 'BF16': 2, 'F32': 4, 'I32': 4, 'I64': 8, 'U8': 1, 'I8': 1, 'BOOL': 1}


def file_digest(path, kind):
    if kind not in ('sha256', 'git-blob-sha1'):
        raise ValueError('Unsupported reference hash kind')
    digest = hashlib.sha256() if kind == 'sha256' else hashlib.sha1()
    if kind == 'git-blob-sha1':
        digest.update(f'blob {path.stat().st_size}\0'.encode())
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_header(path):
    with path.open('rb') as handle:
        prefix = handle.read(8)
        if len(prefix) != 8:
            raise ValueError('Incomplete safetensors prefix')
        size = struct.unpack('<Q', prefix)[0]
        if size > 32 * 1024 * 1024 or size + 8 > path.stat().st_size:
            raise ValueError('Invalid or excessive safetensors header length')
        header = json.loads(handle.read(size))
    tensors = {k: v for k, v in header.items() if k != '__metadata__'}
    payload_size = path.stat().st_size - size - 8
    ranges = []
    for name, item in tensors.items():
        shape, offsets, dtype = item['shape'], item['data_offsets'], item['dtype']
        if dtype not in DTYPE_BYTES or any(type(x) is not int or x < 0 for x in shape):
            raise ValueError('Unsupported tensor metadata')
        if len(offsets) != 2 or any(type(x) is not int for x in offsets):
            raise ValueError('Invalid tensor offsets')
        start, end = offsets
        if not 0 <= start <= end <= payload_size or end - start != math.prod(shape) * DTYPE_BYTES[dtype]:
            raise ValueError('Invalid tensor byte range: ' + name)
        ranges.append((start, end))
    ranges.sort()
    if not ranges or ranges[0][0] != 0 or ranges[-1][1] != payload_size or any(a[1] != b[0] for a, b in zip(ranges, ranges[1:])):
        raise ValueError('Tensor payload has gaps, overlap, or unused bytes')
    names = list(tensors)
    sample = 'backbone.layers.0.self_attn.q_proj.weight'
    return {
        'tensor_count': len(tensors),
        'dtypes': dict(collections.Counter(x['dtype'] for x in tensors.values())),
        'tensor_ranges_valid': True,
        'decision_head_tensors': [k for k in names if not k.startswith('backbone.')],
        'q_projection_packed_shape': tensors.get(sample, {}).get('shape'),
        'q_projection_scale_shape': tensors.get(sample + '.scales', {}).get('shape'),
        'q_projection_bias_shape': tensors.get(sample + '.biases', {}).get('shape'),
        'quantization_suffix': '.weight.scales / .weight.biases',
        'lm_head_present': any(k.startswith('lm_head.') for k in names),
        'lm_head_note': 'Absence alone is not proof of missing weights; tied embeddings may omit lm_head. Decision heads must still be implemented.'
    }


def audit(model_dir, reference_path=REFERENCE):
    model_dir = Path(model_dir).expanduser().resolve()
    reference = json.loads(Path(reference_path).read_text())
    files = []
    for expected in reference['files']:
        rel = Path(expected['path'])
        if rel.is_absolute() or '..' in rel.parts:
            raise ValueError('Unsafe reference path')
        target = model_dir / rel
        # The oMLX local-directory package uses regular files. Do not follow
        # unexpected per-file symlinks outside the explicitly audited folder.
        safe_target = target.resolve().is_relative_to(model_dir)
        item = {'path': expected['path'], 'present': target.is_file(), 'safe_to_read': safe_target}
        if item['present'] and safe_target:
            actual = file_digest(target, expected['hash_kind'])
            item.update(bytes=target.stat().st_size, size_matches=target.stat().st_size == expected['bytes'],
                        hash_kind=expected['hash_kind'], hash_matches=actual == expected['hash'], digest=actual)
        files.append(item)
    complete = bool(files) and all(x['present'] and x['safe_to_read'] and x.get('size_matches') and x.get('hash_matches') for x in files)
    report = {
        'schema': 'study-room.nanojev-mlx-audit.v1',
        'repository': reference['repository'], 'revision': reference['revision'],
        'file_integrity_matches_pinned_release': complete,
        'files': files,
        'model_loaded': False, 'inference_performed': False, 'network_calls': 0,
        'scope': 'Published file integrity, container metadata, and packaging only; not numerical model equivalence or serving readiness.'
    }
    if complete:
        root_config = json.loads((model_dir / 'config.json').read_text())
        backbone = json.loads((model_dir / 'backbone_config/config.json').read_text())
        report['tensors'] = inspect_header(model_dir / 'best.safetensors')
        report['packaging'] = {
            'standard_model_safetensors_count': len(list(model_dir.glob('model*.safetensors'))),
            'root_model_type_present': 'model_type' in root_config,
            'root_quantization_present': 'quantization' in root_config or 'quantization_config' in root_config,
            'root_tokenizer_present': (model_dir / 'tokenizer.json').is_file(),
            'nested_tokenizer_present': (model_dir / 'tokenizer/tokenizer.json').is_file(),
            'backbone_model_type': backbone.get('model_type'),
            'backbone_hidden_size': backbone.get('hidden_size'),
            'backbone_layers': backbone.get('num_hidden_layers'),
            'training_max_length': root_config.get('max_length'),
            'runtime_source_shipped': any((model_dir / name).exists() for name in ('model.py', 'modeling_nanojev.py', 'serve.py')),
            'warning': 'Complete weight downloads do not supply a NanoJev MLX forward implementation or a typed decision-serving engine. Do not ignore decision heads to force chat generation.'
        }
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model-dir', type=Path, default=DEFAULT_MODEL)
    parser.add_argument('--reference', type=Path, default=REFERENCE)
    parser.add_argument('--output', type=Path, help='Create a NEW audit JSON outside the model directory; never overwrite a file')
    args = parser.parse_args()
    if args.output and args.output.expanduser().resolve().is_relative_to(args.model_dir.expanduser().resolve()):
        parser.error('Audit output must not be inside the model directory')
    report = audit(args.model_dir, args.reference)
    text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        with args.output.expanduser().open('x', encoding='utf-8') as handle:
            handle.write(text)
    else:
        print(text, end='')
    return 0 if report['file_integrity_matches_pinned_release'] else 1


if __name__ == '__main__':
    raise SystemExit(main())

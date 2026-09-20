"""Offline tests for the read-only model audit; no actual model or ML runtime."""
import importlib.util
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/audit-nanojev-mlx.py'
spec = importlib.util.spec_from_file_location('nanojev_audit', SCRIPT)
audit_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)


def tensor_file(path, invalid=None):
    header = {
        'backbone.layers.0.self_attn.q_proj.weight': {'dtype': 'U32', 'shape': [2, 2], 'data_offsets': [0, 16]},
        'backbone.layers.0.self_attn.q_proj.weight.scales': {'dtype': 'F16', 'shape': [2, 1], 'data_offsets': [16, 20]},
        'scalar.bias': {'dtype': 'F16', 'shape': [1], 'data_offsets': [20, 22]},
    }
    if invalid == 'overlap':
        header['scalar.bias']['data_offsets'] = [18, 20]
    if invalid == 'shape':
        header['scalar.bias']['shape'] = [2]
    raw = json.dumps(header).encode()
    raw += b' ' * (-len(raw) % 8)
    path.write_bytes(struct.pack('<Q', len(raw)) + raw + bytes(22))


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'model'
        self.root.mkdir()
        (self.root / 'backbone_config').mkdir()
        (self.root / 'tokenizer').mkdir()
        (self.root / 'config.json').write_text(json.dumps({'max_length': 512, 'private_training_path': 'DO_NOT_DISCLOSE'}))
        (self.root / 'backbone_config/config.json').write_text(json.dumps({'model_type': 'qwen3', 'hidden_size': 1024, 'num_hidden_layers': 28}))
        (self.root / 'tokenizer/tokenizer.json').write_text('{}')
        tensor_file(self.root / 'best.safetensors')
        self.reference = Path(self.temp.name) / 'reference.json'
        files = []
        for p in sorted(self.root.rglob('*')):
            if p.is_file():
                kind = 'sha256' if p.suffix == '.safetensors' else 'git-blob-sha1'
                files.append({'path': p.relative_to(self.root).as_posix(), 'bytes': p.stat().st_size,
                              'hash_kind': kind, 'hash': audit_module.file_digest(p, kind)})
        self.reference.write_text(json.dumps({'repository': 'fixture/test', 'revision': 'fixture', 'files': files}))

    def test_complete_files_do_not_imply_loader_compatibility(self):
        report = audit_module.audit(self.root, self.reference)
        self.assertTrue(report['file_integrity_matches_pinned_release'])
        self.assertEqual(report['tensors']['tensor_count'], 3)
        self.assertFalse(report['model_loaded'])
        self.assertFalse(report['inference_performed'])
        self.assertEqual(report['network_calls'], 0)
        self.assertEqual(report['packaging']['standard_model_safetensors_count'], 0)
        self.assertFalse(report['packaging']['root_model_type_present'])
        self.assertTrue(report['packaging']['nested_tokenizer_present'])
        self.assertNotIn('DO_NOT_DISCLOSE', json.dumps(report))

    def test_corruption_and_missing_files_are_detected_without_modifying_them(self):
        weights = self.root / 'best.safetensors'
        weights.write_bytes(weights.read_bytes() + b'x')
        before = weights.read_bytes()
        self.assertFalse(audit_module.audit(self.root, self.reference)['file_integrity_matches_pinned_release'])
        self.assertEqual(weights.read_bytes(), before)
        (self.root / 'config.json').unlink()
        report = audit_module.audit(self.root, self.reference)
        self.assertFalse(next(x for x in report['files'] if x['path'] == 'config.json')['present'])

    def test_header_checks_lengths_overlap_and_excessive_header_size(self):
        weights = self.root / 'best.safetensors'
        for invalid in ('shape', 'overlap'):
            tensor_file(weights, invalid)
            with self.assertRaises(ValueError):
                audit_module.inspect_header(weights)
        weights.write_bytes(struct.pack('<Q', 2 ** 40))
        with self.assertRaises(ValueError):
            audit_module.inspect_header(weights)

    def test_reference_paths_and_external_symlinks_are_not_followed(self):
        ref = json.loads(self.reference.read_text())
        ref['files'][0]['path'] = '../private.txt'
        self.reference.write_text(json.dumps(ref))
        with self.assertRaises(ValueError):
            audit_module.audit(self.root, self.reference)
        other = Path(self.temp.name) / 'private.txt'
        other.write_text('DO_NOT_READ_THIS_FILE')
        link = self.root / 'config.json'
        link.unlink()
        link.symlink_to(other)
        ref['files'] = [{'path': 'config.json', 'bytes': 0, 'hash_kind': 'sha256', 'hash': 'not-a-hash'}]
        self.reference.write_text(json.dumps(ref))
        item = audit_module.audit(self.root, self.reference)['files'][0]
        self.assertTrue(item['present'])
        self.assertFalse(item['safe_to_read'])
        self.assertNotIn('digest', item)

    def test_output_cannot_replace_model_data_or_an_existing_report(self):
        model_output = self.root / 'report.json'
        result = subprocess.run([sys.executable, str(SCRIPT), '--model-dir', str(self.root), '--reference', str(self.reference), '--output', str(model_output)], capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(model_output.exists())
        output = Path(self.temp.name) / 'audit.json'
        output.write_text('KEEP')
        result = subprocess.run([sys.executable, str(SCRIPT), '--model-dir', str(self.root), '--reference', str(self.reference), '--output', str(output)], capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(output.read_text(), 'KEEP')

    def test_unknown_hash_kind_fails(self):
        with self.assertRaises(ValueError):
            audit_module.file_digest(self.root / 'config.json', 'unsupported')


if __name__ == '__main__':
    unittest.main()

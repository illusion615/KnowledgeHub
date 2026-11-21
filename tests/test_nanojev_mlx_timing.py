"""Timing contract with fake kernels/tokenizer; no MLX, GPU or model weights."""
import importlib.util
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from nanojev_mlx.contract import answer_from_probabilities


class TimingTests(unittest.TestCase):
    def setUp(self):
        self.clock = 1.0
        self.evals = 0
        self.forwards = 0
        class Vector:
            def astype(self, dtype):
                return self
            def tolist(self):
                return [.25, .75]
        self.Vector = Vector
        mx = types.ModuleType('mlx.core')
        mx.float32 = 'float32'
        mx.reset_peak_memory = lambda: None
        mx.softmax = lambda value, axis: value
        def evaluate(*values):
            self.evals += 1
            self.clock += .020
        mx.eval = evaluate
        mx.get_peak_memory = lambda: 100
        mx.get_active_memory = lambda: 80
        mx.get_cache_memory = lambda: 10
        mlx = types.ModuleType('mlx'); mlx.__path__ = []; mlx.core = mx
        transformers = types.ModuleType('transformers'); transformers.AutoTokenizer = None
        model = types.ModuleType('nanojev_mlx.model')
        model.NanoJevMLX = model.backbone_args = model.install_weights = None
        spec = importlib.util.spec_from_file_location('nanojev_mlx.timing_test_engine', Path(__file__).resolve().parents[1] / 'scripts/nanojev_mlx/engine.py')
        self.module = importlib.util.module_from_spec(spec)
        with patch.dict(sys.modules, {'mlx': mlx, 'mlx.core': mx, 'transformers': transformers, 'nanojev_mlx.model': model}), patch.dict(os.environ):
            spec.loader.exec_module(self.module)
        self.module.time = types.SimpleNamespace(perf_counter=lambda: self.clock)
        def prepare(payload, tokenizer, max_length):
            self.clock += .005
            return [{'state_id': 'arena', 'qid': 'B0', 'type': 'choice', 'candidate_ids': ['a', 'b'], 'leaf_tokens': [[1, 2], [1, 2, 3]]}]
        self.module.prepare_examples = prepare
        self.engine = self.module.DecisionEngine.__new__(self.module.DecisionEngine)
        self.engine.tokenizer = types.SimpleNamespace(pad_token_id=0)
        self.engine.max_length = 512
        self.engine.path_batch_size = 16
        self.engine.inference_count = 0
        self.engine.last_prediction_end = None
        self.engine.runtime_id = 'a' * 32
        self.engine.model_id = 'TEST-NOT-A-MODEL'
        self.engine.weight_sha = 'f' * 64
        self.engine.dtype = 'float32'
        self.engine.weights_bits = 32
        self.engine.cache_limit_bytes = 512 * 1024**2
        def forward(*args):
            self.forwards += 1
            self.clock += .010
            return [Vector()]
        self.engine.model = forward
        self.payload = {'states': [{'id': 'arena'}]}

    def test_existing_forward_and_eval_are_not_repeated_for_timing(self):
        result = self.engine.predict(self.payload)
        e = result['execution']
        self.assertEqual(self.forwards, 1)
        self.assertEqual(self.evals, 1)
        self.assertEqual(result['states'][0]['answers']['B0']['choice'], 'b')
        self.assertEqual(e['timing_protocol'], 'nanojev-stages-v1')
        self.assertEqual(e['runtime_id'], 'a' * 32)
        self.assertTrue(e['first_inference'])
        self.assertIsNone(e['idle_before_ms'])
        self.assertAlmostEqual(e['prepare_ms'], 5)
        self.assertAlmostEqual(e['forward_ms'], 10)
        self.assertAlmostEqual(e['softmax_eval_ms'], 20)
        self.assertAlmostEqual(e['evaluation_ms'], 35)
        self.assertEqual(e['batch_shapes'], [[2, 3]])
        self.assertEqual(e['candidate_counts'], [2])
        self.assertEqual(e['candidate_path_tokens'], 5)
        self.assertEqual(e['active_memory_bytes'], 80)
        self.assertEqual(e['cache_memory_bytes'], 10)
        self.assertEqual(e['cache_before_bytes'], 10)
        self.assertEqual(e['active_before_bytes'], 80)
        self.assertEqual(e['cache_limit_bytes'], 512 * 1024**2)

    def test_invalid_cache_limit_rejected_before_model_load(self):
        for value in [-1, True, 1.5, 9 * 1024**3]:
            with self.assertRaisesRegex(ValueError, 'Cache limit'):
                self.module.DecisionEngine(cache_limit_bytes=value)

    def test_idle_gap_and_call_index_do_not_claim_every_slow_call_is_cold(self):
        self.engine.predict(self.payload)
        self.clock += 8
        second = self.engine.predict(self.payload)['execution']
        self.assertFalse(second['first_inference'])
        self.assertEqual(second['inference_call_index'], 2)
        self.assertAlmostEqual(second['idle_before_ms'], 8000)

    def test_failed_attempt_updates_gap_without_inventing_a_successful_inference(self):
        prepare = self.module.prepare_examples
        def broken(*args):
            self.clock += .010
            raise ValueError('synthetic failure')
        self.module.prepare_examples = broken
        with self.assertRaises(ValueError):
            self.engine.predict(self.payload)
        self.assertEqual(self.engine.inference_count, 0)
        self.clock += 2
        self.module.prepare_examples = prepare
        e = self.engine.predict(self.payload)['execution']
        self.assertTrue(e['first_inference'])
        self.assertAlmostEqual(e['idle_before_ms'], 2000)
        self.assertEqual(self.evals, 1)


if __name__ == '__main__':
    unittest.main()

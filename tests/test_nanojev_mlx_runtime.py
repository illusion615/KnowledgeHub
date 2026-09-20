"""Pure contract tests plus optional tiny-MLX graph checks (no downloaded weights)."""
import importlib.util
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from nanojev_mlx.contract import prepare_examples, validate_request, parse_json, answer_from_probabilities


class CharacterTokenizer:
    eos_token_id = 0
    def encode(self, value, add_special_tokens=False):
        assert not add_special_tokens
        return [ord(c) + 1 for c in value]


def payload():
    return {'states': [{'id': 'one', 'state': 'A refund was requested.', 'questions': {
        'route': {'type': 'choice', 'instructions': 'Choose a team.', 'criteria': {'a': 'Billing', 'b': 'Support'}},
        'yes': {'type': 'boolean', 'instructions': 'A refund was requested.', 'criteria': {'true': 'An explicit request.', 'false': 'No explicit request.'}},
        'level': {'type': 'score', 'instructions': 'How urgent?', 'criteria': ['Low', 'Medium', 'High']}
    }}]}


class ContractTests(unittest.TestCase):
    def test_ids_are_transport_only_and_unrelated_questions_are_isolated(self):
        p = payload(); before = prepare_examples(p, CharacterTokenizer(), 1024)
        p['states'][0]['id'] = 'different'
        p['states'][0]['questions']['renamed'] = p['states'][0]['questions'].pop('route')
        after = prepare_examples(p, CharacterTokenizer(), 1024)
        self.assertEqual(before[0]['leaf_tokens'], after[-1]['leaf_tokens'])
        self.assertEqual(before[1]['leaf_tokens'], after[0]['leaf_tokens'])

    def test_boolean_has_one_path_and_score_uses_expectation(self):
        rows = prepare_examples(payload(), CharacterTokenizer(), 1024)
        self.assertEqual(len(rows[1]['leaf_tokens']), 1)
        self.assertEqual(rows[1]['candidate_ids'], ['false', 'true'])
        self.assertAlmostEqual(answer_from_probabilities(rows[2], [.2, .3, .5])['score'], 1.3)

    def test_no_silent_truncation_and_no_noul_alias(self):
        with self.assertRaises(ValueError):
            prepare_examples(payload(), CharacterTokenizer(), 3)
        p = payload(); p['states'][0]['questions']['yes']['type'] = 'noul'
        with self.assertRaises(ValueError):
            validate_request(p)

    def test_json_duplicates_nonfinite_and_malformed_probabilities_fail(self):
        for text in ('{"states":[],"states":[]}', '{"x":NaN}'):
            with self.assertRaises(ValueError):
                parse_json(text)
        row = prepare_examples(payload(), CharacterTokenizer(), 1024)[0]
        for probs in ([1, 1], [float('nan'), 0], [-1, 2]):
            with self.assertRaises(ValueError):
                answer_from_probabilities(row, probs)

    def test_question_and_candidate_path_caps_are_independent(self):
        p = payload(); p['states'][0]['questions']['route']['criteria'] = {str(i): 'Option' for i in range(129)}
        with self.assertRaises(ValueError):
            validate_request(p)


@unittest.skipUnless(importlib.util.find_spec('mlx'), 'Use the isolated MLX environment for graph tests')
class GraphTests(unittest.TestCase):
    def setUp(self):
        import mlx.core as mx
        from nanojev_mlx.model import NanoJevMLX, backbone_args
        mx.random.seed(4)
        self.mx = mx
        self.args = backbone_args({'model_type': 'qwen3', 'hidden_size': 64, 'num_hidden_layers': 2, 'intermediate_size': 128, 'num_attention_heads': 4, 'rms_norm_eps': 1e-6, 'vocab_size': 128, 'num_key_value_heads': 2, 'max_position_embeddings': 512, 'rope_parameters': {'rope_type': 'default', 'rope_theta': 1000000}, 'head_dim': 16, 'tie_word_embeddings': True})
        self.model = NanoJevMLX(self.args)
        self.model.set_attention.in_proj_weight = mx.random.normal((384, 128)) * 0.03
        self.model.set_attention.in_proj_bias = mx.random.normal((384,)) * 0.01
        self.model.eval()
        self.examples = [
            {'type': 'choice', 'candidate_ids': ['a', 'b', 'c'], 'leaf_tokens': [[1, 2, 3], [1, 2, 4, 3], [1, 5, 6, 3]]},
            {'type': 'boolean', 'candidate_ids': ['false', 'true'], 'leaf_tokens': [[5, 6, 3]]},
            {'type': 'score', 'candidate_ids': ['0', '1'], 'leaf_tokens': [[8, 3], [9, 3]]},
        ]

    def test_right_padding_and_path_microbatching_preserve_valid_eos_outputs(self):
        a = self.model(self.examples, 0, 16)
        b = self.model(self.examples, 0, 1)
        for x, y in zip(a, b):
            self.assertLess(self.mx.max(self.mx.abs(x - y)).item(), 1e-5)

    def test_choice_permutation_is_equivariant(self):
        mx = self.mx
        before = self.model(self.examples, 0)[0]
        changed = json.loads(json.dumps(self.examples))
        changed[0]['leaf_tokens'] = list(reversed(changed[0]['leaf_tokens']))
        changed[0]['candidate_ids'] = list(reversed(changed[0]['candidate_ids']))
        after = self.model(changed, 0)[0]
        self.assertLess(mx.max(mx.abs(before - after[::-1])).item(), 1e-5)

    def test_all_quantized_and_head_weights_load_strictly_and_match_dequantized_forward(self):
        import mlx.core as mx
        from mlx.utils import tree_flatten
        from nanojev_mlx.model import NanoJevMLX, install_weights
        artifact = {}
        for name, value in tree_flatten(self.model.parameters()):
            if name.startswith('backbone.') and name.endswith('.weight') and value.ndim == 2:
                w, scales, biases = mx.quantize(value, bits=4, group_size=64)
                artifact[name] = w
                artifact[name + '.scales'] = scales.astype(mx.float16)
                artifact[name + '.biases'] = biases.astype(mx.float16)
            else:
                artifact[name] = value.astype(mx.float16)
        q = NanoJevMLX(self.args); reference = NanoJevMLX(self.args)
        record = install_weights(q, artifact); install_weights(reference, artifact, dequantize=True)
        self.assertTrue(record['strict_loading'])
        self.assertEqual(q.backbone.layers[0].self_attn.q_proj.weight.dtype, mx.uint32)
        for x, y in zip(q(self.examples, 0), reference(self.examples, 0)):
            self.assertLess(mx.max(mx.abs(mx.softmax(x) - mx.softmax(y))).item(), 1e-5)
        incomplete = dict(artifact); del incomplete['scalar.bias']
        with self.assertRaises(ValueError):
            install_weights(NanoJevMLX(self.args), incomplete)


if __name__ == '__main__':
    unittest.main()

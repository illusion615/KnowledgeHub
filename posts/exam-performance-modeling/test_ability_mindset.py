"""Run: python3 -m unittest discover -s posts/exam-performance-modeling -p test_ability_mindset.py"""
from copy import deepcopy
from fractions import Fraction as F
from html.parser import HTMLParser
from pathlib import Path
import json
import runpy
import unittest

ROOT = Path(__file__).resolve().parent
MODULE = runpy.run_path(str(ROOT / 'ability-mindset-calculation.py'))


class AbilityMindsetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = MODULE['BASE']['load_records']()

    def test_forecast_inputs_use_the_stated_windows(self):
        values = MODULE['proxy_inputs'](self.records, F(1, 5))
        self.assertEqual(values['recent_rate'], F(399, 450))
        self.assertEqual(values['recent_difficulty'], F(62, 300))
        self.assertEqual(values['previous_margin'], F(18, 150))
        self.assertEqual(values['earlier_margin_mean'], F(30, 450))
        self.assertEqual(values['feedback'], F(4, 75))
        self.assertEqual(values['difficulty_delta'], F(-1, 150))
        with self.assertRaises(ValueError):
            MODULE['proxy_inputs'](self.records[:3], F(1, 5))

    def test_target_and_future_outcomes_never_enter_their_own_forecast(self):
        for start, stop, frozen in [(17, 20, None), (21, 24, 20)]:
            for target in range(start, stop + 1):
                expected = MODULE['evaluate'](self.records, True, target, target, frozen)
                changed = deepcopy(self.records)
                for row in changed[target - 1:]:
                    row['y'] += F(1, 10)
                    row['score'] += row['maximum'] * F(1, 10)
                    row['r'] = row['y'] - row['m']
                actual = MODULE['evaluate'](changed, True, target, target, frozen)
                self.assertEqual(expected['observations'][0]['prediction_points'],
                                 actual['observations'][0]['prediction_points'])
                self.assertEqual(actual['observations'][0]['last_available_exam'], target - 1)

    def test_released_previous_outcomes_are_allowed_to_change_later_inputs(self):
        changed = deepcopy(self.records)
        changed[20]['y'] += F(1, 10)
        changed[20]['r'] += F(1, 10)
        before = MODULE['proxy_inputs'](self.records[:21], self.records[21]['difficulty'])
        after = MODULE['proxy_inputs'](changed[:21], self.records[21]['difficulty'])
        self.assertNotEqual(before['recent_rate'], after['recent_rate'])
        self.assertNotEqual(before['feedback'], after['feedback'])
        # Frozen coefficients still use only the first twenty outcomes.
        self.assertEqual(MODULE['fit_proxy'](self.records[:20]),
                         MODULE['fit_proxy'](changed[:20]))

    def test_joint_fit_matches_exact_arithmetic_and_component_identity(self):
        for feedback in (False, True):
            beta = MODULE['fit_proxy'](self.records, feedback)
            exact = MODULE['fit_proxy'](self.records, feedback, exact=True)
            for a, b in zip(beta, exact):
                self.assertAlmostEqual(a, float(b), places=10)
            alpha, gamma = exact[:2]
            lam = exact[2] if feedback else F(0)
            inputs = MODULE['proxy_inputs'](self.records, F(1, 5))
            ability = inputs['recent_rate'] - gamma * (inputs['recent_difficulty'] - F(1, 5))
            expanded = alpha + ability + lam * inputs['feedback']
            reduced = inputs['recent_rate'] + alpha + gamma * inputs['difficulty_delta'] + lam * inputs['feedback']
            self.assertEqual(expanded, reduced)

    def test_published_results_preserve_limitations_and_show_mixed_validation(self):
        result = MODULE['calculate'](self.records)
        stored = json.loads((ROOT / 'ability-mindset-results.json').read_text())
        self.assertEqual(result, stored)
        original = json.loads((ROOT / 'model-results.json').read_text())
        self.assertEqual(result['source_sha256'], original['source_sha256'])
        variants = result['variants']
        a, full = variants['ability_only'], variants['ability_and_feedback']
        self.assertAlmostEqual(full['forecast_points'], 136.81608401314656, places=9)
        self.assertAlmostEqual(sum(full['forecast_components'].values()), full['forecast_points'], places=9)
        self.assertLess(full['rolling_check_17_20']['mae_points'], a['rolling_check_17_20']['mae_points'])
        self.assertGreater(full['later_check_21_24']['mae_points'], a['later_check_21_24']['mae_points'])
        self.assertTrue(result['protocol']['no_model_selection_claim'])
        self.assertTrue(result['protocol']['not_comparable_to_original_batch_holdout'])
        self.assertIn('retrospective', result['status'])
        self.assertTrue(result['first_question_conclusion']['not_confirmed_superior'])
        self.assertNotAlmostEqual(result['scenario_feedback_zero']['forecast_points'], a['forecast_points'])

    def test_article_tables_match_reproducible_results(self):
        class NumericTables(HTMLParser):
            def __init__(self):
                super().__init__()
                self.table = None
                self.cell = False
                self.values = {}

            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                if tag == 'table' and attrs.get('id') in ('feedback-evaluation', 'ability-mindset-components'):
                    self.table = attrs['id']
                    self.values[self.table] = []
                if tag == 'td' and self.table:
                    self.cell = True

            def handle_data(self, data):
                if self.cell:
                    try:
                        self.values[self.table].append(float(data))
                    except ValueError:
                        pass

            def handle_endtag(self, tag):
                if tag == 'td':
                    self.cell = False
                if tag == 'table':
                    self.table = None

        parser = NumericTables()
        parser.feed((ROOT / 'index.html').read_text())
        results = json.loads((ROOT / 'ability-mindset-results.json').read_text())
        variants = results['variants']
        expected_mae = [variants[k][stage]['mae_points']
                        for k in ('ability_only', 'ability_and_feedback')
                        for stage in ('rolling_check_17_20', 'later_check_21_24')]
        expected_components = list(variants['ability_and_feedback']['forecast_components'].values())
        for table, expected in [('feedback-evaluation', expected_mae),
                                ('ability-mindset-components', expected_components)]:
            self.assertEqual(len(parser.values[table]), 4)
            for shown, exact in zip(parser.values[table], expected):
                self.assertLessEqual(abs(shown - exact), 0.00500001)


if __name__ == '__main__':
    unittest.main()

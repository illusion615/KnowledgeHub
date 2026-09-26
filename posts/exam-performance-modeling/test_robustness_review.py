import copy
import importlib.util
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('robustness_review', ROOT / 'robustness-review.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


class RobustnessReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = review.BASE['load_records']()
        cls.results = review.calculate(cls.records)

    def test_new_results_reproduce_without_overwriting_originals(self):
        saved = json.loads((ROOT / 'robustness-review-results.json').read_text())
        self.assertEqual(self.results, saved)
        old = json.loads((ROOT / 'ability-mindset-results.json').read_text())
        self.assertEqual(saved['source_sha256'], old['source_sha256'])
        self.assertTrue(saved['protocol']['no_winner_selection'])
        self.assertIn('not independent', saved['status'])

    def test_fractional_mean_recovers_known_synthetic_curve(self):
        beta = [0.4, 0.7, -0.5]
        rows = [{'t': 10 + i, 'difficulty': .15 + .025 * (i % 4)} for i in range(12)]
        for row in rows:
            row['y'] = review.sigmoid(review.dot(review.features(row), beta))
        fit = review.fit_bounded(rows, 'y')
        for actual, expected in zip(fit['beta'], beta):
            self.assertAlmostEqual(actual, expected, places=7)
        self.assertLess(fit['gradient_max_abs'], 1e-8)
        # Interior parameters can fit data containing exact 0 and 1 without transforming responses.
        edges = []
        for row in rows:
            edges += [{**row, 'y': 0.}, {**row, 'y': 1.}]
        self.assertEqual(review.fit_bounded(edges, 'y')['beta'], [0., 0., 0.])
        with self.assertRaises(ValueError):
            review.fit_bounded([{**row, 'y': 1.} for row in rows], 'y')

    def test_fitted_score_equations_are_stationary_and_predictions_bounded(self):
        for target, fit in self.results['full_fit'].items():
            for j in range(3):
                score = sum(review.features(row)[j] * (review.bounded_predict(fit, row) - float(row[target]))
                            for row in self.records)
                self.assertLess(abs(score), 1e-8)
            for t in [1, 25, 40]:
                for d in [.0, .1, .2, .4, 1.]:
                    value = review.bounded_predict(fit, {'t': t, 'difficulty': d})
                    self.assertTrue(0 < value < 1)
        for row in self.results['bounded_grid']['rows']:
            self.assertTrue(0 < row['score_points'] < 150)
            self.assertTrue(0 < row['mean_points'] < 150)
            self.assertAlmostEqual(row['score_points'] - row['mean_points'], row['margin_points'])

    def test_all_candidates_share_cutoff_horizon_and_release_rule(self):
        for target in ('score_checks', 'margin_checks'):
            for result in self.results[target].values():
                observations = result['observations']
                self.assertEqual([r['target_t'] for r in observations], list(range(17, 25)))
                self.assertEqual([r['training_cutoff'] for r in observations], list(range(16, 24)))
                self.assertTrue(all(r['horizon'] == 1 for r in observations))
                self.assertAlmostEqual(result['mae_17_24'], sum(abs(r['error_points']) for r in observations) / 8)
        altered = copy.deepcopy(self.records)
        for row in altered[16:]:
            row.update(y=.1, m=.9, r=-.8, score=15, grade_mean=135)
        for kind in review.SCORE_KINDS:
            first = review.evaluate(altered, 'y', kind)['observations'][0]
            self.assertEqual(first['prediction_points'], self.results['score_checks'][kind]['observations'][0]['prediction_points'])
        for kind in review.MARGIN_KINDS:
            first = review.evaluate(altered, 'r', kind)['observations'][0]
            self.assertEqual(first['prediction_points'], self.results['margin_checks'][kind]['observations'][0]['prediction_points'])

    def test_original_selection_period_agrees_but_later_protocol_is_different(self):
        old = json.loads((ROOT / 'model-results.json').read_text())
        for target, key in [('y', 'score_checks'), ('r', 'margin_checks')]:
            for kind in ('mean3', 'linear', 'quadratic'):
                self.assertAlmostEqual(self.results[key][kind]['mae_17_20'],
                                       old['targets'][target]['candidates'][kind]['selection']['mae_points_150'])
        self.assertNotAlmostEqual(self.results['score_checks']['linear']['mae_21_24'],
                                  old['targets']['y']['candidates']['linear']['final_test']['mae_points_150'])
        self.assertTrue(self.results['same_design_ols_margin_identity_exact'])

    def test_grid_and_sensitivity_do_not_claim_an_exact_or_stable_optimum(self):
        grid = self.results['bounded_grid']
        self.assertEqual(len(grid['rows']), 21)
        self.assertEqual(grid['best_on_stated_grid']['d'], .12)
        self.assertEqual(grid['best_on_supported_grid']['d'], .15)
        self.assertLess(grid['best_on_stated_grid']['margin_points'] - grid['rows'][0]['margin_points'], .04)
        self.assertEqual(self.results['stability']['bounded']['deletion_best_grid_d_range'], [.1, .14])
        self.assertEqual([r['last_n'] for r in self.results['stability']['bounded']['window_checks']], [24, 12, 8])
        self.assertEqual([r['best_grid_d'] for r in self.results['stability']['bounded']['window_checks']], [.12, .14, .16])
        self.assertTrue(self.results['protocol']['grid_optimum_is_not_continuous_optimum'])

    def test_article_review_tables_match_result_values(self):
        # Added after the review is integrated, not a snapshot of implementation details.
        from html.parser import HTMLParser
        class Tables(HTMLParser):
            def __init__(self):
                super().__init__(); self.current = None; self.cell = None; self.cells = {}
            def handle_starttag(self, tag, attrs):
                if tag == 'table':
                    self.current = dict(attrs).get('id')
                    self.cells.setdefault(self.current, [])
                if tag == 'td' and self.current:
                    self.cell = ''
            def handle_data(self, data):
                if self.cell is not None: self.cell += data
            def handle_endtag(self, tag):
                if tag == 'td' and self.cell is not None:
                    self.cells[self.current].append(self.cell.strip()); self.cell = None
                if tag == 'table': self.current = None
        parser = Tables(); parser.feed((ROOT / 'index.html').read_text())
        def displayed(value):
            return str(Decimal(str(value)).quantize(Decimal('.01'), rounding=ROUND_HALF_UP))
        tables = [
            ('matched-score-results', 'score_checks', ('mean3', 'linear', 'quadratic', 'bounded')),
            ('matched-proxy-results', 'score_checks', ('ability_only', 'ability_and_feedback')),
            ('matched-margin-results', 'margin_checks', review.MARGIN_KINDS),
        ]
        for table, key, kinds in tables:
            cells = parser.cells[table]
            expected = [displayed(self.results[key][kind][col]) for kind in kinds
                        for col in ('mae_17_20', 'mae_21_24', 'mae_17_24')]
            numbers = [cell for i, cell in enumerate(cells) if i % 4]
            self.assertEqual(numbers, expected)
        grid = [row for row in self.results['bounded_grid']['rows'] if row['d'] in (.1, .12, .15, .2, .25, .3)]
        self.assertEqual(parser.cells['bounded-scenario-results'],
                         [displayed(row[key]) for row in grid for key in ('d', 'score_points', 'mean_points', 'margin_points')])
        windows = self.results['stability']
        self.assertEqual(parser.cells['review-window-results'],
                         [value for a, b in zip(windows['linear']['window_checks'], windows['bounded']['window_checks'])
                          for value in (str(a['last_n']), displayed(a['forecast_points']), displayed(b['forecast_points']))])


if __name__ == '__main__':
    unittest.main()

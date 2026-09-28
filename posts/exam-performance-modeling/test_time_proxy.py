import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('time_proxy', ROOT / 'time-proxy-calculation.py')
proxy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(proxy)


def centered_prediction(past, target, with_stage):
    n = len(past)
    mt, md, my = [sum(float(r[k]) for r in past) / n for k in ('t', 'difficulty', 'y')]
    centered = [(float(r['t']) - mt, float(r['difficulty']) - md, float(r['y']) - my) for r in past]
    dd = sum(d * d for t, d, y in centered)
    dy = sum(d * y for t, d, y in centered)
    if with_stage:
        tt = sum(t * t for t, d, y in centered)
        td = sum(t * d for t, d, y in centered)
        ty = sum(t * y for t, d, y in centered)
        determinant = tt * dd - td * td
        b, c = (ty * dd - dy * td) / determinant, (dy * tt - ty * td) / determinant
    else:
        b, c = 0, dy / dd
    return my + b * (float(target['t']) - mt) + c * (float(target['difficulty']) - md)


class TimeProxyTests(unittest.TestCase):
    def test_export_and_original_evidence(self):
        paths = [ROOT / n for n in ('model-results.json', 'ability-mindset-results.json', 'robustness-review-results.json')]
        before = [p.read_bytes() for p in paths]
        result = proxy.build()
        self.assertEqual(result, json.loads((ROOT / 'time-proxy-results.json').read_text()))
        self.assertEqual(before, [p.read_bytes() for p in paths])
        original = json.loads(paths[0].read_text())['targets']['y']['candidates']['linear']
        for protocol, prior in [('rolling_17_20', 'selection'), ('frozen_21_24', 'final_test')]:
            fitted = result['protocols'][protocol]['stage_and_difficulty']
            self.assertAlmostEqual(fitted['mae_points'], original[prior]['mae_points_150'], places=10)
            for row, old in zip(fitted['forecasts'], original[prior]['observations']):
                self.assertAlmostEqual(row['predicted_rate'], old['predicted_rate'], places=12)

    def test_all_forecasts_independently_reproduced_and_cutoffs_matched(self):
        records = proxy.calculation.load_records()
        for protocol, models in proxy.build()['protocols'].items():
            for kind, result in models.items():
                stage = kind == 'stage_and_difficulty'
                errors = []
                for r in result['forecasts']:
                    cutoff = r['t'] - 1 if protocol == 'rolling_17_20' else 20
                    self.assertEqual(r['training_cutoff'], cutoff)
                    self.assertEqual(r['horizon'], r['t'] - cutoff)
                    self.assertEqual(r['maximum'], 150)
                    prediction = centered_prediction(records[:cutoff], records[r['t'] - 1], stage)
                    self.assertAlmostEqual(prediction, r['predicted_rate'], places=12)
                    error = r['observed_score'] - 150 * prediction
                    self.assertAlmostEqual(error, r['error_points'], places=9)
                    errors.append(abs(error))
                self.assertAlmostEqual(result['mae_points'], sum(errors) / 4, places=9)
        expected = [[3.89, 3.15], [9.78, 6.60]]
        actual = [[round(m[k]['mae_points'], 2) for k in ('difficulty_only', 'stage_and_difficulty')]
                  for m in proxy.build()['protocols'].values()]
        self.assertEqual(actual, expected)

    def test_targets_do_not_enter_their_own_training(self):
        original = proxy.calculation.load_records()
        changed = copy.deepcopy(original)
        for r in changed[20:]:
            r['y'] = 0
        for stage in (False, True):
            before = proxy.evaluate(original, 21, 24, False, stage)
            after = proxy.evaluate(changed, 21, 24, False, stage)
            self.assertEqual([r['predicted_rate'] for r in before['forecasts']], [r['predicted_rate'] for r in after['forecasts']])
            changed_rolling = copy.deepcopy(original)
            changed_rolling[16]['y'] = 0
            before = proxy.evaluate(original, 17, 20, True, stage)['forecasts']
            after = proxy.evaluate(changed_rolling, 17, 20, True, stage)['forecasts']
            self.assertEqual(before[0]['predicted_rate'], after[0]['predicted_rate'])
            self.assertNotAlmostEqual(before[1]['predicted_rate'], after[1]['predicted_rate'])

    def test_index_origin_is_arbitrary_but_parameters_must_change(self):
        records = proxy.calculation.load_records()
        shifted = copy.deepcopy(records)
        for row in shifted:
            row['t'] += 100
        a = proxy.evaluate(records, 21, 24, False, True)['forecasts']
        b = proxy.evaluate(shifted, 21, 24, False, True)['forecasts']
        for original, renamed in zip(a, b):
            self.assertAlmostEqual(original['predicted_rate'], renamed['predicted_rate'], places=9)
            beta = original['coefficients']
            self.assertAlmostEqual(renamed['coefficients']['intercept'], beta['intercept'] - 100 * beta['time'], places=8)
        reduced = proxy.evaluate(records, 21, 24, False, False)['forecasts'][0]
        self.assertNotAlmostEqual(reduced['coefficients']['intercept'], a[0]['coefficients']['intercept'])
        self.assertNotAlmostEqual(reduced['coefficients']['difficulty'], a[0]['coefficients']['difficulty'])


if __name__ == '__main__':
    unittest.main()

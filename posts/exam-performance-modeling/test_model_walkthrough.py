import json
from pathlib import Path
import runpy
import types
import unittest

ROOT = Path(__file__).resolve().parent
export = types.SimpleNamespace(**runpy.run_path(str(ROOT / 'model-walkthrough-calculation.py')))


class WalkthroughTrainingTests(unittest.TestCase):
    def test_export_reproduces_original_training_and_preserves_result_files(self):
        files = [ROOT / name for name in ['model-results.json', 'ability-mindset-results.json', 'robustness-review-results.json']]
        before = [p.read_bytes() for p in files]
        self.assertEqual(export.build(), json.loads((ROOT / 'model-walkthrough-results.json').read_text()))
        self.assertEqual(before, [p.read_bytes() for p in files])

    def test_training_fit_does_not_use_last_four_scores(self):
        records = export.calculation.load_records()
        beta = export.calculation.fit(records[:20], 'y', 'linear', exact=True)
        bounded = export.review.fit_bounded(records[:20], 'y')
        baseline = export.calculation.fit(records[:20], 'y', 'mean3')
        for row in records[20:]:
            row['y'] = 0
        self.assertEqual(beta, export.calculation.fit(records[:20], 'y', 'linear', exact=True))
        self.assertEqual(bounded, export.review.fit_bounded(records[:20], 'y'))
        self.assertEqual(baseline, export.calculation.fit(records[:20], 'y', 'mean3'))
        saved = json.loads((ROOT / 'model-walkthrough-results.json').read_text())
        self.assertEqual(saved['candidate_comparison']['bounded'], bounded)
        self.assertEqual(saved['candidate_comparison']['baseline_mean'], baseline[0])
        self.assertEqual(saved['candidate_comparison']['reference_t'], 20)
        for key, value in export.calculation.raw_coefficients(beta, 'linear').items():
            self.assertAlmostEqual(saved['coefficients'][key], value, places=12)


if __name__ == '__main__':
    unittest.main()

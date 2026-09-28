"""Regression check for the corrected proxy identifiability argument; no new fitted model."""
from fractions import Fraction
from pathlib import Path
import runpy
import unittest

ROOT = Path(__file__).resolve().parent
BASE = runpy.run_path(str(ROOT / 'model-calculation.py'))
PROXY = runpy.run_path(str(ROOT / 'ability-mindset-calculation.py'))


def exact_rank(rows):
    a = [list(row) for row in rows]
    rank = 0
    for col in range(len(a[0])):
        pivot = next((i for i in range(rank, len(a)) if a[i][col]), None)
        if pivot is None:
            continue
        a[rank], a[pivot] = a[pivot], a[rank]
        divisor = a[rank][col]
        a[rank] = [v / divisor for v in a[rank]]
        for i in range(rank + 1, len(a)):
            factor = a[i][col]
            a[i] = [v - factor * p for v, p in zip(a[i], a[rank])]
        rank += 1
    return rank


class ArticleConsistencyTests(unittest.TestCase):
    def test_distinct_proxy_inputs_cannot_be_declared_identical_columns(self):
        records = BASE['load_records']()
        distinct, identical = [], []
        for i in range(4, len(records)):
            values = PROXY['proxy_inputs'](records[:i], records[i]['difficulty'])
            row = [Fraction(1), values['difficulty_delta'], values['feedback']]
            distinct.append(row + [records[i]['difficulty'] - Fraction(1, 5)])
            identical.append(row + [values['difficulty_delta']])
        # The old hypothetical mu*(d-.2) term is NOT collinear once K(gamma) is substituted.
        self.assertEqual(exact_rank(distinct), 4)
        # The corrected illustrative example really does duplicate an input column.
        self.assertEqual(exact_rank(identical), 3)

    def test_gamma_in_the_ability_proxy_prevents_the_old_cancellation_argument(self):
        d, recent_d = Fraction(3, 10), Fraction(1, 4)
        gamma, kappa, shift = Fraction(-1), Fraction(1, 5), Fraction(1, 10)
        before = gamma * (d - recent_d) + kappa * (d - Fraction(1, 5))
        after = (gamma + shift) * (d - recent_d) + (kappa - shift) * (d - Fraction(1, 5))
        self.assertEqual(after - before, shift * (Fraction(1, 5) - recent_d))
        self.assertNotEqual(before, after)
        # For genuinely identical columns, the sum is invariant under the same shift.
        self.assertEqual(gamma * (d - recent_d) + kappa * (d - recent_d),
                         (gamma + shift) * (d - recent_d) + (kappa - shift) * (d - recent_d))


if __name__ == '__main__':
    unittest.main()

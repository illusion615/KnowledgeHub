#!/usr/bin/env python3
"""Retrospective, matched one-step checks; never overwrites the original results.

Fixed review design: exams 17--24, refit before every target, three-exam baseline,
existing candidates plus one fractional-logit mean form. No winner selection,
confidence intervals, or claims of independent confirmation. Standard library only.
"""
from fractions import Fraction
from pathlib import Path
import hashlib
import json
import math
import runpy

ROOT = Path(__file__).resolve().parent
BASE = runpy.run_path(str(ROOT / 'model-calculation.py'))
PROXY = runpy.run_path(str(ROOT / 'ability-mindset-calculation.py'))
SCORE_KINDS = ('mean3', 'linear', 'quadratic', 'ability_only', 'ability_and_feedback', 'bounded')
MARGIN_KINDS = ('mean3', 'linear', 'quadratic', 'bounded_pair')
GRID = tuple(Fraction(10 + i, 100) for i in range(21))  # Fixed .01 grid; not a continuous optimum.


def sigmoid(z):
    if z >= 0:
        return 1 / (1 + math.exp(-z))
    value = math.exp(z)
    return value / (1 + value)


def features(row):
    # Fixed, outcome-independent scaling. Coefficients are in this coordinate system.
    return [1.0, (row['t'] - 16) / 8, (float(row['difficulty']) - .2) / .1]


def dot(x, beta):
    return sum(a * b for a, b in zip(x, beta))


def loss(x, y, beta):
    # Negative Bernoulli quasi-log-likelihood for fractional outcomes, not 150 trials.
    return sum(max(z, 0) + math.log1p(math.exp(-abs(z))) - target * z
               for row, target in zip(x, y) for z in [dot(row, beta)])


def fit_bounded(records, target):
    """Fractional-logit conditional mean fitted by damped Newton iteration.

    No response logit transform, outcome clipping, variable selection, or p-values.
    Convergence is checked; nonconvergence raises rather than publishing a result.
    """
    x = [features(row) for row in records]
    y = [float(row[target]) for row in records]
    if len(y) < 3 or any(not 0 <= value <= 1 for value in y):
        raise ValueError('Need at least three fractional responses in [0, 1]')
    gram = [[sum(row[j] * row[k] for row in x) for k in range(3)] for j in range(3)]
    BASE['solve'](gram, [0., 0., 0.])  # Reject unidentified three-parameter designs.
    mean = sum(y) / len(y)
    if not 0 < mean < 1:
        raise ValueError('All-boundary outcomes have no finite intercept optimum')
    beta = [math.log(mean / (1 - mean)), 0., 0.]
    for iteration in range(100):
        mu = [sigmoid(dot(row, beta)) for row in x]
        gradient = [sum(row[j] * (estimate - actual)
                        for row, estimate, actual in zip(x, mu, y)) for j in range(3)]
        gradient_norm = max(abs(value) for value in gradient)
        if gradient_norm < 1e-8:
            return {'beta': beta, 'iterations': iteration,
                    'gradient_max_abs': gradient_norm, 'loss': loss(x, y, beta)}
        hessian = [[sum(row[j] * row[k] * estimate * (1 - estimate)
                        for row, estimate in zip(x, mu)) for k in range(3)] for j in range(3)]
        step = BASE['solve'](hessian, gradient)
        old_loss = loss(x, y, beta)
        scale = 1.
        for _ in range(40):
            candidate = [b - scale * delta for b, delta in zip(beta, step)]
            if loss(x, y, candidate) <= old_loss + 1e-13:
                beta = candidate
                break
            scale /= 2
        else:
            raise ArithmeticError('Fractional-logit line search failed')
    raise ArithmeticError('Fractional-logit fit did not converge')


def bounded_predict(fit, row):
    return sigmoid(dot(features(row), fit['beta']))


def prediction(past, row, target, kind):
    if kind == 'bounded':
        return bounded_predict(fit_bounded(past, target), row)
    if kind == 'bounded_pair':
        return (bounded_predict(fit_bounded(past, 'y'), row)
                - bounded_predict(fit_bounded(past, 'm'), row))
    if kind in ('ability_only', 'ability_and_feedback'):
        assert target == 'y'
        beta = PROXY['fit_proxy'](past, kind == 'ability_and_feedback')
        return PROXY['predict_proxy'](beta, past, row['difficulty'])
    return BASE['predict'](BASE['fit'](past, target, kind), row, kind)


def evaluate(records, target, kind):
    observations = []
    for i in range(16, 24):
        # Never pass the target's score/mean to a predictor, only its allowed inputs.
        row = {'t': records[i]['t'], 'difficulty': records[i]['difficulty']}
        estimate = prediction(records[:i], row, target, kind)
        observations.append({'target_t': i + 1, 'training_cutoff': i, 'horizon': 1,
                             'prediction_points': estimate * 150,
                             'actual_points': float(records[i][target]) * 150,
                             'error_points': (float(records[i][target]) - estimate) * 150})
    def mae(rows):
        return sum(abs(row['error_points']) for row in rows) / len(rows)
    return {'mae_17_20': mae(observations[:4]), 'mae_21_24': mae(observations[4:]),
            'mae_17_24': mae(observations), 'observations': observations}


def grid_predictions(records, bounded=True):
    target = {'t': 25, 'difficulty': Fraction(1, 5)}
    if bounded:
        fy, fm = fit_bounded(records, 'y'), fit_bounded(records, 'm')
    else:
        fy, fm = BASE['fit'](records, 'y', 'linear'), BASE['fit'](records, 'm', 'linear')
    rows = []
    for d in GRID:
        target['difficulty'] = d
        if bounded:
            y, m = bounded_predict(fy, target), bounded_predict(fm, target)
        else:
            y = BASE['predict'](fy, target, 'linear')
            m = BASE['predict'](fm, target, 'linear')
        rows.append({'d': float(d), 'score_points': 150 * y,
                     'mean_points': 150 * m, 'margin_points': 150 * (y - m)})
    def best(part):
        return max(part, key=lambda row: row['margin_points'])
    return {'rows': rows, 'best_on_stated_grid': best(rows),
            'best_on_supported_grid': best([row for row in rows if row['d'] >= .15])}


def stability(records, kind):
    """Diagnostic refits only: preserve exam IDs, do not claim leave-one-out forecasting."""
    bounded = kind == 'bounded'
    def summarize(sample):
        grid = grid_predictions(sample, bounded)
        forecast = prediction(sample, {'t': 25, 'difficulty': Fraction(1, 5)}, 'y', kind)
        return {'forecast_points': 150 * forecast,
                'best_grid_d': grid['best_on_stated_grid']['d'],
                'best_supported_grid_d': grid['best_on_supported_grid']['d']}
    windows = [{'last_n': n, **summarize(records[-n:])} for n in (24, 12, 8)]
    deletions = [{'omitted_t': row['t'], **summarize(records[:i] + records[i + 1:])}
                 for i, row in enumerate(records)]
    return {'window_checks': windows, 'leave_one_out_diagnostics': deletions,
            'deletion_forecast_range': [min(row['forecast_points'] for row in deletions),
                                        max(row['forecast_points'] for row in deletions)],
            'deletion_best_grid_d_range': [min(row['best_grid_d'] for row in deletions),
                                           max(row['best_grid_d'] for row in deletions)]}


def calculate(records):
    result = {
        'status': 'retrospective review after all 24 outcomes were known; not independent validation',
        'protocol': {
            'targets': [17, 24], 'horizon': 1, 'refit_before_each_target': True,
            'observed_inputs': 'Only exams strictly before each target; target difficulty is given',
            'no_comparison_with_old_batch_mae': True, 'no_winner_selection': True,
            'no_confidence_interval_or_significance_claim': True,
            'article_rounding': 'decimal half-up to 0.01 points; calculations keep full precision',
            'bounded_fit': 'fractional-logit mean; Bernoulli quasi-log-likelihood; no response transform or clipping',
            'joint_scope': 'two separately fitted bounded means; not a joint distribution or a probability model',
            'parameter_counts': {'linear': 3, 'quadratic': 4, 'ability_only': 2,
                                 'ability_and_feedback': 3, 'bounded': 3, 'bounded_pair': 6},
            'grid_step': .01, 'grid_optimum_is_not_continuous_optimum': True,
            'sensitivity': 'fixed last-24/12/8 windows and every single-record deletion, diagnostics only',
        },
        'score_checks': {kind: evaluate(records, 'y', kind) for kind in SCORE_KINDS},
        'margin_checks': {kind: evaluate(records, 'r', kind) for kind in MARGIN_KINDS},
        'full_fit': {target: fit_bounded(records, target) for target in ('y', 'm')},
        'score_scenarios': {kind: prediction(records, {'t': 25, 'difficulty': Fraction(1, 5)}, 'y', kind) * 150
                            for kind in SCORE_KINDS},
        'bounded_grid': grid_predictions(records),
        'stability': {kind: stability(records, kind) for kind in ('linear', 'bounded')},
    }
    # A matched linear pair is algebraically the original direct margin fit.
    for kind in ('linear', 'quadratic'):
        by = BASE['fit'](records, 'y', kind, exact=True)
        bm = BASE['fit'](records, 'm', kind, exact=True)
        br = BASE['fit'](records, 'r', kind, exact=True)
        assert br == [y - m for y, m in zip(by, bm)]
    result['same_design_ols_margin_identity_exact'] = True
    serialized = [{key: str(row[key]) for key in ('t', 'maximum', 'score', 'difficulty', 'grade_mean')}
                  for row in records]
    result['source_sha256'] = hashlib.sha256(json.dumps(serialized, sort_keys=True).encode()).hexdigest()
    return result


if __name__ == '__main__':
    result = calculate(BASE['load_records']())
    output = ROOT / 'robustness-review-results.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {output.name}; retrospective only, original results untouched.')
    print(json.dumps({key: {name: round(value['mae_17_24'], 4) for name, value in result[key].items()}
                      for key in ('score_checks', 'margin_checks')}, ensure_ascii=False))

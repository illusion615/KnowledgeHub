"""Retrospective stage-term ablation; never overwrites the original result files."""
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('exam_calculation', ROOT / 'model-calculation.py')
calculation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calculation)


def fit_difficulty(records):
    """Refit BOTH intercept and difficulty coefficient after removing stage."""
    x = [[1.0, float(r['difficulty'])] for r in records]
    return calculation.solve(
        [[sum(row[j] * row[k] for row in x) for k in range(2)] for j in range(2)],
        [sum(row[j] * float(r['y']) for row, r in zip(x, records)) for j in range(2)])


def evaluate(records, first, last, rolling, with_stage):
    forecasts = []
    for t in range(first, last + 1):
        cutoff = t - 1 if rolling else 20
        past, target = records[:cutoff], records[t - 1]
        if with_stage:
            beta = calculation.fit(past, 'y', 'linear')
            predicted = calculation.predict(beta, target, 'linear')
            coefficients = calculation.raw_coefficients(beta, 'linear')
        else:
            intercept, slope = fit_difficulty(past)
            predicted = intercept + slope * float(target['difficulty'])
            coefficients = {'intercept': intercept, 'difficulty': slope}
        maximum = float(target['maximum'])
        forecasts.append({
            't': t, 'training_cutoff': cutoff, 'horizon': t - cutoff,
            'coefficients': coefficients, 'difficulty': float(target['difficulty']),
            'maximum': maximum, 'observed_score': float(target['score']),
            'predicted_rate': predicted, 'predicted_score': maximum * predicted,
            'error_points': maximum * (float(target['y']) - predicted),
        })
    return {'mae_points': sum(abs(r['error_points']) for r in forecasts) / len(forecasts),
            'forecasts': forecasts}


def build():
    records = calculation.load_records()
    return {
        'scope': 'Additional retrospective ablation on known records, not an original candidate comparison, new independent holdout, significance test, or causal estimate.',
        'target': 'student score rate; least-squares fitting in rate units; evaluation in original score points',
        'ordering_assumption': 'Within-year column order is treated as chronological, with eight records per school year; actual dates and intervals are unavailable.',
        'original_result_sha256': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
                                   for name in ['model-results.json', 'ability-mindset-results.json', 'robustness-review-results.json']},
        'protocols': {
            name: {kind: evaluate(records, first, last, rolling, with_stage)
                   for kind, with_stage in [('difficulty_only', False), ('stage_and_difficulty', True)]}
            for name, first, last, rolling in [('rolling_17_20', 17, 20, True), ('frozen_21_24', 21, 24, False)]
        },
    }


if __name__ == '__main__':
    output = ROOT / 'time-proxy-results.json'
    output.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(output)

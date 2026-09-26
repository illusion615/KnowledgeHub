#!/usr/bin/env python3
"""Retrospective proxy-model check for Question 1; not psychological identification.

Only Python stdlib. Reads the existing article source tables through the existing
calculation module. Does not overwrite model-results.json or select a new winner.
Run: python3 posts/exam-performance-modeling/ability-mindset-calculation.py
"""
from fractions import Fraction
from pathlib import Path
import hashlib
import json
import runpy

ROOT = Path(__file__).resolve().parent
BASE = runpy.run_path(str(ROOT / "model-calculation.py"))
REFERENCE_DIFFICULTY = Fraction(1, 5)


def proxy_inputs(past, difficulty):
    """All observed scores must precede the exam being predicted.

    Recent score and difficulty averages use t-3:t-1. Relative feedback compares
    r_(t-1) against r_(t-4):r_(t-2). These fixed windows are teaching assumptions,
    not validated psychological measurement scales.
    """
    if len(past) < 4:
        raise ValueError("Four past exams are required")
    mean_y = sum(row["y"] for row in past[-3:]) / 3
    mean_d = sum(row["difficulty"] for row in past[-3:]) / 3
    previous_r = past[-1]["r"]
    earlier_r_mean = sum(row["r"] for row in past[-4:-1]) / 3
    return {"recent_rate": mean_y, "recent_difficulty": mean_d,
            "previous_margin": previous_r, "earlier_margin_mean": earlier_r_mean,
            "feedback": previous_r - earlier_r_mean,
            "difficulty_delta": difficulty - mean_d}


def fit_proxy(past, include_feedback=True, exact=False):
    """Regress y_t - recent_rate on [1, d_t - recent_d, feedback]."""
    cast = Fraction if exact else float
    x, y = [], []
    for i in range(4, len(past)):
        values = proxy_inputs(past[:i], past[i]["difficulty"])
        features = [cast(1), cast(values["difficulty_delta"])]
        if include_feedback:
            features.append(cast(values["feedback"]))
        x.append(features)
        y.append(cast(past[i]["y"] - values["recent_rate"]))
    size = 3 if include_feedback else 2
    if len(x) < size:
        raise ValueError("Insufficient training targets")
    matrix = [[sum(row[j] * row[k] for row in x) for k in range(size)]
              for j in range(size)]
    rhs = [sum(row[j] * target for row, target in zip(x, y)) for j in range(size)]
    return BASE["solve"](matrix, rhs)


def predict_proxy(beta, past, difficulty):
    values = proxy_inputs(past, difficulty)
    estimate = (float(values["recent_rate"]) + float(beta[0])
                + float(beta[1]) * float(values["difficulty_delta"]))
    if len(beta) == 3:
        estimate += float(beta[2]) * float(values["feedback"])
    return estimate


def evaluate(records, include_feedback, start, stop, frozen_at=None):
    """One-step evaluation: parameters may be frozen, but past scores are released.

    At exam t, no observation from t or later is used as an input. Difficulty is
    given as in the problem. This is NOT the previous article's four-step batch
    forecast at t=20. Both proxy variants use identical targets and input release.
    """
    fixed = None if frozen_at is None else fit_proxy(records[:frozen_at], include_feedback)
    observations = []
    for i in range(start - 1, stop):
        past = records[:i]
        beta = fit_proxy(past, include_feedback) if fixed is None else fixed
        predicted = predict_proxy(beta, past, records[i]["difficulty"])
        error = 150 * (float(records[i]["y"]) - predicted)
        observations.append({"t": i + 1, "last_available_exam": i,
                             "coefficient_cutoff": i if fixed is None else frozen_at,
                             "prediction_points": 150 * predicted,
                             "actual_points": float(records[i]["score"]),
                             "error_points": error})
    return {"mae_points": sum(abs(r["error_points"]) for r in observations) / len(observations),
            "observations": observations}


def calculate(records):
    result = {
        "status": "retrospective extension after the original holdout was already inspected",
        "interpretation": "Recent difficulty-adjusted performance is an ability proxy. Prior relative-performance surprise is a feedback proxy hypothesized to affect mindset; neither is a direct measurement or a causal effect.",
        "protocol": {"ability_window": 3, "feedback_baseline_window": 3,
                     "first_training_target_t": 5, "full_fit_target_count": 20,
                     "rolling_check": [17, 20], "later_check": [21, 24],
                     "later_check_coefficient_cutoff": 20,
                     "later_check_horizon": "one step; earlier outcomes released sequentially, coefficients frozen",
                     "not_comparable_to_original_batch_holdout": True,
                     "reference_difficulty": .2, "forecast_difficulty": .2,
                     "forecast_assumption": "entrance exam immediately follows observed exam 24; proxy effects persist over that interval",
                     "no_model_selection_claim": True},
        "variants": {},
    }
    values = proxy_inputs(records, REFERENCE_DIFFICULTY)
    result["forecast_inputs"] = {name: float(value) for name, value in values.items()}
    for key, include_feedback in (("ability_only", False), ("ability_and_feedback", True)):
        beta = fit_proxy(records, include_feedback)
        exact = fit_proxy(records, include_feedback, exact=True)
        assert all(abs(float(a) - float(b)) < 1e-10 for a, b in zip(beta, exact))
        alpha, gamma = map(float, beta[:2])
        lam = float(beta[2]) if include_feedback else 0.0
        ability_rate = (float(values["recent_rate"])
                        - gamma * (float(values["recent_difficulty"]) - .2))
        components = {"difficulty_adjusted_ability_proxy_points": ability_rate * 150,
                      "intercept_correction_points": alpha * 150,
                      "target_difficulty_points": 0.0,
                      "feedback_response_points": lam * float(values["feedback"]) * 150}
        prediction = predict_proxy(beta, records, REFERENCE_DIFFICULTY) * 150
        assert abs(sum(components.values()) - prediction) < 1e-10
        result["variants"][key] = {
            "coefficients": {"alpha": alpha, "gamma": gamma, "lambda": lam},
            "forecast_ability_proxy_rate": ability_rate,
            "forecast_points": prediction, "forecast_components": components,
            "rolling_check_17_20": evaluate(records, include_feedback, 17, 20),
            "later_check_21_24": evaluate(records, include_feedback, 21, 24, frozen_at=20),
        }
    result["scenario_feedback_zero"] = {
        "meaning": "set only the feedback response to zero in the SAME fitted full model; do not refit or claim a proven neutral mindset",
        "forecast_points": sum(value for key, value in
                               result["variants"]["ability_and_feedback"]["forecast_components"].items()
                               if key != "feedback_response_points")}
    result["first_question_conclusion"] = {
        "proxy_scenario_points": result["variants"]["ability_and_feedback"]["forecast_points"],
        "not_confirmed_superior": True,
        "missing_measurements": ["comparable topic/item scores for mathematical ability",
                                 "pre-exam anxiety or confidence records measured before the outcome",
                                 "dates and duration between exams"],
        "unidentified": "direct difficulty effect versus difficulty-induced mindset effect; pure ability versus pure mindset",
    }
    source = [{name: str(row[name]) for name in
               ("t", "maximum", "score", "difficulty", "grade_mean")} for row in records]
    result["source_sha256"] = hashlib.sha256(json.dumps(source, sort_keys=True).encode()).hexdigest()
    return result


if __name__ == "__main__":
    results = calculate(BASE["load_records"]())
    output = ROOT / "ability-mindset-results.json"
    output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"Wrote {output}")

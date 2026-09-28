#!/usr/bin/env python3
"""Export the existing final-test training fit without replacing original results."""
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("exam_calculation", ROOT / "model-calculation.py")
calculation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calculation)
review_spec = importlib.util.spec_from_file_location("bounded_review", ROOT / "robustness-review.py")
review = importlib.util.module_from_spec(review_spec)
review_spec.loader.exec_module(review)


def build():
    records = calculation.load_records()
    original = json.loads((ROOT / "model-results.json").read_text())
    source = [{key: str(row[key]) for key in
               ("t", "maximum", "score", "difficulty", "grade_mean")} for row in records]
    fingerprint = hashlib.sha256(json.dumps(source, sort_keys=True).encode()).hexdigest()
    assert fingerprint == original["source_sha256"]
    beta = calculation.fit(records[:20], "y", "linear")
    exact = calculation.fit(records[:20], "y", "linear", exact=True)
    assert all(abs(float(x) - float(y)) < 1e-12 for x, y in zip(beta, exact))
    coefficients = calculation.raw_coefficients(beta, "linear")
    means, algebra = calculation.centered_sums(records[:20], "y")
    assert all(abs(coefficients[key] - algebra[key]) < 1e-12 for key in coefficients)
    # These are exactly the coefficients used by the original frozen final test.
    for saved, record in zip(original["targets"]["y"]["candidates"]["linear"]["final_test"]["observations"], records[20:]):
        assert abs(calculation.predict(beta, record, "linear") - saved["predicted_rate"]) < 1e-12
    bounded = review.fit_bounded(records[:20], "y")
    assert bounded["gradient_max_abs"] < 1e-8
    baseline = calculation.fit(records[:20], "y", "mean3")[0]
    assert all(abs(row["predicted_rate"] - baseline) < 1e-12 for row in original["targets"]["y"]["candidates"]["mean3"]["final_test"]["observations"])
    return {
        "source_sha256": fingerprint,
        "purpose": "Expose the original train-1-to-20 linear fit and a retrospective same-window candidate comparison; not new independent validation.",
        "training_range": [1, 20],
        "candidate_comparison": {
            "reference_t": 20,
            "baseline_mean": baseline,
            "bounded": bounded,
            "bounded_scope": "Retrospective candidate form, estimated on exams 1–20 only; not an original selection winner or independent confirmation.",
        },
        "coefficients": coefficients,
        "means": {key: means[key] for key in ("t_mean", "d_mean", "output_mean")},
        "fitted": [{"t": row["t"], "predicted_rate": calculation.predict(beta, row, "linear")} for row in records[:20]],
    }


if __name__ == "__main__":
    destination = ROOT / "model-walkthrough-results.json"
    destination.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n")
    print("PASS: original train-1-to-20 fit agrees with exact algebra and all four saved forecasts.")

#!/usr/bin/env python3
"""Reproduce the article's numerical case study with Python's standard library.

Reads the three source tables in index.html. Fits only tiny least-squares models;
no network, GPU, dependencies, services, or files outside this directory.
Run: python3 posts/exam-performance-modeling/model-calculation.py
Output: model-results.json alongside this script.
"""
from fractions import Fraction
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parent
KINDS = ("mean3", "linear", "quadratic")
TARGETS = ("y", "r")


class SourceTables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = {}
        self.table = None
        self.row = []
        self.in_cell = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table" and attrs.get("id", "").startswith("source-year-"):
            self.table = attrs["id"]
            self.tables[self.table] = []
        if self.table and tag == "tr":
            self.row = []
        if self.table and tag == "td":
            self.in_cell = True

    def handle_data(self, data):
        if self.in_cell and data.strip():
            self.row.append(Fraction(data.strip()))

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False
        if self.table and tag == "tr" and self.row:
            self.tables[self.table].append(self.row)
        if tag == "table":
            self.table = None


def load_records():
    parser = SourceTables()
    parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    assert set(parser.tables) == {f"source-year-{i}" for i in (1, 2, 3)}
    records = []
    for year in (1, 2, 3):
        table = parser.tables[f"source-year-{year}"]
        assert len(table) == 3 and all(len(row) == 8 for row in table)
        maximum = 150 if year == 3 else 100
        for score, difficulty, mean in zip(*table):
            assert 0 <= score <= maximum and 0 <= mean <= maximum
            assert 0 <= difficulty <= 1
            records.append({
                "t": len(records) + 1, "maximum": maximum,
                "score": score, "difficulty": difficulty, "grade_mean": mean,
                "y": score / maximum, "m": mean / maximum,
                "r": (score - mean) / maximum,
            })
    return records


def solve(matrix, rhs):
    """Pivoted elimination. Works with float or exact Fraction arithmetic."""
    a = [list(row) + [value] for row, value in zip(matrix, rhs)]
    n = len(rhs)
    for column in range(n):
        pivot = max(range(column, n), key=lambda i: abs(a[i][column]))
        a[column], a[pivot] = a[pivot], a[column]
        divisor = a[column][column]
        if abs(divisor) < 1e-12:
            raise ValueError("Singular or numerically degenerate model")
        a[column] = [value / divisor for value in a[column]]
        for i in range(n):
            if i != column:
                factor = a[i][column]
                a[i] = [x - factor * y for x, y in zip(a[i], a[column])]
    return [row[-1] for row in a]


def features(record, kind):
    # Fixed centering improves numerical conditioning. Public coefficients below
    # are transformed back to the article's [1, t, d, d²] representation.
    difficulty = record["difficulty"] - Fraction(1, 5)
    values = [1, record["t"] - 16, difficulty]
    if kind == "quadratic":
        values.append(difficulty * difficulty)
    return values


def fit(records, target, kind, exact=False):
    cast = Fraction if exact else float
    if kind == "mean3":
        return [sum(cast(row[target]) for row in records[-3:]) / 3]
    x = [[cast(value) for value in features(row, kind)] for row in records]
    size = len(x[0])
    matrix = [[sum(row[i] * row[j] for row in x) for j in range(size)]
              for i in range(size)]
    rhs = [sum(row[i] * cast(record[target])
               for row, record in zip(x, records)) for i in range(size)]
    return solve(matrix, rhs)


def predict(coefficients, record, kind):
    if kind == "mean3":
        return float(coefficients[0])
    return sum(float(a) * float(b)
               for a, b in zip(coefficients, features(record, kind)))


def raw_coefficients(beta, kind):
    if kind == "mean3":
        return {"mean": float(beta[0])}
    a, b, c = map(float, beta[:3])
    k = float(beta[3]) if kind == "quadratic" else 0.0
    values = {"intercept": a - 16 * b - .2 * c + .04 * k,
              "time": b, "difficulty": c - .4 * k}
    if kind == "quadratic":
        values["difficulty_squared"] = k
    return values


def evaluate(records, target, kind, rolling):
    indices = range(16, 20) if rolling else range(20, 24)
    fixed = None if rolling else fit(records[:20], target, kind)
    observations = []
    for i in indices:
        beta = fit(records[:i], target, kind) if rolling else fixed
        predicted = predict(beta, records[i], kind)
        actual = float(records[i][target])
        observations.append({"t": i + 1, "actual_rate": actual,
                             "predicted_rate": predicted,
                             "error_points_150": (actual - predicted) * 150})
    return {"mae_points_150": sum(abs(x["error_points_150"])
                                  for x in observations) / 4,
            "observations": observations}


def centered_sums(records, target):
    n = len(records)
    tm = sum(Fraction(row["t"]) for row in records) / n
    dm = sum(row["difficulty"] for row in records) / n
    ym = sum(row[target] for row in records) / n
    t = [row["t"] - tm for row in records]
    d = [row["difficulty"] - dm for row in records]
    y = [row[target] - ym for row in records]
    p = sum(v * v for v in t)
    q = sum(a * b for a, b in zip(t, d))
    r = sum(v * v for v in d)
    u = sum(a * b for a, b in zip(t, y))
    v = sum(a * b for a, b in zip(d, y))
    delta = p * r - q * q
    b, c = (r * u - q * v) / delta, (p * v - q * u) / delta
    return ({"t_mean": float(tm), "d_mean": float(dm), "output_mean": float(ym),
             "P": float(p), "Q": float(q), "R": float(r), "U": float(u),
             "V": float(v), "delta": float(delta)},
            {"intercept": float(ym - b * tm - c * dm),
             "time": float(b), "difficulty": float(c)})


def main():
    records = load_records()
    source = [{key: str(row[key]) for key in
               ("t", "maximum", "score", "difficulty", "grade_mean")}
              for row in records]
    results = {
        "source_tables": "index.html#source-year-1, #source-year-2, #source-year-3",
        "source_sha256": hashlib.sha256(json.dumps(source, sort_keys=True).encode()).hexdigest(),
        "protocol": {
            "initial_training": [1, 16], "rolling_selection": [17, 20],
            "frozen_final_test": [21, 24], "final_test_training": [1, 20],
            "final_refit": [1, 24], "forecast_t": 25, "forecast_d": .2,
            "maximum": 150, "selection_metric": "MAE in 150-point units",
            "difficulty_is_given": True,
            "second_objective": "maximum conditional expected margin, not a threshold probability",
        }, "targets": {},
    }
    for target in TARGETS:
        candidates = {}
        for kind in KINDS:
            beta = fit(records, target, kind)
            exact = fit(records, target, kind, exact=True)
            assert all(abs(float(x) - float(y)) < 1e-9 for x, y in zip(beta, exact))
            candidates[kind] = {
                "selection": evaluate(records, target, kind, rolling=True),
                "final_test": evaluate(records, target, kind, rolling=False),
                "full_refit_coefficients": raw_coefficients(beta, kind),
                "forecast_points_150": predict(beta, {"t": 25, "difficulty": Fraction(1, 5)}, kind) * 150,
            }
        winner = min(KINDS, key=lambda kind: candidates[kind]["selection"]["mae_points_150"])
        assert winner == "linear", "Revisit the article if data or protocol changes."
        sums, algebra_beta = centered_sums(records, target)
        beta = candidates[winner]["full_refit_coefficients"]
        assert all(abs(beta[key] - algebra_beta[key]) < 1e-9 for key in beta)
        sensitivity = []
        for label, subset in [("all_24", records), ("year_3_only", records[16:]),
                              ("exclude_exam_19", [r for r in records if r["t"] != 19])]:
            fitted = fit(subset, target, winner)
            raw = raw_coefficients(fitted, winner)
            sensitivity.append({"sample": label, "n": len(subset),
                                "forecast_points_at_d_02": predict(fitted, {"t": 25, "difficulty": Fraction(1, 5)}, winner) * 150,
                                "difficulty_slope": raw["difficulty"]})
        results["targets"][target] = {"selected": winner, "candidates": candidates,
                                      "full_refit_centered_sums": sums,
                                      "sensitivity_not_reselection": sensitivity}
    margin = results["targets"]["r"]["candidates"]["linear"]["full_refit_coefficients"]
    def gap(d):
        return 150 * (margin["intercept"] + 25 * margin["time"] + margin["difficulty"] * d)
    score = results["targets"]["y"]["candidates"]["linear"]["full_refit_coefficients"]
    score_at_01 = 150 * (score["intercept"] + 25 * score["time"] + .1 * score["difficulty"])
    results["difficulty_comparison"] = {
        "requested_interval": [.1, .3],
        "observed_interval": [float(min(r["difficulty"] for r in records)),
                              float(max(r["difficulty"] for r in records))],
        "G_intercept_points": 150 * (margin["intercept"] + 25 * margin["time"]),
        "G_slope_points_per_unit_d": 150 * margin["difficulty"],
        "grid": [{"d": d, "expected_margin_points": gap(d)} for d in [.1, .15, .2, .25, .3]],
        "formal_maximizer": .1 if margin["difficulty"] < 0 else .3,
        "supported_interval_maximizer": .15 if margin["difficulty"] < 0 else .3,
        "score_model_at_01": score_at_01,
        "score_model_exceeds_maximum_at_01": score_at_01 > 150,
        "warning": "d=0.1 is extrapolation; the separate absolute-score model exceeds 150 there. Do not treat it as a feasible joint forecast or a validated physical optimum.",
    }
    output = ROOT / "model-results.json"
    output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output}")
    for target, info in results["targets"].items():
        print(target, json.dumps(info, ensure_ascii=False))
    print("difficulty_comparison", json.dumps(results["difficulty_comparison"], ensure_ascii=False))
    print("PASS: float fits match exact rational elimination and centered algebra within 1e-9.")


if __name__ == "__main__":
    main()

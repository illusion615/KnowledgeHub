"""Independent M=2 enumeration of NanoJev's documented paired proper reward.

Source: TianyuCodings/NanoJev, commit 71a513bb0163b5634467842b523ee0c0ed6fb1c7,
docs/RLCD_EXPERIMENT.md. This verifies a finite mathematical illustration,
not the PyTorch implementation, official TypeSafe RLCD, or trained-model quality.
No dependencies, network, model weights, or API calls.
"""
import itertools
import json
import math


def check(p, q):
    if len(p) != len(q) or len(p) < 2:
        raise ValueError("Matching distributions with at least two labels required")
    for vector in (p, q):
        if any(not math.isfinite(x) or x < 0 or x > 1 for x in vector):
            raise ValueError("Probabilities must be finite and in [0,1]")
        if not math.isclose(math.fsum(vector), 1, rel_tol=0, abs_tol=1e-12):
            raise ValueError("Probabilities must sum to one")
    k = len(p)
    reward_terms = []
    grad_terms = [[] for _ in range(k)]
    # Y is an observed outcome independent of predictive draws A and B.
    for y, a, b in itertools.product(range(k), repeat=3):
        weight = q[y] * p[a] * p[b]
        reward = int(a == y) + int(b == y) - int(a == b)
        reward_terms.append(weight * reward)
        # Local rewards and detached conditional baselines for M=2.
        advantage_a = int(a == y) - int(a == b) - (p[y] - p[b])
        advantage_b = int(b == y) - int(a == b) - (p[y] - p[a])
        for j in range(k):
            grad_terms[j].append(-weight * (
                advantage_a * (int(a == j) - p[j])
                + advantage_b * (int(b == j) - p[j])
            ))
    expected_reward = 2 * math.fsum(x * y for x, y in zip(p, q)) - math.fsum(x * x for x in p)
    centering = math.fsum(x * (x - y) for x, y in zip(p, q))
    direct_gradient = [2 * x * (x - y - centering) for x, y in zip(p, q)]
    reward_error = abs(math.fsum(reward_terms) - expected_reward)
    gradient_error = max(abs(math.fsum(terms) - target) for terms, target in zip(grad_terms, direct_gradient))
    assert reward_error < 1e-12 and gradient_error < 1e-12
    return {"classes": k, "reward_error": reward_error, "gradient_error": gradient_error}


if __name__ == "__main__":
    cases = [
        ([0.3, 0.7], [0.6, 0.4]),
        ([0.2, 0.3, 0.5], [0.1, 0.7, 0.2]),
        ([0.1, 0.15, 0.2, 0.25, 0.3], [0.3, 0.1, 0.1, 0.2, 0.3]),
    ]
    print(json.dumps({
        "scope": "M=2 exact enumeration; independent prediction draws and outcomes",
        "checks": [check(p, q) for p, q in cases],
        "model_inference_performed": False,
    }, indent=2))

"""Minimal Jev decision example; does not execute business actions.

Python >= 3.10; pip install typesafe-sdk
Set TYPESAFE_API_KEY in the backend environment, then run this file only
when you intend to make a billable API request. It sends synthetic text.
Thresholds are illustrative, NOT calibrated production recommendations.
"""

from typesafe_sdk import Choice, Noul, RetryPolicy, TypeSafeClient, TypeSafeError

MODEL = "jev-1.13.0"
MIN_CONFIDENCE = 0.90
MIN_SUFFICIENCY = 0.95
QUESTIONS = {
    "team": Choice(
        instructions="Which team should handle the customer's request?",
        criteria={
            "billing": "Payment, invoice, or subscription issue.",
            "technical": "Software defect, outage, or integration issue.",
            "other": "Neither team fits, or the request is unclear.",
        },
    ),
    "enough_info": Noul(
        instructions="Does the request provide enough information to choose "
        "between billing and technical without guessing?"
    ),
}


def decide(response):
    """Return an advisory decision. Permissions and execution live elsewhere."""
    team = response.choices["team"]
    enough = response.nouls["enough_info"].noul
    result = {
        "action": "review",
        "model": response.model,
        "candidate": team.choice,
        "confidence": team.confidence,
        "probabilities": team.probabilities,
        "sufficiency": enough,
        "input_tokens": response.usage.input_tokens,
    }
    # A high confidence alone is not an authorization or accuracy guarantee.
    if (
        team.choice in {"billing", "technical"}
        and team.confidence >= MIN_CONFIDENCE
        and enough >= MIN_SUFFICIENCY
    ):
        result["action"] = "suggest_" + team.choice
    return result


def classify(state):
    try:
        with TypeSafeClient(
            model=MODEL,
            timeout=2.0,
            retry=RetryPolicy(max_retries=0),
        ) as client:
            response = client.system_one(state=state, questions=QUESTIONS)
        return decide(response)
    except (TypeSafeError, KeyError, ValueError, TypeError, AttributeError) as exc:
        # Avoid logging raw error bodies: they may contain sensitive input.
        return {"action": "review", "reason": type(exc).__name__}


if __name__ == "__main__":
    import json

    print(json.dumps(classify({
        "request": "The software integration fails with error 500."
    }), indent=2))

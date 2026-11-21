# Multi-intent after-sales routing: v4 evidence and v5 quality review

## v5 correction: classifier uncertainty is not customer omission

User feedback showed a clear failure: “my desk lamp has not arrived” plus an order
number received a fast generic request to clarify the need/order. A 175 ms response
that makes the customer repeat supplied facts is not a useful speed improvement.
The v4 clarification-consolidation change prevented invented intents but did not
address this distinction. It is superseded by `after-sales-v5-quality-review`:

- Native uncertainty, including an inferred ambiguous binding, triggers one internal
  LLM review with the actual conversation and known orders, not a clarification
  template. Known branches are locked; missing/changed locked outputs fail validation.
- Uncertain candidate labels/scores are audit evidence, not instructions to the
  reviewer. Gold remains excluded. Reviewed branches have LLM provenance; raw native
  scores, original plan and native-only structured checks are retained unchanged.
- Actual missing order/ledger information can still receive a focused question.
  Known workflows resume without inference; a unique requested order slot can be
  filled when supplied, without guessing multiple outstanding bindings.
- Confirmed fast replies now describe available facts and next steps. Customer
  prose is separate from expandable branch/source/timing diagnostics.
- Explanation on an uncertain plan is handled in the same review call, not another
  serial verbalizer call. Both paths retain actual streaming, cancellation, token
  accounting and consent limits. Native transport failures still stop.
- Review latency/usage counts in full; reviewed turns are not fast paths. Native
  gates/checkpoint are unchanged. This is a workflow repair, not newly learned
  semantic ability or an established latency improvement.

Regression tests inject weak Native scores and controlled LLM replies, including a
known-order delivery request matching the screenshot's failure shape. They verify
internal review, locked-branch checks, streamed drafts, source attribution, memory,
usage and UI separation. No new local/cloud inference is needed for this correction;
these tests do not establish model accuracy or customer-satisfaction improvement.

## Historical v4 implementation

`after-sales-v4-multi-intent` removes the single Choice and the automatic
multi-issue -> LLM/human rule. A request batches independent Boolean questions
for four intent types against each mentioned order ID and an unbound slot, plus
an uncovered-needs question. Zero, one or two order IDs give 5, 9 or 13 questions.
Several labels may hold simultaneously. No cross-question normalization,
multiplication or top-two margin is used.

Application gates remain explicit and uncalibrated: >=0.8 supported, <=0.2 absent,
otherwise uncertain. Each confirmed branch gets its own order lookup/policy action.
Missing or ambiguous associations are clarified, never assigned to the nearest or
first order. Known branches are retained when another branch is uncertain. Candidate
intent labels are not asserted to the customer: unsupported uncertain topics are
consolidated into one remaining-request clarification. All-uncertain output produces
one clarification, not four invented user needs. Scope beyond two orders is explicit.

The baseline has the same multi-branch decision space, returning reply first and
then branches[{intent,order_id,action}]. Streaming exposes only root reply text, not
branch arrays or reasoning. Hybrid explanation calls receive an immutable branch
brief and return only reply. No real order writes/refunds/transfers occur.

Tests cover same-order multi-labels, different-order bindings, negation instructions,
unbound requests, known-plus-uncertain branches, partial processing, unknown ledger
records, bounded scope, multi-branch memory, missing/extra/invalid outputs, branch
array streaming, strict extra-field rejection, source attribution and usage.
They use injected scores and do not prove model semantic ability.

## Real local development probes — negative evidence

Five predeclared Chinese fixtures were sent once each to the installed FP32 Native
service, while the arena/backend was idle. No cloud calls, retries, warmups, training,
precision changes or threshold fitting occurred. The probe endpoint applies the
normal checkpoint, Boolean-value and probability validation.

| Fixture | Native questions | Path tokens | Reported local probe ms |
| --- | ---: | ---: | ---: |
| Two explicitly bound orders | 13 | 1,925 | 475.35 |
| Two intents, one order | 9 | 1,258 | 146.62 |
| Negation: delivery only | 9 | 1,231 | 126.85 |
| Two orders, unknown associations | 13 | 1,951 | 176.44 |
| Known delivery order plus an unnamed billing order | 9 | 1,312 | 125.65 |

All **53** Boolean scores fell in the uncertain band; none reached 0.8 and none
fell to 0.2. Examples: on the same-order fixture, delivery scored about 0.618,
billing 0.538 and the irrelevant technical label 0.583. On the two-order fixture,
billing support was about 0.503 for the wrong first order versus 0.304 for the
second order named in the complaint. Lowering a global threshold would not solve
those ordering/binding errors and could introduce false positives.

These results verify real multi-question dispatch and expose a **checkpoint/input
quality limitation**, not successful multi-intent understanding. They do not show
that Jev-type interfaces cannot represent the task, nor that another checkpoint or
training setup cannot handle it. A routing interface must not be presented as
validated business capability. The current root checkpoint needs further task
representation/domain validation or training before reliable deployment.

The probes occurred before the final clarification-consolidation adjustment.
Original receipts retain their original plans and scores; they were not rewritten
as successes. The v4 UI asked a single clarification when all topics were uncertain;
that behavior was insufficient and is replaced by the explicit v5 review above.
Neither version covertly relabels an LLM answer as the classifier's answer.

Private receipts (not published):
`~/.cache/study-room/jev-evaluation/multi-intent-native-1790062601067/`
contains a predeclared manifest and five fsynced request/response receipts.

## Other verification

- Installed tokenizer: 720 generated requests, maximum observed path 201 tokens,
  maximum request 2,562 tokens; no truncation, weight loading or inference.
- Installed CLI streaming contract: isolated HOME, loopback mock model only,
  no GitHub login/cloud inference. Multi-branch final JSON is accepted while reply
  deltas reach the callback before the upstream response completes.
- Browser tests use injected Native/CLI values to check both multi-branch chats,
  SSE drafts, ambiguous-order cards, ablation, cancellation, unknown usage and
  desktop/mobile layout. Their successful routing must not be attributed to the
  actual checkpoint.

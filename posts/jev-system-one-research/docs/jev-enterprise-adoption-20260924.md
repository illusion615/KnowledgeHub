# Vendor-neutral enterprise adoption — 2026-09-24

## Reader feedback and structural change

The old chapter 10 assistant checklist still said “justify introducing Jev” and
largely repeated chapter 9's evaluation/rollout advice. The two are merged into
one chapter 09, **Enterprise Architecture and Adoption**, anchored at
`#evaluation`. `#agent-brief` remains a nested ADR/deliverables anchor; the
machine-readable JSON link and optional audit appendix remain available.
References become chapter 10. Header navigation has only the merged adoption
entry, not a second assistant-summary chapter.

The chapter concerns structured decision models as a **category**, including
hosted, self-hosted and trained-classifier options. It does not presuppose Jev,
NanoJev, Laya or a cloud vendor. Provider-specific APIs, runtime instructions and
limitations stay in their model chapters. This is author-recommended architecture,
not a vendor feature promise, compliance certification or measured enterprise ROI.

## Coverage

1. Decision inventory, value baseline, reversibility, asymmetric error cost,
   review capacity, user correction and the legitimate no-adoption alternative.
2. Existing CRM/ERP/ticketing/event systems; minimal evidence snapshots; internal
   vendor-neutral contracts; adapter semantics; policy/authorization/execution
   separation; sync/async queues, backpressure, deadlines, retries, idempotent
   writes, state-version checks and tenant/version-aware cache invalidation.
3. Hosted/local/hybrid tradeoffs: egress/residency, retention/deletion,
   subprocessors, SLA/quotas, runtime/weight licensing and supply chain, secrets,
   tenant isolation, permissions, incident recovery and provider exit.
4. Named business/data/platform/security/review owners; SLO and capacity;
   transport/input/semantic/staleness/approval failure distinctions; circuit
   breakers; drift, subgroup errors, delayed outcomes and reviewed feedback.
5. Representative labeling, critical strata, independent tuning/test splits,
   practical rules/classifier/reranker/optimized-LLM baselines and no-model ablation.
6. Quality vs valid format, calibrated probabilities vs confidence, automation
   coverage/error tradeoff, uncertainty intervals and business outcomes.
7. Whole-path and lifecycle cost, human effort, tail latency, offline/shadow/
   canary progression, explicit data/action approval, full-policy rollback.
8. ADR deliverables: problem/baseline/alternatives, system/data boundaries,
   contracts, owners, budget, risk, acceptance/stop criteria and review date;
   adopt/pilot/defer/reject are all permitted evidence-based outcomes.

The cost formula is consistently `Cpre + Cdecision + r*CLLM + h*Chuman + Cretry +
Cops`; escalation and human review may overlap. Labeling/calibration, integration
and maintenance are amortized without double counting. Costs per successful
business outcome and matched-quality comparisons matter more than unit tokens.
Illustrative sample/gate numbers remain examples, not universal certification.

## Validation

- `tests/jev-enterprise-adoption.test.js`: merged scope and legacy anchor,
  category framing, all eight dimensions, visible content, consistent bilingual
  formula, evidence/authorization boundaries and absence of Jev-only requirements.
- `tests/jev-enterprise-adoption.browser.js`: one h2, eight main narrative blocks,
  former chapter nested correctly, deep links, Chinese/English, desktop/390px/320px,
  complete browser deck traversal with 11 adoption steps and reading restoration.
- Mobile Chinese deployment table and English ADR/deck screenshots inspected.
  A 320px English overflow from a compound version/policy term was corrected
  with article-local wrapping, then rechecked alongside both live-demo layouts.
- `model-chapters.js`: when the nav pager has removed a late chapter's link from
  the DOM, clear the stale preceding highlight instead of incorrectly indicating
  Playground; re-evaluate on pager child changes. Shared nav assets unchanged.

No new model calls, external research claims, provider configuration changes or
backend restart are required. Previous experiment measurements and popup-only
scenario/practice material remain separate and unchanged. Browser deck checks are
not a new PPTX/PDF render certification.

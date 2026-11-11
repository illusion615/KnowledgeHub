# Power Platform Pay-as-You-Go Billing Plan Setup Guide

- Article: `posts/power-platform-pay-as-you-go-billing-plan/index.html`
- Audience/scope: customer-side cross-role setup handoff, Global commercial cloud, bilingual Chinese/English, **guide only**.
- `registration.json` is the proposed catalog entry under `parentId: power-platform`. The shared catalog was deliberately not edited; the coordinator can insert this single entry after acceptance.
- `source-ledger.json` maps 19 numbered official references to claims/steps, retrieval times, document dates, source hashes and qualifications. Document dates are not rollout dates. Three guessed discovery URLs returned 404; the correct FAQ and current product-meter source were subsequently fetched in full and are the cited evidence.
- Complete public official HTML, extracted main text, reproducible authoring/validation scripts and verification outputs are in `.project-data/delivery-board/artifacts/power-platform-payg/`. No tenant data, credentials, portal screenshots or private article bodies were collected.

## Safe Target-Only Checks

From the repository root:

```sh
python3 .project-data/delivery-board/artifacts/power-platform-payg/regression.py
node .project-data/delivery-board/artifacts/power-platform-payg/target-validate.cjs
node .project-data/delivery-board/artifacts/power-platform-payg/browser-regression.cjs --final
```

The first command reads only this article's explicit `index.html`, `registration.json` and `source-ledger.json`. The second runs the existing shared article-validator assertions unchanged through a fail-closed synthetic single-article filesystem adapter. It does **not** run the unrestricted full-repository gate or enumerate `posts/`, which can include ignored private articles. The final browser command is deliberately a single bounded final matrix, not an iteration loop; it launches a fresh synthetic Chrome profile/context, serves only allowlisted public local assets, blocks external/model/API requests, and checks this article alone.

No npm build or TypeScript compiler applies to this static HTML page. No actual portal setup, consent, cloud resource creation, chargeable usage, deployment, commit or push was performed. Actual subscription-offer eligibility, tenant UI, role assignments, approval and business usage remain customer-side checks.

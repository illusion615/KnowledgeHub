# Copilot Studio roadmap article — builder handoff

Run `run_8b4daf2c1cee`; task `task_b8d8e024ae9d`; dispatch `ctx_a7b11439aa4d`.
This is a scoped builder draft, **not** customer acceptance or a release.

## Deliverable

Audience: the confirmed product-selection decision-maker, using a deep reference
with official citations. The article follows one sequence: find the current
official plan → interpret dates/status → query a feature → verify its delivery
scope → decide whether to validate now or retain a conditional dependency.

The Chinese-first article was written and checked before bilingual presentation
and the query UI were added. The final HTML has six numbered sections, canonical
page/hero/topbar/accordion/card/table/flow-list markup, `data-nav-pager`, paired
presentation metadata, the required shared CSS/JS in canonical order, and no
extra narration/email/recording script tags. No customer GO or independent
review is claimed.

### Exact new deliverable/helper files

All are under `posts/copilot-studio-release-roadmap/`:

1. `.gitignore` — ignores article-local verification artifacts.
2. `index.html` — full Chinese/English deep-reference article and query panels.
3. `roadmap-query.js` — vanilla JS snapshot loader, validation, literal query,
   pagination, safe DOM rendering and lifecycle integration.
4. `snapshot.json` — bilingual query data, direct links and field-level source IDs.
5. `evidence.json` — retrieved URLs/headings, source excerpts, date/scope and
   claim-to-source mapping.
6. `registration.json` — exact bilingual knowledgeTree registration object.
7. `tests/roadmap-query.test.cjs` — 14 article-local Node regressions.
8. `tests/browser.cjs` — dependency-free fresh Chrome/CDP browser regressions.
9. `tests/README.md` — actual validation interfaces and export caveats.
10. `BUILDER-REPORT.md` — this handoff, not linked from the published article.

Ignored generated evidence is in `tests/artifacts/`: browser reports/screenshots,
two actual exported PPTX/PDF decks, 52 rendered slide PNGs, 14 four-slide contact
sheets, and `deck-audit.json`. These are real local artifacts, not staged assets.
No shared asset, root test/script, homepage, other article, AGENTS/instruction,
Delivery Board data, or private file was edited. No stage/commit/reset/stash/
clean/push/deploy or existing-service restart was performed.

## Official evidence and useful scope

**Retrieved/verified: 2026-11-09 UTC.** There are **16 selected records**:
12 public roadmap IDs, 3 explicit monthly release-notice capabilities, and
1 archived-plan/current-preview-documentation comparison. The two Agent node
IDs have the same title, so 12 IDs represent 11 distinct live roadmap titles,
not 12 independent capabilities; the article does not advertise 16 distinct
features or exhaustive/current-year release-wave coverage.

The current portal matters: the fetched Release Planner product view says it
is frozen as of **2026-09-01**, retires by **2026-11-15**, and directs readers to
the **AI at Work Roadmap**. The actual legacy parameter is
`app=Microsoft+Copilot+Studio`. Current Copilot Studio Learn plan views redirect
to the AI at Work product filter; the verified 2024 wave 2 view is now archived.
The roadmap HTML exposed the exact public data URL used by that page, and its
public RSS supplied the exact per-ID URLs. No undocumented supported API contract
or runtime cross-origin scraping is promised.

### Final reusable official URLs and what they substantiate

Each source below was fetched with HTTP 200; detailed excerpts and original
headings are in `evidence.json`. The AI at Work page was successfully retrieved
through the official archived Copilot Studio Learn redirect after some earlier
direct requests returned 403; its transport-only `msockid` parameter is omitted
from the reusable link, with that resolution recorded in the evidence file.

| Ref | Official URL | Scope |
| --- | --- | --- |
| 1 | https://releaseplans.microsoft.com/en-US/?app=Microsoft+Copilot+Studio | Actual product selector, freeze/retirement/migration banner |
| 2 | https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=%5B%22Microsoft+Copilot+Studio%22%5D#Roadmap | Current destination, estimated dates, Targeted/Standard rollout and removal policy |
| 3 | https://www.microsoft.com/releasecommunications/api/v2/m365 | Page-backed public record titles, original states, planned months, cloud/platform/phase tags and modified timestamps |
| 4 | https://www.microsoft.com/releasecommunications/api/v2/m365/rss | Matching per-ID links/categories; build time 2026-11-06 23:04:41 UTC |
| 5 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new | April/May/June/August/September 2026 notices and rollout caveat; retrieved page updated 2026-11-04 |
| 6 | https://learn.microsoft.com/en-us/previous-versions/power-platform/release-plan/2024wave2/microsoft-copilot-studio/ | Actual archived product plan, historical wave and investment areas |
| 7 | https://learn.microsoft.com/en-us/previous-versions/power-platform/release-plan/2025wave2/power-platform-governance-administration/extend-ip-firewall-copilot-studio | Archived preview/GA dates and enablement |
| 8 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-network-isolation-firewall | Explicit preview, Managed Environment, channel and session restrictions |
| 9 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use | Standard-harness computer use, machines, credentials and access-control limits |
| 10 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use-standalone | Separately preview tool; agent flows supported, workflows not yet supported |
| 11 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview | Harness-specific comparison; new-harness Computer use still Planned |
| 12 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/knowledge-add-dataverse-tables | Dataverse search/Microsoft auth/15-table limit, preview columns and backfill |
| 13 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/knowledge-add-azure-sql-tables | SQL tables/views, network, connection permissions and published diagnostic-view test |
| 14 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-rest-api | Standard-harness evaluation automation, test set/user-token prerequisites |
| 15 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/agent-node-workflow | GitHub Copilot workflow inline/published agent node and MCP tool path |
| 16 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-node-workflow | Separate standard agent-flow implementation |
| 17 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/authoring-share-agent | New sharing UI viewing rights, alternative editor paths, licensing/environment prerequisites |
| 18 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-agent-status | Standard-harness preview status summary; not a compliance certificate |
| 19 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-use-entra-agent-identities | Existing identity governance, not mailbox/Teams/Office delivery |
| 20 | https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview | Definition and different scope/billing of harnesses |

The live `whats-new` H2 anchors `april-2026`, `may-2026`, `june-2026`,
`august-2026` and `september-2026` were separately fetched and verified.
The migration blog redirect returned HTTP 403 and was **not** used to substantiate
feature availability or dates.

### Included roadmap IDs (all direct official RSS links)

The link form supplied by RSS is
`https://www.microsoft.com/microsoft-365/roadmap?id=<ID>`:

- 576272 — native web browsing on the new harness; In development;
  preview 2026-11 / GA 2027-01 targets.
- 571305 — MPIP-protected file support; In development; both targets 2026-10.
- 570430 — persistent collaborative identity; In development; 2026-09 / 2026-11.
- 568929 — Dataverse integration; In development; 2026-08 / 2026-09;
  related September release note, separately preview unstructured columns.
- 568930 — SQL knowledge; In development; 2026-08 / 2026-09;
  related August release note/guidance, no explicit collected GA label.
- 569930 — conversational connector configuration; Rolling out; GA target 2026-09.
- 569475 — maker sharing; Launched; 2026-09 / 2026-10;
  explicit operational discrepancy with current viewing-only sharing guidance.
- 568762 — Agent Readiness; Launched; GA target 2026-09;
  related standard-harness guidance remains preview and scope-limited.
- 562221 — MCP tools in agent workflows; Launched; 2026-05 / 2026-06.
- 562220 — computer use in workflows; Cancelled; old 2026-04 / 2026-10 targets;
  explicit notice says the item is inaccurate and will be removed, not that
  all Computer use is cancelled.
- 562222 — Agent node; In development; 2026-04 / 2026-09.
- 566998 — same official Agent node title; Launched; same target months.
  Both IDs are retained; no invented harness assignment or replacement relation.

Supplementary records preserve May 2026 `(General availability)` for standard
Computer use, June `(Production-ready preview)` for the GitHub Copilot experience,
April `(Preview)` for REST evaluation automation, and current IP-firewall `preview`
against historical Jul 14 / Dec 12, 2025 date cells. A past planned GA date is
never upgraded to delivered. Document timestamps and announcement months are
not presented as exact tenant rollout days.

## Implementation behavior

- One same-origin `snapshot.json` load; no Microsoft scraping, automatic refresh,
  model endpoint, login, license/tenant check, or query persistence to storage.
- Literal, case-insensitive Chinese/English/ID keyword search; whitespace-separated
  terms use AND semantics. Status is an intersection, not a date-driven upgrade.
- Six explained source categories preserve original roadmap/notice labels.
  `Production-ready preview` is not normalized to GA; Launched is not tenant proof.
- Four records per page; direct feature links, documented conditions, planned
  preview/GA dates, release evidence, original phase tags, source modified date,
  verification freshness and comparison records are separately visible.
- Details and implementation/selection conditions occupy separate reading panels
  and separate presentation steps. References stay last.
- Safe `textContent`/native DOM construction for all loaded record/query strings;
  HTTPS Microsoft host allowlist rejects script schemes, lookalikes, credentials
  and unsafe URLs. Snapshot schema fails closed on malformed provenance/state.
- `langChanged` preserves input/select node identity, unsent draft values, applied
  filters, page and selected record. Hidden presentation steps defer local rerender;
  no timer/poll loop or background refresh. Page visibility and bfcache resumption
  are also handled.
- No-result meaning is limited to the included set; a failed snapshot has a visible
  error, disabled search and explicit manual Retry. No fake availability fallback.

## Actual verification ledger

| Command / check | Actual result |
| --- | --- |
| First-edit Node evidence JSON/provenance assertions | exit 0: 20 source IDs, 12 roadmap IDs + 4 supplementary records, withdrawal and duplicate states retained |
| Chinese-content `node tests/validate.js --article copilot-studio-release-roadmap --checks structure,quotes,citations,density` | exit 0, no warnings |
| JS parse + exact snapshot/evidence title/state/date/link correspondence | exit 0, 12 exact matches |
| `node --test posts/copilot-studio-release-roadmap/tests/roadmap-query.test.cjs` | exit 0: 14 passed, 0 failed/skipped |
| `node --check posts/copilot-studio-release-roadmap/roadmap-query.js` | exit 0 |
| `node --check posts/copilot-studio-release-roadmap/tests/browser.cjs` | exit 0 |
| `node --check posts/copilot-studio-release-roadmap/tests/roadmap-query.test.cjs` | exit 0 |
| Full article-only `validate.js` during S4 | exit 0, no warnings |
| `node tests/verify-change.js --article copilot-studio-release-roadmap --level L2 --json --verbose` | exit 0: article validator, unstaged diff check, staged diff check and inventory all succeeded; validator 0 warnings |
| Registration object/real parent/relations/URL/summary assertions | exit 0; zh 54 chars, en 149 chars |
| Local fixture asset-prefix/encoded-traversal normalization assertion | exit 0; no private file opened |
| `node posts/copilot-studio-release-roadmap/tests/browser.cjs` (initial attempts) | exit 1 initially for an overbroad geometry oracle/profile shutdown race, corrected in the test harness; next attempt exposed an actual 320px nowrap code fragment |
| Scoped fix | mobile-only `#sources .flow-copy code` wrapping; no shared CSS edit |
| `node posts/copilot-studio-release-roadmap/tests/browser.cjs --resume-mobile` | exit 0, 5 recorded fresh-context scenarios; already completed desktop matrices retained because the CSS fix was mobile-only |
| `node posts/copilot-studio-release-roadmap/tests/browser.cjs --probe-console` | exit 0, 3 additional fresh contexts, no runtime exceptions or console.error calls |
| Actual zh/light `render-deck.js` command in tests/README | exit 0, rendered true, 26 PNGs/PPTX/PDF, no skipped images; **visual caveat below** |
| Actual en/dark `render-deck.js` command in tests/README | exit 0, rendered true, 26 PNGs/PPTX/PDF, no skipped images; sparse advisories below |

### Browser evidence and assertions

Primary report: `tests/artifacts/browser/report.json`.
Console/dark-mobile report: `tests/artifacts/browser-console/report.json`.

- Chinese/light and English/dark desktop: all six reading section widths, all
  26 deck pages per language, page-menu navigation, floating bilingual titles/
  labels, no active-step overflow, horizontal navigation-button safe areas and
  vertical content safe areas; query root surfaces transparent/borderless in deck.
- Keyword/status matches, mismatches, all 16 IDs over four pagination pages,
  empty states, planned month values, direct official/docs links and freshness.
- Language switches preserve unsent keyword/status, original control DOM nodes,
  selected record, applied filters and result set.
- Hidden hero-slide language change leaves query rendering deferred until a query
  step becomes active; full navigation does not fetch the snapshot again.
- Mock HTML/script-like imported titles and hostile query text remain plain;
  no image/script node, execution, or javascript link is created.
- Intentional 503 snapshot fixture: visible error/disabled search and exactly one
  explicit Retry; two requests total, not silent automatic retries.
- Chinese and English 320px reading, all disclosures opened for width scans;
  additional English/dark 320px reading has no visible Chinese body residue.
- All six article-specific status badge palettes measured at least 4.5:1 in the
  dark-mobile probe. These are accessibility observations, not model ratings.
- Mandatory shared assistant opens using a fixed fresh-origin mock configuration;
  unsent assistant draft only, **0 model POSTs / no inference**. Shared QR imagery
  is stubbed in fixtures; no actual user storage or conversation was accessed.
- Tests close their own browsers/servers/profiles; no existing service was touched.

Playwright was absent from default Node/Python resolution. No dependency was
installed; real browser checks ran via installed Chrome and Node 22 CDP rather
than being claimed as a skipped Playwright PASS. IDE diagnostics are not exposed
by these tools; no IDE-diagnostics PASS is asserted.

## Export visual caveats — not hidden as PASS

Both real export paths ran with Chrome, LibreOffice and poppler available.
All **52** PNGs were visually reviewed through 14 contact sheets, with selected
raw query/overview images also inspected. English content is visible; several
chapter overview pages are sparse. The actual renderer emitted **14 zh / 9 en
sparse-slide advisories**, zero overflow advisories and no skipped images.

**Chinese LibreOffice-rendered PNGs have missing/blank Chinese glyphs.** This is
not a clean bilingual PPT visual acceptance. `deck-audit.json` proves the PPTX and
extracted PDF text both retain **4,278 CJK characters**, while the visual PNGs do
not display them correctly. Browser Chinese reading/presentation screenshots do
display the glyphs and pass geometry. The exact renderer/font cause was not
proven or patched; no shared exporter or global font/dependency configuration
was changed. Coordinator triage is needed if Chinese PowerPoint rendering is part
of release acceptance. CLI exit 0 / `rendered: true` is not presented as visual PASS.

An optional Pillow contact-sheet attempt failed because Pillow is not installed;
existing Swift/AppKit generated the actual contact sheets successfully without
installing anything. That helper is ignored verification material, not site
build tooling or an original generated article image.

## Remaining scope, risk and release ownership

- Registration in **DIRTY `assets/knowledge-data.js`** is deliberately left to the
  coordinator; `registration.json` contains the complete narrow insertion object.
- Independent evidence/structure/customer review and the full-repository
  `verify-change.js --final`/release gate remain with the coordinator.
- This selection is not exhaustive, does not inspect tenant/region/language/
  licensing/rollout entitlements, and does not promise automatic freshness.
- Official duplicate/scope/status discrepancies are retained, not adjudicated:
  the Agent node pair, new sharing Editor description versus viewing-only UI
  guidance, Dataverse/SQL plan labels versus usable guidance, and the archived
  firewall date/current preview conflict.
- Microsoft CDN redirects were intermittently 403 during research; the final
  evidence sources were fetched successfully, while the inaccessible migration
  blog is explicitly unused. Per-ID links come from the official RSS; no separate
  customer/geography availability probe was performed.
- Chinese PPT rendering and sparse exported chapter overviews remain disclosed
  export concerns; no customer acceptance or global shared-rule release occurred.
- No narration generation, model use, commit or deployment was attempted.

## Exact knowledgeTree object (also registration.json)

```json
{
  "id": "copilot-studio-release-roadmap",
  "parentId": "copilot-studio",
  "type": "article",
  "title": {
    "zh": "Copilot Studio 官方路线图与发布状态",
    "en": "Copilot Studio Official Roadmap and Release Status"
  },
  "summary": {
    "zh": "查询 16 条官方路线图与发布对照记录，区分计划日期、预览、发布标记和租户可用性，并核对范围差异与选型条件。",
    "en": "Query 16 cited roadmap and release records; separate plans, preview, launch labels, and tenant availability to validate product-selection conditions."
  },
  "tags": ["Copilot Studio", "Official Roadmap", "Release Status", "Product Selection"],
  "date": "2026-11-09",
  "url": "posts/copilot-studio-release-roadmap/index.html",
  "color": "#7c3aed",
  "phase": 2.4,
  "speed": 0.84,
  "relations": ["copilot-studio-overview", "copilot-studio-constraints", "copilot-studio-cua", "copilot-studio-vs-agent-sdk"]
}
```

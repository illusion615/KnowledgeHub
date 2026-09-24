# AGENTS.md

This file provides guidance to Claw Code (clawcode.dev) when working with code in this repository.

## Detected stack
- No specific language markers were detected yet; document the primary language and verification commands once the project structure settles.
- Frameworks: none detected from the supported starter markers.

## Repository shape
- `tests/` contains validation surfaces that should be reviewed alongside code changes.

## Working agreement
- Prefer small, reviewable changes and keep generated bootstrap files aligned with actual repo workflows.
- Keep shared defaults in `.Codex.json`; reserve `.Codex/settings.local.json` for machine-local overrides.
- Do not overwrite existing `AGENTS.md` content automatically; update it intentionally when repo workflows change.

## Continuous workflow feedback
- At a safe checkpoint after user feedback about layout, structure, reader needs, evidence or workflow, read `authoring/workflow-feedback/README.md` and submit a short record via `python3 scripts/workflow-feedback.py submit --file <feedback.json>`.
- Record the user's wording, issue, proposed scope and actual verification. No credentials, complete chat logs or image blobs. Collect promptly; do not wait until the article ends.
- `article-workflow-improvement` owns triage and validated shared-rule releases. Article agents fix their scoped task but do not independently propagate shared rules.
- Shared changes are not global until main and applicable worktrees are safely synchronized. Preserve dirty work; report blocked synchronization instead of overwriting it.

# Validation Workflow

`validate.js` is the deterministic check engine. `verify-change.js` is the concurrent read-only orchestrator used during article work.

## Common Commands

```bash
# Fast text-only iteration
node tests/verify-change.js --article <slug> --level L0

# Local behavior or one-section change
node tests/verify-change.js --article <slug> --level L1

# Structural, navigation, presentation, or shared-runtime change
node tests/verify-change.js --article <slug> --level L2

# Derive scope from the working tree; shared assets force a full gate
node tests/verify-change.js --changed --level L1

# Stable change set and pre-commit gate
node tests/verify-change.js --final
```

Use `--json` for machine-readable timing and browser plans. Use `--serial` only to benchmark or troubleshoot concurrency.

## Architecture

- `validate.js --article <slug>` filters article-scoped checks to one or more articles.
- `validate.js --checks <list>` selects named deterministic checks.
- `validate.js --changed` targets changed articles, includes knowledge metadata when needed, and falls back to the full suite for shared assets.
- `verify-change.js` runs the validator, unstaged diff check, staged diff check, and changed-file inventory concurrently.
- IDE diagnostics and browser automation remain outside the Node runner. Run diagnostics in the same parallel tool batch; use the returned browser plan to choose the minimum browser matrix that preserves coverage.

## Adding Checks

1. Add a deterministic check function and registry entry in `validate.js`.
2. Decide whether it belongs in `ARTICLE_CHECKS` or only the full suite.
3. If it is an independent process-level check, add one task to `taskRegistry()` in `verify-change.js`; no scheduler rewrite is needed.
4. Keep tasks read-only. The main agent remains the only working-tree editor.
5. Add browser coverage to the L0/L1/L2 plan only when the new risk cannot be checked statically.

## Delegated Review

For L2 work, `Article Evidence Reviewer` and `Article Structure Reviewer` are read-only custom agents. Invoke both in one parallel batch only when evidence and structure are independent uncertainties. They return findings; they never edit files or run commands.

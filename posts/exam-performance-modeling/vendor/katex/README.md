# Local math rendering assets

KaTeX **0.16.11**, the same version referenced by the repository's shared math loader.

- Upstream: https://github.com/KaTeX/KaTeX/tree/v0.16.11
- Download source: https://cdn.jsdelivr.net/npm/katex@0.16.11/
- License: MIT, preserved in `LICENSE`.
- `katex.min.js`, `katex.min.css` and all 60 font files referenced by that CSS are unchanged upstream distribution files.
- `checksums.json` records SHA-256 digests for the downloaded files.

These copies are scoped to this article so math works without a CDN connection or edits to shared assets. No package installation or build step is required. The article-local `math-rendering.js` uses the standard KaTeX API and re-renders inline expressions after the site's existing language-switch event.

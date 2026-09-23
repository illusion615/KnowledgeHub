# Article assistant rendering dependencies

Checked-in browser distributions; no npm install or build step is needed at runtime.
Do not edit upstream minified files. Update versions, licenses, hashes, and renderer
regressions together when upgrading.

| Dependency | Version | License | Upstream |
| --- | --- | --- | --- |
| markdown-it | 14.1.0 | MIT (`markdown-it-14.1.0/LICENSE`) | https://github.com/markdown-it/markdown-it/tree/14.1.0 |
| KaTeX | 0.16.11 | MIT (`katex-0.16.11/LICENSE`) | https://github.com/KaTeX/KaTeX/tree/v0.16.11 |

Source download URLs (unmodified files):

- `https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js`
- `https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/LICENSE`
- `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js`
- `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css`
- `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/<font-file>` (all 60 CSS-referenced WOFF2/WOFF/TTF files)
- `https://cdn.jsdelivr.net/npm/katex@0.16.11/LICENSE`

`SHA256SUMS` records the downloaded bytes. Verify with:

```sh
(cd assets/vendor && shasum -a 256 -c SHA256SUMS)
node --test tests/assistant-markdown.test.js
```

The assistant loads these relative to `article-assistant.js`, not a CDN. KaTeX's
version matches the existing article math loader; that separate loader remains
unchanged. Formula rendering waits for both local JS and CSS; failed loads leave
readable source. Markdown disables raw HTML and image loading; math uses
`trust: false`, bounded expansion, and per-expression macros (no shared state).

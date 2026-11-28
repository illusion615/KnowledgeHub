# One top-level chapter per model — 2026-09-24

The header now offers one entry each for Jev, NanoJev and Laya. Detailed material
remains visible in reading mode, with a small contents navigation per model.

- `#jev`: product overview, `#contract`, `#evidence`, `#integration`, `#limits`.
- `#nanojev`: design/training/evidence, `#nanojev-integration`, `#mlx-local`.
- `#laya`: checkpoint/architecture/training, Chinese evidence, local runtime/limits.

The six formerly top-level auxiliary sections are now `.model-subchapter` divs
inside their model's `.section`; their IDs are preserved for existing links.
Each model has exactly one h2. Nested subchapter headers are h3, their narrative
blocks h4, and deeper card headings h5. Original titles and bilingual text remain.
Only genuine existing implementation extras collapse; the main content did not
become an accordion. Chapter contents menus are reading-only, not extra slides.

One-time preservation comparison against the pre-edit source confirmed that all
377 paragraph blocks, 16 code/pre blocks and 42 tables were byte-identical, and
all 134 heading contents remained in order. This is a migration check, not a new
permanent gate preventing subsequent content improvements.

`model-chapters.js` is article-local: it highlights the top-level chapter at the
reading position. A fixed intersection ratio for an entire long chapter is not
reliable once that chapter spans many viewports. Deep links therefore highlight
Jev/NanoJev instead of requiring obsolete child entries in the header. Shared
navigation/presentation assets were not changed.

Verification:

- `tests/jev-article-structure.test.js`: top-level order, grouped anchor presence,
  visible narrative blocks, unique IDs and unchanged evidence boundaries.
- `tests/jev-model-chapters.browser.js`: actual nesting and heading hierarchy,
  chapter contents links, old hash landing/highlighting, Chinese/English,
  desktop/mobile, and zero model calls.
- `tests/jev-laya-research.browser.js`: entire browser presentation in both
  languages, all reading blocks visible without JS, independent optional extras,
  return-to-reading state. Model slide counts: Jev 20, NanoJev 19, Laya 6;
  grouping changes ownership, not the order/content of the existing slides.
- Desktop English/dark and mobile Chinese screenshots visually inspected.

No inference or backend restart is required. Browser presentation validation does
not assert a newly rendered PPTX/PDF export; export-engine code was unchanged.

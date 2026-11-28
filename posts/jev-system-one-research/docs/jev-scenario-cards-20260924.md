# Scenario cards and application-plan dialogs — 2026-09-24

`#architectures` replaces its three-row pattern table with three linked cards:

- Support and business tickets → canonical `#workflow`.
- Model, skill and tool coordination → canonical `#agent`.
- Knowledge retrieval and bounded extraction → canonical `#retrieval`.

Cards retain visible use cases and responsibility boundaries. Clicking opens a
native modal with the selected chapter's existing context, application sequence,
tradeoffs, failure handling and citations. Following the reader's layout revision, the detailed schemes are popup-only
sources outside the main reading and deck flow, not repeated chapters. Hash links
still open them (CSS :target fallback without JS). The obsolete alternatives
chapter is removed. This change does not claim new model capabilities or trigger
any inference.

`scenarios.js` creates a read-only clone from the canonical static popup source, rather
than maintaining another copy of its prose. IDs, presentation/reading markers,
inline styles and event attributes are stripped; heading levels are adjusted
inside the modal. Interactive chapters (forms, controls, canvas, iframe, scripts)
are not cloned and fall back to the original anchor. Dialog copies cannot add
slides or duplicate source IDs. Closing clears the copy and restores the opener
focus and previous scroll-lock state. Internal citations close the dialog before navigating to references. Practice
anchors inside a source scroll within the open dialog; old deep links open the
corresponding source. The footer returns to its card, not to duplicate prose.

Native dialog behavior supplies focus containment; explicit handlers cover Close,
Escape/cancel, backdrop clicks and focus return. Dialog keyboard events do not
advance or exit the underlying presentation. Source-language changes refresh the
open read-only view; light/dark surfaces remain legible. Body scrolling is locked
while modal content scrolls independently, with close and full-text controls kept
available on narrow screens.

Validation:

- `tests/jev-scenarios.test.js`: card/anchor structure, responsibility boundaries,
  accessible modal label and canonical source preservation.
- `tests/jev-scenarios.browser.js`: all three schemes in Chinese/English; desktop,
  390px and 320px; keyboard opening, Close/Escape/backdrop; original-text link;
  language change while open; no duplicate IDs/slide/reading markers; popup use
  during presentation; JS-disabled native-link fallback; zero inference.
- Actual screenshots of cards and dialogs reviewed in light desktop/mobile and
  dark desktop modes.

Tank and support practice notes now use the same dialog via a note card directly
below each demo. Configuration/inspection controls are moved, not cloned, into
model chapters by `article-layout.js`. The interactive chapter contains only the
two demos, retaining their live controls and dynamic diagnostics.

Files: `index.html`, `scenarios.css`, `scenarios.js`, `article-layout.js`,
`article-layout.css`. Static assets only; no backend
restart, provider configuration, live model call or business action is needed.

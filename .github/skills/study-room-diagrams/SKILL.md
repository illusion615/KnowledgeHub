---
name: study-room-diagrams
description: "Use when: a Study-Room article needs an architecture diagram, flowchart, hierarchy, system topology, process map, Draw.io source, or bilingual SVG. Selects the right visualization path and runs the DiagramSpec compile and validation workflow."
---

# Study Room Diagrams

Use this workflow while authoring or revising `posts/**/index.html`.

## Choose the Representation

1. Use `.flow-list` for a short linear explanation with no cross-links.
2. Use Mermaid for a compact sequence or simple graph that benefits from inline source editing.
3. Use existing HTML/SVG components for data-driven, mathematical, or interactive visualizations.
4. Use DiagramSpec for an architecture diagram, directed flowchart, or sequence diagram that needs editable Draw.io source and bilingual publication assets.
5. Do not extend the engine until a real article cannot be expressed clearly by the existing four options.

## DiagramSpec Workflow

1. Identify the single reader question the diagram answers.
2. Create `media/<name>.diagram.json` with `version: 1`, `type`, bilingual `title`, nodes, and edges.
3. Give every node a unique `id`, non-negative integer `layer`, registered `role`, and non-empty `label.zh` / `label.en`.
4. Keep edge labels optional; when present, provide both locales.
5. Use `layout.direction: down` for architecture and process flow unless the content requires otherwise. Architecture groups render as top-to-bottom full-width layers; components render horizontally within each layer.
6. Architecture diagrams must define at least two `groups` that represent real system, subsystem, ownership, deployment, or trust boundaries. Assign every architecture node to one group. A flat left-to-right DAG without boundaries is a flowchart, not an architecture diagram.
7. All article diagrams use the same embedded visual contract: `layout.showTitle: false`, `layout.showCanvas: false`, transparent root surface, restrained semantic fills, thin borders, 12px node radius, and no shadows. The article section or presentation slide owns the title and outer surface. This applies equally to architecture, flowchart, and sequence diagrams.
8. Sequence diagrams use bilingual `participants` and ordered `messages` instead of nodes and edges. Use `kind: response` for diagnostics, acknowledgements, or feedback that should render as a dashed return message.
9. Generate assets:

```sh
node tools/diagram-engine/compiler.js \
  posts/<slug>/media/<name>.diagram.json \
  posts/<slug>/media \
  <name>
```

10. Run `node tools/diagram-engine/compiler.test.js`.
11. Embed `<name>.zh.svg` and `<name>.en.svg` in one figure, switching by the document `lang` attribute. Link the `.drawio` source from the caption.
12. Never hand-edit generated SVG. Fix the DiagramSpec or compiler and regenerate.

## SVG Typography and Fit Contract

Apply this contract to DiagramSpec output and hand-controlled SVG alike.

1. Define five text levels before drawing: phase/section title, role title, action or node title, information copy, and structural label. For dense execution matrices, use one shared modular scale across locales: `19 : 18 : 15 : 13 : 11.5` at native SVG size. Treat these as tokens, not independent guesses. At the final rendered size, information copy must be at least `0.82rem` in reading mode and `0.76rem` in presentation mode; structural labels must be at least `0.72rem` and `0.7rem` respectively.
2. Measure the longest localized string, not the shortest locale. A text line must fit inside its owning box after left and right padding. Use browser `getBBox()` or an equivalent SVG text measurement; visual estimation is not sufficient.
3. Resolve overflow in this order: wrap into explicit `<tspan>` lines, widen the owning column or label rail, shorten wording without losing meaning, then split the visualization. Do not shrink all diagram text to make one long label fit.
4. Fixed-format matrices use semantic axes: stages or states form one axis and accountable roles form the other. Every cell must keep the same internal hierarchy and padding. If the matrix cannot remain readable at article width, reading mode preserves its native SVG width inside a horizontally scrollable figure; presentation mode may scale the complete matrix as an overview. Always preserve the SVG viewBox aspect ratio: do not combine a forced width with an independent max-height; use auto sizing plus max-width/max-height constraints.
5. Role rails, legends, and subtitles follow the same fit rules as content cells. Subtitles containing multiple concepts must wrap deliberately instead of overflowing or using a smaller one-off font.
6. Validate Chinese light, English dark, mobile reading, and presentation after the final typography change. For every locale, assert that all text bounding boxes remain inside their semantic rectangle and capture a settled screenshot after transitions complete.
7. When DiagramSpec or Draw.io auto-layout cannot represent a fixed semantic matrix without changing its axes, use a hand-controlled bilingual SVG. In that case, the SVG pair is authoritative, no stale Draw.io download link may remain, and both files must share identical geometry and text-level tokens.

## Quality Gates

- Compiler: schema, direction, IDs, layers, roles, locales, references, self-connections, cycles, and node overlap.
- Asset set: DiagramSpec output includes `.diagram.json`, `.drawio`, `.zh.svg`, and `.en.svg`; hand-controlled fixed matrices include the bilingual SVG pair with identical geometry.
- Browser: Chinese light, English dark, desktop presentation, and mobile reading.
- Visual review: complete labels, no incoherent crossings, no clipping, no navigation intrusion, and readable density.
- Visual consistency: no title duplicated inside the SVG, no opaque root canvas inside the article figure, no node/participant shadows, and no diagram-specific palette that conflicts with article tokens.
- Use the official Draw.io layout adapter for graph-routing problems that require cycles, compound containers, or obstacle avoidance. Use the hand-controlled SVG exception only for fixed semantic matrices whose row and column axes must not be changed by auto-layout.

## Ownership

- DiagramSpec owns semantic content and bilingual text.
- The compiler owns geometry, styles, validation, and serialization.
- Draw.io owns optional manual editing of the generated source.
- The article runtime consumes static SVG only; it does not lay out diagrams.
---
applyTo: "index.html"
---

# Homepage Knowledge Graph Conventions

- Homepage is a full-screen interactive canvas — NOT a traditional page layout
- All `var` declarations must be at the top of the DOMContentLoaded scope (avoid hoisting bugs)
- Planets orbit the center; knowledge nodes orbit their parent planet
- Planet grouping is data-driven via `planetId` — NOT tied to file directory structure
- When adding a new post: add entry to `posts[]` array with `planetId` matching a planet's `id`
- When adding a new topic group: add entry to `planets[]` array with unique `orbitIndex`
- Stagger `phase` values to prevent visual overlap of nodes/planets
- All visible text must have `data-zh` and `data-en` attributes for bilingual support
- Settings (theme, lang) persist via `localStorage`

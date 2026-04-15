# Knowledge Hub — Article System Replication Prompt

> **Purpose**: Give this entire document to any AI coding assistant. It contains everything needed to replicate a progressive-disclosure article system — self-contained HTML pages with structured sections, scroll-reveal animations, accordion deep-dives, dark/light theming, and presentation mode. No frameworks, no build tools, pure vanilla HTML/CSS/JS.

---

## 1. Design Philosophy

Each article is a **self-contained interactive HTML page** that uses **progressive disclosure** — not a traditional blog post. Content is layered:

- **Layer 0 — Hero**: Title, thesis statement, 2–4 key metrics. The reader grasps the topic in 5 seconds.
- **Layer 1 — Sections**: Numbered sections (`01 / Section Label`) with a headline and optional description. Scannable in 30 seconds.
- **Layer 2 — Accordions**: Each section contains collapsible subsections. The reader clicks to expand only what interests them.
- **Layer 3 — Deep-dive content**: Inside accordions — comparison grids, tables, flow lists, quote blocks, insight cards. Full detail on demand.

Key principles:
- **Miller's Law**: No more than 7±2 visible items at any level
- **Hick's Law**: Reduce visible choices; let the reader drill down
- **Cognitive load**: Hero metrics give orientation before depth
- **Chunking**: Group related content into accordion sections

---

## 2. Technology Stack

- **Zero dependencies**: No React, Vue, npm, bundlers, or build steps
- **Pure vanilla JS** with `forEach` + function expressions (no arrow functions for broad compat)
- **CSS custom properties** for theming (`:root` + `[data-theme="dark"]`)
- **Google Fonts**: `Noto Sans SC` (body) + `Space Grotesk` (headings, labels)
- **No inline `style=""` attributes** — use CSS classes or inline `<style>` blocks
- All scripts wrap logic in a `DOMContentLoaded` or IIFE scope
- Declare `var` at top of scope to avoid hoisting issues

---

## 3. CSS Design Tokens

```css
:root {
  /* Background */
  --bg-top: #fcf6ee;
  --bg-bottom: #eef3ef;

  /* Typography */
  --ink: #172430;          /* Primary text */
  --muted: #5d6c76;        /* Secondary text */

  /* Surfaces */
  --panel: rgba(255, 255, 255, 0.76);
  --panel-strong: rgba(16, 31, 43, 0.94);
  --line: rgba(23, 36, 48, 0.12);
  --card-bg: rgba(255, 255, 255, 0.62);
  --card-border: rgba(255, 255, 255, 0.55);
  --card-shadow: 0 4px 24px rgba(17, 31, 43, 0.06);

  /* Accent colors */
  --accent: #ff7a00;       /* Orange — primary accent */
  --accent-soft: rgba(255, 122, 0, 0.14);
  --teal: #0d8f8c;         /* Teal — secondary accent */
  --teal-soft: rgba(13, 143, 140, 0.14);
  --gold: #e0b04b;         /* Gold — tertiary */

  /* Elevation */
  --shadow: 0 24px 70px rgba(17, 31, 43, 0.12);

  /* Radii */
  --radius-xl: 32px;
  --radius-lg: 24px;
  --radius-md: 18px;

  /* Layout */
  --content-width: 1200px;
}

[data-theme="dark"] {
  --bg-top: #0f1318;
  --bg-bottom: #111820;
  --ink: #e4e6ea;
  --muted: #9ca3af;
  --panel: rgba(30, 38, 48, 0.82);
  --panel-strong: rgba(16, 31, 43, 0.96);
  --line: rgba(255, 255, 255, 0.1);
  --accent-soft: rgba(255, 122, 0, 0.18);
  --teal-soft: rgba(13, 143, 140, 0.18);
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  --card-bg: rgba(22, 27, 38, 0.72);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}
```

---

## 4. Full Page Skeleton (Every Article Must Follow This)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Article Title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />

  <!-- Shared article stylesheet (see Section 6 for full CSS) -->
  <link rel="stylesheet" href="assets/article.css" />

  <!-- Article-specific overrides only -->
  <style>
    /* Article-specific styles go here */
  </style>
</head>
<body>
  <div class="page-shell">
    <!-- Animated background orbs -->
    <div class="backdrop" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="orb orb-c"></span>
    </div>

    <div class="site">
      <!-- ═══ HERO ═══ -->
      <header class="hero">
        <div class="topbar load-in">
          <a class="home-link" href="/" aria-label="Home">←</a>
          <div class="brand">
            <span class="brand-mark"></span>
            PARENT TOPIC NAME
          </div>
          <div class="topbar-actions">
            <nav class="nav-links" aria-label="Page sections">
              <a href="#section-1">Section 1</a>
              <a href="#section-2">Section 2</a>
              <a href="#section-3">Section 3</a>
            </nav>
          </div>
        </div>

        <div class="hero-grid">
          <div class="hero-copy load-in">
            <span class="eyebrow">Kicker / Category</span>
            <h1>Article Title Goes Here</h1>
            <p>A one-paragraph summary of the article's thesis and scope.</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#section-1">Start Reading</a>
              <a class="button button-secondary" href="#references">References</a>
            </div>
          </div>

          <aside class="hero-panel load-in">
            <span class="panel-label">Core Argument</span>
            <h2>Key insight or thesis statement.</h2>
            <ul class="layer-list">
              <li><span class="layer-number">1</span>First key point</li>
              <li><span class="layer-number">2</span>Second key point</li>
              <li><span class="layer-number">3</span>Third key point</li>
            </ul>
          </aside>
        </div>

        <div class="hero-metrics load-in">
          <div class="metric">
            <div class="metric-label">Metric A</div>
            <strong>42%</strong>
            <span>Brief context</span>
          </div>
          <div class="metric">
            <div class="metric-label">Metric B</div>
            <strong>3.2x</strong>
            <span>Brief context</span>
          </div>
          <div class="metric">
            <div class="metric-label">Metric C</div>
            <strong>17</strong>
            <span>Brief context</span>
          </div>
        </div>
      </header>

      <!-- ═══ MAIN CONTENT ═══ -->
      <main>
        <section id="section-1" class="section" data-reveal>
          <div class="section-head">
            <p class="section-kicker">01 / Section Label</p>
            <h2>Section Title</h2>
            <p>Optional section description.</p>
          </div>

          <!-- Accordion subsections -->
          <div class="subsection-accordion">
            <article class="subsection-item is-open" data-accordion>
              <button class="subsection-toggle">
                <span>Subsection A Title</span>
              </button>
              <div class="subsection-content">
                <p>Content here — text, grids, cards, tables, etc.</p>
              </div>
            </article>

            <article class="subsection-item" data-accordion>
              <button class="subsection-toggle">
                <span>Subsection B Title</span>
              </button>
              <div class="subsection-content">
                <p>More content here.</p>
              </div>
            </article>
          </div>
        </section>

        <!-- More sections follow the same pattern -->
      </main>

      <footer>
        <p>&copy; 2026 Your Project Name | Interactive HTML article.</p>
      </footer>
    </div>
  </div>

  <!-- Scripts (order matters) -->
  <script src="assets/article-common.js"></script>
</body>
</html>
```

**Critical skeleton rules:**
- Always `<div class="page-shell">` → `<div class="site">` — never `page-wrapper` or other names
- Hero is `<header class="hero">`, never inside `<main>` or as a `<section>`
- Never invent hero sub-classes like `hero-inner`, `hero-sub`, `meta-chip` — use canonical: `.eyebrow`, `.hero-copy`, `.hero-panel`, `.hero-metrics`, `.metric`, `.panel-label`, `.layer-list`
- `<main>` contains only `<section>` elements; `<footer>` is a sibling of `<main>` inside `.site`
- The `+`/`−` icon on accordion toggles is CSS `::after` — never add inline icon markup
- Use `data-accordion` attribute on each `.subsection-item` (required for JS binding)
- First accordion can be pre-opened with `class="subsection-item is-open"`

---

## 5. Complete Component Catalog

### 5.1 Accordion (Progressive Disclosure Core)

```html
<div class="subsection-accordion">
  <article class="subsection-item" data-accordion>
    <button class="subsection-toggle">
      <span>Title Text</span>
    </button>
    <div class="subsection-content">
      <!-- Any content: text, grids, cards, tables -->
    </div>
  </article>
</div>
```

### 5.2 Insight Grid (3-column cards)

```html
<div class="insight-grid">
  <article class="insight-card">
    <span class="card-index">01</span>
    <h4>Card Title</h4>
    <p>Card description text goes here.</p>
  </article>
  <article class="insight-card">
    <span class="card-index">02</span>
    <h4>Card Title</h4>
    <p>Card description text goes here.</p>
  </article>
  <article class="insight-card">
    <span class="card-index">03</span>
    <h4>Card Title</h4>
    <p>Card description text goes here.</p>
  </article>
</div>
```

### 5.3 Comparison Grid (Side-by-side)

```html
<div class="comparison-grid">
  <article class="comparison-card">
    <span class="comparison-label">Option A</span>
    <h3>Title A</h3>
    <p>Description of option A.</p>
  </article>
  <article class="comparison-card next">
    <!-- .next variant uses dark background -->
    <span class="comparison-label">Option B</span>
    <h3>Title B</h3>
    <p>Description of option B.</p>
  </article>
</div>
```

### 5.4 Flow List (Numbered steps)

```html
<ol class="flow-list">
  <li>
    <span class="flow-step">1</span>
    <div class="flow-copy">
      <strong>Step Title</strong>
      <p>Step description text.</p>
    </div>
  </li>
  <li>
    <span class="flow-step">2</span>
    <div class="flow-copy">
      <strong>Step Title</strong>
      <p>Step description text.</p>
    </div>
  </li>
</ol>
```

### 5.5 Quote Block

```html
<div class="quote-block">
  <p>"Quoted text goes here — from a paper, expert, or key finding."</p>
  <cite>— Source Attribution</cite>
</div>
```

### 5.6 Simple Table

```html
<div class="table-scroll">
  <table class="simple-table">
    <thead>
      <tr><th>Column A</th><th>Column B</th><th>Column C</th></tr>
    </thead>
    <tbody>
      <tr><td>Data</td><td>Data</td><td>Data</td></tr>
    </tbody>
  </table>
</div>
```

### 5.7 Tab Switcher

```html
<div class="tab-shell">
  <div class="tab-list" role="tablist">
    <button class="tab-button is-active" role="tab" aria-selected="true" data-tab="tab-a">Tab A</button>
    <button class="tab-button" role="tab" aria-selected="false" data-tab="tab-b">Tab B</button>
  </div>
  <div class="tab-panel" id="tab-a" role="tabpanel">
    <p>Content for Tab A.</p>
  </div>
  <div class="tab-panel" id="tab-b" role="tabpanel" hidden>
    <p>Content for Tab B.</p>
  </div>
</div>
```

### 5.8 Layer List (Numbered points in panels)

```html
<ul class="layer-list">
  <li><span class="layer-number">1</span>Point one with explanation</li>
  <li><span class="layer-number">2</span>Point two with explanation</li>
  <li><span class="layer-number">3</span>Point three with explanation</li>
</ul>
```

### 5.9 Bibliography / Reference List

```html
<ol class="bib-list">
  <li>
    <span class="bib-id">[1]</span>
    <span class="bib-author">Author Name et al.</span>
    <a href="https://example.com" target="_blank" rel="noopener noreferrer">Paper Title</a>
    <span class="bib-note">— What this reference supports in the article</span>
  </li>
</ol>
```

### 5.10 Challenge / Scenario Cards

```html
<div class="challenge-grid">
  <article class="challenge-card">
    <span class="challenge-badge">Category</span>
    <h4>Challenge Title</h4>
    <p>Description of the challenge or scenario.</p>
  </article>
</div>
```

---

## 6. Core CSS (article.css essentials)

Below is the **minimum viable CSS** to produce the full visual system. Copy this into your `assets/article.css`.

```css
/* ═══════════════════════════════════════════════
   DESIGN TOKENS — see Section 3 above
   Copy the :root and [data-theme="dark"] blocks
   ═══════════════════════════════════════════════ */

/* ── Reset & Base ── */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--reading-font, "Noto Sans SC", "PingFang SC", sans-serif);
  color: var(--ink);
  background:
    radial-gradient(circle at 12% 12%, rgba(255,122,0,0.18), transparent 30%),
    radial-gradient(circle at 84% 10%, rgba(13,143,140,0.14), transparent 24%),
    linear-gradient(180deg, var(--bg-top) 0%, #f4ede3 38%, var(--bg-bottom) 100%);
  overflow-x: hidden;
}

/* Grid texture overlay */
body::before {
  content: "";
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(23,36,48,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23,36,48,0.03) 1px, transparent 1px);
  background-size: 112px 112px;
  pointer-events: none;
  opacity: 0.55;
}

a { color: inherit; text-decoration: none; }

/* ── Layout Shell ── */
.page-shell { position: relative; padding: 22px; }

.backdrop { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }

.orb { position: absolute; border-radius: 50%; filter: blur(26px); opacity: 0.48; }
.orb-a { width: 280px; height: 280px; background: rgba(255,122,0,0.18); top: 8%; left: -80px; animation: driftA 16s ease-in-out infinite; }
.orb-b { width: 340px; height: 340px; background: rgba(13,143,140,0.16); top: 48%; right: -110px; animation: driftB 18s ease-in-out infinite; }
.orb-c { width: 200px; height: 200px; background: rgba(224,176,75,0.18); bottom: 8%; left: 42%; animation: driftC 14s ease-in-out infinite; }

@keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,30px); } }
@keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,-40px); } }
@keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }

.site { position: relative; z-index: 1; max-width: var(--content-width); margin: 0 auto; }

/* ── Hero ── */
.hero {
  min-height: calc(100vh - 44px);
  display: flex; flex-direction: column; justify-content: flex-end;
  gap: 28px; padding: 78px 0 28px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0,1.1fr) minmax(320px,0.9fr);
  gap: 34px; align-items: end;
}

.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 1px solid var(--line); border-radius: 999px;
  background: rgba(255,255,255,0.55); backdrop-filter: blur(12px);
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase;
}
.eyebrow::before {
  content: ""; width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--teal));
}

.hero-copy h1 {
  margin: 18px 0 20px;
  font-family: "Space Grotesk", "Noto Sans SC", sans-serif;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.08; letter-spacing: -0.04em;
}
.hero-copy p { margin: 0; max-width: 60ch; font-size: 1.08rem; line-height: 1.9; color: var(--muted); }

.hero-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 30px; }

.button {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: 999px; border: 1px solid transparent;
  font-weight: 700; transition: transform 0.25s, box-shadow 0.25s;
}
.button:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(17,31,43,0.12); }
.button-primary { background: linear-gradient(135deg, var(--accent), #ff9340); color: #fff; }
.button-secondary { background: rgba(255,255,255,0.58); border-color: var(--line); color: var(--ink); }

.hero-panel {
  padding: 28px; border-radius: var(--radius-xl);
  background: var(--panel-strong); color: #fff;
}
.hero-panel::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(circle at 30% 20%, rgba(255,122,0,0.12), transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(13,143,140,0.08), transparent 40%);
  pointer-events: none;
}
.panel-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 12px;
}
.hero-panel h2 { font-size: 1.4rem; line-height: 1.4; margin: 0 0 18px; }

.hero-metrics {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;
}
.metric {
  padding: 18px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.55); backdrop-filter: blur(10px);
}
.metric-label { font-size: 0.78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.metric strong { font-size: 1.6rem; display: block; }
.metric span { font-size: 0.85rem; color: var(--muted); }

/* ── Topbar ── */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr);
  align-items: center; gap: 18px; min-height: 62px;
  padding: 10px clamp(20px, 3vw, 34px);
  background: rgba(252,246,238,0.78); border-bottom: 1px solid rgba(23,36,48,0.08);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--muted); white-space: nowrap;
}
.brand-mark {
  width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--teal));
}

.nav-links {
  display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 20px;
}
.nav-links a {
  position: relative; font-size: 0.9rem; font-weight: 600; color: var(--muted);
  padding: 8px 0; transition: color 0.25s;
}
.nav-links a::after {
  content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--teal));
  transform: scaleX(0); transform-origin: left; transition: transform 0.25s;
}
.nav-links a:hover, .nav-links a[aria-current="true"] { color: var(--ink); }
.nav-links a:hover::after, .nav-links a[aria-current="true"]::after { transform: scaleX(1); }

.home-link {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 999px;
  color: var(--muted); transition: background 0.2s, color 0.2s;
}
.home-link:hover { color: var(--ink); background: rgba(23,36,48,0.06); }

/* ── Section ── */
.section { padding: 60px 0 40px; }
.section-head { margin-bottom: 28px; }
.section-kicker {
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.82rem; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--teal); margin-bottom: 8px;
}
.section-head h2 {
  font-family: "Space Grotesk", "Noto Sans SC", sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem); line-height: 1.15; margin: 0 0 12px;
}
.section-head p { max-width: 72ch; font-size: 1rem; color: var(--muted); line-height: 1.8; }

/* ── Accordion ── */
.subsection-accordion { display: grid; gap: 14px; }
.subsection-item {
  border-radius: var(--radius-lg); overflow: hidden;
  background: var(--card-bg); border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}
.subsection-toggle {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 20px 24px; border: none; background: none;
  font: inherit; font-size: 1.05rem; font-weight: 700; color: var(--ink);
  cursor: pointer; text-align: left; transition: background 0.2s;
}
.subsection-toggle:hover { background: rgba(23,36,48,0.03); }
/* +/- icon via CSS — never add inline icon markup */
.subsection-toggle::after {
  content: "+"; display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 999px; flex-shrink: 0;
  background: rgba(23,36,48,0.06); font-size: 1.1rem; font-weight: 600;
  transition: transform 0.3s, background 0.2s;
}
.subsection-item.is-open .subsection-toggle::after { content: "−"; transform: rotate(180deg); }

.subsection-content {
  max-height: 0; overflow: hidden; opacity: 0;
  padding: 0 24px; transition: max-height 0.34s ease, opacity 0.24s ease, padding 0.34s ease;
}
.subsection-item.is-open .subsection-content {
  max-height: 1600px; opacity: 1; padding: 0 24px 24px;
}

/* ── Insight Grid ── */
.insight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 16px; }
.insight-card {
  padding: 24px; border-radius: var(--radius-lg);
  background: var(--card-bg); border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}
.insight-card h4 { margin: 0 0 8px; font-size: 1.05rem; }
.insight-card p { color: var(--muted); font-size: 0.92rem; line-height: 1.72; }
.card-index {
  display: inline-flex; align-items: center; justify-content: center;
  height: 34px; padding: 0 12px; border-radius: 999px; margin-bottom: 12px;
  background: rgba(23,36,48,0.06); font-family: "Space Grotesk", sans-serif;
  font-size: 0.82rem; font-weight: 700;
}

/* ── Comparison Grid ── */
.comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-top: 16px; }
.comparison-card {
  padding: 26px; border-radius: var(--radius-lg);
  background: var(--card-bg); border: 1px solid var(--card-border);
}
.comparison-card.next { background: var(--panel-strong); color: #fff; border-color: transparent; }
.comparison-label {
  display: inline-block; padding: 6px 12px; border-radius: 999px; margin-bottom: 12px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  background: rgba(23,36,48,0.06);
}

/* ── Flow List ── */
.flow-list { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 14px; }
.flow-list li { display: flex; gap: 16px; align-items: flex-start; }
.flow-step {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--teal)); color: #fff;
  font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 0.9rem;
}
.flow-copy strong { display: block; margin-bottom: 4px; }
.flow-copy p { color: var(--muted); font-size: 0.92rem; line-height: 1.72; margin: 0; }

/* ── Quote Block ── */
.quote-block {
  padding: 22px; border-radius: var(--radius-lg); margin: 16px 0;
  background: linear-gradient(135deg, rgba(255,122,0,0.06), rgba(13,143,140,0.08));
  border: 1px solid var(--line);
}
.quote-block p { font-size: 1.02rem; line-height: 1.8; font-style: italic; margin: 0; }
.quote-block cite { display: block; margin-top: 10px; font-size: 0.85rem; color: var(--muted); font-style: normal; }

/* ── Layer List ── */
.layer-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.layer-list li {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border-radius: 14px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.95rem;
}
.layer-number {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.18); font-family: "Space Grotesk", sans-serif;
  font-size: 0.78rem; font-weight: 700;
}

/* ── Simple Table ── */
.table-scroll { overflow-x: auto; margin: 16px 0; border-radius: var(--radius-md); }
.simple-table { width: 100%; border-collapse: collapse; }
.simple-table th, .simple-table td {
  padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--line);
  font-size: 0.9rem;
}
.simple-table th { font-weight: 700; color: var(--muted); text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.08em; }

/* ── Tab Shell ── */
.tab-shell { padding: 26px; border-radius: var(--radius-lg); background: var(--card-bg); border: 1px solid var(--card-border); }
.tab-list { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.tab-button {
  padding: 10px 14px; border-radius: 999px; border: 1px solid var(--line);
  background: rgba(255,255,255,0.55); font: inherit; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.tab-button.is-active { background: linear-gradient(135deg, var(--accent), #ff9340); color: #fff; border-color: transparent; }
.tab-panel[hidden] { display: none; }

/* ── Bib List ── */
.bib-list { list-style: none; padding: 0; display: grid; gap: 10px; }
.bib-list li { padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,0.55); border: 1px solid var(--line); font-size: 0.88rem; line-height: 1.72; }
.bib-id { font-weight: 700; color: var(--accent); margin-right: 8px; }
.bib-author { font-weight: 600; }
.bib-note { color: var(--muted); font-size: 0.82rem; }

/* ── Footer ── */
footer { padding: 40px 0 20px; text-align: center; }
footer p { font-size: 0.82rem; color: var(--muted); }

/* ── Scroll-reveal Animations ── */
.load-in, [data-reveal] {
  opacity: 0; transform: translateY(26px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.load-in.is-visible, [data-reveal].is-visible {
  opacity: 1; transform: translateY(0);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-panel { order: -1; }
  .topbar { grid-template-columns: auto 1fr; }
  .nav-links { display: none; }
  .comparison-grid { grid-template-columns: 1fr; }
}
```

---

## 7. Core JavaScript (article-common.js)

```javascript
/**
 * article-common.js
 * Handles: scroll-reveal, nav highlighting, accordion toggle, theme sync.
 * Load this BEFORE any other article scripts.
 */
(function () {
  'use strict';

  // ── Scroll-reveal ──
  var revealTargets = document.querySelectorAll('.load-in, [data-reveal]');
  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(function (target) { revealObserver.observe(target); });

  // ── Load-in stagger delay ──
  document.querySelectorAll('.load-in').forEach(function (element, index) {
    element.style.transitionDelay = (index * 120) + 'ms';
  });

  // ── Nav link active highlighting ──
  var sectionTargets = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if (sectionTargets.length && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute('id');
        var matchingLink = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (!matchingLink) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) { link.removeAttribute('aria-current'); });
          matchingLink.setAttribute('aria-current', 'true');
        }
      });
    }, { threshold: 0.4 });
    sectionTargets.forEach(function (section) { navObserver.observe(section); });
  }

  // ── Accordion toggle (one-at-a-time) ──
  var syncAccordionState = function (targetItem, expanded) {
    var targetButton = targetItem.querySelector('.subsection-toggle');
    var targetContent = targetItem.querySelector('.subsection-content');
    if (!targetButton || !targetContent) return;
    targetButton.setAttribute('aria-expanded', String(expanded));
    targetItem.classList.toggle('is-open', expanded);
    targetContent.setAttribute('aria-hidden', String(!expanded));
  };

  document.querySelectorAll('[data-accordion]').forEach(function (item) {
    var button = item.querySelector('.subsection-toggle');
    var content = item.querySelector('.subsection-content');
    if (!button || !content) return;
    syncAccordionState(item, item.classList.contains('is-open'));

    button.addEventListener('click', function () {
      var isExpanded = item.classList.contains('is-open');
      var topBefore = button.getBoundingClientRect().top;
      if (!isExpanded) {
        document.querySelectorAll('[data-accordion]').forEach(function (otherItem) {
          if (otherItem === item) return;
          syncAccordionState(otherItem, false);
        });
      }
      syncAccordionState(item, !isExpanded);
      var topAfter = button.getBoundingClientRect().top;
      if (topAfter !== topBefore) window.scrollBy(0, topAfter - topBefore);
    });
  });

  // ── Theme sync from localStorage ──
  var root = document.documentElement;
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
})();
```

---

## 8. Content Authoring Guidelines

### Article Structure

1. **Hero** (Layer 0): 
   - Eyebrow kicker = category or topic area
   - Title = content-summarizing, not narrative (e.g., "4-bit DiT Quantization: 23GB→6GB Memory Path", not "How to Fit Models")
   - 2–4 hero metrics with quantified values
   - Hero panel with thesis + 3-4 layer-list key points

2. **3–6 Sections** (Layer 1):
   - Numbered kickers: `01 / Background`, `02 / Architecture`, `03 / Evaluation`
   - Each section has a clear causal connection to the next

3. **2–5 Accordion Subsections per Section** (Layer 2):
   - First accordion optionally pre-opened (`is-open`)
   - Each subsection = one focused idea

4. **Deep-dive Components** (Layer 3):
   - Mix insight-grids, comparison-grids, flow-lists, tables, quote-blocks inside accordions
   - Don't put all content in paragraphs — use structured components

### Writing Standards

- Every quantitative claim needs measurement conditions (hardware, config, etc.)
- No vague comparisons ("significantly faster") — use ratios or absolute numbers
- No empty rhetoric ("the real key is...", "the most important...") — use falsifiable statements
- When data is missing, state the gap explicitly
- External evidence must be cited with specific URLs in a `.bib-list` reference section

---

## 9. Adaptation Checklist

To port this system to a new project:

1. **Create `assets/article.css`** — copy or adapt the CSS from Section 6
2. **Create `assets/article-common.js`** — copy the JS from Section 7
3. **Create your first article** — copy the skeleton from Section 4, fill in content
4. **Customize design tokens** — change colors in `:root` to match your brand
5. **Replace fonts** — swap `Noto Sans SC` / `Space Grotesk` for your preferred fonts
6. **Update paths** — adjust `href="../../assets/"` to match your directory structure
7. **Add dark mode** — ensure all custom components have `[data-theme="dark"]` variants
8. **Test the accordion** — click toggles, verify one-at-a-time behavior
9. **Test scroll-reveal** — scroll down, verify elements fade in with stagger
10. **Test responsive** — verify hero-grid collapses to single column on mobile

### Optional Enhancements (not required for core system)

- **Presentation mode**: Carousel that turns sections into slides (`article-presentation.js`)
- **Image lightbox**: Click-to-zoom for inline images (`article-lightbox.js`)
- **Theme toggle**: Button in topbar to switch dark/light
- **Bilingual support**: `data-zh` / `data-en` attributes on text elements, JS switches `innerHTML` based on `localStorage.lang`

---

## 10. Quick Reference — Class Name Cheat Sheet

| Component | Container Class | Item Class | Key Sub-elements |
|-----------|----------------|------------|------------------|
| Page shell | `.page-shell` | `.site` | `.backdrop`, `.orb-a/b/c` |
| Hero | `.hero` | `.hero-grid` | `.hero-copy`, `.hero-panel`, `.hero-metrics` |
| Topbar | `.topbar` | — | `.home-link`, `.brand`, `.nav-links` |
| Section | `.section` | `.section-head` | `.section-kicker`, `h2`, `p` |
| Accordion | `.subsection-accordion` | `.subsection-item[data-accordion]` | `.subsection-toggle`, `.subsection-content` |
| Insight grid | `.insight-grid` | `.insight-card` | `.card-index`, `h4`, `p` |
| Comparison | `.comparison-grid` | `.comparison-card` | `.comparison-label`, `.next` variant |
| Flow list | `.flow-list` | `li` | `.flow-step`, `.flow-copy` |
| Quote | `.quote-block` | — | `p`, `cite` |
| Table | `.table-scroll` | `.simple-table` | `th`, `td` |
| Tabs | `.tab-shell` | `.tab-button` | `.tab-list`, `.tab-panel` |
| Layer list | `.layer-list` | `li` | `.layer-number` |
| Bibliography | `.bib-list` | `li` | `.bib-id`, `.bib-author`, `.bib-note` |
| Metrics | `.hero-metrics` | `.metric` | `.metric-label`, `strong`, `span` |
| Button | — | `.button` | `.button-primary`, `.button-secondary` |
| Kicker | — | `.eyebrow` | Auto `::before` dot |
| Panel label | — | `.panel-label` | — |

---

**End of replication prompt.** Any AI coding assistant with this document can generate complete, visually consistent progressive-disclosure articles from scratch.

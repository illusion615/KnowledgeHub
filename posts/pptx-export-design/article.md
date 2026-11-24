---
title: "PPT Export Design: Layout Grid, Typography & Annotated Examples"
eyebrow: Design Specification
brand: Knowledge Hub Design
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: Complete visual specification for the PptxGenJS export pipeline. Defines the slide grid system, typography token dictionary, color palette, and layout conventions with annotated example slides for every common layout type.
hero_actions:
  - "Annotated Examples | #examples"
  - "Layout Rules | #conventions"
panel_label: Export Pipeline
panel_title: HTML article → Presentation steps → Native PPTX slides
panel:
  - enterPresentation() collects steps from hero + sections (accordion auto-split) + ending slide.
  - "Pre-capture: SVG diagrams serialized to PNG data URLs via Canvas API."
  - "forEach step: setPresentStep → renderStep dispatches to typed renderers (hero, table, flow, arch, insight, ending)."
  - restoreSnapshot() exits fullscreen and returns to reading mode.
metrics:
  - "Slide Size | 13.333 × 7.5 in | Widescreen 16:9 (LAYOUT_WIDE)"
  - "Font Family | Aptos | Display (titles) + Regular (body)"
  - "Title Size | 28 pt | Slide title anchor for hierarchy"
  - "Body Size | 12 pt | Prose and supporting text baseline"
style:
  accent: "#ff7a00"
---

## #grid 01 / Slide Grid :: Slide Layout Constants

Fixed grid system applied to every exported slide. All values in inches.

:::accordion
::panel { open: true }
### 1.1 Grid Token Dictionary
| Token | Description | Value | Notes |
| --- | --- | --- | --- |
| **SW** | Slide width | 13.333 in | Widescreen 16:9 |
| **SH** | Slide height | 7.5 in | — |
| **MX** | Horizontal margin | 0.72 in | Left & right safe zone |
| **BY** | Body area top | 1.42 in | Below slide title area |
| **BH** | Body area height | 5.58 in | BY + BH = bottom safe zone |
| **BW** | Body area width | 11.893 in | SW − 2 × MX |
| **GAP** | Element spacing | 0.18 in | Between blocks |
| **R** | Card corner radius | 0.12 in | roundRect default |
:::

## #typography 02 / Typography :: Typography Token Dictionary

Every text element in the exported PPTX, with font family, size, weight, and color token.

:::accordion
::panel { open: true }
### 2.1 Full Token Table
| Element | Font | Size | Weight | Color |
| --- | --- | --- | --- | --- |
| **Slide kicker label** | Aptos | 11 pt | Bold | alt (teal) |
| **Slide title** | Aptos Display | 28 pt | Bold | text |
| **Hero H1** | Aptos Display | 36 pt | Bold | text |
| **Hero eyebrow** | Aptos | 12 pt | Bold | alt (teal) |
| **Hero panel H2** | Aptos Display | 20 pt | Bold | bg (inverted) |
| **Hero panel list item** | Aptos | 13 pt | Regular | muted |
| **Metric value** | Aptos Display | 28 pt | Bold | accent |
| **Metric label** | Aptos | 10 pt | Bold | muted |
| **Metric detail** | Aptos | 12 pt | Regular | muted |
| **Component heading** (card h3, flow title, accordion) | Aptos Display | 20 pt | Bold | text |
| **Insight card heading** | Aptos Display | 16 pt | Bold | text |
| **Body prose** | Aptos | 12 pt | Regular | muted |
| **Card body text** | Aptos | 12 pt | Regular | muted |
| **Insight card body** | Aptos | 11 pt | Regular | muted |
| **Flow step description** | Aptos | 11 pt | Regular | muted |
| **List item text** | Aptos | 12 pt | Regular / Bold (key) | text / muted |
| **Table cell** | Aptos | 12 pt | Regular / Bold (TH) | text / alt |
| **Layer list text** | Aptos | 14 pt | Regular | text |
| **Arch block title** | Aptos | 14 pt | Bold | block-color |
| **Arch block body** | Aptos | 11 pt | Regular | text |
| **Arch block hint** | Aptos | 10 pt | Italic | muted |
| **Quote text** | Aptos | 12 pt | Italic | text |
| **Badge / card-index** | Aptos | 10-11 pt | Bold | accent |
| **Bib-list references** | Aptos | 10 pt | Regular | muted |
| **End slide title** | Aptos Display | 44 pt | Bold | text |
| **Slide number** | Aptos | 9 pt | Regular | muted |

::panel
### 2.2 Typography Hierarchy
Three-tier hierarchy ensures component headings are always visually larger than body text:

- **Slide Title — 28pt** — Aptos Display bold. Anchor for the entire hierarchy. Hero H1 uses 36pt; ending slide uses 44pt.
- **Component Heading — 20pt** — Aptos Display bold. Flow step titles, card headings, accordion toggles. Insight cards use 16pt (smaller due to multi-column density).
- **Body Text — 11-12pt** — Aptos regular. Prose, descriptions, table cells. 12pt for standalone text; 11pt for dense contexts (insight cards, flow descriptions).
:::

## #examples 03 / Examples :: Annotated Example Slides

Each example shows the actual layout with callouts marking element names, font sizes, and dimensions. Use these as reference when requesting style adjustments.

:::accordion
::panel { open: true }
### 3.1 Hero Slide
Two-column layout: left column (title stack) + right panel (dark block with layer list). Metric cards span full width below. All elements vertically centered as a group.

eyebrow 12pt bold alt

SOLUTION ARCHITECTURE

Zava Claims 360: Power

Platform + Copilot Studio

H1 36pt bold text

A solution architecture for Zava...

Power Platform + Copilot Studio with ALM...

desc 16pt muted

Low-code + AI agents

with governance

panel H2 20pt bold bg

1

Rapid deployment...

2

Built-in integrations...

panel li 13pt muted

PLATFORM

Power Platform

Model-driven app

label 10pt bold | value 28pt bold accent | detail 12pt muted

MX = 0.72 in

Hero Slide — Two-Column + Metric Cards

::panel
### 3.2 Content Slide with Table
Fixed header area (kicker + title) with vertically centered body. Tables: 12pt, 0.38-in row height.

01 / EXECUTIVE RECOMMENDATION

kicker 11pt bold alt

1.3 Addressing Zava's Objections

title 28pt bold text

BY = 1.42 in

CONCERN

HOW PLATFORM MITIGATES

TH 12pt bold alt

No AI expertise on staff

Copilot Studio is no-code...

TD 12pt text | rowH 0.38 in

v-center offset

BY+BH = 7.0 in

5

Content Slide — Table (vertically centered)

::panel
### 3.3 Mixed Content (Prose + Diagram)
Prose paragraph (12pt) followed by architecture diagram with colored blocks. Content vertically centered as a group.

01 / EXECUTIVE RECOMMENDATION

1.1 Solution Architecture Overview

The solution maps to three business objectives:

prose 12pt muted

Channels

Web Chat · Mobile · Teams

↓

Copilot Studio Agent

Model-Driven App

↓

Dataverse + Connectors

arch-block: title 14pt bold

body 11pt | hint 10pt

2-col: grid(w, 2, GAP)

fill transparency 88%

Content Slide — Prose + Architecture Diagram

::panel
### 3.4 Insight Card Grid
Auto-computed card height per row. Cards: 16pt headings, 11pt body. Badge (card-index) 11pt bold accent pill.

01 / EXECUTIVE RECOMMENDATION

1.2 Why Power Platform Fits

01

No AI Engineers

Needed

Copilot Studio uses

natural-language...

02

03

04

badge 11pt bold accent pill

h3 16pt bold text

body 11pt muted shrinkText

4 cols | grid(BW, 4, 0.18) | card height = max(row) auto-sized

Content Slide — 4-Column Insight Card Grid

::panel
### 3.5 Flow List with Hierarchy Reference
Numbered circles (accent) + 20pt bold titles + 11pt descriptions. Includes typography hierarchy reference block.

04 / MEASUREMENT

4.4 ROI Framework Against $6M

Zava's $6M investment spans licensing...

1

Pilot ROI Check (Week 4)

Measure claim processing time...

2

Production ROI Review (Week 10)

3

Annualized ROI Report (Week 16+)

circle 0.36in

flow title 20pt bold text

flow desc 11pt muted

Typography Hierarchy

Slide Title 28pt

Component Heading 20pt

Body Prose 12pt

Supporting Text 11pt

Label / Badge 10pt

Slide Number 9pt

Content Slide — Flow List + Typography Hierarchy

::panel
### 3.6 Slide Grid & Centering System
Content area dimensions, vertical centering calculation, and export pipeline steps.

MX 0.72

accent bar y=0.30

KICKER 11pt

Slide Title 28pt

slide# 9pt

BY = 1.42 in

(BH - contentH)/2

Content block (measureDispatch → dispatch)

(BH - contentH)/2

BY+BH = 7.0 in

Export Pipeline

1. enterPresentation → collectSteps

2. forEach step: renderStep

3. restoreSnapshot → exitFullscreen

PPT Export — Slide Grid & Centering System
:::

## #colors 04 / Colors :: PPT Color Palette (Light / Dark)

Color tokens auto-selected based on the current page theme at export time.

:::accordion
::panel { open: true }
### 4.1 Color Token Table
| Token | Light Mode | Dark Mode | Usage |
| --- | --- | --- | --- |
| **bg** | #FCF6EE | #0F1318 | Slide background |
| **text** | #172430 | #E4E6EA | Primary text, headings |
| **muted** | #5D6C76 | #9CA3AF | Body text, descriptions |
| **accent** | #FF7A00 | #FF9340 | Metric values, badges, accent bar, flow circles |
| **alt** | #0D8F8C | #77D7D0 | Kicker labels, table headers |
| **cardBg** | #FFFFFF | #1E2630 | Card / row fill |
| **border** | #E8DDD2 | #2A3440 | Card / table borders |
:::

## #conventions 05 / Layout Conventions :: PPT Export Layout Rules

Rules governing how HTML article content maps to native PptxGenJS slide objects.

:::accordion
::panel { open: true }
### 5.1 Complete Convention Table
| Convention | Rule |
| --- | --- |
| **Slide master** | CONTENT_MASTER: accent bar at y=0.30 (w=2.2 h=0.04), slide number top-right 9pt. Hero and ending slides use blank master. |
| **Header area** | y=0.42 kicker (11pt bold alt) + y=0.72 title (28pt bold text). Body starts at BY=1.42. |
| **Body area** | BY=1.42 to BY+BH=7.0 (5.58 in). Width = BW = 11.893 in. |
| **Vertical centering** | All non-overview slides: content measured by measureDispatch(). If content < body area, y += (BH − contentH) / 2. |
| **Hero slide** | Measure-first: compute left column + panel heights. startY = (SH − totalH) / 2. Metrics below tallest column. |
| **Content sizing** | Text boxes use estTextH(text, fontSize, width). No hardcoded heights. Tables 0.38 in rows, list items max(0.44, estimated). |
| **Insight grid** | Up to 4 columns. Card height = max per row (content-driven). Same row shares height. |
| **Arch diagrams** | .arch-layer: stacked colored roundRects. .arch-flow: horizontal block-arrow-block. Native shapes, never placeholder. |
| **Flow list** | Accent circle 0.36 in (14pt white) + title 20pt bold + desc 11pt muted. |
| **Tables** | addTable() with equal columns. TH: 12pt bold alt 7% fill. TD: 12pt text. Row 0.38 in. |
| **SVG diagrams** | Pre-captured as PNG via Canvas API. Embedded as addImage({ data: dataUrl }). Aspect-ratio preserved, centered. |
| **Ending slide** | Centered: accent bar + Thank You 44pt + QR code 1.8×1.8 in + scan tip 13pt + brand 11pt. |
| **Overview slides** | Description at top (12pt). Accordion titles as collapsed rows (20pt, 0.46 in). No centering. |
| **shrinkText** | Safety net on all text boxes. estTextH() should prevent most shrinking. |
| **Fullscreen** | Export enters presentation mode, renders, then restores + exitFullscreen. |
:::

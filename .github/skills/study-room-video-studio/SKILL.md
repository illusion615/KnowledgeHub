---
name: study-room-video-studio
description: "Use when: generating, customizing, previewing, or reviewing an article explainer or product walkthrough video in Study Room (`posts/<slug>/index.html`). Adapts the zaz8848/Video-Generator (Adu/MotionGit 0.2) choreography, 4 fluid gradient & organic motion visual themes, procedural 48kHz stereo BGM synthesizer, and macOS/Volcengine TTS pipeline to Study Room's native resources."
---

# Study Room Video Studio

Use this skill when turning a Study Room article (`posts/<slug>/index.html`) into a narrated, animated 1920×1080 MP4 video or when revising the Video Studio pipeline, templates, audio synthesizer, or visual styles.

## 1. Study Room Native Resource Mapping

Unlike the standalone `zaz8848/Video-Generator` repository—which targets external directories and standalone CLI manifests—Study Room embeds Video Studio directly inside every article page and binds to repository-native assets:

| Video Production Stage | Study Room Native Resource / Module | Responsibility |
|---|---|---|
| Article Source & Facts | `posts/<slug>/index.html` (`extractSource` in `scripts/video-studio-model.mjs` & DOM extractor in `assets/article-video-modal.js`) | Extracts localized Chinese headings (`data-zh`), lead paragraphs, section anchors (`section[id]`), numerical metrics, step lists, and comparison tables without executing page scripts. |
| Article Diagrams & Figures | `posts/<slug>/media/*.zh.svg`, `*.en.svg`, `*.diagram.json` (compiled via `.github/skills/study-room-diagrams/SKILL.md`) | Provides architecture diagrams and visual assets that can be referenced or framed with `containBounds` in `TPL.demo` / `TPL.hero` scenes. |
| Visual Themes & Fluid Motion | `assets/video-studio-composition.js` (`drawAmbientEnvironment`) & `assets/video-studio-templates.js` (`visualThemes`) | Isomorphic 1920×1080 Canvas renderer shared by the live browser monitor and the headless Motion Canvas / Playwright MP4 encoder (`scripts/video-studio-render/`). |
| 9 TPL Scene Choreographies | `assets/video-studio-templates.js` (`buildTemplateComposition`, `buildAutoDraftFromSource`) | Maps article sections into `TPL.hero`, `TPL.point`, `TPL.number`, `TPL.compare`, `TPL.steps`, `TPL.quote`, `TPL.demo`, `TPL.checklist`, and `TPL.outro`. |
| Procedural BGM Synthesizer | `assets/video-studio-bgm.js` & `scripts/video-studio-bgm.mjs` + `scripts/video-studio-audio.mjs` (`assembleAudio`) | Generates 48kHz stereo background music in code (WebAudio live preview + Node PCM rendering) with automatic sidechain ducking under narration. |
| Voice & Word-Level Captions | `scripts/video-studio-media.mjs` & `scripts/video-generator-tts.mjs` | Synthesizes narration via macOS native voices (`Yue (Premium)`, `Lili (Premium)`, `Tingting`) or Volcengine `seed-tts-2.0` (`zh_female_cancan_uranus_bigtts`, `zh_male_chunhou_uranus_bigtts`). |
| Local Server & API Bridge | `scripts/serve-knowledge-hub.mjs` & `scripts/video-studio.mjs` (`/api/copilot/studio/*`) | Persists projects in `private/video-studio/<projectId>/` and runs `/open`, `/auto-narration`, `/one-click`, `/jobs`, and `/manifest`. |

## 2. Four Visual Aesthetic Themes & Organic Living Motion

Never render scenes on flat, blank monochrome backgrounds. Every 1920×1080 frame is driven by continuous time `t` in `KHVideoComposition.draw`:

1. **Professional (`professional`)**: Deep slate/ivory multi-stop gradient mesh + breathing coordinate grid lines, subtle geometric node pulses, and structured cards (`01-A` default pack). Best for architecture reviews and governance guides.
2. **Vibrant (`vibrant`)**: Warm coral/mint fluid gradient mesh + floating organic living bubbles, high-contrast badges, and lively card motion (`05-A` default pack). Best for tutorials and adoption playbooks.
3. **Dynamic (`dynamic`)**: High-energy deep-space neon gradient + flowing energy wave trajectories and bottom time-driven procedural waveform spectrum bars (`04-A` default pack). Best for performance benchmarks and system comparisons.
4. **Elegant (`elegant`)**: Warm gold and twilight violet silk radial gradients + breathing bioluminescent bokeh particles (`01-D` default pack). Best for executive summaries and theoretical essays.

## 3. Procedural Code-Synthesized Background Music (BGM)

Background music is synthesized purely in code (`assets/video-studio-bgm.js` & `scripts/video-studio-bgm.mjs`)—never commit static MP3 files to the repository:

- **`ambient-tech` (知性科技 · 96 BPM)**: Warm Maj7 chord pads + crisp pentatonic arpeggio pulses.
- **`upbeat-pulse` (轻快律动 · 112 BPM)**: Major pentatonic marimba plucks + rhythmic bass groove.
- **`dynamic-drive` (动感节奏 · 122 BPM)**: Octave synth bassline + syncopated electronic pulse.
- **`elegant-minimal` (优雅极简 · 78 BPM)**: Harmonic electric piano broken chords + breathing cello/string sustain.
- **`none` (无配乐)**: Pure voice narration without background music.

During live browser simulation (`playSimulation` in `assets/video-studio-playback.js`), `KHVideoBgm.startPreviewBgm` plays the selected style via WebAudio (`0.16` gain when narration is present, `0.48` when silent) and propagates `AudioContext.resume()` or synthesis errors to the studio error bar. During final audio assembly (`assembleAudio` in `scripts/video-studio-audio.mjs`), lookahead envelope detection automatically ducks BGM volume to ~16% whenever narration is active and restores it smoothly during pauses, with 1.0s fade-in and 1.3s fade-out.

## 4. Typography & 1920×1080 Safe Frame Contract

1. **UI Modal & Panel Legibility (`assets/video-studio.css` + `assets/article-video-modal.js`)**:
   - Modal shell opens at `min(1580px, 96vw) × min(960px, 94dvh)`.
   - Stepper titles use `15px` bold, status badges/details `12px–13px`, primary CTA buttons `15px`, and scene inspector inputs/textareas `15px` (`line-height: 1.6`).
2. **1920×1080 Video Canvas Typography (`assets/video-studio-templates.js` + `assets/video-studio-composition.js`)**:
   - Hero / Quote headlines: `68px–80px` (`weight: 800`), Metric counters: `138px`, Section titles: `58px–68px`, Card copy: `34px–40px`, Kicker badges: `26px–28px`.
   - Bottom subtitle band (`captions` layer): `40px` (`weight: 700`) rendered over a rounded dark translucent pill (`rgba(15, 23, 42, 0.84)`) so captions remain crisp over any gradient background.
   - `fitText` automatically steps down font size (down to `22px`) before wrapping if a localized string is unusually long, preventing unexpected clipping.

## 5. Standard Execution & Visual Self-Check Workflow

1. **Start Local Server**:
   ```sh
   node scripts/serve-knowledge-hub.mjs
   ```
2. **One-Click or API Generation**:
   - In the browser: open `http://127.0.0.1:8000/posts/<slug>/index.html`, click **视频工作室** in the article toolbar, choose the Visual Style (`专业 / 活泼 / 动态 / 优雅`) and BGM (`🎵 开启配乐` + style), and click **⚡ 一键生成完整视频**.
   - Via HTTP API: `POST /api/copilot/studio/open` with `{ article: "<slug>", autoDraft: true }`, then `POST /api/copilot/studio/<id>/one-click` with `{ revision, brief: { visualTheme, music, scenario, stylePack, seconds } }`.
3. **Mandatory Visual & Audio Verification Before Delivery**:
   - Inspect both the Video Studio UI modal and the rendered 1920×1080 Canvas frames at representative timestamps (e.g., `progress = 0.25` or `t = 1.2s`) across visual styles to confirm readable font sizes, balanced card margins, and visible gradient/particle motion.
   - Verify generated `.wav` / `.mp4` outputs with `ffprobe` and waveform peak checks (`peak <= 1.0`, non-silent voice + BGM mix).
   - Run automated tests:
     ```sh
     node scripts/video-generator-tts.mjs --self-check
     node --test tests/video-generator.test.mjs tests/video-studio.test.mjs
     node tests/validate.js
     ```

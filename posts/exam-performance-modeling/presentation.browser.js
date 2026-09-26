/* Real presenter + optional real PPTX export; reuse a running preview only.
 * Independent browser context, no user settings, credentials, model or TTS calls. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const plan = require('./presentation-plan.js');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const out = process.env.EXAM_DEFENSE_EVIDENCE || fs.mkdtempSync(path.join(os.tmpdir(), 'exam-defense-'));
fs.mkdirSync(out, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const summary = [];
  try {
    for (const [lang, width, height, theme] of [['zh', 1920, 1080, 'light'], ['en', 1920, 1080, 'dark'], ['zh', 1280, 720, 'light'], ['en', 1280, 720, 'dark'], ['zh', 390, 844, 'light']]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', acceptDownloads: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === new URL(base).origin) return route.continue();
        // Shared end slide requests a QR even when its default is hidden. Stub
        // that unshown image locally; QR generation is not part of this test.
        if (url.hostname === 'api.qrserver.com') return route.fulfill({ contentType: 'image/png',
          body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5ioAAAAASUVORK5CYII=', 'base64') });
        return route.abort();
      });
      await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.exam-defense-slide').count(), 26);
      assert.equal(await page.locator('.exam-defense-slide:visible').count(), 0);
      assert.equal(await page.locator('main > .section:not(.exam-defense-slide)').count(), 14);
      const problem = await page.locator('#defense-problem-statement').evaluate(slide => {
        const sourceArticles = document.querySelectorAll('#problem .exam-body > article');
        const tables = [...slide.querySelectorAll('[data-source-table]')];
        return {
          rowsMatch: tables.every(table => {
            const original = document.getElementById(table.dataset.sourceTable);
            const heads = [...original.querySelectorAll('thead th')].slice(1).map(e => e.textContent);
            const data = [...original.querySelectorAll('tbody tr')].map(row => [...row.querySelectorAll('td')].map(e => e.textContent));
            return [...table.tBodies[0].rows].every((row, i) => row.cells[0].textContent === heads[i] &&
              data.every((values, j) => row.cells[j + 1].textContent === values[i]));
          }),
          counts: tables.map(table => table.tBodies[0].rows.length),
          conditionsMatch: slide.querySelector('.defense-problem-conditions').textContent === sourceArticles[1].querySelector('.exam-copy > p').textContent,
          introMatch: [...slide.querySelectorAll('.defense-problem-intro p')].every((p, i) => p.textContent === sourceArticles[0].querySelectorAll('.exam-copy > p')[i].textContent),
          questionsMatch: [...slide.querySelectorAll('.defense-problem-questions li')].every((li, i) => li.textContent === sourceArticles[2].querySelectorAll('ol > li')[i].textContent),
          noteAbsent: !/对号入座|Original note|identify them with/.test(slide.textContent)
        };
      });
      assert.deepEqual(problem.counts, [8, 8, 8]);
      assert.ok(problem.rowsMatch && problem.conditionsMatch && problem.introMatch && problem.questionsMatch && problem.noteAbsent);
      const errorsBefore = await page.locator('.exam-defense-slide [data-math-error]').count();
      assert.equal(errorsBefore, 0);
      const charts = await page.evaluate(() => {
        const points = [...document.querySelectorAll('#defense-exploration [data-exam]')];
        const scatterMatches = points.every(point => {
          const t = Number(point.dataset.exam), year = Math.floor((t - 1) / 8) + 1, col = (t - 1) % 8;
          const rows = document.querySelectorAll('#source-year-' + year + ' tbody tr');
          const y = Number(rows[0].querySelectorAll('td')[col].textContent) / (year === 3 ? 150 : 100);
          const d = Number(rows[1].querySelectorAll('td')[col].textContent);
          return Number(point.dataset.rate) === y && Number(point.dataset.difficulty) === d;
        });
        return { points: points.length, uniqueExams: new Set(points.map(p => p.dataset.exam)).size,
          scatterMatches, errors: document.querySelectorAll('#defense-error-profile [data-error]').length };
      });
      assert.deepEqual(charts, { points: 24, uniqueExams: 24, scatterMatches: true, errors: 16 });
      const displayCount = await page.locator('.exam-defense-slide .defense-math .katex').count();
      assert.equal(displayCount, 38);
      await page.locator('[data-presentation-toggle]').click();
      await page.locator('.launch-play-btn').click();
      await page.waitForFunction(() => document.documentElement.classList.contains('is-presentation-mode'));
      await page.waitForTimeout(700);
      const pages = [];
      for (let i = 0; i < plan.length + 1; i++) {
        await page.waitForTimeout(120);
        const state = await page.evaluate(() => {
          const slide = document.querySelector('[data-present-step].is-active');
          const rect = slide.getBoundingClientRect();
          const prev = document.querySelector('[data-present-prev]').getBoundingClientRect();
          const next = document.querySelector('[data-present-next]').getBoundingClientRect();
          const header = document.querySelector('.present-deck').getBoundingClientRect();
          const status = document.querySelector('.present-status').getBoundingClientRect();
          const first = slide.firstElementChild?.getBoundingClientRect();
          const last = slide.lastElementChild?.getBoundingClientRect();
          return {
            id: slide.id, title: document.querySelector('[data-present-deck-title]').textContent,
            label: document.querySelector('[data-present-deck-label]').textContent,
            chapter: slide.dataset.defenseChapter, subsection: slide.dataset.defenseSubsection,
            count: document.querySelector('[data-present-counter]').textContent,
            safeSides: rect.left >= prev.right - 1 && rect.right <= next.left + 1,
            safeTop: !first || first.top >= header.bottom - 1,
            safeBottom: !last || last.bottom <= status.top - 1,
            horizontalOverflow: slide.scrollWidth > slide.clientWidth + 1,
            verticalOverflow: slide.scrollHeight > slide.clientHeight + 2,
            missingMath: [...slide.querySelectorAll('.defense-math')].some(e => !e.querySelector('.katex')),
            mathOverflow: [...slide.querySelectorAll('.defense-math')].some(e => e.scrollWidth > e.clientWidth + 2),
            forbidden: slide.querySelectorAll('.extension-card,.knowledge-card,dialog,[data-accordion]').length,
            font: getComputedStyle(slide).fontSize,
            tableRows: [...slide.querySelectorAll('.defense-year-table')].map(table => Math.round(table.getBoundingClientRect().top)),
            chartLineFills: [...slide.querySelectorAll('.defense-chart-line')].map(line => getComputedStyle(line).fill),
            chartTextOverflow: [...slide.querySelectorAll('.defense-chart text')].some(text => {
              const box = text.getBBox(), view = text.ownerSVGElement.viewBox.baseVal;
              return box.x < -1 || box.y < -1 || box.x + box.width > view.width + 1 || box.y + box.height > view.height + 1;
            })
          };
        });
        assert.equal(state.count, `${i + 1} / ${plan.length + 1}`);
        if (i < plan.length) {
          assert.equal(state.id, 'defense-' + plan[i].id);
          assert.equal(state.title, plan[i].title[lang === 'en' ? 1 : 0]);
          assert.equal(state.label, plan[i].label[lang === 'en' ? 1 : 0]);
          assert.equal(state.chapter, String(plan[i].chapter));
          assert.equal(state.subsection, plan[i].subsection);
          assert.equal(state.forbidden, 0); assert.equal(state.missingMath, false);
          assert.equal(state.chartTextOverflow, false);
          assert.ok(state.chartLineFills.every(fill => fill === 'none'), 'error lines must not imply an unlabelled area');
          assert.equal(state.horizontalOverflow, false);
          if (width >= 1000) {
            if (i === 0) assert.equal(new Set(state.tableRows).size, 1, 'source tables share one row');
            assert.ok(state.safeSides && state.safeTop && state.safeBottom, JSON.stringify(state));
            assert.equal(state.verticalOverflow, false, JSON.stringify(state));
            assert.equal(state.mathOverflow, false, JSON.stringify(state));
          }
        }
        pages.push(state);
        if (width === 1920 && process.env.EXAM_DEFENSE_SCREENSHOTS === '1') {
          await page.waitForTimeout(450);
          await page.screenshot({ path: path.join(out, `${lang}-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 65 });
        }
        if (i < plan.length) await page.locator('[data-present-next]').click();
      }
      // Export the real deck using the shared production download handler.
      if (width === 1920 && process.env.EXAM_DEFENSE_EXPORT === '1') {
        const downloadPromise = page.waitForEvent('download', { timeout: 180000 });
        await page.evaluate(() => document.querySelector('[data-share-export-ppt]').click());
        const download = await downloadPromise;
        await download.saveAs(path.join(out, `exam-defense-${lang}.pptx`));
        const findings = await page.evaluate(() => ({ density: window.StudyRoomPptxExport.getOverflowReports(), skipped: window.StudyRoomPptxExport.getSkippedImages() }));
        fs.writeFileSync(path.join(out, `${lang}-export-findings.json`), JSON.stringify(findings, null, 2));
      }
      await page.locator('[data-present-exit]').click();
      await page.waitForFunction(() => !document.documentElement.classList.contains('is-presentation-mode'));
      assert.equal(await page.locator('.exam-defense-slide:visible').count(), 0);
      assert.equal(await page.locator('#original-data').count(), 1);
      await page.locator('#model-selection-details .extension-card-trigger').click();
      assert.ok(await page.locator('#knowledge-dialog').evaluate(d => d.open));
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      const result = { lang, width, height, theme, pages, errors };
      summary.push(result);
      fs.writeFileSync(path.join(out, `${lang}-${width}-geometry.json`), JSON.stringify(result, null, 2));
      console.log(JSON.stringify({ lang, width, slides: pages.length, displayFormulas: displayCount, errors }));
      await context.close();
    }
  } finally { await browser.close(); }
  console.log('Evidence: ' + out);
})().catch(error => { console.error(error); process.exitCode = 1; });

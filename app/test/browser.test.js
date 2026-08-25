/* ==========================================================================
   Browser smoke test — drives the real app in headless Chromium over
   file://, so it exercises exactly what a student would touch.

     node test/browser.test.js

   Needs Playwright somewhere resolvable; skips with a note if it is missing.
   Exits non-zero on failure.
   ========================================================================== */
'use strict';

var path = require('path');
var PAGE = 'file://' + path.join(__dirname, '..', 'index.html');

var chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  try { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; }
  catch (e2) {
    console.log('Playwright not found — skipping the browser test.');
    console.log('  npm i -D playwright && npx playwright install chromium');
    process.exit(0);
  }
}

var failures = [];
function check(cond, msg) { if (!cond) failures.push(msg); }

function seed(page, state) {
  /* evaluate() serialises the function, so the state has to travel as an arg */
  return page.evaluate(function (s) {
    localStorage.setItem('divisionAdventure.v1', JSON.stringify(s));
  }, state);
}

(async function () {
  var browser = await chromium.launch();
  var ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 } });
  var page = await ctx.newPage();
  var noise = [];
  page.on('pageerror', function (e) { noise.push('pageerror: ' + e.message); });
  page.on('console', function (m) { if (m.type() === 'error') noise.push('console: ' + m.text()); });

  /* ---- 1. it loads, offline, straight off the filesystem ---------------- */
  await page.goto(PAGE);
  await seed(page, { name: 'Test', grade: 3, sound: false, totals: { lessons: 1 } });
  await page.reload();
  await page.waitForTimeout(700);

  check(await page.locator('.hero h1').count() === 1, 'home screen did not render');
  check(await page.locator('.grade-card').count() === 6, 'expected 6 grade paths');
  check(await page.locator('.menu-card').count() === 5, 'expected 5 menu buttons');
  check(await page.evaluate(function () {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; }
  }), 'progress cannot be saved');

  /* ---- 2. every picture and every question card mounts ------------------ */
  var sweep = await page.evaluate(function () {
    var bad = [], host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-99999px;top:0;width:900px';
    document.body.appendChild(host);
    var visuals = 0, cards = 0;

    function spec(s, where) {
      if (!s) return;
      var n;
      try { n = Visual.render(s); } catch (e) { bad.push(where + ' threw ' + e.message); return; }
      if (!n) { bad.push(where + ': ' + s.kind + ' rendered nothing'); return; }
      host.appendChild(n);
      if (n.getBoundingClientRect().height < 4) bad.push(where + ': ' + s.kind + ' rendered empty');
      visuals++;
      host.innerHTML = '';
    }

    for (var g = 1; g <= 6; g++) {
      ['easy', 'medium', 'challenge'].forEach(function (d) {
        for (var i = 0; i < 40; i++) {
          var q = Questions.make(g, d);
          spec(q.visual, 'g' + g + '/' + d + '/' + q.kindLabel + ' visual');
          spec(q.teach && q.teach.visual, 'g' + g + '/' + d + '/' + q.kindLabel + ' teach');
          try {
            host.appendChild(Session.QuestionCard(q, { onResult: function () {} }).node);
            cards++;
            if (!host.querySelector('.q-prompt')) bad.push('g' + g + ' card has no prompt');
            host.innerHTML = '';
          } catch (e) { bad.push('g' + g + '/' + d + ' card threw ' + e.message); }
        }
      });
      Curriculum.lessonsFor(g).forEach(function (L) {
        spec(L.visual, L.id + ' visual');
        spec(L.worked.visual, L.id + ' worked');
        for (var k = 0; k < 8; k++) {
          var tq = L.tryIt();
          spec(tq.visual, L.id + ' tryIt visual');
          spec(tq.teach && tq.teach.visual, L.id + ' tryIt teach');
        }
      });
    }
    host.remove();
    return { bad: Array.from(new Set(bad)), visuals: visuals, cards: cards };
  });
  check(sweep.bad.length === 0, 'render problems: ' + sweep.bad.slice(0, 5).join('; '));
  check(sweep.visuals > 1000, 'expected to render many visuals, got ' + sweep.visuals);

  /* ---- 3. a lesson, end to end, answered correctly ---------------------- */
  await page.evaluate(function () { App.go('lesson', { id: 'g2-l3' }); });
  await page.waitForTimeout(500);
  var steps = ['Show me a picture', 'Watch a worked example', "I'm ready"];
  for (var s = 0; s < steps.length; s++) {
    await page.locator('button:has-text("' + steps[s] + '")').first().click();
    await page.waitForTimeout(700);
  }
  check(await page.locator('.q-card').count() === 1, 'lesson did not reach its Try It question');
  var answered = await page.evaluate(function () {
    var m = document.querySelector('.q-prompt').textContent.match(/hops of (\d+).*reach (\d+)/);
    if (!m) return false;
    var want = String((+m[2]) / (+m[1]));
    var hit = Array.prototype.slice.call(document.querySelectorAll('.choice'))
      .filter(function (c) { return c.textContent.trim() === want; })[0];
    if (!hit) return false;
    hit.click();
    return true;
  });
  check(answered, 'could not find the correct choice in the lesson question');
  await page.locator('button:has-text("Check my answer")').click();
  await page.waitForTimeout(500);
  check(await page.locator('.feedback.is-right').count() === 1, 'a correct answer was not marked correct');
  await page.locator('button:has-text("Finish this lesson")').click();
  await page.waitForTimeout(900);
  check(await page.evaluate(function () { return Progress.lessonDone('g2-l3'); }), 'finishing a lesson did not record it');

  /* ---- 4. a wrong answer coaches instead of scolding -------------------- */
  await page.evaluate(function () { App.go('practiceRun', { difficulty: 'easy' }); });
  await page.waitForTimeout(600);
  await page.evaluate(function () {
    var c = document.querySelector('.choice');
    if (c) { c.click(); return; }
    document.querySelectorAll('.answer-input').forEach(function (i) {
      i.value = '999999';
      i.dispatchEvent(new Event('input'));
    });
  });
  await page.locator('button:has-text("Check my answer")').click();
  await page.waitForTimeout(500);
  var fb = await page.evaluate(function () {
    var box = document.querySelector('.feedback');
    return box ? { text: box.textContent, lines: box.querySelectorAll('.fb-lines li').length,
                   retry: !!box.querySelector('button') } : null;
  });
  if (fb && /is-wrong/.test(await page.locator('.feedback').getAttribute('class'))) {
    check(fb.lines >= 1, 'a wrong answer showed no explanation');
    check(!/\bWrong\b/.test(fb.text), 'feedback said "Wrong" to a child');
    check(fb.retry, 'a wrong answer offered no way to try again');
  }

  /* ---- 5. drag and drop: pointer, tap and keyboard ---------------------- */
  async function freshDrag() {
    await page.evaluate(function () {
      var q = { mode: 'drag', kindLabel: 'Drag', prompt: 'Share 6 between 3',
        drag: { total: 6, groups: 3, per: 2, emoji: '🍎', boxLabel: 'basket', itemName: 'apple' },
        answer: { groups: 3, per: 2, total: 6 }, hint: 'h', teach: { lines: ['x'] }, tags: [] };
      window.__res = null;
      var card = Session.QuestionCard(q, { onResult: function (c) { window.__res = c; } });
      var m = document.getElementById('main');
      m.innerHTML = '';
      m.appendChild(card.node);
    });
    await page.waitForTimeout(250);
  }
  async function submitDrag() {
    await page.locator('button:has-text("Check my answer")').click();
    await page.waitForTimeout(400);
    return page.evaluate(function () { return window.__res; });
  }

  await freshDrag();
  for (var bx = 0; bx < 3; bx++) {
    for (var k = 0; k < 2; k++) {
      var tok = page.locator('.drag-pool .drag-tok').first();
      var box = page.locator('.group-box').nth(bx);
      var a = await tok.boundingBox(), c = await box.boundingBox();
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
      await page.mouse.down();
      await page.mouse.move(a.x + a.width / 2 + 14, a.y + a.height / 2 + 14, { steps: 3 });
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(60);
    }
  }
  check(await submitDrag() === true, 'dragging with a pointer did not solve the grouping question');

  await freshDrag();
  for (var bx2 = 0; bx2 < 3; bx2++) {
    for (var k2 = 0; k2 < 2; k2++) {
      await page.locator('.drag-pool .drag-tok').first().click();
      await page.locator('.group-box').nth(bx2).click();
      await page.waitForTimeout(40);
    }
  }
  check(await submitDrag() === true, 'tap-to-place did not solve the grouping question');

  await freshDrag();
  for (var bx3 = 0; bx3 < 3; bx3++) {
    for (var k3 = 0; k3 < 2; k3++) {
      await page.evaluate(function () { document.querySelector('.drag-pool .drag-tok').focus(); });
      await page.keyboard.press('Enter');
      await page.evaluate(function (i) { document.querySelectorAll('.group-box')[i].focus(); }, bx3);
      await page.keyboard.press('Enter');
    }
  }
  check(await submitDrag() === true, 'the keyboard path did not solve the grouping question');

  /* ---- 6. layout holds from phone to desktop --------------------------- */
  var screens = ['home', 'learn', 'practice', 'challenges', 'progress', 'achievements'];
  var widths = [390, 820, 1280];
  for (var w = 0; w < widths.length; w++) {
    await page.setViewportSize({ width: widths[w], height: 900 });
    for (var sc = 0; sc < screens.length; sc++) {
      await page.evaluate(function (r) { App.go(r); }, screens[sc]);
      await page.waitForTimeout(350);
      var layout = await page.evaluate(function () {
        var small = [];
        document.querySelectorAll('button').forEach(function (b) {
          if (!b.offsetParent) return;
          var r = b.getBoundingClientRect();
          if (Math.min(r.width, r.height) < 40) small.push((b.textContent || '').trim().slice(0, 20) || b.className);
        });
        return { overflow: document.documentElement.scrollWidth > window.innerWidth + 1, small: small };
      });
      check(!layout.overflow, screens[sc] + ' scrolls sideways at ' + widths[w] + 'px');
      check(layout.small.length === 0,
        screens[sc] + ' at ' + widths[w] + 'px has tap targets under 40px: ' + layout.small.join(', '));
    }
  }

  check(noise.length === 0, 'browser reported errors: ' + Array.from(new Set(noise)).slice(0, 4).join(' | '));

  await browser.close();

  console.log('rendered ' + sweep.visuals + ' visuals and ' + sweep.cards + ' question cards');
  console.log('drove ' + screens.length + ' screens at ' + widths.join('/') + 'px');
  if (failures.length) {
    console.error('\nFAILED (' + failures.length + '):');
    failures.forEach(function (f) { console.error('  - ' + f); });
    process.exit(1);
  }
  console.log('all good ✓');
})().catch(function (e) {
  console.error('browser test crashed: ' + e.stack);
  process.exit(1);
});

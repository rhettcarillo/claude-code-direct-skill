/* ==========================================================================
   session.js — the question card, the drag-and-drop widget, and the round
   runner shared by Learn ("Try It!"), Practice and Challenges.
   ========================================================================== */
window.Session = (function () {
  'use strict';

  var el = U.el;

  var PRAISE = ['Brilliant! 🌟', 'You got it! 🎉', 'Nice thinking! 💪', 'Superstar! ⭐',
    'Exactly right! 🙌', 'Perfect! 🏆', 'Amazing work! 🚀', 'Spot on! ✨', 'Great job! 🥳'];
  var GENTLE = ['Almost! Let\'s do it together 💛', 'Good try! Look at this with me 🤗',
    'Nearly there — let\'s check it step by step 🌈', 'Close one! Here\'s the trick 💡',
    'Nice effort! Let\'s walk through it 🧡'];
  var MASCOTS = ['🦉', '🐨', '🦊', '🐼', '🐵', '🦁'];

  /* ======================================================================
     Drag & drop grouping widget — works with mouse, finger and taps.
     ====================================================================== */
  function DragGroups(spec) {
    var pool = el('div', { class: 'drag-pool' });
    var boxes = [];
    var selected = null;
    var ghost = null;

    var itemName = spec.itemName || 'object';
    var boxName = spec.boxLabel || 'group';

    function makeTok(i) {
      var t = el('button', {
        class: 'drag-tok', type: 'button', text: spec.emoji,
        'aria-label': itemName + ' ' + (i + 1),
        dataset: { i: String(i) }
      });
      wireToken(t);
      return t;
    }

    function containerAt(x, y) {
      var node = document.elementFromPoint(x, y);
      while (node && node !== document.body) {
        if (node.classList && (node.classList.contains('drag-pool') || node.classList.contains('group-box'))) return node;
        node = node.parentNode;
      }
      return null;
    }

    function highlight(node) {
      [pool].concat(boxes).forEach(function (b) { b.classList.remove('is-over'); });
      if (node) node.classList.add('is-over');
    }

    function drop(tokEl, target) {
      if (!target) return;
      var host = target.classList.contains('group-box') ? target.querySelector('.gb-items') : target;
      host.appendChild(tokEl);
      U.Sound.pop();
      refreshCounts();
    }

    /* One place decides what a tap means, so a tap on a token sitting inside a
       basket still works as "drop the selected one here". */
    function tapToken(t) {
      if (selected && selected !== t) {
        var container = t.closest('.group-box') || t.closest('.drag-pool');
        var prev = selected;
        selected.classList.remove('is-selected');
        selected = null;
        drop(prev, container);
        return;
      }
      if (selected === t) { t.classList.remove('is-selected'); selected = null; }
      else {
        if (selected) selected.classList.remove('is-selected');
        selected = t;
        t.classList.add('is-selected');
      }
    }

    function wireToken(t) {
      var dragging = false, moved = false, suppressClick = false;

      t.addEventListener('pointerdown', function (e) {
        dragging = true; moved = false;
        try { t.setPointerCapture(e.pointerId); } catch (err) {}
      });

      t.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        if (!moved && Math.abs(e.movementX) + Math.abs(e.movementY) < 2) return;
        moved = true;
        if (!ghost) {
          ghost = el('div', { class: 'drag-ghost', text: spec.emoji });
          document.body.appendChild(ghost);
          t.style.opacity = '.25';
        }
        ghost.style.left = e.clientX + 'px';
        ghost.style.top = e.clientY + 'px';
        highlight(containerAt(e.clientX, e.clientY));
      });

      function finish(e) {
        if (!dragging) return;
        dragging = false;
        try { t.releasePointerCapture(e.pointerId); } catch (err) {}
        if (ghost) { ghost.remove(); ghost = null; }
        t.style.opacity = '';
        highlight(null);
        if (moved) {
          suppressClick = true;                 /* the drag already placed it */
          drop(t, containerAt(e.clientX, e.clientY));
        }
      }
      t.addEventListener('pointerup', finish);
      t.addEventListener('pointercancel', finish);

      /* Taps land here — and so do Enter and Space, because the token is a
         real button. That gives the whole activity a keyboard path. */
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        if (suppressClick) { suppressClick = false; return; }
        tapToken(t);
      });
    }

    function wireTarget(node, label) {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', label);
      function place() {
        if (!selected) return;
        selected.classList.remove('is-selected');
        drop(selected, node);
        selected = null;
      }
      node.addEventListener('click', place);
      node.addEventListener('keydown', function (e) {
        /* only when the container itself has focus — otherwise this would
           swallow the Enter that activates a token button inside it */
        if (e.target !== node) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); place(); }
      });
    }

    for (var i = 0; i < spec.total; i++) pool.appendChild(makeTok(i));

    var boxRow = el('div', { class: 'group-row' });
    for (var g = 0; g < spec.groups; g++) {
      var count = el('span', { class: 'gb-label', text: '0' });
      var box = el('div', { class: 'group-box' }, [el('div', { class: 'gb-items' }), count]);
      box._count = count;
      box._index = g + 1;
      wireTarget(box, 'Put the chosen ' + itemName + ' in ' + boxName + ' ' + (g + 1));
      boxes.push(box);
      boxRow.appendChild(box);
    }
    wireTarget(pool, 'Put the chosen ' + itemName + ' back with the spare ones');

    function refreshCounts() {
      boxes.forEach(function (b) {
        var n = b.querySelectorAll('.drag-tok').length;
        b._count.textContent = String(n);
        b.setAttribute('aria-label', boxName + ' ' + b._index + ', ' + n + ' ' +
          U.plural(n, itemName, itemName + 's') + '. Press Enter to put the chosen one here.');
        b.classList.remove('is-ok', 'is-bad');
      });
    }
    refreshCounts();

    function evaluate() {
      var counts = boxes.map(function (b) { return b.querySelectorAll('.drag-tok').length; });
      var leftInPool = pool.querySelectorAll('.drag-tok').length;
      var allSame = counts.every(function (c) { return c === counts[0]; });
      var ok = leftInPool === 0 && allSame && counts[0] === spec.per;
      boxes.forEach(function (b, i) {
        b.classList.toggle('is-ok', ok);
        b.classList.toggle('is-bad', !ok && counts[i] !== spec.per);
      });
      return { ok: ok, counts: counts, leftInPool: leftInPool };
    }

    function lock() {
      U.$$('.drag-tok', node).forEach(function (t) { t.style.pointerEvents = 'none'; });
    }

    var node = el('div', { class: 'drag-area' }, [
      el('div', { class: 'drag-help', text: 'Drag the ' + spec.emoji + ' into the ' + boxName + 's — or tap one, then tap where it goes.' }),
      el('div', { class: 'sr-only', text: 'Using a keyboard: tab to an object and press Enter to pick it up, then tab to a ' + boxName + ' and press Enter to put it there.' }),
      pool,
      boxRow
    ]);

    return { node: node, evaluate: evaluate, lock: lock };
  }

  /* ======================================================================
     Question card
     ====================================================================== */
  /* opts: { onResult(correct, meta), onNext, nextLabel, showNext } */
  function QuestionCard(q, opts) {
    opts = opts || {};
    var answered = false, usedHint = false, retrying = false;
    var given = null;
    var dragWidget = null;
    var inputs = [];
    var activeInput = null;
    var pickedIndex = -1;

    var feedbackHost = el('div', {});
    var hintHost = el('div', {});
    var answerHost = el('div', { class: 'stack' });

    var checkBtn = el('button', { class: 'btn btn-green btn-lg', type: 'button' }, ['✓ Check my answer']);
    var hintBtn = el('button', { class: 'btn btn-blue btn-sm', type: 'button' }, ['💡 Hint']);

    /* ---- answer widgets ---- */
    function buildChoices() {
      var grid = el('div', { class: 'choices' });
      q.choices.forEach(function (label, i) {
        var visual = q.choiceVisuals ? Visual.renderMini(q.choiceVisuals[i]) : null;
        var btn = el('button', { class: 'choice', type: 'button', 'aria-label': 'Answer ' + label }, [
          visual,
          el('span', { text: label })
        ]);
        btn.addEventListener('click', function () {
          if (answered) return;
          U.Sound.click();
          U.$$('.choice', grid).forEach(function (c) { c.classList.remove('is-picked'); });
          btn.classList.add('is-picked');
          pickedIndex = i;
          given = i;
          checkBtn.disabled = false;
        });
        grid.appendChild(btn);
      });
      checkBtn.disabled = true;
      return grid;
    }

    function makeInput(placeholder, label, cls) {
      var input = el('input', {
        class: 'answer-input ' + (cls || ''), type: 'text', inputmode: 'decimal',
        autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
        placeholder: placeholder || '?', 'aria-label': label || 'Your answer'
      });
      input.addEventListener('focus', function () { activeInput = input; });
      input.addEventListener('input', function () { checkBtn.disabled = !input.value.trim(); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
      inputs.push(input);
      if (!activeInput) activeInput = input;
      return input;
    }

    function keypad() {
      var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '/', '⌫', 'C', '↵'];
      var pad = el('div', { class: 'keypad' });
      keys.forEach(function (k) {
        var b = el('button', { class: k.length > 1 || '0123456789'.indexOf(k) === -1 ? 'k-wide' : '', type: 'button', text: k });
        b.addEventListener('click', function () {
          if (answered && !retrying) return;
          var target = activeInput || inputs[0];
          if (!target) return;
          if (k === '⌫') target.value = target.value.slice(0, -1);
          else if (k === 'C') target.value = '';
          else if (k === '↵') { submit(); return; }
          else target.value += k;
          U.Sound.click();
          checkBtn.disabled = !inputs.some(function (i) { return i.value.trim(); });
          target.focus();
        });
        pad.appendChild(b);
      });
      return pad;
    }

    function buildInput() {
      var input = makeInput('?', 'Type your answer');
      checkBtn.disabled = true;
      return el('div', { class: 'stack' }, [
        el('div', { class: 'answer-input-row' }, [
          input,
          q.unit ? el('span', { style: { fontWeight: '800', color: '#5C5470' }, text: q.unit }) : null
        ]),
        keypad()
      ]);
    }

    function buildQuotRem() {
      var a = makeInput('?', 'Answer');
      var b = makeInput('?', 'Remainder');
      a.classList.add('answer-input-sm');
      b.classList.add('answer-input-sm');
      checkBtn.disabled = true;
      return el('div', { class: 'stack' }, [
        el('div', { class: 'answer-input-row' }, [
          el('label', { class: 'input-label' }, [el('span', { text: 'Answer' }), a]),
          el('span', { style: { fontSize: '26px', fontWeight: '800' }, text: 'r' }),
          el('label', { class: 'input-label' }, [el('span', { text: 'Remainder' }), b])
        ]),
        keypad()
      ]);
    }

    function buildDrag() {
      dragWidget = DragGroups(q.drag);
      checkBtn.disabled = false;
      return dragWidget.node;
    }

    /* ---- checking ---- */
    function readAnswer() {
      if (q.mode === 'mc') return pickedIndex;
      if (q.mode === 'quotrem') return { q: inputs[0].value, r: inputs[1].value };
      if (q.mode === 'drag') return dragWidget.evaluate();
      return inputs[0].value;
    }

    function markWidgets(correct) {
      if (q.mode === 'mc') {
        U.$$('.choice', answerHost).forEach(function (c, i) {
          c.classList.add('is-locked');
          if (i === q.answerIndex) c.classList.add('is-right');
          else if (i === pickedIndex && !correct) c.classList.add('is-wrong');
        });
      } else if (q.mode === 'drag') {
        if (correct) dragWidget.lock();
      } else {
        inputs.forEach(function (i) { i.classList.add(correct ? 'is-right' : 'is-wrong'); });
      }
    }

    function submit() {
      if (answered && !retrying) return;
      given = readAnswer();
      if (q.mode === 'mc' && pickedIndex < 0) return;
      if ((q.mode === 'input' || q.mode === 'quotrem') && !inputs.some(function (i) { return i.value.trim(); })) return;

      var correct = Questions.check(q, given);

      if (retrying) {
        /* a second attempt: coach, but do not re-score */
        markWidgets(correct);
        if (correct) {
          U.Sound.correct();
          U.clear(feedbackHost).appendChild(rightPanel(true));
        } else {
          U.clear(feedbackHost).appendChild(revealPanel());
        }
        checkBtn.disabled = true;
        retrying = false;
        return;
      }

      answered = true;
      checkBtn.disabled = true;
      hintBtn.disabled = true;
      markWidgets(correct);

      if (correct) {
        U.Sound.correct();
        U.clear(feedbackHost).appendChild(rightPanel(false));
      } else {
        U.Sound.wrong();
        U.clear(feedbackHost).appendChild(wrongPanel());
      }
      if (opts.onResult) opts.onResult(correct, { usedHint: usedHint, question: q });
      feedbackHost.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* ---- feedback panels ---- */
    function nextButton() {
      if (!opts.onNext) return null;
      var b = el('button', { class: 'btn btn-purple btn-lg', type: 'button' }, [opts.nextLabel || 'Next question ▶']);
      b.addEventListener('click', function () { U.Sound.click(); opts.onNext(); });
      return el('div', { class: 'row row-end' }, [b]);
    }

    function rightPanel(secondTry) {
      return el('div', { class: 'feedback is-right' }, [
        el('div', { class: 'fb-title' }, [
          el('span', { text: U.pick(MASCOTS) }),
          el('span', { text: secondTry ? 'Yes! You worked it out 🎉' : U.pick(PRAISE) })
        ]),
        el('div', { style: { fontWeight: '700' }, text: (q.mode === 'drag' ? 'Every group has the same amount — that is fair sharing!' : 'The answer is ' + Questions.answerLabel(q) + '.') }),
        nextButton()
      ]);
    }

    function wrongPanel() {
      var againBtn = el('button', { class: 'btn btn-orange btn-sm', type: 'button' }, ['↺ Try it again']);
      againBtn.addEventListener('click', function () {
        retrying = true;
        checkBtn.disabled = false;
        if (q.mode === 'mc') {
          U.$$('.choice', answerHost).forEach(function (c) { c.classList.remove('is-locked', 'is-right', 'is-wrong', 'is-picked'); });
          pickedIndex = -1; checkBtn.disabled = true;
        } else if (q.mode !== 'drag') {
          inputs.forEach(function (i) { i.classList.remove('is-wrong'); i.value = ''; });
          checkBtn.disabled = true;
          if (inputs[0]) inputs[0].focus();
        }
        againBtn.disabled = true;
      });

      return el('div', { class: 'feedback is-wrong' }, [
        el('div', { class: 'fb-title' }, [
          el('span', { text: U.pick(MASCOTS) }),
          el('span', { text: U.pick(GENTLE) })
        ]),
        el('ul', { class: 'fb-lines' }, (q.teach.lines || []).map(function (line) {
          return el('li', {}, [el('span', { text: line })]);
        })),
        q.teach.visual ? Visual.render(q.teach.visual) : null,
        el('div', { style: { fontWeight: '800', color: '#2B2340' }, text: 'The answer is ' + Questions.answerLabel(q) + '. Mistakes help your brain grow! 🌱' }),
        el('div', { class: 'row' }, [againBtn]),
        nextButton()
      ]);
    }

    function revealPanel() {
      return el('div', { class: 'feedback is-wrong' }, [
        el('div', { class: 'fb-title' }, [el('span', { text: '🤝' }), el('span', { text: 'That\'s okay — here it is' })]),
        el('div', { style: { fontWeight: '800' }, text: 'The answer is ' + Questions.answerLabel(q) + '. You will get the next one!' }),
        nextButton()
      ]);
    }

    /* ---- hint ---- */
    hintBtn.addEventListener('click', function () {
      if (usedHint) return;
      usedHint = true;
      hintBtn.disabled = true;
      U.Sound.click();
      U.clear(hintHost).appendChild(el('div', { class: 'hint-box' }, [
        el('span', { class: 'hb-icon', text: '💡' }),
        el('div', {}, [el('strong', { text: 'Hint: ' }), el('span', { text: q.hint })])
      ]));
    });
    checkBtn.addEventListener('click', submit);

    /* ---- assemble ---- */
    if (q.mode === 'mc') answerHost.appendChild(buildChoices());
    else if (q.mode === 'quotrem') answerHost.appendChild(buildQuotRem());
    else if (q.mode === 'drag') answerHost.appendChild(buildDrag());
    else answerHost.appendChild(buildInput());

    var node = el('div', { class: 'card q-card' }, [
      q.kindLabel ? el('span', { class: 'q-kind', text: q.kindLabel }) : null,
      q.story ? el('div', { class: 'q-story', text: q.story }) : null,
      el('div', { class: 'q-prompt', text: q.prompt }),
      q.equation ? el('div', { class: 'q-equation', text: q.equation.text }) : null,
      q.visual ? Visual.render(q.visual) : null,
      answerHost,
      hintHost,
      el('div', { class: 'row' }, [hintBtn, el('div', { class: 'grow' }), checkBtn]),
      feedbackHost
    ]);

    return {
      node: node,
      focus: function () { if (inputs[0]) inputs[0].focus(); }
    };
  }

  /* ======================================================================
     Round runner — shared by Practice and Challenges
     ====================================================================== */
  /* cfg: {grade, difficulty, count, kind, mode:'plain'|'hearts'|'timed',
           timeLimit, title, subtitle, onExit, onAgain, makeQuestion} */
  function Runner(cfg) {
    var state = {
      index: 0, correct: 0, streak: 0, best: 0, hints: 0,
      lives: cfg.mode === 'hearts' ? 3 : 0,
      score: 0, results: [], timeLeft: cfg.timeLimit || 0, over: false
    };
    var timerId = null;

    var host = el('div', { class: 'stack' });
    var barHost = el('div', {});
    var bodyHost = el('div', {});
    var node = el('div', { class: 'screen' }, [
      el('div', { class: 'wrap wrap-narrow stack' }, [barHost, bodyHost])
    ]);

    var grade = Curriculum.gradeById(cfg.grade);

    function dots() {
      var row = el('div', { class: 'progress-dots' });
      for (var i = 0; i < cfg.count; i++) {
        var cls = i < state.results.length ? (state.results[i] ? 'ok' : 'no') : (i === state.index ? 'now' : '');
        row.appendChild(el('i', { class: cls }));
      }
      return row;
    }

    function hearts() {
      var row = el('div', { class: 'hearts' });
      for (var i = 0; i < 3; i++) row.appendChild(el('span', { class: i < state.lives ? '' : 'lost', text: '❤️' }));
      return row;
    }

    function paintBar() {
      var pct = Math.round((state.results.length / cfg.count) * 100);
      var chips = [
        el('span', { class: 'chip chip-grade', text: grade.emoji + ' ' + grade.name }),
        el('span', { class: 'chip chip-star', text: '⭐ ' + state.correct + '/' + cfg.count })
      ];
      if (state.streak >= 2) chips.push(el('span', { class: 'chip chip-fire', text: '🔥 ' + state.streak + ' in a row' }));

      var exitBtn = el('button', { class: 'icon-btn', type: 'button', title: 'Leave this round', 'aria-label': 'Leave this round', text: '✕' });
      exitBtn.addEventListener('click', function () { confirmExit(); });

      U.clear(barHost).appendChild(el('div', { class: 'session-bar' }, [
        el('div', { class: 'sb-top' }, [
          el('span', { class: 'sb-title', text: cfg.title }),
          el('div', { class: 'grow' }),
          cfg.mode === 'hearts' ? hearts() : null,
          exitBtn
        ]),
        el('div', { class: 'row' }, chips),
        el('div', { class: 'progress-track' }, [el('i', { style: { width: pct + '%' } })]),
        dots(),
        cfg.mode === 'timed' ? el('div', { class: 'timer-track' + (state.timeLeft <= 15 ? ' low' : '') }, [
          el('i', { style: { width: Math.max(0, (state.timeLeft / cfg.timeLimit) * 100) + '%' } })
        ]) : null,
        cfg.mode === 'timed' ? el('div', { class: 'vis-caption', text: '⏱ ' + state.timeLeft + ' seconds left' }) : null
      ]));
    }

    function confirmExit() {
      var m = U.modal([
        el('h2', { text: 'Leave this round?' }),
        el('p', { text: 'Your progress in this round will not be saved — but everything you have already earned stays safe.' }),
        el('div', { class: 'row row-end' }, [
          el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Keep playing', onclick: function () { m.close(); } }),
          el('button', { class: 'btn btn-pink btn-sm', type: 'button', text: 'Leave', onclick: function () { m.close(); stopTimer(); cfg.onExit(); } })
        ])
      ]);
    }

    function startTimer() {
      if (cfg.mode !== 'timed') return;
      timerId = setInterval(function () {
        state.timeLeft -= 1;
        if (state.timeLeft <= 0) { state.timeLeft = 0; stopTimer(); finish(); }
        paintBar();
      }, 1000);
    }
    function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

    function flashStreak(n) {
      var f = el('div', { class: 'streak-flash', text: n + ' in a row! 🔥' });
      document.body.appendChild(f);
      setTimeout(function () { f.remove(); }, 1200);
    }

    function onResult(correct, meta) {
      state.results.push(correct);
      if (meta.usedHint) state.hints += 1;
      if (correct) {
        state.correct += 1;
        state.streak += 1;
        state.best = Math.max(state.best, state.streak);
        state.score += 100 + Math.min(state.streak - 1, 5) * 20;
        if (state.streak === 3 || state.streak === 5 || state.streak >= 10) flashStreak(state.streak);
      } else {
        state.streak = 0;
        if (cfg.mode === 'hearts') state.lives -= 1;
      }
      Progress.recordStreak(state.best);
      var res = Progress.recordAnswer({
        grade: cfg.grade, difficulty: cfg.difficulty, correct: correct,
        tags: meta.question.tags, usedHint: meta.usedHint
      });
      res.unlocked.forEach(function (lvl) {
        U.toast('🔓', U.cap(lvl) + ' unlocked!', 'New questions are waiting in ' + grade.name + ' practice.', 4200);
        U.Sound.badge();
      });
      Badges.celebrate(Badges.check());
      paintBar();
    }

    function nextQuestion() {
      state.index += 1;
      if (state.index >= cfg.count || (cfg.mode === 'hearts' && state.lives <= 0)) { finish(); return; }
      showQuestion();
    }

    function showQuestion() {
      var q = cfg.makeQuestion(state.index);
      var last = state.index === cfg.count - 1;
      var card = QuestionCard(q, {
        onResult: onResult,
        onNext: nextQuestion,
        nextLabel: last ? 'See my results 🏁' : 'Next question ▶'
      });
      U.clear(bodyHost).appendChild(card.node);
      paintBar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function starsFor(pct) { return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0; }

    function finish() {
      state.over = true;
      stopTimer();
      var answered = state.results.length || 1;
      var pct = state.correct / cfg.count;
      var stars = starsFor(pct);
      var earned;

      if (cfg.kind === 'challenge') {
        Progress.finishChallenge({ grade: cfg.grade, mode: cfg.challengeMode || cfg.mode, stars: stars, score: state.score });
      }
      Progress.finishSession({
        grade: cfg.grade, difficulty: cfg.difficulty, correct: state.correct,
        total: cfg.count, hintsUsed: state.hints, kind: cfg.kind
      });
      earned = Badges.check();

      var msg = stars === 3 ? 'Outstanding! You are a division star! 🌟'
        : stars === 2 ? 'Great work — you really know this! 💪'
        : stars === 1 ? 'Nice going! A little more practice and you\'ve got it. 🌱'
        : 'Every try makes you stronger. Let\'s go again together! 🤗';

      if (stars >= 2) { U.confetti({ count: stars === 3 ? 170 : 110 }); U.Sound.win(); }
      else U.Sound.badge();
      Badges.celebrate(earned);

      var starRow = el('div', { class: 'result-stars' });
      for (var i = 0; i < 3; i++) {
        starRow.appendChild(el('span', { class: i < stars ? '' : 'off', style: { animationDelay: (i * 0.18) + 's' }, text: '⭐' }));
      }

      var againBtn = el('button', { class: 'btn btn-green btn-lg', type: 'button', text: '↻ Play again' });
      againBtn.addEventListener('click', function () { U.Sound.click(); cfg.onAgain(); });
      var homeBtn = el('button', { class: 'btn btn-ghost btn-lg', type: 'button', text: '🏠 Back' });
      homeBtn.addEventListener('click', function () { U.Sound.click(); cfg.onExit(); });

      U.clear(barHost);
      U.clear(bodyHost).appendChild(el('div', { class: 'card result-card' }, [
        el('div', { class: 'tape' }),
        el('div', { style: { fontSize: '46px' }, text: stars === 3 ? '🏆' : stars === 2 ? '🎉' : '🌱' }),
        el('h2', { text: cfg.kind === 'challenge' ? 'Challenge complete!' : 'Round complete!' }),
        starRow,
        el('div', { class: 'result-score', text: state.correct + '/' + cfg.count }),
        el('div', { class: 'result-msg', text: msg }),
        el('div', { class: 'stat-strip' }, [
          el('div', { class: 'stat-pill' }, [el('b', { text: String(Math.round(pct * 100)) + '%' }), el('span', { text: 'Accuracy' })]),
          el('div', { class: 'stat-pill' }, [el('b', { text: String(state.best) }), el('span', { text: 'Best streak' })]),
          cfg.kind === 'challenge' ? el('div', { class: 'stat-pill' }, [el('b', { text: String(state.score) }), el('span', { text: 'Score' })]) : null,
          el('div', { class: 'stat-pill' }, [el('b', { text: String(state.hints) }), el('span', { text: 'Hints used' })])
        ]),
        el('div', { class: 'row', style: { justifyContent: 'center' } }, [againBtn, homeBtn])
      ]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showQuestion();
    startTimer();

    return { node: node, stop: stopTimer };
  }

  return { QuestionCard: QuestionCard, DragGroups: DragGroups, Runner: Runner, PRAISE: PRAISE };
})();

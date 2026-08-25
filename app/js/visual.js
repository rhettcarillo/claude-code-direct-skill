/* ==========================================================================
   visual.js — every picture the app can draw.
   A "visual spec" is a plain object with a `kind`; Visual.render turns it
   into DOM. Kinds: share, groups, pool, array, numberline, bar, equation,
   factTriangle, placevalue, longdiv, fracbar, compare, table.
   ========================================================================== */
window.Visual = (function () {
  'use strict';

  var el = U.el;
  var BOX_COLORS = ['', 'g-teal', 'g-pink', 'g-orange', 'g-blue'];

  function tok(emoji, i, small) {
    return el('span', {
      class: 'tok' + (small ? ' tok-sm' : ''),
      text: emoji,
      style: { animationDelay: (Math.min(i, 30) * 0.04) + 's' },
      'aria-hidden': 'true'
    });
  }

  function tokens(emoji, count, small) {
    var out = [];
    for (var i = 0; i < count; i++) out.push(tok(emoji, i, small));
    return out;
  }

  /* ---------- share: deal `total` into `groups` equal piles -------------- */
  function share(s) {
    var per = Math.floor(s.total / s.groups);
    var rem = s.total - per * s.groups;
    var boxes = [];
    for (var g = 0; g < s.groups; g++) {
      var items = [];
      for (var i = 0; i < per; i++) {
        items.push(el('span', {
          class: 'tok' + (s.small ? ' tok-sm' : ''), text: s.emoji, 'aria-hidden': 'true',
          style: { animationDelay: ((i * s.groups + g) * 0.06) + 's' }
        }));
      }
      boxes.push(el('div', { class: 'group-box ' + BOX_COLORS[g % BOX_COLORS.length] }, [
        el('div', { class: 'gb-items' }, items),
        s.showCounts !== false ? el('span', { class: 'gb-label', text: per + ' each' }) : null
      ]));
    }
    if (rem > 0) {
      boxes.push(el('div', { class: 'leftover-box' }, [
        el('div', { class: 'gb-items' }, tokens(s.emoji, rem, s.small)),
        el('span', { class: 'lb-label', text: rem + ' left over' })
      ]));
    }
    return el('div', { class: 'group-row' }, boxes);
  }

  /* ---------- groups: make piles of `per`, count the piles --------------- */
  function groups(s) {
    var count = Math.floor(s.total / s.per);
    var rem = s.total - count * s.per;
    var boxes = [];
    for (var g = 0; g < count; g++) {
      boxes.push(el('div', { class: 'group-box ' + BOX_COLORS[g % BOX_COLORS.length] }, [
        el('div', { class: 'gb-items' }, tokens(s.emoji, s.per, s.small)),
        s.showCounts !== false ? el('span', { class: 'gb-label', text: 'group ' + (g + 1) }) : null
      ]));
    }
    if (rem > 0) {
      boxes.push(el('div', { class: 'leftover-box' }, [
        el('div', { class: 'gb-items' }, tokens(s.emoji, rem, s.small)),
        el('span', { class: 'lb-label', text: rem + ' left over' })
      ]));
    }
    return el('div', { class: 'group-row' }, boxes);
  }

  /* ---------- pool: just a heap of objects ------------------------------- */
  function pool(s) {
    return el('div', { class: 'vis-pool' }, tokens(s.emoji, s.total, s.small));
  }

  /* ---------- array: rows x cols ----------------------------------------- */
  function array(s) {
    var rows = [];
    for (var r = 0; r < s.rows; r++) {
      var cells = [];
      for (var c = 0; c < s.cols; c++) cells.push(tok(s.emoji, r * s.cols + c, s.small));
      rows.push(el('div', { class: 'array-row' + (s.highlightRow === r ? ' is-hl' : '') }, cells));
    }
    return el('div', { class: 'array-grid' }, rows);
  }

  /* ---------- number line with equal jumps -------------------------------- */
  function numberline(s) {
    var total = s.total, step = s.step;
    var jumps = Math.floor(total / step);
    var inner = el('div', { class: 'numline-inner' });
    inner.appendChild(el('div', { class: 'numline-axis' }));
    for (var v = 0; v <= total; v += step) {
      var pct = (v / total) * 100;
      inner.appendChild(el('div', { class: 'numline-tick', style: { left: pct + '%' } }));
      inner.appendChild(el('div', { class: 'numline-label', style: { left: pct + '%' }, text: String(v) }));
    }
    for (var j = 0; j < jumps; j++) {
      var left = ((j * step) / total) * 100;
      var w = (step / total) * 100;
      inner.appendChild(el('div', {
        class: 'numline-jump',
        style: { left: left + '%', width: w + '%', animationDelay: (j * 0.14) + 's' }
      }, [el('span', { text: '+' + step })]));
    }
    return el('div', { class: 'numline' }, [inner]);
  }

  /* ---------- bar model ---------------------------------------------------- */
  function bar(s) {
    var parts = [];
    for (var i = 0; i < s.parts; i++) {
      parts.push(el('div', {
        class: 'bp', text: s.partLabel !== undefined ? s.partLabel : U.fmt(s.per),
        style: { animationDelay: (i * 0.08) + 's' }
      }));
    }
    if (s.remainder) parts.push(el('div', { class: 'bp bp-rem', text: s.remainder + ' left' }));
    return el('div', { class: 'barmodel' }, [
      el('div', { class: 'bar-total' }, [el('div', { class: 'bt-fill', text: (s.totalLabel || s.total) })]),
      el('div', { class: 'bar-brace', text: s.brace || ('split into ' + s.parts + ' equal parts') }),
      el('div', { class: 'bar-parts' }, parts)
    ]);
  }

  /* ---------- labelled equation ------------------------------------------- */
  function equation(s) {
    var tags = s.tags || ['the whole', 'groups', 'each group'];
    function part(val, tag) {
      return el('div', { class: 'eq-part' }, [
        el('span', { class: 'eq-tag', text: tag }),
        el('span', { text: String(val) })
      ]);
    }
    return el('div', { class: 'eqlabel' }, [
      el('div', { class: 'eq-row' }, [
        part(s.a, tags[0]),
        el('span', { class: 'eq-op', text: '÷' }),
        part(s.b, tags[1]),
        el('span', { class: 'eq-op', text: '=' }),
        part(s.c, tags[2])
      ])
    ]);
  }

  /* ---------- fact family triangle ---------------------------------------- */
  function factTriangle(s) {
    var svg = '<svg viewBox="0 0 250 216" width="250" height="216">' +
      '<polygon points="125,26 232,196 18,196" fill="#FFFDF3" stroke="#7C5CFF" stroke-width="6" stroke-linejoin="round"/>' +
      '<text x="125" y="120" text-anchor="middle" font-size="26" fill="#8C86A0" font-family="sans-serif">×  ÷</text>' +
      '</svg>';
    return el('div', { class: 'fact-triangle', html: svg + '' +
      '<div class="ft-num ft-top">' + s.product + '</div>' +
      '<div class="ft-num ft-left">' + s.f1 + '</div>' +
      '<div class="ft-num ft-right">' + s.f2 + '</div>' });
  }

  /* ---------- place-value blocks ------------------------------------------- */
  function placevalue(s) {
    var h = Math.floor(s.number / 100);
    var t = Math.floor((s.number % 100) / 10);
    var o = s.number % 10;
    function col(label, count, cls) {
      if (!count) return null;
      var blocks = [];
      for (var i = 0; i < count; i++) blocks.push(el('i', { class: cls }));
      return el('div', { class: 'pv-col' }, [
        el('div', { class: 'pv-blocks' }, blocks),
        el('span', { class: 'pv-label', text: count + ' ' + label })
      ]);
    }
    return el('div', { class: 'pv-set' }, [
      col('hundreds', h, 'pv-h'),
      col('tens', t, 'pv-t'),
      col('ones', o, 'pv-o')
    ]);
  }

  /* ---------- fraction bar --------------------------------------------------- */
  function fracbar(s) {
    var cells = [];
    for (var i = 0; i < s.parts; i++) {
      var cls = 'x';
      if (i < s.shaded) {
        cls = 'on';
        if (s.chunk && Math.floor(i / s.chunk) % 2 === 1) cls = 'on chunk';
      }
      cells.push(el('i', { class: cls, text: s.cellLabel || '' }));
    }
    return el('div', { class: 'fracbar' }, [el('div', { class: 'fracbar-track' }, cells)]);
  }

  /* ---------- equal vs unequal comparison ------------------------------------ */
  function compare(s) {
    var wraps = s.sets.map(function (set, idx) {
      var boxes = set.map(function (count, g) {
        return el('div', { class: 'group-box ' + BOX_COLORS[g % BOX_COLORS.length] }, [
          el('div', { class: 'gb-items' }, tokens(s.emoji, count, true))
        ]);
      });
      return el('div', { class: 'vis', style: { padding: '10px' } }, [
        el('div', { class: 'group-row' }, boxes),
        s.labels ? el('div', { class: 'vis-caption', text: s.labels[idx] }) : null
      ]);
    });
    return el('div', { class: 'group-row' }, wraps);
  }

  /* ---------- small data table ------------------------------------------------ */
  function table(s) {
    var head = el('tr', {}, s.head.map(function (h) { return el('th', { text: h }); }));
    var rows = s.rows.map(function (r, ri) {
      return el('tr', {}, r.map(function (c, ci) {
        var hl = s.hl && s.hl[0] === ri && s.hl[1] === ci;
        return el('td', { class: hl ? 'hl' : '', text: String(c) });
      }));
    });
    return el('table', { class: 'mini-table' }, [el('thead', {}, [head]), el('tbody', {}, rows)]);
  }

  /* ======================================================================
     Long division
     ====================================================================== */

  /* Works on a digit string that may contain a decimal point, e.g. "45.00". */
  function longDivision(dividendStr, divisor) {
    var digits = String(dividendStr).split('');
    var quot = new Array(digits.length).fill('');
    var positions = [];
    var rem = 0, started = false;

    for (var i = 0; i < digits.length; i++) {
      if (digits[i] === '.') { quot[i] = '.'; started = true; continue; }
      var cur = rem * 10 + parseInt(digits[i], 10);
      var qd = Math.floor(cur / divisor);
      if (qd > 0) started = true;
      if (!started) { quot[i] = ''; rem = cur; continue; }
      quot[i] = String(qd);
      var prod = qd * divisor;
      rem = cur - prod;
      /* which column holds the next digit to bring down? */
      var bringCol = null, bringChar = null;
      for (var j = i + 1; j < digits.length; j++) {
        if (digits[j] !== '.') { bringCol = j; bringChar = digits[j]; break; }
      }
      positions.push({
        col: i, cur: cur, qd: qd, prod: prod, rem: rem,
        bringCol: bringCol, bringChar: bringChar,
        next: bringChar !== null ? rem * 10 + parseInt(bringChar, 10) : null
      });
    }

    var quotStr = quot.join('').replace(/^\.+/, '0.');
    return {
      digits: digits,
      quot: quot,
      quotStr: quotStr === '' ? '0' : quotStr,
      remainder: rem,
      divisor: divisor,
      positions: positions
    };
  }

  /* Builds the DMSB micro-steps used by the interactive widget. */
  function longDivSteps(model) {
    var steps = [];
    model.positions.forEach(function (p, pi) {
      steps.push({ type: 'D', pos: pi, tag: 'Divide',
        note: 'How many ' + model.divisor + 's fit in ' + p.cur + '? ' + p.qd + '. Write ' + p.qd + ' on top.' });
      steps.push({ type: 'M', pos: pi, tag: 'Multiply',
        note: p.qd + ' × ' + model.divisor + ' = ' + p.prod + '. Write it underneath.' });
      steps.push({ type: 'S', pos: pi, tag: 'Subtract',
        note: p.cur + ' − ' + p.prod + ' = ' + p.rem + '.' });
      if (p.bringChar !== null) {
        steps.push({ type: 'B', pos: pi, tag: 'Bring down',
          note: 'Bring down the ' + p.bringChar + ' to make ' + p.next + '.' });
      }
    });
    return steps;
  }

  function renderLongDiv(model, reveal) {
    var steps = longDivSteps(model);
    if (reveal === undefined || reveal === null) reveal = steps.length;
    var shown = { D: {}, M: {}, S: {}, B: {} };
    for (var i = 0; i < Math.min(reveal, steps.length); i++) shown[steps[i].type][steps[i].pos] = true;

    var cols = model.digits.length;
    var grid = el('div', {
      class: 'longdiv-grid',
      style: { gridTemplateColumns: 'auto repeat(' + cols + ', 1.15em)' }
    });

    function cell(row, col, text, cls) {
      grid.appendChild(el('div', {
        class: 'ld-cell ' + (cls || ''),
        style: { gridRow: String(row), gridColumn: String(col + 2) },
        text: text === null || text === undefined ? '' : String(text)
      }));
    }

    var row = 1;
    /* quotient */
    model.quot.forEach(function (q, i) {
      if (q === '') return;
      var posIndex = -1;
      model.positions.forEach(function (p, pi) { if (p.col === i) posIndex = pi; });
      var visible = q === '.' ? true : shown.D[posIndex];
      if (!visible) return;
      cell(row, i, q, 'ld-quot');
    });

    /* dividend with the division bracket */
    row = 2;
    grid.appendChild(el('div', {
      class: 'ld-cell ld-divisor',
      style: { gridRow: '2', gridColumn: '1' },
      text: String(model.divisor)
    }));
    model.digits.forEach(function (d, i) {
      /* only the first digit carries the upright of the bracket; the rest just
         continue the bar across the top */
      cell(row, i, d, 'ld-bracket' + (i === 0 ? ' ld-bracket-start' : ''));
    });

    /* work rows */
    row = 3;
    model.positions.forEach(function (p, pi) {
      if (shown.M[pi]) {
        var prodStr = String(p.prod);
        var start = p.col - prodStr.length + 1;
        grid.appendChild(el('div', {
          class: 'ld-cell ld-sub ld-row-new',
          style: { gridRow: String(row), gridColumn: (start + 1) + ' / ' + (p.col + 3), textAlign: 'right' },
          text: '−' + prodStr
        }));
        var line = el('div', {
          class: 'ld-cell ld-underline',
          style: { gridRow: String(row), gridColumn: (Math.max(0, start - 1) + 2) + ' / ' + (p.col + 3) }
        });
        grid.appendChild(line);
        row++;
      }
      if (shown.S[pi]) {
        var remStr = String(p.rem);
        var rstart = p.col - remStr.length + 1;
        grid.appendChild(el('div', {
          class: 'ld-cell ld-row-new' + (pi === model.positions.length - 1 ? ' ld-rem' : ''),
          style: { gridRow: String(row), gridColumn: (rstart + 2) + ' / ' + (p.col + 3), textAlign: 'right' },
          text: remStr
        }));
        if (shown.B[pi] && p.bringCol !== null) {
          grid.appendChild(el('div', {
            class: 'ld-cell ld-bring',
            style: { gridRow: String(row), gridColumn: String(p.bringCol + 2) },
            text: p.bringChar
          }));
        }
        row++;
      }
    });

    return el('div', { class: 'longdiv' }, [grid]);
  }

  /* Interactive stepper used inside lessons and wrong-answer explanations. */
  function longDivWidget(dividendStr, divisor, opts) {
    opts = opts || {};
    var model = longDivision(dividendStr, divisor);
    var steps = longDivSteps(model);
    var reveal = opts.startRevealed ? steps.length : 0;

    var board = el('div', {});
    var note = el('div', { class: 'step-note' }, [
      el('span', { class: 'sn-tag', text: 'Ready' }),
      el('span', { text: 'Tap “Next step” to divide together.' })
    ]);
    var backBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: '◀ Back' });
    var nextBtn = el('button', { class: 'btn btn-teal btn-sm', type: 'button', text: 'Next step ▶' });
    var allBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Show all' });

    function paint() {
      U.clear(board).appendChild(renderLongDiv(model, reveal));
      U.clear(note);
      if (reveal === 0) {
        U.add(note, [el('span', { class: 'sn-tag', text: 'Ready' }), el('span', { text: 'Tap “Next step” to divide together.' })]);
      } else if (reveal >= steps.length) {
        var tail = model.remainder ? (' remainder ' + model.remainder) : '';
        U.add(note, [el('span', { class: 'sn-tag', text: 'Done' }),
          el('span', { text: 'The answer is ' + model.quotStr + tail + '. 🎉' })]);
      } else {
        var s = steps[reveal - 1];
        U.add(note, [el('span', { class: 'sn-tag', text: s.tag }), el('span', { text: s.note })]);
      }
      backBtn.disabled = reveal === 0;
      nextBtn.disabled = reveal >= steps.length;
      allBtn.disabled = reveal >= steps.length;
    }

    nextBtn.addEventListener('click', function () { reveal = Math.min(steps.length, reveal + 1); U.Sound.pop(); paint(); });
    backBtn.addEventListener('click', function () { reveal = Math.max(0, reveal - 1); paint(); });
    allBtn.addEventListener('click', function () { reveal = steps.length; U.Sound.correct(); paint(); });

    paint();

    return el('div', { class: 'vis', style: { justifyItems: 'stretch' } }, [
      board,
      note,
      opts.static ? null : el('div', { class: 'row', style: { justifyContent: 'center' } }, [backBtn, nextBtn, allBtn])
    ]);
  }

  /* ======================================================================
     Dispatch
     ====================================================================== */
  var KINDS = {
    share: share, groups: groups, pool: pool, array: array, numberline: numberline,
    bar: bar, equation: equation, factTriangle: factTriangle, placevalue: placevalue,
    fracbar: fracbar, compare: compare, table: table
  };

  function render(spec) {
    if (!spec) return null;
    if (spec.kind === 'longdiv') {
      return longDivWidget(spec.dividend, spec.divisor, {
        static: spec.static, startRevealed: spec.startRevealed
      });
    }
    var fn = KINDS[spec.kind];
    if (!fn) return null;
    var body = fn(spec);
    return el('div', { class: 'vis' }, [
      body,
      spec.caption ? el('div', { class: 'vis-caption', text: spec.caption }) : null
    ]);
  }

  /* A compact version used inside multiple-choice buttons. */
  function renderMini(spec) {
    if (!spec) return null;
    var small = Object.assign({}, spec, { small: true, showCounts: false, caption: null });
    var fn = KINDS[small.kind];
    if (!fn) return null;
    return el('div', { class: 'choice-visual' }, [fn(small)]);
  }

  return {
    render: render,
    renderMini: renderMini,
    longDivision: longDivision,
    longDivSteps: longDivSteps,
    longDivWidget: longDivWidget,
    renderLongDiv: renderLongDiv
  };
})();

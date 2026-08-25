/* ==========================================================================
   Generator sweep — runs the question engine head-less, with no browser and
   no dependencies, and checks that what it produces is actually correct.

     node test/questions.test.js [reps]

   Exits non-zero if anything fails.
   ========================================================================== */
'use strict';

var fs = require('fs');
var path = require('path');
var APP = path.join(__dirname, '..');
var REPS = parseInt(process.argv[2], 10) || 800;

/* the app targets a browser, so give it just enough of one to load */
global.window = {};
global.document = {
  createElement: function () {
    return { style: {}, dataset: {}, setAttribute: function () {}, appendChild: function () {},
             addEventListener: function () {}, classList: { add: function () {} } };
  },
  createTextNode: function () { return {}; },
  getElementById: function () { return null; }
};

/* Each file assigns itself to `window`; in a browser that also makes it a
   global, so mirror that here before loading the next one. */
function load(f) {
  eval(fs.readFileSync(path.join(APP, 'js', f), 'utf8'));
  Object.keys(window).forEach(function (k) { global[k] = window[k]; });
}
load('util.js');
load('questions.js');
load('visual.js');
load('curriculum.js');

var Q = window.Questions;
var C = window.Curriculum;
var failures = [];
var checked = 0;

function fail(msg) { failures.push(msg); }

/* The answer a perfect student would give, in the shape the checker expects. */
function perfectAnswer(q) {
  if (q.mode === 'mc') return q.answerIndex;
  if (q.mode === 'quotrem') return { q: String(q.answer.q), r: String(q.answer.r) };
  if (q.mode === 'drag') return { ok: true };
  return String(q.answer);
}

function checkQuestion(q, where) {
  checked++;
  var text = [q.prompt, q.story || '', (q.equation && q.equation.text) || '', q.hint,
              (q.teach.lines || []).join(' ')].join(' ');

  if (!q.prompt) fail(where + ': no prompt');
  if (!q.hint) fail(where + ': no hint');
  if (!q.teach.lines.length) fail(where + ': no teaching lines for a wrong answer');
  if (/undefined|NaN|Infinity/.test(text)) fail(where + ': broken text -> ' + text.slice(0, 120));

  if (!Q.check(q, perfectAnswer(q))) fail(where + ': the stated answer does not pass its own checker');

  if (q.mode === 'mc') {
    if (!q.choices || q.choices.length < 3) fail(where + ': fewer than 3 choices');
    if (new Set(q.choices).size !== q.choices.length) fail(where + ': duplicate choices ' + JSON.stringify(q.choices));
    if (!(q.answerIndex >= 0)) fail(where + ': no correct choice');
  }
  if (q.mode === 'input' && typeof q.answer === 'number') {
    if (!isFinite(q.answer) || q.answer <= 0) fail(where + ': answer is ' + q.answer);
  }
  if (q.mode === 'quotrem') {
    if (!(q.answer.q >= 1) || !(q.answer.r >= 1)) fail(where + ': bad quotient/remainder ' + JSON.stringify(q.answer));
  }
  if (q.mode === 'drag') {
    if (q.answer.groups * q.answer.per !== q.answer.total) fail(where + ': drag groups do not multiply back to the total');
  }

  /* Where the question states its own equation, verify the arithmetic. */
  var eq = (q.equation && q.equation.text) || '';
  var m;
  if (typeof q.answer === 'number') {
    if ((m = eq.match(/^([\d.]+) ÷ ([\d.]+) = \?$/))) {
      if (Math.abs(parseFloat(m[1]) / parseFloat(m[2]) - q.answer) > 1e-6)
        fail(where + ' MATH: ' + eq + ' answered ' + q.answer);
    } else if ((m = eq.match(/^\? ÷ ([\d.]+) = ([\d.]+)$/))) {
      if (Math.abs(parseFloat(m[1]) * parseFloat(m[2]) - q.answer) > 1e-6)
        fail(where + ' MATH: ' + eq + ' answered ' + q.answer);
    } else if ((m = eq.match(/^([\d.]+) ÷ \? = ([\d.]+)$/))) {
      if (Math.abs(parseFloat(m[1]) / parseFloat(m[2]) - q.answer) > 1e-6)
        fail(where + ' MATH: ' + eq + ' answered ' + q.answer);
    }
  }
}

/* ---- 1. every grade x difficulty pool ---------------------------------- */
var kinds = {};
for (var g = 1; g <= 6; g++) {
  ['easy', 'medium', 'challenge'].forEach(function (d) {
    for (var i = 0; i < REPS; i++) {
      var q;
      try { q = Q.make(g, d); }
      catch (e) { fail('g' + g + '/' + d + ' threw: ' + e.message); continue; }
      kinds['g' + g + '.' + d] = (kinds['g' + g + '.' + d] || new Set()).add(q.kindLabel);
      checkQuestion(q, 'g' + g + '/' + d + '/' + q.kindLabel);
    }
  });
}

/* every pool must offer real variety, or a round gets monotonous */
Object.keys(kinds).forEach(function (k) {
  if (kinds[k].size < 3) fail(k + ' only ever produces ' + kinds[k].size + ' kind(s) of question');
});

/* ---- 2. rounds must not repeat a question ------------------------------ */
var dupRounds = 0, totalRounds = 0;
for (var g2 = 1; g2 <= 6; g2++) {
  ['easy', 'medium', 'challenge'].forEach(function (d) {
    for (var r = 0; r < Math.max(50, REPS / 4); r++) {
      var round = Q.makeRound(g2, d, 10);
      totalRounds++;
      if (round.length !== 10) fail('g' + g2 + '/' + d + ': round came back with ' + round.length + ' questions');
      if (new Set(round.map(Q.signature)).size !== round.length) dupRounds++;
    }
  });
}
if (dupRounds) fail(dupRounds + ' of ' + totalRounds + ' rounds repeated a question');

/* ---- 3. every lesson's Try It ------------------------------------------ */
for (var g3 = 1; g3 <= 6; g3++) {
  C.lessonsFor(g3).forEach(function (L) {
    if (!L.explain || !L.explain.length) fail(L.id + ': no explanation');
    if (!L.visual) fail(L.id + ': no visual example');
    if (!L.worked || !L.worked.steps.length) fail(L.id + ': no worked example');
    for (var k = 0; k < 40; k++) {
      var tq;
      try { tq = L.tryIt(); }
      catch (e) { fail(L.id + ' tryIt threw: ' + e.message); break; }
      checkQuestion(tq, L.id + '/tryIt');
    }
  });
}
if (C.totalLessons() !== 18) fail('expected 18 lessons, found ' + C.totalLessons());

/* ---- 4. answer parsing ------------------------------------------------- */
[['12', 12], ['1.5', 1.5], ['3/4', 0.75], ['1 1/2', 1.5], ['1,200', 1200], ['$3.25', 3.25], ['  8 ', 8]]
  .forEach(function (pair) {
    if (Math.abs(U.parseNumeric(pair[0]) - pair[1]) > 1e-9)
      fail('parseNumeric("' + pair[0] + '") = ' + U.parseNumeric(pair[0]) + ', expected ' + pair[1]);
  });
['', 'abc', '?', '--'].forEach(function (bad) {
  if (!isNaN(U.parseNumeric(bad))) fail('parseNumeric("' + bad + '") should be NaN');
});

/* ---- 5. long division -------------------------------------------------- */
[['96', 4, '24', 0], ['845', 7, '120', 5], ['45.00', 4, '11.25', 0], ['736', 23, '32', 0], ['1000', 8, '125', 0]]
  .forEach(function (c) {
    var m = Visual.longDivision(c[0], c[1]);
    if (m.quotStr !== c[2] || m.remainder !== c[3])
      fail('longDivision(' + c[0] + ' ÷ ' + c[1] + ') = ' + m.quotStr + ' r ' + m.remainder + ', expected ' + c[2] + ' r ' + c[3]);
    if (!Visual.longDivSteps(m).length) fail('longDivision(' + c[0] + '): no teaching steps');
  });

/* ---- report ------------------------------------------------------------ */
console.log('checked ' + checked + ' questions and ' + totalRounds + ' rounds');
if (failures.length) {
  var unique = Array.from(new Set(failures));
  console.error('\nFAILED (' + unique.length + ' distinct):');
  unique.slice(0, 25).forEach(function (f) { console.error('  - ' + f); });
  if (unique.length > 25) console.error('  ... and ' + (unique.length - 25) + ' more');
  process.exit(1);
}
console.log('all good ✓');

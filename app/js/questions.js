/* ==========================================================================
   questions.js — the question factory.
   Questions.make(grade, difficulty) returns a fresh random question.
   Each grade has its own pool of generators, so a Grade 1 question and a
   Grade 6 question are different *kinds of thinking*, not the same shape
   with bigger numbers.

   Question shape:
     { type, mode, prompt, story, visual, choices, answerIndex, answer,
       answerText, unit, hint, teach:{lines, visual}, tags, drag }
     mode: 'mc' | 'input' | 'quotrem' | 'drag'
   ========================================================================== */
window.Questions = (function () {
  'use strict';

  var ri = U.randInt, pick = U.pick, shuffle = U.shuffle;

  var NAMES = ['Maya', 'Leo', 'Aria', 'Kai', 'Zoe', 'Milo', 'Nina', 'Theo', 'Ivy', 'Omar',
    'Luna', 'Finn', 'Ruby', 'Ezra', 'Mia', 'Jax', 'Sana', 'Noah', 'Pia', 'Dev', 'Rosa', 'Hugo', 'Nora', 'Amir'];

  var THEMES = [
    { e: '🍎', one: 'apple', many: 'apples', box: 'basket', boxes: 'baskets' },
    { e: '🍪', one: 'cookie', many: 'cookies', box: 'plate', boxes: 'plates' },
    { e: '⭐', one: 'star', many: 'stars', box: 'box', boxes: 'boxes' },
    { e: '🧸', one: 'teddy', many: 'teddies', box: 'shelf', boxes: 'shelves' },
    { e: '🍬', one: 'candy', many: 'candies', box: 'bag', boxes: 'bags' },
    { e: '🎈', one: 'balloon', many: 'balloons', box: 'bunch', boxes: 'bunches' },
    { e: '🌸', one: 'flower', many: 'flowers', box: 'vase', boxes: 'vases' },
    { e: '🍓', one: 'strawberry', many: 'strawberries', box: 'bowl', boxes: 'bowls' },
    { e: '🖍️', one: 'crayon', many: 'crayons', box: 'pack', boxes: 'packs' },
    { e: '⚽', one: 'ball', many: 'balls', box: 'net', boxes: 'nets' },
    { e: '🐚', one: 'shell', many: 'shells', box: 'bucket', boxes: 'buckets' },
    { e: '🎁', one: 'gift', many: 'gifts', box: 'sack', boxes: 'sacks' }
  ];

  var GROUPEES = [
    { one: 'friend', many: 'friends' },
    { one: 'classmate', many: 'classmates' },
    { one: 'sister', many: 'sisters' },
    { one: 'teammate', many: 'teammates' },
    { one: 'puppy', many: 'puppies' },
    { one: 'robot', many: 'robots' }
  ];

  /* ---------- helpers ----------------------------------------------------- */

  function theme() { return pick(THEMES); }
  function name() { return pick(NAMES); }
  function who() { return pick(GROUPEES); }

  function uniquePush(arr, v) { if (arr.indexOf(v) === -1) arr.push(v); }

  /* Plausible near-miss answers so multiple choice actually tests thinking. */
  function numDistractors(ans, opts) {
    opts = opts || {};
    var out = [];
    var isInt = Math.abs(ans - Math.round(ans)) < 1e-9;
    var cands = isInt
      ? [ans + 1, ans - 1, ans + 2, ans - 2, ans * 2, Math.round(ans / 2), ans + 10, ans - 10, ans + 3]
      : [ans * 10, ans / 10, +(ans + 1).toFixed(2), +(ans - 1).toFixed(2), +(ans + 0.1).toFixed(2), +(ans - 0.1).toFixed(2), +(ans * 2).toFixed(2)];
    (opts.extra || []).forEach(function (v) { cands.unshift(v); });
    shuffle(cands).forEach(function (c) {
      if (out.length >= 3) return;
      if (c === ans || !isFinite(c)) return;
      if (c <= 0 && !opts.allowZero) return;
      if (isInt && Math.abs(c - Math.round(c)) > 1e-9) return;
      uniquePush(out, c);
    });
    var bump = 3;
    while (out.length < 3) {
      var v = isInt ? ans + bump : +(ans + bump / 10).toFixed(2);
      if (v !== ans && v > 0) uniquePush(out, v);
      bump++;
    }
    return out.slice(0, 3);
  }

  function mcNumbers(ans, opts) {
    var labels = [String(U.fmt(ans))].concat(numDistractors(ans, opts).map(function (v) { return String(U.fmt(v)); }));
    var order = shuffle(labels);
    return { choices: order, answerIndex: order.indexOf(String(U.fmt(ans))) };
  }

  function mcLabels(correct, wrongs, pad) {
    var out = [];
    (wrongs || []).forEach(function (w) {
      if (w !== correct && out.indexOf(w) === -1) out.push(w);
    });
    var i = 1;
    while (out.length < 3 && i < 60) {
      var cand = pad ? String(pad(i)) : 'option ' + i;
      if (cand !== correct && out.indexOf(cand) === -1) out.push(cand);
      i++;
    }
    var order = shuffle([correct].concat(out.slice(0, 3)));
    return { choices: order, answerIndex: order.indexOf(correct) };
  }

  function Q(o) {
    o.mode = o.mode || 'input';
    o.tags = o.tags || [];
    o.teach = o.teach || {};
    o.teach.lines = o.teach.lines || [];
    if (o.mode === 'input' && o.answerText === undefined) o.answerText = String(U.fmt(o.answer));
    return o;
  }

  function fracStr(n, d) { var s = U.simplify(n, d); return s[1] === 1 ? String(s[0]) : s[0] + '/' + s[1]; }

  /* ======================================================================
     GRADE 1 — sharing and grouping with real objects
     ====================================================================== */
  var G1CFG = {
    easy:      { groups: [2, 2], per: [1, 5] },
    medium:    { groups: [2, 3], per: [2, 5] },
    challenge: { groups: [2, 5], per: [2, 5] }
  };

  function g1Share(d) {
    var c = G1CFG[d], t = theme(), w = who(), nm = name();
    var groups = ri(c.groups[0], c.groups[1]);
    var per = ri(c.per[0], c.per[1]);
    var total = groups * per;
    var mcSet = mcNumbers(per);
    return Q({
      type: 'picture', mode: d === 'challenge' ? 'input' : 'mc',
      kindLabel: 'Sharing',
      story: nm + ' has ' + total + ' ' + t.many + ' ' + t.e + ' to share with ' + groups + ' ' + w.many + '.',
      prompt: 'How many ' + t.many + ' does each ' + w.one + ' get?',
      visual: { kind: 'pool', emoji: t.e, total: total, caption: total + ' ' + t.many + ' to share' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: per,
      hint: 'Give one ' + t.one + ' to each ' + w.one + ', then go around again — keep going until they are all gone.',
      tags: ['picture', 'share'],
      teach: {
        lines: [
          'Let\'s split ' + total + ' into ' + groups + ' equal groups together.',
          'Deal them out one at a time, like cards: one for each ' + w.one + ', then around again.',
          'Every ' + w.one + ' ends up with ' + per + '. So ' + total + ' ÷ ' + groups + ' = ' + per + '.'
        ],
        visual: { kind: 'share', emoji: t.e, total: total, groups: groups, caption: total + ' ÷ ' + groups + ' = ' + per }
      }
    });
  }

  function g1Group(d) {
    var c = G1CFG[d], t = theme(), nm = name();
    var per = ri(2, d === 'easy' ? 3 : 5);
    var count = ri(2, d === 'challenge' ? 5 : 4);
    var total = per * count;
    var mcSet = mcNumbers(count);
    return Q({
      type: 'picture', mode: d === 'challenge' ? 'input' : 'mc',
      kindLabel: 'Grouping',
      story: nm + ' puts ' + total + ' ' + t.many + ' ' + t.e + ' into ' + t.boxes + '. Each ' + t.box + ' holds ' + per + '.',
      prompt: 'How many ' + t.boxes + ' does ' + nm + ' need?',
      visual: { kind: 'pool', emoji: t.e, total: total, caption: total + ' ' + t.many + ' altogether' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: count,
      hint: 'Circle ' + per + ' at a time. Count how many circles you made.',
      tags: ['picture', 'group'],
      teach: {
        lines: [
          'This time we know how many go in each ' + t.box + ' — we are counting the ' + t.boxes + '.',
          'Take ' + per + ', then ' + per + ' more, and keep going until you run out.',
          'That makes ' + count + ' ' + t.boxes + '. So ' + total + ' ÷ ' + per + ' = ' + count + '.'
        ],
        visual: { kind: 'groups', emoji: t.e, total: total, per: per, caption: total + ' ÷ ' + per + ' = ' + count }
      }
    });
  }

  function g1Drag(d) {
    var c = G1CFG[d], t = theme(), w = who();
    var groups = ri(2, d === 'easy' ? 2 : d === 'medium' ? 3 : 4);
    var per = ri(2, d === 'challenge' ? 4 : 3);
    var total = groups * per;
    return Q({
      type: 'drag', mode: 'drag',
      kindLabel: 'Drag & share',
      prompt: 'Share the ' + total + ' ' + t.many + ' fairly between the ' + groups + ' ' + w.many + '.',
      drag: { total: total, groups: groups, per: per, emoji: t.e, boxLabel: t.box },
      answer: { groups: groups, per: per, total: total },
      hint: 'Fair means every basket has the SAME number. Try one at a time, going round and round.',
      tags: ['drag', 'share'],
      teach: {
        lines: [
          'Fair sharing means every group gets the same amount.',
          'Deal one at a time into each basket, then start again from the first basket.',
          total + ' shared into ' + groups + ' groups gives ' + per + ' in each. ' + total + ' ÷ ' + groups + ' = ' + per + '.'
        ],
        visual: { kind: 'share', emoji: t.e, total: total, groups: groups }
      }
    });
  }

  function g1Equal(d) {
    var t = theme();
    var per = ri(2, 4), groups = ri(2, 3);
    var equalSet = [];
    for (var i = 0; i < groups; i++) equalSet.push(per);
    var bad1 = equalSet.slice(); bad1[0] = per + 1;
    var bad2 = equalSet.slice(); bad2[groups - 1] = Math.max(1, per - 1);
    var opts = shuffle([
      { label: 'Picture A', set: equalSet, ok: true },
      { label: 'Picture B', set: bad1, ok: false },
      { label: 'Picture C', set: bad2, ok: false }
    ]);
    var labels = opts.map(function (o, i) { return String.fromCharCode(65 + i); });
    var answerIndex = 0;
    opts.forEach(function (o, i) { if (o.ok) answerIndex = i; });
    return Q({
      type: 'picture', mode: 'mc',
      kindLabel: 'Equal groups',
      prompt: 'Which picture shows EQUAL groups?',
      choices: labels,
      choiceVisuals: opts.map(function (o) { return { kind: 'compare', emoji: t.e, sets: [o.set] }; }),
      answerIndex: answerIndex,
      answer: labels[answerIndex],
      hint: 'Count each group. Equal groups all have the same number — no group is bigger.',
      tags: ['picture'],
      teach: {
        lines: [
          'Division only works when the groups are EQUAL.',
          'Count the objects in each group. If one group has more, the sharing was not fair.',
          'The fair picture has ' + per + ' in every group.'
        ],
        visual: { kind: 'compare', emoji: t.e, sets: [equalSet, bad1], labels: ['Equal — fair! ✅', 'Not equal ❌'] }
      }
    });
  }

  function g1Missing(d) {
    var t = theme();
    var groups = ri(2, 4), per = ri(2, 5), total = groups * per;
    var mcSet = mcNumbers(total);
    return Q({
      type: 'missing', mode: 'mc',
      kindLabel: 'Missing number',
      prompt: 'Which number is hiding?',
      equation: { text: '? ÷ ' + groups + ' = ' + per },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: total,
      visual: { kind: 'share', emoji: t.e, total: total, groups: groups, showCounts: false, caption: groups + ' groups of ' + per },
      hint: 'Count all the objects in the picture — that is the number we started with.',
      tags: ['missing'],
      teach: {
        lines: [
          'There are ' + groups + ' groups and each one has ' + per + '.',
          'Put them back together: ' + groups + ' groups of ' + per + ' is ' + total + '.',
          'So the hidden number is ' + total + '. ' + total + ' ÷ ' + groups + ' = ' + per + '.'
        ],
        visual: { kind: 'share', emoji: t.e, total: total, groups: groups }
      }
    });
  }

  /* ======================================================================
     GRADE 2 — pictures become number sentences
     ====================================================================== */
  var G2CFG = {
    easy:      { divisors: [2, 5, 10], quot: [1, 5] },
    medium:    { divisors: [2, 3, 4, 5], quot: [2, 6] },
    challenge: { divisors: [2, 3, 4, 5, 6, 10], quot: [2, 10] }
  };

  function g2Array(d) {
    var c = G2CFG[d], t = theme(), nm = name();
    var rows = pick(c.divisors.filter(function (x) { return x <= 6; }).concat([3]));
    var cols = ri(c.quot[0] + 1, Math.min(c.quot[1], 8));
    var total = rows * cols;
    var mcSet = mcNumbers(cols);
    return Q({
      type: 'picture', mode: d === 'easy' ? 'mc' : 'input',
      kindLabel: 'Rows & columns',
      story: nm + ' sticks ' + total + ' ' + t.many + ' ' + t.e + ' on a page in ' + rows + ' equal rows.',
      prompt: 'How many ' + t.many + ' are in each row?',
      visual: { kind: 'array', emoji: t.e, rows: rows, cols: cols, highlightRow: 0, caption: rows + ' rows' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: cols,
      hint: 'Just count along ONE row — every row is the same.',
      tags: ['picture', 'array'],
      teach: {
        lines: [
          'An array is objects in neat rows. Every row holds the same number.',
          'Count one row: ' + cols + '.',
          total + ' ÷ ' + rows + ' = ' + cols + '.'
        ],
        visual: { kind: 'array', emoji: t.e, rows: rows, cols: cols, highlightRow: 0, caption: total + ' ÷ ' + rows + ' = ' + cols }
      }
    });
  }

  function g2Sentence(d) {
    var t = theme();
    var per = ri(2, 5), count = ri(2, 5), total = per * count;
    var correct = total + ' ÷ ' + count + ' = ' + per;
    var wrongs = [
      total + ' ÷ ' + per + ' = ' + count + ' + 1',
      (total + count) + ' ÷ ' + count + ' = ' + per,
      total + ' ÷ ' + (count + 1) + ' = ' + per
    ];
    var mcSet = mcLabels(correct, U.pickN(wrongs, 3), function (i) {
      return (total + i) + ' \u00f7 ' + count + ' = ' + (per + i);
    });
    return Q({
      type: 'facts', mode: 'mc',
      kindLabel: 'Match the sentence',
      prompt: 'Which number sentence matches the picture?',
      visual: { kind: 'share', emoji: t.e, total: total, groups: count, showCounts: false, caption: count + ' equal groups' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: correct,
      hint: 'Start with how many there are ALTOGETHER, then how many groups, then how many in each.',
      tags: ['facts'],
      teach: {
        lines: [
          'Read the picture in order: total, then groups, then how many in each.',
          'Altogether there are ' + total + '. There are ' + count + ' groups. Each group has ' + per + '.',
          'So the sentence is ' + total + ' ÷ ' + count + ' = ' + per + '.'
        ],
        visual: { kind: 'equation', a: total, b: count, c: per }
      }
    });
  }

  function g2Skip(d) {
    var c = G2CFG[d];
    var step = pick(c.divisors);
    var jumps = ri(2, Math.min(c.quot[1], 6));
    var total = step * jumps;
    var mcSet = mcNumbers(jumps);
    return Q({
      type: 'picture', mode: d === 'easy' ? 'mc' : 'input',
      kindLabel: 'Skip counting',
      prompt: 'How many jumps of ' + step + ' does it take to reach ' + total + '?',
      visual: { kind: 'numberline', total: total, step: step, caption: 'Jump by ' + step + 's' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: jumps,
      hint: 'Count out loud as you hop: ' + step + ', ' + (step * 2) + ', ' + (step * 3) + ' …',
      tags: ['picture', 'skip'],
      teach: {
        lines: [
          'Skip counting and dividing are the same idea.',
          'Hop along by ' + step + ': ' + Array.apply(null, Array(jumps)).map(function (_, i) { return step * (i + 1); }).join(', ') + '.',
          'That was ' + jumps + ' hops, so ' + total + ' ÷ ' + step + ' = ' + jumps + '.'
        ],
        visual: { kind: 'numberline', total: total, step: step, caption: total + ' ÷ ' + step + ' = ' + jumps }
      }
    });
  }

  function g2Missing(d) {
    var c = G2CFG[d];
    var b = pick(c.divisors), q = ri(c.quot[0] + 1, c.quot[1]), a = b * q;
    var blank = pick(['b', 'c']);
    var text = blank === 'b' ? (a + ' ÷ ? = ' + q) : (a + ' ÷ ' + b + ' = ?');
    var ans = blank === 'b' ? b : q;
    var mcSet = mcNumbers(ans);
    return Q({
      type: 'missing', mode: d === 'challenge' ? 'input' : 'mc',
      kindLabel: 'Missing number',
      prompt: 'Find the missing number.',
      equation: { text: text },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: ans,
      hint: 'Think of the times table: ? × ' + (blank === 'b' ? q : b) + ' = ' + a + '.',
      tags: ['missing'],
      teach: {
        lines: [
          'Division and multiplication are partners.',
          b + ' × ' + q + ' = ' + a + ', so ' + a + ' ÷ ' + b + ' = ' + q + ' and ' + a + ' ÷ ' + q + ' = ' + b + '.',
          'The missing number is ' + ans + '.'
        ],
        visual: { kind: 'factTriangle', product: a, f1: b, f2: q }
      }
    });
  }

  function g2Word(d) {
    var c = G2CFG[d], t = theme(), nm = name(), w = who();
    var groups = pick(c.divisors), per = ri(c.quot[0] + 1, c.quot[1]), total = groups * per;
    var mcSet = mcNumbers(per);
    return Q({
      type: 'word', mode: d === 'easy' ? 'mc' : 'input',
      kindLabel: 'Word problem',
      story: nm + ' baked ' + total + ' ' + t.many + ' ' + t.e + ' and packed them equally into ' + groups + ' ' + t.boxes + '.',
      prompt: 'How many ' + t.many + ' went into each ' + t.box + '?',
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: per,
      hint: 'The big number gets shared. ' + total + ' shared into ' + groups + ' ' + t.boxes + '.',
      tags: ['word'],
      teach: {
        lines: [
          'Find the total first: ' + total + '.',
          'Find how many groups: ' + groups + '.',
          total + ' ÷ ' + groups + ' = ' + per + ', so each ' + t.box + ' holds ' + per + '.'
        ],
        visual: { kind: 'bar', total: total, parts: groups, per: per, totalLabel: total + ' ' + t.many }
      }
    });
  }

  function g2Drag(d) {
    var t = theme();
    var groups = ri(2, d === 'challenge' ? 5 : 4);
    var per = ri(2, d === 'easy' ? 3 : 5);
    var total = groups * per;
    return Q({
      type: 'drag', mode: 'drag',
      kindLabel: 'Drag & group',
      prompt: 'Put the ' + total + ' ' + t.many + ' into ' + groups + ' equal ' + t.boxes + ', then check.',
      drag: { total: total, groups: groups, per: per, emoji: t.e, boxLabel: t.box },
      answer: { groups: groups, per: per, total: total },
      hint: 'Try ' + total + ' ÷ ' + groups + ' in your head first, then move that many into each ' + t.box + '.',
      tags: ['drag'],
      teach: {
        lines: [
          total + ' ÷ ' + groups + ' means "how many in each group".',
          'Deal them out evenly: ' + per + ' in each ' + t.box + '.',
          total + ' ÷ ' + groups + ' = ' + per + '.'
        ],
        visual: { kind: 'share', emoji: t.e, total: total, groups: groups }
      }
    });
  }

  /* ======================================================================
     GRADE 3 — facts, remainders, two kinds of word problem
     ====================================================================== */
  var G3CFG = {
    easy:      { divisors: [2, 3, 4, 5, 10], quot: [2, 5] },
    medium:    { divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10], quot: [2, 10] },
    challenge: { divisors: [3, 4, 6, 7, 8, 9, 12], quot: [3, 12] }
  };

  function g3Fact(d) {
    var c = G3CFG[d];
    var b = pick(c.divisors), q = ri(c.quot[0], c.quot[1]), a = b * q;
    var mcSet = mcNumbers(q, { extra: [a - b, b + q] });
    return Q({
      type: 'facts', mode: d === 'easy' ? 'mc' : 'input',
      kindLabel: 'Division fact',
      prompt: 'What is ' + a + ' ÷ ' + b + '?',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: q,
      hint: 'Ask yourself: ' + b + ' × what = ' + a + '?',
      tags: ['facts'],
      teach: {
        lines: [
          'Use the multiplication fact you already know.',
          b + ' × ' + q + ' = ' + a + '.',
          'So ' + a + ' ÷ ' + b + ' = ' + q + '.'
        ],
        visual: { kind: 'factTriangle', product: a, f1: b, f2: q }
      }
    });
  }

  function g3Family(d) {
    var c = G3CFG[d];
    var f1 = pick(c.divisors), f2 = ri(c.quot[0], c.quot[1]), p = f1 * f2;
    var missing = pick(['product', 'f2']);
    var ans = missing === 'product' ? p : f2;
    var text = missing === 'product'
      ? ('? ÷ ' + f1 + ' = ' + f2)
      : (p + ' ÷ ' + f1 + ' = ?');
    var mcSet = mcNumbers(ans);
    return Q({
      type: 'missing', mode: 'input',
      kindLabel: 'Fact family',
      prompt: 'Complete the fact family.',
      equation: { text: text },
      visual: { kind: 'factTriangle', product: missing === 'product' ? '?' : p, f1: f1, f2: missing === 'f2' ? '?' : f2, caption: 'The triangle links × and ÷' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: ans,
      hint: 'The two small numbers multiply to make the top number.',
      tags: ['missing', 'facts'],
      teach: {
        lines: [
          'A fact family has three numbers: ' + f1 + ', ' + f2 + ' and ' + p + '.',
          f1 + ' × ' + f2 + ' = ' + p + ' and ' + p + ' ÷ ' + f1 + ' = ' + f2 + '.',
          'The missing number is ' + ans + '.'
        ],
        visual: { kind: 'factTriangle', product: p, f1: f1, f2: f2 }
      }
    });
  }

  function g3Remainder(d) {
    var c = G3CFG[d], t = theme(), nm = name();
    var b = pick(c.divisors.filter(function (x) { return x >= 3; }));
    var q = ri(2, d === 'challenge' ? 9 : 6);
    var r = ri(1, b - 1);
    var a = b * q + r;
    return Q({
      type: 'remainder', mode: 'quotrem',
      kindLabel: 'Remainder',
      story: nm + ' shares ' + a + ' ' + t.many + ' ' + t.e + ' equally between ' + b + ' friends.',
      prompt: 'How many does each friend get, and how many are left over?',
      visual: { kind: 'pool', emoji: t.e, total: a, small: a > 18, caption: a + ' ' + t.many },
      answer: { q: q, r: r },
      answerText: q + ' each, remainder ' + r,
      hint: 'Find the biggest multiple of ' + b + ' that fits inside ' + a + '. Whatever is left is the remainder.',
      tags: ['remainder'],
      teach: {
        lines: [
          'Share them out until you cannot make another full round.',
          b + ' × ' + q + ' = ' + (b * q) + ', and ' + a + ' − ' + (b * q) + ' = ' + r + '.',
          'So ' + a + ' ÷ ' + b + ' = ' + q + ' remainder ' + r + '. The ' + r + ' left over cannot be shared fairly.'
        ],
        visual: { kind: 'share', emoji: t.e, total: a, groups: b, small: true, caption: a + ' ÷ ' + b + ' = ' + q + ' r ' + r }
      }
    });
  }

  function g3WordShare(d) {
    var c = G3CFG[d], t = theme(), nm = name(), w = who();
    var groups = pick(c.divisors), per = ri(c.quot[0], c.quot[1]), total = groups * per;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Sharing story',
      story: nm + ' has ' + total + ' ' + t.many + ' ' + t.e + ' and ' + groups + ' ' + w.many + '. Everyone gets the same amount.',
      prompt: 'How many ' + t.many + ' does each ' + w.one + ' receive?',
      answer: per,
      hint: 'You know the total and the number of groups — you are looking for the size of each group.',
      tags: ['word', 'share'],
      teach: {
        lines: [
          'This is a SHARING problem: we know how many groups, we want the size of each group.',
          total + ' ÷ ' + groups + ' = ' + per + '.',
          'Each ' + w.one + ' gets ' + per + ' ' + t.many + '.'
        ],
        visual: { kind: 'bar', total: total, parts: groups, per: per, totalLabel: total + ' ' + t.many, brace: groups + ' equal shares' }
      }
    });
  }

  function g3WordGroup(d) {
    var c = G3CFG[d], t = theme(), nm = name();
    var per = pick(c.divisors), count = ri(c.quot[0], c.quot[1]), total = per * count;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Grouping story',
      story: nm + ' has ' + total + ' ' + t.many + ' ' + t.e + '. Each ' + t.box + ' holds exactly ' + per + '.',
      prompt: 'How many ' + t.boxes + ' can ' + nm + ' fill?',
      answer: count,
      hint: 'This time you know the size of each group. You are counting how MANY groups.',
      tags: ['word', 'group'],
      teach: {
        lines: [
          'This is a GROUPING problem: we know the size of each group, we want the number of groups.',
          total + ' ÷ ' + per + ' = ' + count + '.',
          nm + ' can fill ' + count + ' ' + t.boxes + '.'
        ],
        visual: { kind: 'bar', total: total, parts: count, per: per, totalLabel: total + ' ' + t.many, brace: 'groups of ' + per }
      }
    });
  }

  function g3PictureRem(d) {
    var t = theme();
    var per = ri(3, 5), count = ri(2, 4), r = ri(1, per - 1);
    var total = per * count + r;
    var mcSet = mcNumbers(r, { allowZero: true, extra: [count, per] });
    return Q({
      type: 'remainder', mode: 'mc',
      kindLabel: 'Leftovers',
      prompt: total + ' ' + t.many + ' go into ' + t.boxes + ' of ' + per + '. How many are LEFT OVER?',
      visual: { kind: 'groups', emoji: t.e, total: total, per: per, caption: 'Groups of ' + per },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: r,
      hint: 'Look at the dotted box on the end — those are the ones that could not make a full group.',
      tags: ['remainder', 'picture'],
      teach: {
        lines: [
          'We can make ' + count + ' full groups of ' + per + ' — that uses ' + (per * count) + '.',
          total + ' − ' + (per * count) + ' = ' + r + '.',
          'So ' + total + ' ÷ ' + per + ' = ' + count + ' remainder ' + r + '.'
        ],
        visual: { kind: 'groups', emoji: t.e, total: total, per: per, caption: count + ' full groups, ' + r + ' left over' }
      }
    });
  }

  /* ======================================================================
     GRADE 4 — place value, long division, interpreting remainders
     ====================================================================== */
  function g4PlaceValue(d) {
    var b = pick([2, 3, 4, 5, 6, 7, 8, 9]);
    var base = ri(2, 9);
    var zeros = d === 'easy' ? 1 : pick([1, 2]);
    var a = b * base * Math.pow(10, zeros);
    var ans = base * Math.pow(10, zeros);
    var mcSet = mcNumbers(ans, { extra: [base, ans * 10, ans / 10] });
    return Q({
      type: 'facts', mode: d === 'easy' ? 'mc' : 'input',
      kindLabel: 'Place value',
      prompt: 'What is ' + a + ' ÷ ' + b + '?',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      visual: { kind: 'placevalue', number: a, caption: a + ' in place-value blocks' },
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: ans,
      hint: 'Cover the zeros. Solve ' + (b * base) + ' ÷ ' + b + ' first, then put the zeros back.',
      tags: ['facts', 'placevalue'],
      teach: {
        lines: [
          'Use a fact you already know: ' + (b * base) + ' ÷ ' + b + ' = ' + base + '.',
          a + ' is ' + (b * base) + ' with ' + zeros + ' extra zero' + (zeros > 1 ? 's' : '') + ', so the answer also gets ' + zeros + ' zero' + (zeros > 1 ? 's' : '') + '.',
          a + ' ÷ ' + b + ' = ' + ans + '.'
        ],
        visual: { kind: 'placevalue', number: a }
      }
    });
  }

  function g4Long(d) {
    var b = ri(3, 9);
    var q = d === 'easy' ? ri(11, 49) : ri(52, 249);
    var a = b * q;
    return Q({
      type: 'longdiv', mode: 'input',
      kindLabel: 'Long division',
      prompt: 'Work out ' + a + ' ÷ ' + b + '.',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: q,
      hint: 'Divide, Multiply, Subtract, Bring down — one digit at a time, left to right.',
      tags: ['longdiv'],
      teach: {
        lines: [
          'Set it out as long division and take one digit at a time.',
          'Remember the chant: Divide → Multiply → Subtract → Bring down.',
          a + ' ÷ ' + b + ' = ' + q + '.'
        ],
        visual: { kind: 'longdiv', dividend: String(a), divisor: b }
      }
    });
  }

  function g4LongRem(d) {
    var b = ri(3, 9);
    var q = d === 'medium' ? ri(21, 99) : ri(105, 399);
    var r = ri(1, b - 1);
    var a = b * q + r;
    return Q({
      type: 'longdiv', mode: 'quotrem',
      kindLabel: 'Long division',
      prompt: 'Divide ' + a + ' by ' + b + '. Give the answer with its remainder.',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: { q: q, r: r },
      answerText: q + ' r ' + r,
      hint: 'When you cannot subtract any more, whatever is left at the bottom is the remainder.',
      tags: ['longdiv', 'remainder'],
      teach: {
        lines: [
          'Work through the long division one digit at a time.',
          'The last number left at the bottom is the remainder.',
          a + ' ÷ ' + b + ' = ' + q + ' remainder ' + r + '.'
        ],
        visual: { kind: 'longdiv', dividend: String(a), divisor: b }
      }
    });
  }

  function g4Interpret(d) {
    var nm = name();
    var perVehicle = pick([4, 5, 6, 8]);
    var q = ri(3, 12), r = ri(1, perVehicle - 1);
    var total = perVehicle * q + r;
    var kind = pick(['roundup', 'dropit']);
    if (kind === 'roundup') {
      var ans = q + 1;
      var mcSet = mcLabels(String(ans), [String(q), String(q) + ' remainder ' + r, String(ans + 1)],
        function (i) { return String(ans + i + 1); });
      return Q({
        type: 'word', mode: 'mc',
        kindLabel: 'Think about the remainder',
        story: total + ' students are going on a trip. Each minibus holds ' + perVehicle + ' students. Nobody may be left behind.',
        prompt: 'How many minibuses are needed?',
        choices: mcSet.choices, answerIndex: mcSet.answerIndex,
        answer: String(ans),
        hint: total + ' ÷ ' + perVehicle + ' = ' + q + ' r ' + r + '. Those ' + r + ' students still need a seat!',
        tags: ['word', 'remainder'],
        teach: {
          lines: [
            total + ' ÷ ' + perVehicle + ' = ' + q + ' remainder ' + r + '.',
            r + ' students are left over — they still need a bus.',
            'So round UP: ' + ans + ' minibuses.'
          ],
          visual: { kind: 'bar', total: total, parts: q, per: perVehicle, remainder: r, totalLabel: total + ' students' }
        }
      });
    }
    var boxSize = perVehicle;
    var ansD = q;
    var mcSet2 = mcLabels(String(ansD), [String(q + 1), String(q + r), String(q) + '.' + r],
      function (i) { return String(ansD + i + 1); });
    return Q({
      type: 'word', mode: 'mc',
      kindLabel: 'Think about the remainder',
      story: nm + ' has ' + total + ' cupcakes and packs them in boxes of ' + boxSize + '. Only FULL boxes can be sold.',
      prompt: 'How many boxes can be sold?',
      choices: mcSet2.choices, answerIndex: mcSet2.answerIndex,
      answer: String(ansD),
      hint: total + ' ÷ ' + boxSize + ' = ' + q + ' r ' + r + '. A part-full box cannot be sold.',
      tags: ['word', 'remainder'],
      teach: {
        lines: [
          total + ' ÷ ' + boxSize + ' = ' + q + ' remainder ' + r + '.',
          'The ' + r + ' spare cupcakes do not fill a box.',
          'So the answer ignores the remainder: ' + ansD + ' boxes.'
        ],
        visual: { kind: 'bar', total: total, parts: q, per: boxSize, remainder: r, totalLabel: total + ' cupcakes' }
      }
    });
  }

  function g4Multistep(d) {
    var nm = name(), t = theme();
    var packs = ri(3, 8), perPack = pick([6, 8, 10, 12]);
    var friends = pick([2, 3, 4, 5, 6]);
    var total = packs * perPack;
    while (total % friends !== 0) { perPack += 1; total = packs * perPack; }
    var ans = total / friends;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Two-step problem',
      story: nm + ' buys ' + packs + ' packs of ' + t.many + ' ' + t.e + '. Each pack holds ' + perPack + '. They are shared equally between ' + friends + ' friends.',
      prompt: 'How many ' + t.many + ' does each friend get?',
      answer: ans,
      hint: 'Step 1: how many altogether? Step 2: share that total between ' + friends + '.',
      tags: ['word', 'multistep'],
      teach: {
        lines: [
          'Step 1 — multiply to find the total: ' + packs + ' × ' + perPack + ' = ' + total + '.',
          'Step 2 — divide to share it: ' + total + ' ÷ ' + friends + ' = ' + ans + '.',
          'Each friend gets ' + ans + '.'
        ],
        visual: { kind: 'bar', total: total, parts: friends, per: ans, totalLabel: total + ' ' + t.many }
      }
    });
  }

  function g4Missing(d) {
    var b = ri(3, 9), q = ri(12, 99), a = b * q;
    var blank = pick(['a', 'b']);
    var text = blank === 'a' ? ('? ÷ ' + b + ' = ' + q) : (a + ' ÷ ? = ' + q);
    var ans = blank === 'a' ? a : b;
    return Q({
      type: 'missing', mode: 'input',
      kindLabel: 'Missing number',
      prompt: 'Find the missing number.',
      equation: { text: text },
      answer: ans,
      hint: blank === 'a'
        ? 'To undo a division, multiply: ' + b + ' × ' + q + '.'
        : 'Ask: ' + a + ' ÷ what = ' + q + '? Try ' + a + ' ÷ ' + q + '.',
      tags: ['missing'],
      teach: {
        lines: [
          'Multiplication undoes division.',
          b + ' × ' + q + ' = ' + a + '.',
          'So the missing number is ' + ans + '.'
        ],
        visual: { kind: 'factTriangle', product: a, f1: b, f2: q }
      }
    });
  }

  /* ======================================================================
     GRADE 5 — two-digit divisors, decimal quotients, real life
     ====================================================================== */
  function g5TwoDigit(d) {
    var b = ri(11, d === 'easy' ? 25 : 45);
    var q = d === 'easy' ? ri(6, 25) : ri(12, 60);
    var a = b * q;
    return Q({
      type: 'longdiv', mode: 'input',
      kindLabel: 'Two-digit divisor',
      prompt: 'Work out ' + a + ' ÷ ' + b + '.',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: q,
      hint: 'Estimate first: round ' + b + ' to ' + (Math.round(b / 10) * 10) + ' and ask how many fit into ' + a + '.',
      tags: ['longdiv'],
      teach: {
        lines: [
          'With a 2-digit divisor, estimate before each digit.',
          'Roughly, ' + b + ' is about ' + (Math.round(b / 10) * 10) + ', and ' + (Math.round(b / 10) * 10) + ' × ' + q + ' ≈ ' + (Math.round(b / 10) * 10 * q) + '.',
          'The exact answer is ' + a + ' ÷ ' + b + ' = ' + q + '.'
        ],
        visual: { kind: 'longdiv', dividend: String(a), divisor: b }
      }
    });
  }

  function g5Estimate(d) {
    var b = ri(18, 42);
    var q = ri(8, 40);
    var a = b * q + ri(1, b - 1);
    var rounded = Math.round(q / 10) * 10 || 10;
    var mcSet = mcLabels('about ' + rounded,
      ['about ' + (rounded * 10), 'about ' + Math.max(1, Math.round(rounded / 10)), 'about ' + (rounded + 30)],
      function (i) { return 'about ' + (rounded + i * 10); });
    return Q({
      type: 'facts', mode: 'mc',
      kindLabel: 'Estimate',
      prompt: 'Without dividing exactly — about how big is ' + a + ' ÷ ' + b + '?',
      choices: mcSet.choices, answerIndex: mcSet.answerIndex,
      answer: 'about ' + rounded,
      hint: 'Round both numbers to friendly ones: ' + a + ' ≈ ' + (Math.round(a / 100) * 100) + ' and ' + b + ' ≈ ' + (Math.round(b / 10) * 10) + '.',
      tags: ['estimate'],
      teach: {
        lines: [
          'Estimating tells you whether an answer is sensible.',
          'Round to compatible numbers: about ' + (Math.round(b / 10) * 10) + ' into about ' + (Math.round(a / 100) * 100) + '.',
          'That gives roughly ' + rounded + ' — and the real answer is ' + Math.floor(a / b) + '.'
        ],
        visual: null
      }
    });
  }

  function g5Decimal(d) {
    var b = pick([2, 4, 5, 8]);
    var whole = ri(4, 40);
    var r = pick(b === 2 ? [1] : b === 4 ? [1, 2, 3] : b === 5 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7]);
    var a = whole * b + r;
    var ans = a / b;
    return Q({
      type: 'decimal', mode: 'input',
      kindLabel: 'Decimal answer',
      prompt: 'Divide ' + a + ' ÷ ' + b + '. Write the answer as a decimal.',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: ans, tol: 1e-6,
      unit: '',
      hint: 'Do not stop at the remainder. Add a decimal point and zeros: ' + a + '.00, then keep dividing.',
      tags: ['decimal', 'longdiv'],
      teach: {
        lines: [
          a + ' ÷ ' + b + ' is ' + whole + ' remainder ' + r + ' — but we can keep going.',
          'Write ' + a + ' as ' + a + '.00, put a decimal point in the answer, and bring down zeros.',
          'The exact answer is ' + U.fmt(ans) + '.'
        ],
        visual: { kind: 'longdiv', dividend: a + '.' + (b === 8 ? '000' : '00'), divisor: b }
      }
    });
  }

  function g5Money(d) {
    var nm = name(), t = theme();
    var count = pick([3, 4, 5, 6, 8]);
    var each = ri(105, 899) / 100;
    each = Math.round(each * 100) / 100;
    var total = Math.round(each * count * 100) / 100;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Money problem',
      story: nm + ' pays ' + U.money(total) + ' for ' + count + ' identical ' + t.many + ' ' + t.e + '.',
      prompt: 'How much does ONE cost? (write it like 3.25)',
      answer: each, tol: 0.005,
      answerText: U.money(each),
      hint: 'Divide the total by the number of items: ' + U.money(total) + ' ÷ ' + count + '.',
      tags: ['word', 'decimal', 'money'],
      teach: {
        lines: [
          'Total ÷ number of items = price of one. This is called a unit price.',
          U.money(total) + ' ÷ ' + count + ' = ' + U.money(each) + '.',
          'Line up the decimal point in the answer above the one in the total.'
        ],
        visual: { kind: 'bar', total: total, parts: count, per: each, totalLabel: U.money(total), brace: count + ' equal parts' }
      }
    });
  }

  function g5UnitRate(d) {
    var nm = name();
    var kind = pick(['speed', 'pages', 'laps']);
    if (kind === 'speed') {
      var hours = ri(3, 9), speed = pick([45, 55, 60, 65, 70, 80]);
      var miles = hours * speed;
      return Q({
        type: 'word', mode: 'input',
        kindLabel: 'Rate problem',
        story: 'A train travels ' + miles + ' miles in ' + hours + ' hours at a steady speed.',
        prompt: 'How many miles does it travel each hour?',
        answer: speed, unit: 'miles/hour',
        hint: 'Miles ÷ hours gives miles per hour.',
        tags: ['word', 'rate'],
        teach: {
          lines: ['"Per hour" means divide by the number of hours.',
            miles + ' ÷ ' + hours + ' = ' + speed + '.',
            'The train travels ' + speed + ' miles every hour.'],
          visual: { kind: 'bar', total: miles, parts: hours, per: speed, totalLabel: miles + ' miles', brace: hours + ' hours' }
        }
      });
    }
    if (kind === 'pages') {
      var days = ri(4, 12), perDay = ri(12, 40), pages = days * perDay;
      return Q({
        type: 'word', mode: 'input',
        kindLabel: 'Rate problem',
        story: nm + ' reads a ' + pages + '-page book in ' + days + ' days, reading the same amount each day.',
        prompt: 'How many pages does ' + nm + ' read per day?',
        answer: perDay, unit: 'pages',
        hint: 'Total pages ÷ number of days.',
        tags: ['word', 'rate'],
        teach: {
          lines: ['Same amount each day means equal groups.',
            pages + ' ÷ ' + days + ' = ' + perDay + '.',
            nm + ' reads ' + perDay + ' pages a day.'],
          visual: { kind: 'bar', total: pages, parts: days, per: perDay, totalLabel: pages + ' pages' }
        }
      });
    }
    var laps = pick([6, 8, 12]), secs = laps * ri(48, 95);
    var per = secs / laps;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Rate problem',
      story: nm + ' runs ' + laps + ' laps in ' + secs + ' seconds, keeping a steady pace.',
      prompt: 'How many seconds does one lap take?',
      answer: per, unit: 'seconds',
      hint: 'Seconds ÷ laps = seconds per lap.',
      tags: ['word', 'rate'],
      teach: {
        lines: ['"Per lap" tells you to divide by the number of laps.',
          secs + ' ÷ ' + laps + ' = ' + per + '.',
          'Each lap takes ' + per + ' seconds.'],
        visual: { kind: 'bar', total: secs, parts: laps, per: per, totalLabel: secs + ' seconds' }
      }
    });
  }

  function g5Multistep(d) {
    var nm = name(), t = theme();
    var boxes = ri(4, 12), perBox = pick([12, 15, 20, 24]);
    var total = boxes * perBox;
    var groups = pick([2, 4, 5]);
    /* pick what is LEFT first (a multiple of `groups`) so `used` is always sensible */
    var maxUnits = Math.floor((total - groups) / groups);
    var units = ri(Math.max(2, Math.floor(maxUnits * 0.35)), maxUnits);
    var left = units * groups;
    var used = total - left;
    var ans = units;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Multi-step',
      story: 'A shop receives ' + boxes + ' boxes of ' + t.many + ' ' + t.e + ' with ' + perBox + ' in each box. ' + used + ' are sold straight away. The rest are split equally between ' + groups + ' shelves.',
      prompt: 'How many ' + t.many + ' go on each shelf?',
      answer: ans,
      hint: 'Three steps: multiply for the total, subtract what was sold, then divide what is left.',
      tags: ['word', 'multistep'],
      teach: {
        lines: [
          'Step 1: ' + boxes + ' × ' + perBox + ' = ' + total + ' altogether.',
          'Step 2: ' + total + ' − ' + used + ' = ' + left + ' remaining.',
          'Step 3: ' + left + ' ÷ ' + groups + ' = ' + ans + ' on each shelf.'
        ],
        visual: { kind: 'bar', total: left, parts: groups, per: ans, totalLabel: left + ' left', brace: groups + ' shelves' }
      }
    });
  }

  /* ======================================================================
     GRADE 6 — decimals, fractions, ratios
     ====================================================================== */
  function g6DecWhole(d) {
    var b = ri(2, 9);
    var q = ri(11, 89) / 10;
    var a = Math.round(q * b * 10) / 10;
    return Q({
      type: 'decimal', mode: 'input',
      kindLabel: 'Decimal ÷ whole',
      prompt: 'What is ' + a + ' ÷ ' + b + '?',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: q, tol: 1e-6,
      hint: 'Divide as normal and keep the decimal point in the answer directly above the one in ' + a + '.',
      tags: ['decimal'],
      teach: {
        lines: [
          'Dividing a decimal by a whole number works exactly like normal long division.',
          'Keep the decimal point in the answer lined up above the decimal point in ' + a + '.',
          a + ' ÷ ' + b + ' = ' + U.fmt(q) + '.'
        ],
        visual: { kind: 'longdiv', dividend: String(a.toFixed(2)), divisor: b }
      }
    });
  }

  function g6DecDec(d) {
    var divisorTenths = pick([2, 3, 4, 5, 6, 8]);
    var b = divisorTenths / 10;                      /* e.g. 0.6 */
    var q = d === 'medium' ? ri(3, 12) : ri(11, 40);
    var a = Math.round(q * b * 100) / 100;
    var scaledA = Math.round(a * 10);
    return Q({
      type: 'decimal', mode: 'input',
      kindLabel: 'Decimal ÷ decimal',
      prompt: 'What is ' + a + ' ÷ ' + b + '?',
      equation: { text: a + ' ÷ ' + b + ' = ?' },
      answer: q, tol: 1e-6,
      hint: 'Make the divisor a whole number: multiply BOTH numbers by 10. ' + a + ' ÷ ' + b + ' becomes ' + scaledA + ' ÷ ' + divisorTenths + '.',
      tags: ['decimal'],
      teach: {
        lines: [
          'You cannot easily divide by ' + b + ', so change the question into an easier one that has the same answer.',
          'Multiply both numbers by 10: ' + a + ' × 10 = ' + scaledA + ' and ' + b + ' × 10 = ' + divisorTenths + '.',
          scaledA + ' ÷ ' + divisorTenths + ' = ' + q + ', so ' + a + ' ÷ ' + b + ' = ' + q + '.'
        ],
        visual: { kind: 'longdiv', dividend: String(scaledA), divisor: divisorTenths }
      }
    });
  }

  function g6FracWhole(d) {
    var den = pick([2, 3, 4, 5, 6, 8]);
    var num = ri(1, den - 1);
    var w = ri(2, 5);
    var ansN = num, ansD = den * w;
    var simp = U.simplify(ansN, ansD);
    var ansVal = ansN / ansD;
    return Q({
      type: 'fraction', mode: 'input',
      kindLabel: 'Fraction ÷ whole',
      prompt: 'What is ' + num + '/' + den + ' ÷ ' + w + '? (write it like 1/6)',
      equation: { text: num + '/' + den + ' ÷ ' + w + ' = ?' },
      answer: ansVal, tol: 1e-6,
      answerText: simp[0] + '/' + simp[1],
      hint: 'Dividing by ' + w + ' is the same as multiplying by 1/' + w + '.',
      tags: ['fraction'],
      teach: {
        lines: [
          'Splitting ' + num + '/' + den + ' into ' + w + ' equal parts makes each part smaller.',
          num + '/' + den + ' ÷ ' + w + ' = ' + num + '/' + den + ' × 1/' + w + ' = ' + ansN + '/' + ansD + '.',
          'Simplified, that is ' + simp[0] + '/' + simp[1] + '.'
        ],
        visual: { kind: 'fracbar', parts: den, shaded: num, chunk: 1, caption: num + '/' + den + ' split into ' + w + ' pieces' }
      }
    });
  }

  function g6FracFrac(d) {
    var den = pick([2, 3, 4]);
    var num = ri(1, den - 1);
    var mult = pick([2, 3, 4]);
    var smallDen = den * mult;                          /* e.g. 3/4 ÷ 1/8 */
    var ans = (num / den) / (1 / smallDen);
    var isWhole = Math.abs(ans - Math.round(ans)) < 1e-9;
    return Q({
      type: 'fraction', mode: 'input',
      kindLabel: 'Fraction ÷ fraction',
      prompt: 'How many ' + '1/' + smallDen + ' pieces fit inside ' + num + '/' + den + '?',
      equation: { text: num + '/' + den + ' ÷ 1/' + smallDen + ' = ?' },
      answer: ans, tol: 1e-6,
      answerText: isWhole ? String(Math.round(ans)) : U.fmt(ans),
      hint: 'Keep, Change, Flip: ' + num + '/' + den + ' × ' + smallDen + '/1.',
      tags: ['fraction'],
      teach: {
        lines: [
          'Dividing by a fraction asks "how many of these fit inside?"',
          'Keep ' + num + '/' + den + ', change ÷ to ×, flip 1/' + smallDen + ' to ' + smallDen + '/1.',
          num + '/' + den + ' × ' + smallDen + ' = ' + (num * smallDen) + '/' + den + ' = ' + U.fmt(ans) + '.'
        ],
        visual: { kind: 'fracbar', parts: smallDen, shaded: Math.round(num / den * smallDen), chunk: 1, caption: num + '/' + den + ' cut into ' + smallDen + 'ths' }
      }
    });
  }

  function g6Rate(d) {
    var kind = pick(['price', 'recipe', 'fuel']);
    if (kind === 'price') {
      var grams = pick([250, 400, 500, 750]);
      var price = Math.round(ri(180, 900)) / 100;
      var per100 = Math.round((price / grams) * 100 * 100) / 100;
      return Q({
        type: 'word', mode: 'input',
        kindLabel: 'Unit rate',
        story: 'A ' + grams + ' g bag of cereal costs ' + U.money(price) + '.',
        prompt: 'What is the price per 100 g? (round to 2 decimal places)',
        answer: per100, tol: 0.015,
        answerText: U.money(per100),
        hint: 'First find the price of 1 g (' + U.money(price) + ' ÷ ' + grams + '), then multiply by 100.',
        tags: ['word', 'decimal', 'rate'],
        teach: {
          lines: [
            'Unit rates let you compare different sized packs fairly.',
            U.money(price) + ' ÷ ' + grams + ' g gives the price of one gram.',
            'Multiply by 100: about ' + U.money(per100) + ' per 100 g.'
          ],
          visual: { kind: 'table', head: ['Amount', 'Cost'], rows: [[grams + ' g', U.money(price)], ['100 g', U.money(per100)]], hl: [1, 1] }
        }
      });
    }
    if (kind === 'recipe') {
      var serves = pick([4, 6, 8]);
      var target = pick([1, 2, 3]);
      var flour = serves * ri(40, 90);
      var ans = Math.round((flour / serves) * target * 10) / 10;
      return Q({
        type: 'word', mode: 'input',
        kindLabel: 'Scaling a recipe',
        story: 'A recipe uses ' + flour + ' g of flour and serves ' + serves + ' people.',
        prompt: 'How much flour is needed for ' + target + ' ' + U.plural(target, 'person', 'people') + '?',
        answer: ans, tol: 0.05, unit: 'g',
        hint: 'Divide to find the amount for ONE person, then multiply.',
        tags: ['word', 'rate'],
        teach: {
          lines: [
            'Find the amount for one person first: ' + flour + ' ÷ ' + serves + ' = ' + (flour / serves) + ' g.',
            'Then multiply by ' + target + ': ' + (flour / serves) + ' × ' + target + ' = ' + ans + ' g.',
            'This is called scaling a recipe.'
          ],
          visual: { kind: 'table', head: ['People', 'Flour'], rows: [[serves, flour + ' g'], [1, (flour / serves) + ' g'], [target, ans + ' g']], hl: [2, 1] }
        }
      });
    }
    var litres = pick([25, 40, 45, 50]);
    var kmPerL = pick([12, 14, 15, 16, 18]);
    var km = litres * kmPerL;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Unit rate',
      story: 'A car travels ' + km + ' km using ' + litres + ' litres of fuel.',
      prompt: 'How many kilometres does it travel per litre?',
      answer: kmPerL, unit: 'km/L',
      hint: 'Kilometres ÷ litres.',
      tags: ['word', 'rate'],
      teach: {
        lines: ['"Per litre" means divide by the number of litres.',
          km + ' ÷ ' + litres + ' = ' + kmPerL + '.',
          'The car does ' + kmPerL + ' km on every litre.'],
        visual: { kind: 'bar', total: km, parts: litres > 12 ? 5 : litres, per: Math.round(km / (litres > 12 ? 5 : litres)), totalLabel: km + ' km' }
      }
    });
  }

  function g6Multistep(d) {
    var people = pick([4, 5, 6, 8]);
    var billEach = Math.round(ri(450, 1600)) / 100;
    var bill = Math.round(billEach * people * 100) / 100;
    var tipPct = pick([10, 20]);
    var totalWithTip = Math.round(bill * (1 + tipPct / 100) * 100) / 100;
    var ans = Math.round((totalWithTip / people) * 100) / 100;
    return Q({
      type: 'word', mode: 'input',
      kindLabel: 'Multi-step',
      story: 'A meal costs ' + U.money(bill) + '. A ' + tipPct + '% tip is added, and the new total is split equally between ' + people + ' people.',
      prompt: 'How much does each person pay? (2 decimal places)',
      answer: ans, tol: 0.02,
      answerText: U.money(ans),
      hint: 'Step 1: add the tip (' + U.money(bill) + ' × ' + (1 + tipPct / 100) + '). Step 2: divide by ' + people + '.',
      tags: ['word', 'decimal', 'multistep'],
      teach: {
        lines: [
          'Step 1 — add the tip: ' + U.money(bill) + ' + ' + tipPct + '% = ' + U.money(totalWithTip) + '.',
          'Step 2 — divide: ' + U.money(totalWithTip) + ' ÷ ' + people + ' = ' + U.money(ans) + '.',
          'Each person pays ' + U.money(ans) + '.'
        ],
        visual: { kind: 'bar', total: totalWithTip, parts: people, per: ans, totalLabel: U.money(totalWithTip), brace: people + ' equal shares' }
      }
    });
  }

  function g6Missing(d) {
    var b = pick([0.2, 0.4, 0.5, 0.25, 1.5]);
    var q = ri(4, 40);
    var a = Math.round(b * q * 100) / 100;
    var blank = pick(['a', 'b']);
    var text = blank === 'a' ? ('? ÷ ' + b + ' = ' + q) : (a + ' ÷ ? = ' + q);
    var ans = blank === 'a' ? a : b;
    return Q({
      type: 'missing', mode: 'input',
      kindLabel: 'Missing number',
      prompt: 'Find the missing number.',
      equation: { text: text },
      answer: ans, tol: 1e-6,
      hint: 'Multiplication undoes division: ' + b + ' × ' + q + ' = ' + a + '.',
      tags: ['missing', 'decimal'],
      teach: {
        lines: [
          'Rewrite it as a multiplication.',
          b + ' × ' + q + ' = ' + a + '.',
          'The missing number is ' + U.fmt(ans) + '. Notice dividing by a number below 1 makes the answer BIGGER.'
        ],
        visual: null
      }
    });
  }

  /* ======================================================================
     Pools
     ====================================================================== */
  var POOLS = {
    1: {
      easy:      [{ w: 4, v: g1Share }, { w: 3, v: g1Group }, { w: 3, v: g1Drag }, { w: 2, v: g1Equal }],
      medium:    [{ w: 4, v: g1Share }, { w: 4, v: g1Group }, { w: 3, v: g1Drag }, { w: 2, v: g1Equal }],
      challenge: [{ w: 3, v: g1Share }, { w: 3, v: g1Group }, { w: 3, v: g1Drag }, { w: 2, v: g1Missing }, { w: 1, v: g1Equal }]
    },
    2: {
      easy:      [{ w: 4, v: g2Array }, { w: 3, v: g2Skip }, { w: 3, v: g2Sentence }, { w: 2, v: g2Word }, { w: 2, v: g2Drag }],
      medium:    [{ w: 3, v: g2Array }, { w: 3, v: g2Skip }, { w: 3, v: g2Missing }, { w: 3, v: g2Word }, { w: 2, v: g2Drag }, { w: 2, v: g2Sentence }],
      challenge: [{ w: 3, v: g2Missing }, { w: 3, v: g2Word }, { w: 2, v: g2Array }, { w: 2, v: g2Skip }, { w: 2, v: g2Drag }]
    },
    3: {
      easy:      [{ w: 4, v: g3Fact }, { w: 3, v: g3Family }, { w: 3, v: g3WordShare }, { w: 2, v: g3WordGroup }],
      medium:    [{ w: 3, v: g3Fact }, { w: 3, v: g3Remainder }, { w: 3, v: g3WordShare }, { w: 3, v: g3WordGroup }, { w: 2, v: g3Family }, { w: 2, v: g3PictureRem }],
      challenge: [{ w: 4, v: g3Remainder }, { w: 3, v: g3WordGroup }, { w: 3, v: g3WordShare }, { w: 2, v: g3Family }, { w: 2, v: g3Fact }]
    },
    4: {
      easy:      [{ w: 4, v: g4PlaceValue }, { w: 4, v: g4Long }, { w: 2, v: g4Missing }, { w: 2, v: g4Multistep }],
      medium:    [{ w: 4, v: g4Long }, { w: 4, v: g4LongRem }, { w: 3, v: g4Interpret }, { w: 3, v: g4Multistep }, { w: 2, v: g4PlaceValue }, { w: 2, v: g4Missing }],
      challenge: [{ w: 4, v: g4LongRem }, { w: 4, v: g4Multistep }, { w: 3, v: g4Interpret }, { w: 2, v: g4Long }, { w: 2, v: g4Missing }]
    },
    5: {
      easy:      [{ w: 4, v: g5TwoDigit }, { w: 3, v: g5UnitRate }, { w: 2, v: g5Estimate }, { w: 2, v: g5Money }],
      medium:    [{ w: 3, v: g5TwoDigit }, { w: 4, v: g5Decimal }, { w: 3, v: g5Money }, { w: 3, v: g5UnitRate }, { w: 2, v: g5Estimate }],
      challenge: [{ w: 4, v: g5Multistep }, { w: 3, v: g5Decimal }, { w: 3, v: g5TwoDigit }, { w: 3, v: g5Money }, { w: 2, v: g5Estimate }]
    },
    6: {
      easy:      [{ w: 4, v: g6DecWhole }, { w: 3, v: g6FracWhole }, { w: 3, v: g6Rate }],
      medium:    [{ w: 4, v: g6DecDec }, { w: 3, v: g6FracFrac }, { w: 3, v: g6FracWhole }, { w: 2, v: g6DecWhole }, { w: 2, v: g6Rate }],
      challenge: [{ w: 4, v: g6Multistep }, { w: 3, v: g6FracFrac }, { w: 3, v: g6DecDec }, { w: 2, v: g6Rate }, { w: 2, v: g6Missing }]
    }
  };

  function make(grade, difficulty) {
    var pool = (POOLS[grade] || POOLS[3])[difficulty] || (POOLS[grade] || POOLS[3]).easy;
    var gen = U.weighted(pool);
    var q = gen(difficulty);
    q.grade = grade;
    q.difficulty = difficulty;
    return q;
  }

  /* A round with variety: avoids three identical question types in a row. */
  function makeRound(grade, difficulty, count) {
    var out = [];
    var lastType = null, lastLast = null;
    var guard = 0;
    while (out.length < count && guard < count * 30) {
      guard++;
      var q = make(grade, difficulty);
      if (q.type === lastType && q.type === lastLast) continue;
      lastLast = lastType; lastType = q.type;
      out.push(q);
    }
    while (out.length < count) out.push(make(grade, difficulty));
    return out;
  }

  /* ---------- answer checking ---------------------------------------------- */
  function check(q, given) {
    if (q.mode === 'mc') return given === q.answerIndex;
    if (q.mode === 'quotrem') {
      var qq = U.parseNumeric(given.q), rr = U.parseNumeric(given.r);
      return U.near(qq, q.answer.q, 1e-6) && U.near(rr, q.answer.r, 1e-6);
    }
    if (q.mode === 'drag') {
      return given && given.ok === true;
    }
    var v = U.parseNumeric(given);
    if (isNaN(v)) return false;
    return U.near(v, q.answer, q.tol || 1e-6);
  }

  function answerLabel(q) {
    if (q.mode === 'mc') return q.choices[q.answerIndex];
    if (q.mode === 'quotrem') return q.answer.q + ' remainder ' + q.answer.r;
    if (q.mode === 'drag') return q.answer.per + ' in each group';
    return q.answerText !== undefined ? q.answerText : String(U.fmt(q.answer));
  }

  return {
    make: make,
    makeRound: makeRound,
    check: check,
    answerLabel: answerLabel,
    THEMES: THEMES,
    NAMES: NAMES,
    POOLS: POOLS
  };
})();

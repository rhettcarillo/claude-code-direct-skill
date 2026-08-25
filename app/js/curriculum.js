/* ==========================================================================
   curriculum.js — the six learning paths and their eighteen lessons.
   Every grade teaches a genuinely different idea, in different language,
   with its own pictures and its own kind of "Try It!" question.
   ========================================================================== */
window.Curriculum = (function () {
  'use strict';

  var ri = U.randInt, pick = U.pick;

  var GRADES = [
    { id: 1, name: 'Grade 1', title: 'Sharing Star', emoji: '🍎', color: '#FF6FB5', dark: '#DB4C92',
      blurb: 'Share things fairly and make equal groups.', path: 'Objects & sharing' },
    { id: 2, name: 'Grade 2', title: 'Picture Explorer', emoji: '⭐', color: '#FF9F1C', dark: '#DB7E00',
      blurb: 'Turn pictures into real division sentences.', path: 'Pictures → numbers' },
    { id: 3, name: 'Grade 3', title: 'Fact Finder', emoji: '🧩', color: '#35C46A', dark: '#23994F',
      blurb: 'Division facts, leftovers and word problems.', path: 'Facts & remainders' },
    { id: 4, name: 'Grade 4', title: 'Division Cadet', emoji: '🚀', color: '#3AA0FF', dark: '#1C7BD1',
      blurb: 'Big numbers and the long division method.', path: 'Long division' },
    { id: 5, name: 'Grade 5', title: 'Number Navigator', emoji: '🧭', color: '#12BFB4', dark: '#0C968E',
      blurb: 'Two-digit divisors, decimals and real life.', path: 'Decimals & rates' },
    { id: 6, name: 'Grade 6', title: 'Division Master', emoji: '👑', color: '#7C5CFF', dark: '#5B3FD6',
      blurb: 'Decimals, fractions, ratios and tough problems.', path: 'Advanced division' }
  ];

  function gradeById(id) {
    for (var i = 0; i < GRADES.length; i++) if (GRADES[i].id === id) return GRADES[i];
    return GRADES[0];
  }

  /* A small local question builder so each lesson can ask exactly the
     question that follows from what it just taught. */
  function mkQ(o) {
    o.mode = o.mode || 'input';
    o.tags = o.tags || ['lesson'];
    o.teach = o.teach || { lines: [] };
    o.teach.lines = o.teach.lines || [];
    if (o.answerText === undefined && o.mode === 'input') o.answerText = String(U.fmt(o.answer));
    return o;
  }

  /* Build multiple-choice options that are always distinct — a repeated
     option is confusing, and with small Grade 1 numbers the obvious
     distractors collide often. */
  function mcOf(correct, wrongs, pad) {
    var right = String(correct);
    var out = [];
    (wrongs || []).forEach(function (w) {
      var sw = String(w);
      if (sw !== right && out.indexOf(sw) === -1) out.push(sw);
    });
    var base = Number(correct);
    var i = 1;
    while (out.length < 3 && i < 60) {
      var cand = pad ? String(pad(i)) : (isFinite(base) ? String(base + i + 1) : right + ' ' + i);
      if (cand !== right && out.indexOf(cand) === -1) out.push(cand);
      i++;
    }
    var order = U.shuffle([right].concat(out.slice(0, 3)));
    return { choices: order, answerIndex: order.indexOf(right) };
  }

  var THEMES = Questions.THEMES;
  function th() { return pick(THEMES); }
  function nm() { return pick(Questions.NAMES); }

  /* ======================================================================
     GRADE 1
     ====================================================================== */
  var G1 = [
    {
      id: 'g1-l1', title: 'Fair Shares', icon: '🍎',
      idea: 'Division means giving everyone the same amount.',
      explain: [
        'When we <strong>share</strong>, everybody must get the <strong>same</strong> amount. That is called an <strong>equal share</strong>.',
        'Look at 6 apples and 2 friends. Give one apple to the first friend, one to the second friend… then go around again.',
        'Keep going until there are no apples left. Now count what one friend has.'
      ],
      visual: { kind: 'share', emoji: '🍎', total: 6, groups: 2, caption: '6 apples shared between 2 friends → 3 each' },
      worked: {
        title: 'Watch me share 8 cookies with 4 friends',
        steps: [
          { label: 'Count the cookies', text: 'There are 8 cookies 🍪.' },
          { label: 'Count the friends', text: 'There are 4 friends.' },
          { label: 'Deal them out', text: 'One cookie each… then go around again.' },
          { label: 'Check it is fair', text: 'Everybody has the same amount — 2 cookies each.' }
        ],
        visual: { kind: 'share', emoji: '🍪', total: 8, groups: 4 },
        answer: '8 shared between 4 = 2 each'
      },
      tryIt: function () {
        var t = th(), groups = ri(2, 3), per = ri(2, 4), total = groups * per;
        var mc = mcOf(per, [per + 1, Math.max(1, per - 1), total]);
        return mkQ({
          mode: 'mc', kindLabel: 'Sharing',
          story: 'Here are ' + total + ' ' + t.many + ' ' + t.e + ' and ' + groups + ' friends.',
          prompt: 'If they share fairly, how many does each friend get?',
          visual: { kind: 'pool', emoji: t.e, total: total },
          choices: mc.choices, answerIndex: mc.answerIndex, answer: per,
          hint: 'Point to each friend and give out one at a time, again and again.',
          teach: {
            lines: ['Let\'s split ' + total + ' into ' + groups + ' equal groups together.',
              'Deal one at a time until they are all gone.',
              'Each friend gets ' + per + '. So ' + total + ' shared between ' + groups + ' is ' + per + '.'],
            visual: { kind: 'share', emoji: t.e, total: total, groups: groups }
          }
        });
      }
    },
    {
      id: 'g1-l2', title: 'Making Groups', icon: '🧺',
      idea: 'Sometimes we know how many go in each group — and we count the groups.',
      explain: [
        'There is another way to divide. Instead of asking <strong>“how many each?”</strong> we ask <strong>“how many groups?”</strong>',
        'Imagine 12 stars ⭐. You put <strong>3 stars</strong> in every box.',
        'Take 3… take 3 more… keep going until the stars run out. Then count your boxes.'
      ],
      visual: { kind: 'groups', emoji: '⭐', total: 12, per: 3, caption: '12 stars in groups of 3 → 4 groups' },
      worked: {
        title: 'Watch me put 10 balloons into bunches of 2',
        steps: [
          { label: 'How many in each?', text: 'Every bunch gets 2 balloons 🎈.' },
          { label: 'Make a bunch', text: 'Take 2. That is bunch number 1.' },
          { label: 'Keep going', text: 'Take 2 more… and 2 more… until none are left.' },
          { label: 'Count the bunches', text: 'There are 5 bunches.' }
        ],
        visual: { kind: 'groups', emoji: '🎈', total: 10, per: 2 },
        answer: '10 in groups of 2 = 5 groups'
      },
      tryIt: function () {
        var t = th(), per = ri(2, 4), count = ri(2, 4), total = per * count;
        var mc = mcOf(count, [count + 1, Math.max(1, count - 1), per]);
        return mkQ({
          mode: 'mc', kindLabel: 'Grouping',
          story: 'There are ' + total + ' ' + t.many + ' ' + t.e + '. Each ' + t.box + ' holds ' + per + '.',
          prompt: 'How many ' + t.boxes + ' can we fill?',
          visual: { kind: 'pool', emoji: t.e, total: total },
          choices: mc.choices, answerIndex: mc.answerIndex, answer: count,
          hint: 'Circle ' + per + ' at a time, then count your circles.',
          teach: {
            lines: ['Take ' + per + ' at a time and keep making groups.',
              'Count the groups you made.',
              'There are ' + count + ' ' + t.boxes + '.'],
            visual: { kind: 'groups', emoji: t.e, total: total, per: per }
          }
        });
      }
    },
    {
      id: 'g1-l3', title: 'Equal or Not Equal?', icon: '⚖️',
      idea: 'If the groups are not the same size, the sharing was not fair.',
      explain: [
        'Division only works when the groups are <strong>equal</strong>.',
        'If one friend gets 4 sweets and another gets 2, that is <strong>not fair</strong> — and it is not division.',
        'Always check at the end: does every group have the <strong>same number</strong>?'
      ],
      visual: { kind: 'compare', emoji: '🍬', sets: [[3, 3, 3], [4, 2, 3]], labels: ['Equal — fair! ✅', 'Not equal ❌'] },
      worked: {
        title: 'Which sharing is fair?',
        steps: [
          { label: 'Look at picture 1', text: 'Three groups: 3, 3 and 3. All the same!' },
          { label: 'Look at picture 2', text: 'Three groups: 4, 2 and 3. One friend got extra.' },
          { label: 'Decide', text: 'Only picture 1 shows equal groups, so only picture 1 is division.' }
        ],
        visual: null,
        answer: 'Fair sharing = every group is the same size'
      },
      tryIt: function () {
        var t = th(), per = ri(2, 4);
        var good = [per, per, per];
        var bad1 = [per + 1, per, per];                     /* one group too big */
        var bad2 = [per, Math.max(1, per - 1), per];        /* one group too small */
        var order = U.shuffle([
          { set: good, ok: true }, { set: bad1, ok: false }, { set: bad2, ok: false }
        ]);
        var labels = ['A', 'B', 'C'];
        var ansIdx = 0;
        order.forEach(function (o, i) { if (o.ok) ansIdx = i; });
        return mkQ({
          mode: 'mc', kindLabel: 'Equal groups',
          prompt: 'Which one shows EQUAL groups?',
          choices: labels,
          choiceVisuals: order.map(function (o) { return { kind: 'compare', emoji: t.e, sets: [o.set] }; }),
          answerIndex: ansIdx, answer: labels[ansIdx],
          hint: 'Count every group. Equal means no group has more than another.',
          teach: {
            lines: ['Count each group carefully.',
              'Equal groups all hold the same number — here that is ' + per + '.',
              'The other picture has a group with a different amount, so it is not fair.'],
            visual: { kind: 'compare', emoji: t.e, sets: [good, bad1], labels: ['Equal ✅', 'Not equal ❌'] }
          }
        });
      }
    }
  ];

  /* ======================================================================
     GRADE 2
     ====================================================================== */
  var G2 = [
    {
      id: 'g2-l1', title: 'Rows and Columns', icon: '🔲',
      idea: 'Objects in neat rows make division easy to see.',
      explain: [
        'An <strong>array</strong> is objects arranged in neat rows, like a chocolate bar or a sticker sheet.',
        'Here are 12 stickers in <strong>3 equal rows</strong>. Because the rows are equal, you only need to count <strong>one</strong> row.',
        'One row has 4. So 12 stickers in 3 rows means <strong>4 in each row</strong>.'
      ],
      visual: { kind: 'array', emoji: '⭐', rows: 3, cols: 4, highlightRow: 0, caption: '12 stars in 3 rows → 4 in each row' },
      worked: {
        title: 'Watch me: 15 apples in 5 rows',
        steps: [
          { label: 'Look at the rows', text: 'There are 5 rows and they are all equal.' },
          { label: 'Count one row', text: 'The first row has 3 apples 🍎.' },
          { label: 'That is the answer', text: 'Every row has 3, so 15 ÷ 5 = 3.' }
        ],
        visual: { kind: 'array', emoji: '🍎', rows: 5, cols: 3, highlightRow: 0 },
        answer: '15 ÷ 5 = 3'
      },
      tryIt: function () {
        var t = th(), rows = ri(2, 5), cols = ri(2, 6), total = rows * cols;
        var mc = mcOf(cols, [cols + 1, rows, total - rows]);
        return mkQ({
          mode: 'mc', kindLabel: 'Rows & columns',
          prompt: total + ' ' + t.many + ' are in ' + rows + ' equal rows. How many are in each row?',
          visual: { kind: 'array', emoji: t.e, rows: rows, cols: cols, highlightRow: 0 },
          choices: mc.choices, answerIndex: mc.answerIndex, answer: cols,
          hint: 'Count along the highlighted row only.',
          teach: {
            lines: ['Every row is the same, so count just one row.',
              'One row has ' + cols + '.',
              total + ' ÷ ' + rows + ' = ' + cols + '.'],
            visual: { kind: 'array', emoji: t.e, rows: rows, cols: cols, highlightRow: 0 }
          }
        });
      }
    },
    {
      id: 'g2-l2', title: 'Meet the ÷ Sign', icon: '➗',
      idea: 'Now we can write sharing as a number sentence.',
      explain: [
        'Instead of drawing, we can <strong>write</strong> division using the ÷ sign.',
        'We read <strong>12 ÷ 3 = 4</strong> as “twelve divided by three equals four”.',
        'Each number has a job: the first is <strong>how many altogether</strong>, the second is <strong>how many groups</strong>, and the answer is <strong>how many in each group</strong>.'
      ],
      visual: { kind: 'equation', a: 12, b: 3, c: 4, caption: 'Every number in a division sentence has a job' },
      worked: {
        title: 'Write the sentence for this picture',
        steps: [
          { label: 'Count altogether', text: 'There are 10 cookies 🍪 in total.' },
          { label: 'Count the groups', text: 'They are on 2 plates.' },
          { label: 'Count one group', text: 'Each plate has 5.' },
          { label: 'Write it', text: 'Total ÷ groups = each group, so 10 ÷ 2 = 5.' }
        ],
        visual: { kind: 'share', emoji: '🍪', total: 10, groups: 2 },
        answer: '10 ÷ 2 = 5'
      },
      tryIt: function () {
        var t = th(), groups = ri(2, 5), per = ri(2, 5), total = groups * per;
        var correct = total + ' ÷ ' + groups + ' = ' + per;
        var mc = mcOf(correct, [
          total + ' ÷ ' + per + ' = ' + (groups + 1),
          (total + groups) + ' ÷ ' + groups + ' = ' + per,
          total + ' ÷ ' + (groups + 1) + ' = ' + per
        ]);
        return mkQ({
          mode: 'mc', kindLabel: 'Write the sentence',
          prompt: 'Which number sentence matches this picture?',
          visual: { kind: 'share', emoji: t.e, total: total, groups: groups, showCounts: false },
          choices: mc.choices, answerIndex: mc.answerIndex, answer: correct,
          hint: 'Total first, then the number of groups, then how many in each.',
          teach: {
            lines: ['Altogether: ' + total + '. Groups: ' + groups + '. In each group: ' + per + '.',
              'Write them in that order with ÷ and =.',
              total + ' ÷ ' + groups + ' = ' + per + '.'],
            visual: { kind: 'equation', a: total, b: groups, c: per }
          }
        });
      }
    },
    {
      id: 'g2-l3', title: 'Skip Count to Divide', icon: '🐸',
      idea: 'Hopping along a number line is a fast way to divide.',
      explain: [
        'Skip counting and dividing are the <strong>same idea</strong>.',
        'To work out 20 ÷ 5, hop along the number line in jumps of <strong>5</strong>: 5, 10, 15, 20.',
        'That took <strong>4 hops</strong> — so 20 ÷ 5 = 4. Counting the hops gives you the answer.'
      ],
      visual: { kind: 'numberline', total: 20, step: 5, caption: '4 hops of 5 to reach 20 → 20 ÷ 5 = 4' },
      worked: {
        title: 'Watch me: 18 ÷ 3',
        steps: [
          { label: 'Start at 0', text: 'Put your finger on zero.' },
          { label: 'Hop by 3', text: '3, 6, 9, 12, 15, 18 — stop when you land on 18.' },
          { label: 'Count the hops', text: 'That was 6 hops.' },
          { label: 'Answer', text: '18 ÷ 3 = 6.' }
        ],
        visual: { kind: 'numberline', total: 18, step: 3 },
        answer: '18 ÷ 3 = 6'
      },
      tryIt: function () {
        var step = pick([2, 3, 4, 5, 10]), jumps = ri(2, 6), total = step * jumps;
        var mc = mcOf(jumps, [jumps + 1, Math.max(1, jumps - 1), step]);
        return mkQ({
          mode: 'mc', kindLabel: 'Skip counting',
          prompt: 'How many hops of ' + step + ' does it take to reach ' + total + '?',
          visual: { kind: 'numberline', total: total, step: step },
          choices: mc.choices, answerIndex: mc.answerIndex, answer: jumps,
          hint: 'Say the numbers out loud as you hop: ' + step + ', ' + (step * 2) + ', ' + (step * 3) + ' …',
          teach: {
            lines: ['Start at 0 and hop by ' + step + '.',
              'You land on ' + total + ' after ' + jumps + ' hops.',
              total + ' ÷ ' + step + ' = ' + jumps + '.'],
            visual: { kind: 'numberline', total: total, step: step }
          }
        });
      }
    }
  ];

  /* ======================================================================
     GRADE 3
     ====================================================================== */
  var G3 = [
    {
      id: 'g3-l1', title: 'Fact Families', icon: '🔺',
      idea: 'If you know your times tables, you already know division.',
      explain: [
        'Multiplication and division are <strong>opposites</strong> — they undo each other.',
        'The numbers 4, 6 and 24 make a <strong>fact family</strong>: 4 × 6 = 24, 6 × 4 = 24, 24 ÷ 4 = 6 and 24 ÷ 6 = 4.',
        'So when you see 24 ÷ 6, don\'t count — just ask yourself <strong>“6 times what makes 24?”</strong>'
      ],
      visual: { kind: 'factTriangle', product: 24, f1: 4, f2: 6, caption: 'The two bottom numbers multiply to make the top one' },
      worked: {
        title: 'Watch me: 42 ÷ 7',
        steps: [
          { label: 'Turn it around', text: 'Ask: 7 × ? = 42.' },
          { label: 'Use the table', text: '7 × 6 = 42. That is the one!' },
          { label: 'Write the answer', text: 'So 42 ÷ 7 = 6.' },
          { label: 'Check', text: '6 × 7 = 42 ✓' }
        ],
        visual: { kind: 'factTriangle', product: 42, f1: 7, f2: 6 },
        answer: '42 ÷ 7 = 6'
      },
      tryIt: function () {
        var b = pick([3, 4, 5, 6, 7, 8, 9]), q = ri(3, 9), a = b * q;
        return mkQ({
          mode: 'input', kindLabel: 'Division fact',
          prompt: 'What is ' + a + ' ÷ ' + b + '?',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: q,
          hint: 'Ask yourself: ' + b + ' × what = ' + a + '?',
          teach: {
            lines: ['Flip it into a multiplication.',
              b + ' × ' + q + ' = ' + a + '.',
              'So ' + a + ' ÷ ' + b + ' = ' + q + '.'],
            visual: { kind: 'factTriangle', product: a, f1: b, f2: q }
          }
        });
      }
    },
    {
      id: 'g3-l2', title: 'Leftovers: Remainders', icon: '🍕',
      idea: 'Sometimes things do not share out perfectly — and that is fine.',
      explain: [
        'Not every number shares out evenly. What is left over is called the <strong>remainder</strong>.',
        'Share 13 cookies between 4 friends: everyone gets 3, and <strong>1 cookie is left over</strong>.',
        'We write that as <strong>13 ÷ 4 = 3 remainder 1</strong>. The remainder is always <strong>smaller</strong> than the number you divided by.'
      ],
      visual: { kind: 'share', emoji: '🍪', total: 13, groups: 4, caption: '13 ÷ 4 = 3 remainder 1' },
      worked: {
        title: 'Watch me: 17 ÷ 5',
        steps: [
          { label: 'Find the closest fact', text: '5 × 3 = 15, and 5 × 4 = 20 which is too big.' },
          { label: 'Use the one that fits', text: 'So the answer starts with 3.' },
          { label: 'Subtract', text: '17 − 15 = 2 left over.' },
          { label: 'Write it', text: '17 ÷ 5 = 3 remainder 2. Check: 2 is smaller than 5 ✓' }
        ],
        visual: { kind: 'groups', emoji: '⭐', total: 17, per: 5 },
        answer: '17 ÷ 5 = 3 r 2'
      },
      tryIt: function () {
        var t = th(), b = ri(3, 6), q = ri(2, 5), r = ri(1, b - 1), a = b * q + r;
        return mkQ({
          mode: 'quotrem', kindLabel: 'Remainder',
          story: 'There are ' + a + ' ' + t.many + ' ' + t.e + ' to share between ' + b + ' friends.',
          prompt: 'How many each, and how many left over?',
          visual: { kind: 'pool', emoji: t.e, total: a },
          answer: { q: q, r: r }, answerText: q + ' each, remainder ' + r,
          hint: 'What is the biggest multiple of ' + b + ' that fits inside ' + a + '?',
          teach: {
            lines: [b + ' × ' + q + ' = ' + (b * q) + ', which fits inside ' + a + '.',
              a + ' − ' + (b * q) + ' = ' + r + ' left over.',
              a + ' ÷ ' + b + ' = ' + q + ' remainder ' + r + '.'],
            visual: { kind: 'share', emoji: t.e, total: a, groups: b, small: true }
          }
        });
      }
    },
    {
      id: 'g3-l3', title: 'Two Kinds of Story', icon: '📖',
      idea: 'Word problems divide in two different ways — spot which one you have.',
      explain: [
        'Every division word problem is one of <strong>two kinds</strong>.',
        '<strong>Sharing:</strong> you know how many <em>groups</em>, and you want the size of each group. “15 sweets shared between 3 friends.”',
        '<strong>Grouping:</strong> you know the <em>size</em> of each group, and you want how many groups. “15 sweets in bags of 3.”',
        'Both are 15 ÷ 3 = 5 — but the 5 means something different each time: 5 <em>sweets</em>, or 5 <em>bags</em>.'
      ],
      visual: { kind: 'bar', total: 15, parts: 3, per: 5, totalLabel: '15 sweets', brace: '3 equal shares → 5 each' },
      worked: {
        title: 'Two stories, same numbers',
        steps: [
          { label: 'Story A (sharing)', text: '24 pencils shared between 6 children → each child gets 4 pencils.' },
          { label: 'Story B (grouping)', text: '24 pencils in packs of 6 → you get 4 packs.' },
          { label: 'Same sum', text: 'Both are 24 ÷ 6 = 4.' },
          { label: 'Different meaning', text: 'In A the answer counts pencils. In B it counts packs. Always say what your answer means!' }
        ],
        visual: { kind: 'bar', total: 24, parts: 6, per: 4, totalLabel: '24 pencils' },
        answer: '24 ÷ 6 = 4 (pencils, or packs)'
      },
      tryIt: function () {
        var t = th(), n = nm(), per = pick([3, 4, 5, 6]), count = ri(3, 8), total = per * count;
        var grouping = Math.random() < 0.5;
        if (grouping) {
          return mkQ({
            mode: 'input', kindLabel: 'Grouping story',
            story: n + ' has ' + total + ' ' + t.many + ' ' + t.e + ' and puts exactly ' + per + ' in each ' + t.box + '.',
            prompt: 'How many ' + t.boxes + ' does ' + n + ' fill?',
            answer: count,
            hint: 'You know the size of each group — you are counting the groups.',
            teach: {
              lines: ['This is a GROUPING story: the group size is given.',
                total + ' ÷ ' + per + ' = ' + count + '.',
                'The answer counts ' + t.boxes + ': ' + count + '.'],
              visual: { kind: 'bar', total: total, parts: count, per: per, totalLabel: total + ' ' + t.many, brace: 'groups of ' + per }
            }
          });
        }
        return mkQ({
          mode: 'input', kindLabel: 'Sharing story',
          story: n + ' shares ' + total + ' ' + t.many + ' ' + t.e + ' equally between ' + count + ' friends.',
          prompt: 'How many does each friend get?',
          answer: per,
          hint: 'You know the number of groups — you want the size of each group.',
          teach: {
            lines: ['This is a SHARING story: the number of groups is given.',
              total + ' ÷ ' + count + ' = ' + per + '.',
              'The answer counts ' + t.many + ': ' + per + ' each.'],
            visual: { kind: 'bar', total: total, parts: count, per: per, totalLabel: total + ' ' + t.many }
          }
        });
      }
    }
  ];

  /* ======================================================================
     GRADE 4
     ====================================================================== */
  var G4 = [
    {
      id: 'g4-l1', title: 'Dividing Tens and Hundreds', icon: '🏗️',
      idea: 'A fact you already know can solve a much bigger division.',
      explain: [
        'You already know 24 ÷ 6 = 4. That single fact unlocks <strong>240 ÷ 6</strong> and <strong>2400 ÷ 6</strong> too.',
        'Think of 240 as <strong>24 tens</strong>. If 24 ÷ 6 = 4, then 24 tens ÷ 6 = <strong>4 tens</strong>, which is 40.',
        'The trick: <strong>cover the zeros</strong>, divide the small numbers, then put the zeros back on the answer.'
      ],
      visual: { kind: 'placevalue', number: 240, caption: '240 = 2 hundreds and 4 tens' },
      worked: {
        title: 'Watch me: 3500 ÷ 7',
        steps: [
          { label: 'Cover the zeros', text: 'Ignore the two zeros for a moment: 35 ÷ 7.' },
          { label: 'Use the known fact', text: '35 ÷ 7 = 5.' },
          { label: 'Put the zeros back', text: 'We covered 2 zeros, so the answer gets 2 zeros: 500.' },
          { label: 'Check it makes sense', text: '500 × 7 = 3500 ✓' }
        ],
        visual: { kind: 'table', head: ['Question', 'Answer'], rows: [['35 ÷ 7', '5'], ['350 ÷ 7', '50'], ['3500 ÷ 7', '500']], hl: [2, 1] },
        answer: '3500 ÷ 7 = 500'
      },
      tryIt: function () {
        var b = pick([3, 4, 6, 7, 8, 9]), base = ri(2, 9), zeros = pick([1, 2]);
        var a = b * base * Math.pow(10, zeros), ans = base * Math.pow(10, zeros);
        return mkQ({
          mode: 'input', kindLabel: 'Place value',
          prompt: 'What is ' + a + ' ÷ ' + b + '?',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: ans,
          hint: 'Cover the zeros: what is ' + (b * base) + ' ÷ ' + b + '?',
          teach: {
            lines: ['Known fact: ' + (b * base) + ' ÷ ' + b + ' = ' + base + '.',
              'Put the ' + zeros + ' zero' + (zeros > 1 ? 's' : '') + ' back on.',
              a + ' ÷ ' + b + ' = ' + ans + '.'],
            visual: { kind: 'placevalue', number: a }
          }
        });
      }
    },
    {
      id: 'g4-l2', title: 'Long Division Step by Step', icon: '📐',
      idea: 'Divide, Multiply, Subtract, Bring down — then repeat.',
      explain: [
        'When numbers get big, we use <strong>long division</strong>. It handles one digit at a time, left to right.',
        'There are four steps and they repeat in the same order every time: <strong>Divide → Multiply → Subtract → Bring down</strong>.',
        'Use the widget below — press <strong>Next step</strong> and watch each part appear. Say the four words out loud as you go.'
      ],
      visual: { kind: 'longdiv', dividend: '96', divisor: 4, caption: 'Press “Next step” to divide 96 by 4' },
      worked: {
        title: 'Watch me: 872 ÷ 4',
        steps: [
          { label: 'Divide', text: 'How many 4s in 8? Two. Write 2 above the 8.' },
          { label: 'Multiply & subtract', text: '2 × 4 = 8, and 8 − 8 = 0.' },
          { label: 'Bring down', text: 'Bring down the 7. How many 4s in 7? One, with 3 left.' },
          { label: 'Repeat to the end', text: 'Bring down the 2 to make 32. 32 ÷ 4 = 8. The answer is 218.' }
        ],
        visual: { kind: 'longdiv', dividend: '872', divisor: 4 },
        answer: '872 ÷ 4 = 218'
      },
      tryIt: function () {
        var b = ri(3, 8), q = ri(23, 149), a = b * q;
        return mkQ({
          mode: 'input', kindLabel: 'Long division',
          prompt: 'Use long division to work out ' + a + ' ÷ ' + b + '.',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: q,
          hint: 'Divide, Multiply, Subtract, Bring down. Start with the left-hand digit.',
          teach: {
            lines: ['Take one digit at a time from the left.',
              'Chant the four steps at every position.',
              a + ' ÷ ' + b + ' = ' + q + '.'],
            visual: { kind: 'longdiv', dividend: String(a), divisor: b }
          }
        });
      }
    },
    {
      id: 'g4-l3', title: 'What About the Remainder?', icon: '🚌',
      idea: 'The story tells you what to do with the leftover part.',
      explain: [
        'In real life, a remainder needs a <strong>decision</strong>. The maths is the same — the story decides the answer.',
        '<strong>Round up:</strong> 26 children, 6 per minibus. 26 ÷ 6 = 4 r 2 — but those 2 children still need a bus, so you need <strong>5</strong>.',
        '<strong>Drop it:</strong> 26 eggs, boxes of 6, only full boxes sold. You can sell just <strong>4</strong> boxes.',
        '<strong>The remainder IS the answer:</strong> “How many eggs are left over?” → <strong>2</strong>.',
        'So always read the question again after you divide, and ask: what is it actually asking for?'
      ],
      visual: { kind: 'bar', total: 26, parts: 4, per: 6, remainder: 2, totalLabel: '26 children', brace: 'buses of 6' },
      worked: {
        title: 'Same sum, three answers',
        steps: [
          { label: 'The sum', text: '26 ÷ 6 = 4 remainder 2.' },
          { label: 'Buses needed?', text: 'Round UP → 5 buses (nobody left behind).' },
          { label: 'Full boxes sold?', text: 'Drop the remainder → 4 boxes.' },
          { label: 'How many left over?', text: 'The remainder itself → 2.' }
        ],
        visual: null,
        answer: 'Read the question — then choose'
      },
      tryIt: function () {
        var per = pick([4, 5, 6, 8]), q = ri(4, 11), r = ri(1, per - 1), total = per * q + r;
        var mc = mcOf(q + 1, [q, r, q + 2]);
        return mkQ({
          mode: 'mc', kindLabel: 'Think about the remainder',
          story: total + ' children need to travel. Each van seats ' + per + '. Everyone must go.',
          prompt: 'How many vans are needed?',
          choices: mc.choices, answerIndex: mc.answerIndex, answer: String(q + 1),
          hint: total + ' ÷ ' + per + ' = ' + q + ' r ' + r + '. Where do the last ' + r + ' children sit?',
          teach: {
            lines: [total + ' ÷ ' + per + ' = ' + q + ' remainder ' + r + '.',
              'The ' + r + ' extra children still need a van.',
              'So round up: ' + (q + 1) + ' vans.'],
            visual: { kind: 'bar', total: total, parts: q, per: per, remainder: r, totalLabel: total + ' children' }
          }
        });
      }
    }
  ];

  /* ======================================================================
     GRADE 5
     ====================================================================== */
  var G5 = [
    {
      id: 'g5-l1', title: 'Dividing by Two-Digit Numbers', icon: '🔭',
      idea: 'Estimate first, then divide — guessing well is part of the method.',
      explain: [
        'Dividing by 18 is harder than dividing by 8, because you cannot recite an 18 times table.',
        'The trick is <strong>estimation</strong>. Round the divisor to something friendly: 18 is close to <strong>20</strong>.',
        'Ask “how many 20s fit?”, then check with the real number and adjust up or down if you overshot.',
        'This is called using <strong>compatible numbers</strong>, and good mathematicians do it every time.'
      ],
      visual: { kind: 'table', head: ['Think', 'Because'], rows: [['372 ÷ 18', 'the real question'], ['360 ÷ 18 = 20', 'a friendly nearby fact'], ['answer ≈ 20', 'so start your guess at 20']], hl: [2, 0] },
      worked: {
        title: 'Watch me: 736 ÷ 23',
        steps: [
          { label: 'Estimate', text: '23 is about 20. How many 20s in 73? About 3.' },
          { label: 'Test the guess', text: '3 × 23 = 69, which fits inside 73. 73 − 69 = 4.' },
          { label: 'Bring down', text: 'Bring down the 6 to make 46.' },
          { label: 'Finish', text: '46 ÷ 23 = 2 exactly. The answer is 32.' }
        ],
        visual: { kind: 'longdiv', dividend: '736', divisor: 23 },
        answer: '736 ÷ 23 = 32'
      },
      tryIt: function () {
        var b = ri(12, 32), q = ri(11, 39), a = b * q;
        return mkQ({
          mode: 'input', kindLabel: 'Two-digit divisor',
          prompt: 'Work out ' + a + ' ÷ ' + b + '.',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: q,
          hint: 'Round ' + b + ' to ' + (Math.round(b / 10) * 10) + ' to make your first guess, then check it.',
          teach: {
            lines: ['Estimate with a friendly number first: about ' + (Math.round(b / 10) * 10) + '.',
              'Then do the long division properly, adjusting each guess.',
              a + ' ÷ ' + b + ' = ' + q + '.'],
            visual: { kind: 'longdiv', dividend: String(a), divisor: b }
          }
        });
      }
    },
    {
      id: 'g5-l2', title: 'Keep Going: Decimal Answers', icon: '💧',
      idea: 'A remainder does not have to stay a remainder.',
      explain: [
        'When you share £45 between 4 people, “11 remainder 1” is not a useful answer — you can split that last pound.',
        'Instead of stopping, write the dividend with a decimal point and zeros: <strong>45.00</strong>.',
        'Put a decimal point in your answer <strong>directly above</strong> the one in the dividend, then keep bringing down zeros.',
        '45 ÷ 4 = <strong>11.25</strong>. The remainder became the 0.25 — a quarter of a whole.'
      ],
      visual: { kind: 'longdiv', dividend: '45.00', divisor: 4, caption: 'Step through 45 ÷ 4 = 11.25' },
      worked: {
        title: 'Watch me: 27 ÷ 8',
        steps: [
          { label: 'Start normally', text: 'How many 8s in 27? Three, with 3 left over.' },
          { label: 'Add the decimal', text: 'Write 27 as 27.000 and put a point in the answer above it.' },
          { label: 'Bring down zeros', text: '30 ÷ 8 = 3 r 6 → 60 ÷ 8 = 7 r 4 → 40 ÷ 8 = 5.' },
          { label: 'Read it off', text: '27 ÷ 8 = 3.375 exactly.' }
        ],
        visual: { kind: 'longdiv', dividend: '27.000', divisor: 8 },
        answer: '27 ÷ 8 = 3.375'
      },
      tryIt: function () {
        var b = pick([2, 4, 5, 8]);
        var whole = ri(5, 30);
        var r = pick(b === 2 ? [1] : b === 4 ? [1, 2, 3] : b === 5 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7]);
        var a = whole * b + r, ans = a / b;
        return mkQ({
          mode: 'input', kindLabel: 'Decimal answer',
          prompt: 'Work out ' + a + ' ÷ ' + b + ' as a decimal.',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: ans, tol: 1e-6,
          hint: 'Write ' + a + ' as ' + a + '.00 and keep dividing past the decimal point.',
          teach: {
            lines: [a + ' ÷ ' + b + ' starts as ' + whole + ' remainder ' + r + '.',
              'Add a decimal point and zeros, then carry on dividing.',
              'The exact answer is ' + U.fmt(ans) + '.'],
            visual: { kind: 'longdiv', dividend: a + '.000', divisor: b }
          }
        });
      }
    },
    {
      id: 'g5-l3', title: 'Division in Real Life', icon: '🛒',
      idea: 'Division answers the question “how much for just one?”',
      explain: [
        'A <strong>unit rate</strong> is how much you get for exactly <strong>one</strong> of something: price per item, miles per hour, pages per day.',
        'You find it by dividing: total ÷ number of units.',
        'Unit rates let you compare things fairly. A 6-pack for £4.20 is 70p each; an 8-pack for £5.20 is 65p each — so the bigger pack is the <strong>better buy</strong>.',
        'Watch out for multi-step problems: sometimes you must add or subtract <em>before</em> you divide.'
      ],
      visual: { kind: 'table', head: ['Pack', 'Price', 'Each'], rows: [['6 drinks', '$4.20', '$0.70'], ['8 drinks', '$5.20', '$0.65']], hl: [1, 2] },
      worked: {
        title: 'Watch me: which is the better buy?',
        steps: [
          { label: 'Pack A', text: '6 drinks for $4.20 → 4.20 ÷ 6 = $0.70 each.' },
          { label: 'Pack B', text: '8 drinks for $5.20 → 5.20 ÷ 8 = $0.65 each.' },
          { label: 'Compare the unit prices', text: '$0.65 is less than $0.70.' },
          { label: 'Answer in words', text: 'Pack B is better value — 5c cheaper per drink.' }
        ],
        visual: null,
        answer: 'Divide to compare fairly'
      },
      tryIt: function () {
        var count = pick([3, 4, 5, 6, 8]);
        var each = Math.round(ri(120, 850)) / 100;
        var total = Math.round(each * count * 100) / 100;
        return mkQ({
          mode: 'input', kindLabel: 'Unit price',
          story: 'A pack of ' + count + ' identical notebooks costs ' + U.money(total) + '.',
          prompt: 'What is the price of ONE notebook? (write it like 1.35)',
          answer: each, tol: 0.005, answerText: U.money(each),
          hint: 'Unit price = total ÷ number of items.',
          teach: {
            lines: ['Divide the total by how many there are.',
              U.money(total) + ' ÷ ' + count + ' = ' + U.money(each) + '.',
              'Keep the decimal points lined up as you divide.'],
            visual: { kind: 'bar', total: total, parts: count, per: each, totalLabel: U.money(total) }
          }
        });
      }
    }
  ];

  /* ======================================================================
     GRADE 6
     ====================================================================== */
  var G6 = [
    {
      id: 'g6-l1', title: 'Dividing Decimals', icon: '🔬',
      idea: 'Change a hard question into an easy one with the same answer.',
      explain: [
        'Nobody wants to divide by 0.6. So don\'t — <strong>change the question</strong> into one with the same answer.',
        'If you multiply <strong>both</strong> numbers by 10, the answer does not change: 4.8 ÷ 0.6 is the same as <strong>48 ÷ 6</strong> = 8.',
        'Why does that work? Because division is a ratio. 4.8/0.6 and 48/6 are equivalent fractions — scaling top and bottom by the same amount keeps them equal.',
        'One surprise: dividing by a number <strong>less than 1</strong> makes the answer <strong>bigger</strong>. 8 is bigger than 4.8, because lots of little 0.6s fit inside 4.8.'
      ],
      visual: { kind: 'table', head: ['Question', '× 10 both', 'Answer'], rows: [['4.8 ÷ 0.6', '48 ÷ 6', '8'], ['1.44 ÷ 0.12', '144 ÷ 12', '12']], hl: [0, 1] },
      worked: {
        title: 'Watch me: 7.2 ÷ 0.8',
        steps: [
          { label: 'Look at the divisor', text: '0.8 has one decimal place, so multiply by 10.' },
          { label: 'Move BOTH', text: '7.2 × 10 = 72 and 0.8 × 10 = 8.' },
          { label: 'Divide the easy version', text: '72 ÷ 8 = 9.' },
          { label: 'Sanity check', text: '9 × 0.8 = 7.2 ✓ — and notice the answer is bigger than 7.2.' }
        ],
        visual: { kind: 'longdiv', dividend: '72', divisor: 8 },
        answer: '7.2 ÷ 0.8 = 9'
      },
      tryIt: function () {
        var tenths = pick([2, 3, 4, 5, 6, 8]), b = tenths / 10;
        var q = ri(4, 24), a = Math.round(q * b * 100) / 100;
        return mkQ({
          mode: 'input', kindLabel: 'Decimal ÷ decimal',
          prompt: 'What is ' + a + ' ÷ ' + b + '?',
          equation: { text: a + ' ÷ ' + b + ' = ?' },
          answer: q, tol: 1e-6,
          hint: 'Multiply both numbers by 10 first: ' + Math.round(a * 10) + ' ÷ ' + tenths + '.',
          teach: {
            lines: ['Make the divisor whole: multiply both numbers by 10.',
              Math.round(a * 10) + ' ÷ ' + tenths + ' = ' + q + '.',
              'So ' + a + ' ÷ ' + b + ' = ' + q + '.'],
            visual: { kind: 'longdiv', dividend: String(Math.round(a * 10)), divisor: tenths }
          }
        });
      }
    },
    {
      id: 'g6-l2', title: 'Dividing Fractions', icon: '🥧',
      idea: 'Keep, Change, Flip — and here is why it works.',
      explain: [
        '“3/4 ÷ 1/8” really asks: <strong>how many eighths fit inside three quarters?</strong>',
        'Look at the bar: three quarters shaded, cut into eighths. Count the eighths in the shaded part — there are <strong>6</strong>.',
        'The shortcut is <strong>Keep, Change, Flip</strong>: keep 3/4, change ÷ to ×, flip 1/8 to 8/1. So 3/4 × 8 = 24/4 = <strong>6</strong>. Same answer.',
        'It works because flipping gives the <strong>reciprocal</strong>, and multiplying by the reciprocal undoes the division — the same way × 2 undoes ÷ 2.'
      ],
      visual: { kind: 'fracbar', parts: 8, shaded: 6, chunk: 1, caption: '3/4 shaded, cut into eighths → 6 pieces fit' },
      worked: {
        title: 'Watch me: 2/3 ÷ 1/6',
        steps: [
          { label: 'Say it in words', text: 'How many sixths fit inside two thirds?' },
          { label: 'Keep', text: 'Keep the first fraction: 2/3.' },
          { label: 'Change & Flip', text: 'Change ÷ to ×, and flip 1/6 to 6/1.' },
          { label: 'Multiply', text: '2/3 × 6 = 12/3 = 4. Four sixths-pieces fit ✓' }
        ],
        visual: { kind: 'fracbar', parts: 6, shaded: 4, chunk: 1 },
        answer: '2/3 ÷ 1/6 = 4'
      },
      tryIt: function () {
        var den = pick([2, 3, 4]), num = ri(1, den - 1), mult = pick([2, 3, 4]);
        var small = den * mult, ans = (num / den) * small;
        return mkQ({
          mode: 'input', kindLabel: 'Fraction ÷ fraction',
          prompt: 'How many 1/' + small + ' pieces fit inside ' + num + '/' + den + '?',
          equation: { text: num + '/' + den + ' ÷ 1/' + small + ' = ?' },
          answer: ans, tol: 1e-6,
          hint: 'Keep ' + num + '/' + den + ', change ÷ to ×, flip 1/' + small + ' to ' + small + '.',
          teach: {
            lines: ['Keep, Change, Flip: ' + num + '/' + den + ' × ' + small + '.',
              (num * small) + '/' + den + ' = ' + U.fmt(ans) + '.',
              'So ' + U.fmt(ans) + ' pieces of size 1/' + small + ' fit inside ' + num + '/' + den + '.'],
            visual: { kind: 'fracbar', parts: small, shaded: Math.round(num / den * small), chunk: 1 }
          }
        });
      }
    },
    {
      id: 'g6-l3', title: 'Ratios, Rates & Tricky Problems', icon: '⚖️',
      idea: 'Find the value of ONE, then scale to whatever you need.',
      explain: [
        'Hard problems get easy when you find the <strong>unit value</strong> first — the amount for exactly one.',
        'A recipe serving 8 uses 480 g of flour. For one person: 480 ÷ 8 = <strong>60 g</strong>. Now you can serve any number: 3 people need 180 g.',
        'This is <strong>ratio reasoning</strong>: divide to get down to one, multiply to get up to the number you want.',
        'In multi-step problems, do the adding or subtracting <strong>first</strong>, then divide. Read the question twice before you choose.'
      ],
      visual: { kind: 'table', head: ['People', 'Flour'], rows: [['8', '480 g'], ['1', '60 g'], ['3', '180 g']], hl: [1, 1] },
      worked: {
        title: 'Watch me: splitting a bill with a tip',
        steps: [
          { label: 'Read carefully', text: 'A $60 meal, a 20% tip, split between 4 people.' },
          { label: 'Step 1 — the tip', text: '20% of 60 is 12, so the total is $72.' },
          { label: 'Step 2 — divide', text: '72 ÷ 4 = 18.' },
          { label: 'Answer in words', text: 'Each person pays $18. Dividing first would have given the wrong answer!' }
        ],
        visual: { kind: 'bar', total: 72, parts: 4, per: 18, totalLabel: '$72 total', brace: '4 equal shares' },
        answer: 'Add first, then divide → $18 each'
      },
      tryIt: function () {
        var serves = pick([4, 6, 8]), target = pick([1, 2, 3, 5]);
        var perPerson = ri(35, 90), flour = serves * perPerson;
        var ans = perPerson * target;
        return mkQ({
          mode: 'input', kindLabel: 'Scale it',
          story: 'A recipe uses ' + flour + ' g of flour and serves ' + serves + ' people.',
          prompt: 'How much flour is needed for ' + target + ' ' + U.plural(target, 'person', 'people') + '?',
          answer: ans, unit: 'g',
          hint: 'First divide to find the flour for ONE person, then multiply by ' + target + '.',
          teach: {
            lines: ['One person: ' + flour + ' ÷ ' + serves + ' = ' + perPerson + ' g.',
              'Then scale up: ' + perPerson + ' × ' + target + ' = ' + ans + ' g.',
              'Divide down to one, then multiply up — that is ratio reasoning.'],
            visual: { kind: 'table', head: ['People', 'Flour'], rows: [[serves, flour + ' g'], [1, perPerson + ' g'], [target, ans + ' g']], hl: [2, 1] }
          }
        });
      }
    }
  ];

  var LESSONS = { 1: G1, 2: G2, 3: G3, 4: G4, 5: G5, 6: G6 };

  function lessonsFor(gradeId) { return LESSONS[gradeId] || []; }
  function lessonById(id) {
    var found = null;
    Object.keys(LESSONS).forEach(function (g) {
      LESSONS[g].forEach(function (l) { if (l.id === id) found = l; });
    });
    return found;
  }
  function totalLessons() {
    var n = 0;
    Object.keys(LESSONS).forEach(function (g) { n += LESSONS[g].length; });
    return n;
  }

  var DIFFICULTIES = [
    { id: 'easy', name: 'Easy', emoji: '🌱', color: '#35C46A', dark: '#23994F', sub: 'Gentle start — lots of pictures' },
    { id: 'medium', name: 'Medium', emoji: '🔥', color: '#FF9F1C', dark: '#DB7E00', sub: 'Bigger numbers, more thinking' },
    { id: 'challenge', name: 'Challenge', emoji: '💎', color: '#FF6FB5', dark: '#DB4C92', sub: 'The tough ones — go get them' }
  ];

  return {
    GRADES: GRADES,
    DIFFICULTIES: DIFFICULTIES,
    gradeById: gradeById,
    lessonsFor: lessonsFor,
    lessonById: lessonById,
    totalLessons: totalLessons
  };
})();

/* ==========================================================================
   challenge.js — three challenge modes per grade, each with a different
   kind of pressure: lives, the clock, or a rising difficulty ladder.
   ========================================================================== */
window.Challenge = (function () {
  'use strict';

  var el = U.el;

  var MODES = [
    {
      id: 'hearts', name: 'Three Lives', emoji: '❤️', color: '#FF5C7A', dark: '#D93A58',
      sub: '10 questions. Three mistakes and the run ends.',
      count: 10, mode: 'hearts', difficulty: 'medium'
    },
    {
      id: 'timed', name: 'Beat the Clock', emoji: '⏱️', color: '#3AA0FF', dark: '#1C7BD1',
      sub: '90 seconds. Answer as many as you can.',
      count: 8, mode: 'timed', timeLimit: 90, difficulty: 'medium'
    },
    {
      id: 'ladder', name: 'Rising Ladder', emoji: '🪜', color: '#7C5CFF', dark: '#5B3FD6',
      sub: 'Easy → Medium → Challenge, all in one climb.',
      count: 12, mode: 'plain', difficulty: 'challenge', ladder: true
    }
  ];

  function list() {
    var gradeId = Progress.currentGrade();
    var grade = Curriculum.gradeById(gradeId);
    var gs = Progress.gradeState(gradeId);
    var data = Progress.get();
    var ready = gs.unlocked.medium;

    var cards = MODES.map(function (m) {
      var rec = data.challenges['g' + gradeId + ':' + m.id] || { stars: 0, best: 0, plays: 0 };
      var starStr = '★★★'.slice(0, rec.stars) + '☆☆☆'.slice(0, 3 - rec.stars);
      var card = el('button', {
        class: 'diff-card' + (ready ? '' : ' is-locked'),
        type: 'button', style: { '--d': m.color, '--dd': m.dark }, disabled: !ready
      }, [
        el('span', { class: 'd-emoji', text: m.emoji }),
        el('div', {}, [
          el('div', { class: 'd-name', text: m.name }),
          el('div', { class: 'd-sub', text: m.sub })
        ]),
        ready ? el('div', { class: 'd-stars', text: starStr + (rec.best ? '   ·   best ' + rec.best : '') }) : null,
        ready ? null : el('div', { class: 'lock-note', text: '🔒 Unlock Medium practice first' })
      ]);
      if (ready) {
        card.addEventListener('click', function () { U.Sound.click(); App.go('challengeRun', { mode: m.id }); });
      }
      return card;
    });

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }], 'Challenges · ' + grade.name),
        el('div', { class: 'hero', style: { background: 'linear-gradient(135deg,#FF9F1C,#FF5C7A)' } }, [
          el('span', { class: 'hero-mascot', text: '🏆' }),
          el('h1', { style: { fontSize: 'clamp(28px,6vw,46px)' }, text: 'Challenges' }),
          el('p', { text: 'Test what you know in ' + grade.name + ' — earn up to three stars in each.' })
        ]),
        el('div', { class: 'diff-grid' }, cards),
        el('div', { class: 'mascot-say' }, [
          el('span', { class: 'ms-face', text: '🦊' }),
          el('span', { class: 'ms-text', text: ready
            ? 'There are no hints in a challenge — but a wrong answer still shows you how it works.'
            : 'Challenges open once you have unlocked Medium practice in this grade. You are nearly there!' })
        ])
      ])
    ]);
  }

  function run(modeId) {
    var m = MODES.filter(function (x) { return x.id === modeId; })[0] || MODES[0];
    var gradeId = Progress.currentGrade();

    function question(i) {
      var diff = m.difficulty;
      if (m.ladder) {
        diff = i < 4 ? 'easy' : i < 8 ? 'medium' : 'challenge';
      }
      return Questions.make(gradeId, diff);
    }

    var runner = Session.Runner({
      grade: gradeId,
      difficulty: m.difficulty,
      count: m.count,
      kind: 'challenge',
      challengeMode: m.id,
      mode: m.mode,
      timeLimit: m.timeLimit,
      title: m.emoji + ' ' + m.name,
      makeQuestion: question,
      onExit: function () { App.go('challenges'); },
      onAgain: function () { App.go('challengeRun', { mode: m.id }); }
    });
    return runner.node;
  }

  return { list: list, run: run, MODES: MODES };
})();

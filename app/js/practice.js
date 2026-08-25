/* ==========================================================================
   practice.js — pick a difficulty, then run a 10-question round of mixed
   question types for the chosen grade.
   ========================================================================== */
window.Practice = (function () {
  'use strict';

  var el = U.el;
  var ROUND = 10;

  function setup() {
    var gradeId = Progress.currentGrade();
    var grade = Curriculum.gradeById(gradeId);
    var gs = Progress.gradeState(gradeId);

    var cards = Curriculum.DIFFICULTIES.map(function (d) {
      var unlocked = gs.unlocked[d.id];
      var stars = gs.stars[d.id] || 0;
      var starStr = '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
      var prevIdx = Progress.LEVELS.indexOf(d.id) - 1;
      var prev = Progress.LEVELS[prevIdx];
      var need = prev ? Math.max(0, Progress.UNLOCK_AT - (gs.levelCorrect[prev] || 0)) : 0;

      var card = el('button', {
        class: 'diff-card' + (unlocked ? '' : ' is-locked'),
        type: 'button',
        style: { '--d': d.color, '--dd': d.dark },
        disabled: !unlocked
      }, [
        el('span', { class: 'd-emoji', text: d.emoji }),
        el('div', {}, [
          el('div', { class: 'd-name', text: d.name }),
          el('div', { class: 'd-sub', text: d.sub })
        ]),
        unlocked ? el('div', { class: 'd-stars', text: starStr }) : null,
        unlocked ? null : el('div', { class: 'lock-note', text: '🔒 Get ' + need + ' more right in ' + U.cap(prev) + ' to unlock' })
      ]);
      if (unlocked) {
        card.addEventListener('click', function () {
          U.Sound.click();
          App.go('practiceRun', { difficulty: d.id });
        });
      }
      return card;
    });

    var kinds = ['Multiple choice', 'Type the answer', 'Missing number', 'Picture division', 'Word problems', 'Drag & drop'];

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }], 'Practice · ' + grade.name),
        el('div', { class: 'card', style: { background: 'linear-gradient(135deg,' + grade.color + ',' + grade.dark + ')', color: '#fff', border: 0 } }, [
          el('div', { class: 'row' }, [
            el('span', { style: { fontSize: '44px' }, text: '✏️' }),
            el('div', {}, [
              el('h2', { text: 'Practice — ' + grade.name }),
              el('div', { style: { fontWeight: '700', opacity: '.94' }, text: ROUND + ' mixed questions. Start easy, unlock the tough ones.' })
            ])
          ])
        ]),
        el('div', { class: 'section-head' }, [
          el('h2', { text: '🎚️ Choose your level' }),
          el('span', { class: 'hint-text', text: 'Get ' + Progress.UNLOCK_AT + ' right to unlock the next one' })
        ]),
        el('div', { class: 'diff-grid' }, cards),
        el('div', { class: 'card card-tight' }, [
          el('h3', { class: 'card-title' }, [el('span', { class: 'emoji', text: '🎲' }), el('span', { text: 'Questions come in all shapes' })]),
          el('div', { class: 'tag-row' }, kinds.map(function (k) { return el('span', { class: 'tag', text: k }); }))
        ]),
        el('div', { class: 'row', style: { justifyContent: 'center' } }, [
          el('button', {
            class: 'btn btn-ghost', type: 'button', text: '🎓 Change grade',
            onclick: function () { App.go('home'); }
          })
        ])
      ])
    ]);
  }

  function run(difficulty) {
    var gradeId = Progress.currentGrade();
    var grade = Curriculum.gradeById(gradeId);
    var diff = Curriculum.DIFFICULTIES.filter(function (d) { return d.id === difficulty; })[0] || Curriculum.DIFFICULTIES[0];
    var bank = Questions.makeRound(gradeId, difficulty, ROUND);

    var runner = Session.Runner({
      grade: gradeId,
      difficulty: difficulty,
      count: ROUND,
      kind: 'practice',
      mode: 'plain',
      title: diff.emoji + ' ' + diff.name + ' practice',
      makeQuestion: function (i) { return bank[i] || Questions.make(gradeId, difficulty); },
      onExit: function () { App.go('practice'); },
      onAgain: function () { App.go('practiceRun', { difficulty: difficulty }); }
    });
    return runner.node;
  }

  return { setup: setup, run: run, ROUND: ROUND };
})();

/* ==========================================================================
   learn.js — the lesson list and the four-step lesson player:
   Big Idea → Picture → Worked Example → Try It!
   ========================================================================== */
window.Learn = (function () {
  'use strict';

  var el = U.el;

  /* ---------- lesson list --------------------------------------------- */
  function list(gradeId) {
    var grade = Curriculum.gradeById(gradeId);
    var lessons = Curriculum.lessonsFor(gradeId);
    var done = Progress.lessonsDoneInGrade(gradeId);

    var items = lessons.map(function (lesson, i) {
      var isDone = Progress.lessonDone(lesson.id);
      var btn = el('button', { class: 'lesson-item' + (isDone ? ' is-done' : ''), type: 'button' }, [
        el('div', { class: 'li-icon', text: lesson.icon }),
        el('div', {}, [
          el('div', { class: 'li-name', text: (i + 1) + '. ' + lesson.title }),
          el('div', { class: 'li-idea', text: lesson.idea })
        ]),
        el('div', { class: 'li-state', text: isDone ? '✅' : '▶️' })
      ]);
      btn.addEventListener('click', function () { U.Sound.click(); App.go('lesson', { id: lesson.id }); });
      return btn;
    });

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap wrap-narrow stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }], 'Learn · ' + grade.name),
        el('div', { class: 'card', style: { background: 'linear-gradient(135deg,' + grade.color + ',' + grade.dark + ')', color: '#fff', border: 0 } }, [
          el('div', { class: 'row' }, [
            el('span', { style: { fontSize: '46px' }, text: grade.emoji }),
            el('div', {}, [
              el('h2', { text: grade.name + ' · ' + grade.title }),
              el('div', { style: { fontWeight: '700', opacity: '.94' }, text: grade.blurb })
            ])
          ]),
          el('div', { class: 'progress-track', style: { marginTop: '12px', background: 'rgba(255,255,255,.3)' } }, [
            el('i', { style: { width: Math.round((done / lessons.length) * 100) + '%', background: '#fff' } })
          ]),
          el('div', { style: { fontWeight: '800', marginTop: '8px' }, text: done + ' of ' + lessons.length + ' lessons finished' })
        ]),
        el('div', { class: 'section-head' }, [el('h2', { text: '📚 Lessons' })]),
        el('div', { class: 'lesson-list' }, items),
        el('div', { class: 'mascot-say' }, [
          el('span', { class: 'ms-face', text: '🦉' }),
          el('span', { class: 'ms-text', text: 'Tip: finish a lesson, then head to Practice to make it stick!' })
        ]),
        el('div', { class: 'row', style: { justifyContent: 'center' } }, [
          el('button', {
            class: 'btn btn-teal', type: 'button', text: '✏️ Practise ' + grade.name,
            onclick: function () { App.go('practice'); }
          })
        ])
      ])
    ]);
  }

  /* ---------- lesson player -------------------------------------------- */
  function lesson(lessonId) {
    var lesson = Curriculum.lessonById(lessonId);
    if (!lesson) return list(Progress.currentGrade());
    var gradeId = parseInt(lessonId.charAt(1), 10);
    var grade = Curriculum.gradeById(gradeId);
    var lessons = Curriculum.lessonsFor(gradeId);
    var index = 0;
    lessons.forEach(function (l, i) { if (l.id === lessonId) index = i; });

    var step = 0;
    var STEPS = ['Big Idea', 'Picture It', 'Watch Me', 'Try It!'];
    var answeredTryIt = false;

    var pillHost = el('div', { class: 'step-tabs' });
    var bodyHost = el('div', { class: 'stack scroll-anchor' });
    var navHost = el('div', { class: 'row' });
    var firstPaint = true;

    function paintPills() {
      U.clear(pillHost);
      STEPS.forEach(function (label, i) {
        var b = el('button', {
          class: 'step-pill' + (i === step ? ' is-current' : (i < step ? ' is-done' : '')),
          type: 'button', text: (i < step ? '✓ ' : '') + label
        });
        b.addEventListener('click', function () { if (i <= step) { step = i; paint(); } });
        pillHost.appendChild(b);
      });
    }

    function nav(nextLabel, onNext, hideBack) {
      U.clear(navHost);
      if (!hideBack && step > 0) {
        navHost.appendChild(el('button', {
          class: 'btn btn-ghost', type: 'button', text: '◀ Back',
          onclick: function () { step -= 1; paint(); }
        }));
      }
      navHost.appendChild(el('div', { class: 'grow' }));
      if (nextLabel) {
        navHost.appendChild(el('button', {
          class: 'btn btn-lg', type: 'button', text: nextLabel,
          onclick: function () { U.Sound.click(); onNext(); }
        }));
      }
    }

    function stepIdea() {
      U.clear(bodyHost);
      U.add(bodyHost, [
        el('div', { class: 'big-idea' }, [el('span', { text: '💡' }), el('span', { text: lesson.idea })]),
        el('div', { class: 'notebook explain-block' }, lesson.explain.map(function (p) {
          return el('p', { html: p });
        }))
      ]);
      nav('Show me a picture ▶', function () { step = 1; paint(); }, true);
    }

    function stepPicture() {
      U.clear(bodyHost);
      U.add(bodyHost, [
        el('div', { class: 'card' }, [
          el('h3', { class: 'card-title' }, [el('span', { class: 'emoji', text: '👀' }), el('span', { text: 'Picture It' })]),
          el('p', { style: { fontWeight: '700', color: '#5C5470' }, text: 'Look carefully — the picture shows exactly what the numbers mean.' }),
          Visual.render(lesson.visual)
        ])
      ]);
      nav('Watch a worked example ▶', function () { step = 2; paint(); });
    }

    function stepWorked() {
      U.clear(bodyHost);
      var w = lesson.worked;
      U.add(bodyHost, [
        el('div', { class: 'card' }, [
          el('h3', { class: 'card-title' }, [el('span', { class: 'emoji', text: '🧑‍🏫' }), el('span', { text: w.title })]),
          el('div', { class: 'worked' }, w.steps.map(function (s, i) {
            return el('div', { class: 'worked-step', style: { animationDelay: (i * 0.1) + 's' } }, [
              el('div', { class: 'ws-num', text: String(i + 1) }),
              el('div', {}, [
                el('span', { class: 'ws-label', text: s.label }),
                el('span', { class: 'ws-text', text: s.text })
              ])
            ]);
          })),
          w.visual ? Visual.render(w.visual) : null,
          el('div', { class: 'answer-line', text: w.answer })
        ])
      ]);
      nav('I\'m ready — let me try! ▶', function () { step = 3; paint(); });
    }

    function stepTry() {
      U.clear(bodyHost);
      var q = lesson.tryIt();
      var card = Session.QuestionCard(q, {
        onResult: function (correct, meta) {
          answeredTryIt = true;
          Progress.recordAnswer({
            grade: gradeId, difficulty: 'easy', correct: correct,
            tags: (meta.question.tags || []).concat(['lesson']), usedHint: meta.usedHint
          });
          if (correct) Progress.recordStreak(1);
          Badges.celebrate(Badges.check());
          nav('Finish this lesson 🎉', finishLesson);
          navHost.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
      U.add(bodyHost, [
        el('div', { class: 'section-head' }, [
          el('h2', { text: '✋ Try It!' }),
          el('span', { class: 'hint-text', text: 'Stuck? Tap the hint — that is what it is for.' })
        ]),
        card.node
      ]);
      nav(answeredTryIt ? 'Finish this lesson 🎉' : null, finishLesson);
    }

    function finishLesson() {
      var isNew = Progress.completeLesson(lesson.id);
      if (isNew) { U.confetti({ count: 150, emojis: ['🎓', '⭐', '🎉', '✏️'] }); U.Sound.win(); }
      Badges.celebrate(Badges.check());

      var next = lessons[index + 1];
      U.clear(pillHost);
      U.clear(navHost);
      U.clear(bodyHost).appendChild(el('div', { class: 'card result-card' }, [
        el('div', { class: 'tape' }),
        el('div', { style: { fontSize: '54px' }, text: '🎓' }),
        el('h2', { text: 'Lesson complete!' }),
        el('div', { class: 'result-msg', text: lesson.title + ' — nicely done, ' + (Progress.get().name || 'superstar') + '!' }),
        el('div', { class: 'tag-row', style: { justifyContent: 'center' } }, [
          el('span', { class: 'tag tag-green', text: '✅ ' + Progress.lessonsDoneInGrade(gradeId) + '/' + lessons.length + ' lessons in ' + grade.name }),
          el('span', { class: 'tag', text: '🏅 ' + Badges.earnedCount() + ' badges' })
        ]),
        el('div', { class: 'row', style: { justifyContent: 'center' } }, [
          next ? el('button', {
            class: 'btn btn-lg', type: 'button', text: 'Next lesson ▶',
            onclick: function () { App.go('lesson', { id: next.id }); }
          }) : el('button', {
            class: 'btn btn-teal btn-lg', type: 'button', text: '✏️ Practise this grade',
            onclick: function () { App.go('practice'); }
          }),
          el('button', {
            class: 'btn btn-ghost btn-lg', type: 'button', text: '📚 All lessons',
            onclick: function () { App.go('learn'); }
          })
        ])
      ]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function paint() {
      paintPills();
      if (step === 0) stepIdea();
      else if (step === 1) stepPicture();
      else if (step === 2) stepWorked();
      else stepTry();
      /* moving to a new step should show the top of that step, not wherever
         the last button happened to be */
      if (!firstPaint) bodyHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
      firstPaint = false;
    }

    paint();

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap wrap-narrow stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }, { label: '📚 ' + grade.name + ' lessons', to: 'learn' }], lesson.title),
        el('div', { class: 'card card-tight' }, [
          el('div', { class: 'row' }, [
            el('span', { style: { fontSize: '34px' }, text: lesson.icon }),
            el('div', {}, [
              el('h2', { style: { fontSize: '25px' }, text: lesson.title }),
              el('div', { style: { fontWeight: '700', color: '#8C86A0', fontSize: '14px' }, text: grade.name + ' · Lesson ' + (index + 1) + ' of ' + lessons.length })
            ])
          ]),
          pillHost
        ]),
        bodyHost,
        navHost
      ])
    ]);
  }

  return { list: list, lesson: lesson };
})();

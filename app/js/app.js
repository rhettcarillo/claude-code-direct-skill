/* ==========================================================================
   app.js — top bar, home dashboard, grade chooser and the little router
   that ties every screen together.
   ========================================================================== */
window.App = (function () {
  'use strict';

  var el = U.el;
  var state = { route: 'home', params: {} };
  var mainHost, topHost;

  /* ---------- routing ---------------------------------------------------- */
  function go(route, params) {
    state.route = route;
    state.params = params || {};
    render();
    try { location.hash = route; } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    paintTopbar();
    var node;
    switch (state.route) {
      case 'learn':        node = Learn.list(Progress.currentGrade()); break;
      case 'lesson':       node = Learn.lesson(state.params.id); break;
      case 'practice':     node = Practice.setup(); break;
      case 'practiceRun':  node = Practice.run(state.params.difficulty); break;
      case 'challenges':   node = Challenge.list(); break;
      case 'challengeRun': node = Challenge.run(state.params.mode); break;
      case 'progress':     node = ProgressScreen.dashboard(); break;
      case 'achievements': node = ProgressScreen.achievements(); break;
      default:             node = home();
    }
    U.clear(mainHost).appendChild(node);
  }

  function crumb(links, current) {
    var row = el('div', { class: 'crumb' });
    links.forEach(function (l) {
      row.appendChild(el('button', { type: 'button', text: l.label, onclick: function () { go(l.to); } }));
      row.appendChild(el('span', { text: '›' }));
    });
    row.appendChild(el('span', { text: current }));
    return row;
  }

  /* ---------- top bar ----------------------------------------------------- */
  function paintTopbar() {
    var d = Progress.get();
    var grade = Curriculum.gradeById(d.grade);

    var brand = el('button', { class: 'brand', type: 'button', 'aria-label': 'Go to the home screen' }, [
      el('span', { class: 'brand-mark', text: '➗' }),
      el('span', { class: 'brand-name' }, [el('span', { text: 'Division' }), ' Adventure'])
    ]);
    brand.addEventListener('click', function () { U.Sound.click(); go('home'); });

    var soundBtn = el('button', {
      class: 'icon-btn', type: 'button',
      title: d.sound ? 'Turn sounds off' : 'Turn sounds on',
      'aria-label': d.sound ? 'Turn sounds off' : 'Turn sounds on',
      text: d.sound ? '🔊' : '🔇'
    });
    soundBtn.addEventListener('click', function () {
      Progress.setSound(!Progress.get().sound);
      if (Progress.get().sound) U.Sound.click();
      paintTopbar();
    });

    var progBtn = el('button', { class: 'icon-btn', type: 'button', title: 'My progress', 'aria-label': 'My progress', text: '📈' });
    progBtn.addEventListener('click', function () { U.Sound.click(); go('progress'); });

    U.clear(topHost).appendChild(el('div', { class: 'topbar-inner' }, [
      brand,
      el('div', { class: 'topbar-spacer' }),
      el('span', { class: 'chip chip-grade', text: grade.emoji + ' ' + grade.name }),
      el('span', { class: 'chip chip-star', text: '⭐ ' + d.totals.correct }),
      d.daily.streak > 0 ? el('span', { class: 'chip chip-fire', text: '🔥 ' + d.daily.streak }) : null,
      soundBtn,
      progBtn
    ]));
  }

  /* ---------- home -------------------------------------------------------- */
  var MENU = [
    { id: 'learn', name: 'Learn', sub: 'Lessons with pictures', icon: '📚', color: '#7C5CFF', dark: '#5B3FD6' },
    { id: 'practice', name: 'Practice', sub: 'Mixed questions', icon: '✏️', color: '#12BFB4', dark: '#0C968E' },
    { id: 'challenges', name: 'Challenges', sub: 'Stars & high scores', icon: '🏆', color: '#FF9F1C', dark: '#DB7E00' },
    { id: 'progress', name: 'My Progress', sub: 'How far you have come', icon: '📈', color: '#3AA0FF', dark: '#1C7BD1' },
    { id: 'achievements', name: 'Achievements', sub: 'Your badge wall', icon: '🏅', color: '#FF6FB5', dark: '#DB4C92' }
  ];

  function menuCard(m) {
    var card = el('button', { class: 'menu-card', type: 'button', style: { borderColor: m.color + '33' } }, [
      el('span', { class: 'mc-icon', style: { background: 'linear-gradient(135deg,' + m.color + ',' + m.dark + ')', boxShadow: '0 4px 0 ' + m.dark }, text: m.icon }),
      el('span', { class: 'mc-name', style: { color: m.dark }, text: m.name }),
      el('span', { class: 'mc-sub', text: m.sub })
    ]);
    card.addEventListener('click', function () { U.Sound.click(); go(m.id); });
    return card;
  }

  function gradeCard(g) {
    var gs = Progress.gradeState(g.id);
    var lessons = Curriculum.lessonsFor(g.id).length;
    var done = Progress.lessonsDoneInGrade(g.id);
    var pct = Math.round((done / lessons) * 100);
    var active = Progress.currentGrade() === g.id;

    var card = el('button', {
      class: 'grade-card' + (active ? ' is-active' : ''),
      type: 'button',
      style: { '--g': g.color, '--gd': g.dark },
      'aria-label': g.name + ', ' + g.title + '. ' + g.blurb
    }, [
      el('span', { class: 'g-emoji', text: g.emoji }),
      active ? el('span', { class: 'g-active-tag', text: '★ MY GRADE' }) : null,
      el('span', { class: 'g-badge', text: g.path }),
      el('div', {}, [
        el('div', { class: 'g-num', text: 'Grade ' + g.id }),
        el('div', { class: 'g-title', text: g.title })
      ]),
      el('div', { class: 'g-blurb', text: g.blurb }),
      el('div', { class: 'g-foot' }, [
        el('span', { text: done + '/' + lessons + ' 📚' }),
        el('span', { class: 'g-bar' }, [el('i', { style: { width: pct + '%' } })]),
        el('span', { text: (gs.stars.easy + gs.stars.medium + gs.stars.challenge) + '★' })
      ])
    ]);
    card.addEventListener('click', function () {
      U.Sound.click();
      Progress.setGrade(g.id);
      Badges.celebrate(Badges.check());
      go('learn');
    });
    return card;
  }

  function nextLesson() {
    var g = Progress.currentGrade();
    var lessons = Curriculum.lessonsFor(g);
    for (var i = 0; i < lessons.length; i++) {
      if (!Progress.lessonDone(lessons[i].id)) return lessons[i];
    }
    return null;
  }

  function home() {
    var d = Progress.get();
    var grade = Curriculum.gradeById(d.grade);
    var next = nextLesson();
    var hello = d.name ? 'Hi ' + d.name + '!' : 'Hello, mathematician!';

    var continueCard = el('div', { class: 'card', style: { borderColor: '#FFE79A', background: 'linear-gradient(180deg,#FFFCEC,#fff)' } }, [
      el('div', { class: 'row' }, [
        el('span', { style: { fontSize: '40px' }, text: next ? next.icon : '🎓' }),
        el('div', { class: 'grow' }, [
          el('div', { style: { fontWeight: '900', color: '#DB7E00', fontSize: '13px', letterSpacing: '.6px' }, text: next ? 'CARRY ON WHERE YOU LEFT OFF' : 'ALL LESSONS FINISHED IN THIS GRADE' }),
          el('h3', { style: { fontSize: '22px' }, text: next ? next.title : grade.name + ' complete! 🎉' }),
          el('div', { style: { fontWeight: '700', color: '#8C86A0', fontSize: '14px' }, text: next ? next.idea : 'Try the challenges, or pick a new grade below.' })
        ]),
        el('button', {
          class: 'btn btn-orange', type: 'button', text: next ? 'Start ▶' : 'Challenges ▶',
          onclick: function () {
            U.Sound.click();
            if (next) go('lesson', { id: next.id }); else go('challenges');
          }
        })
      ])
    ]);

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap stack' }, [
        el('div', { class: 'hero' }, [
          el('span', { class: 'hero-mascot', text: '🧮' }),
          el('h1', { text: 'Division Adventure' }),
          el('p', { text: hello + ' Pick a path, learn the idea, then practise until it clicks.' })
        ]),
        continueCard,
        el('div', { class: 'menu-grid' }, MENU.map(menuCard)),
        el('div', { class: 'section-head' }, [
          el('h2', { text: '🎓 Choose Your Grade' }),
          el('span', { class: 'hint-text', text: 'Each grade is a different learning path — tap one to make it yours' })
        ]),
        el('div', { class: 'grade-grid' }, Curriculum.GRADES.map(gradeCard)),
        el('div', { class: 'card card-tight' }, [
          el('div', { class: 'row' }, [
            el('span', { style: { fontSize: '34px' }, text: '📊' }),
            el('div', { class: 'grow' }, [
              el('div', { style: { fontWeight: '800' }, text: 'Today so far' }),
              el('div', { style: { fontWeight: '700', color: '#8C86A0', fontSize: '14px' },
                text: d.totals.answered + ' questions answered · ' + d.totals.correct + ' correct · ' + Badges.earnedCount() + ' badges · ' + d.daily.streak + '-day streak' })
            ]),
            el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Details ▶', onclick: function () { go('progress'); } })
          ])
        ]),
        el('div', { class: 'footer-note', text: 'Made for curious learners · works offline · your progress is saved on this device' })
      ])
    ]);
  }

  /* ---------- first run ---------------------------------------------------- */
  function welcome() {
    var input = el('input', {
      class: 'answer-input', type: 'text', maxlength: '14', placeholder: 'Your name',
      style: { width: '100%', fontSize: '26px' }, 'aria-label': 'Your name'
    });
    var m = U.modal([
      el('div', { class: 'center', style: { fontSize: '54px' }, text: '🧮' }),
      el('h2', { class: 'center', text: 'Welcome to Division Adventure!' }),
      el('p', { class: 'center', style: { fontWeight: '700', color: '#5C5470' }, text: 'What should we call you? (You can skip this.)' }),
      input,
      el('div', { class: 'row', style: { justifyContent: 'center' } }, [
        el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Skip', onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn', type: 'button', text: "Let's go! 🚀",
          onclick: function () {
            var v = input.value.trim();
            if (v) Progress.setName(v);
            m.close();
            U.confetti({ count: 90 });
            render();
          }
        })
      ])
    ], { dismissable: true });
    input.focus();
  }

  /* ---------- boot --------------------------------------------------------- */
  function init() {
    topHost = document.getElementById('topbar');
    mainHost = document.getElementById('main');

    U.Sound.enabled = function () { return Progress.get().sound !== false; };
    Progress.touchDay();

    var d = Progress.get();
    render();
    if (!d.name && d.totals.answered === 0 && d.totals.lessons === 0) {
      setTimeout(welcome, 500);
    }

    window.addEventListener('hashchange', function () {
      var r = location.hash.replace('#', '');
      if (r && r !== state.route && ['home', 'learn', 'practice', 'challenges', 'progress', 'achievements'].indexOf(r) >= 0) {
        go(r);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { go: go, crumb: crumb, render: render, home: home };
})();

/* ==========================================================================
   progress.js — the My Progress dashboard and the Achievements wall.
   ========================================================================== */
window.ProgressScreen = (function () {
  'use strict';

  var el = U.el;

  function statCard(icon, value, label) {
    return el('div', { class: 'stat-card' }, [
      el('span', { class: 'sc-icon', text: icon }),
      el('span', { class: 'sc-val', text: String(value) }),
      el('span', { class: 'sc-lab', text: label })
    ]);
  }

  function levelBar(name, value, max, cls) {
    var pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return el('div', { class: 'gp-bar ' + cls }, [
      el('span', { text: U.cap(name) }),
      el('div', { class: 'track' }, [el('i', { style: { width: pct + '%' } })]),
      el('span', { text: value + '/' + max })
    ]);
  }

  function dashboard() {
    var d = Progress.get();
    var accuracy = d.totals.answered ? Math.round((d.totals.correct / d.totals.answered) * 100) : 0;
    var totalLessons = Curriculum.totalLessons();

    var gradeRows = Curriculum.GRADES.map(function (g) {
      var gs = Progress.gradeState(g.id);
      var lessons = Curriculum.lessonsFor(g.id).length;
      var doneL = Progress.lessonsDoneInGrade(g.id);
      var acc = gs.answered ? Math.round((gs.correct / gs.answered) * 100) : 0;
      var pct = Math.round((doneL / lessons) * 100);

      var row = el('div', { class: 'grade-progress-row' }, [
        el('div', { class: 'ring', style: { '--p': String(pct), background: 'conic-gradient(' + g.color + ' ' + pct + '%, #EDE8F8 0)' } }, [
          el('b', { style: { color: g.dark }, text: pct + '%' })
        ]),
        el('div', {}, [
          el('div', { class: 'gp-name', text: g.emoji + ' ' + g.name + ' · ' + g.title }),
          el('div', { class: 'gp-meta', text: doneL + '/' + lessons + ' lessons · ' + gs.answered + ' questions · ' + acc + '% correct' }),
          el('div', { class: 'gp-bars' }, [
            levelBar('easy', Math.min(gs.levelCorrect.easy, Progress.UNLOCK_AT), Progress.UNLOCK_AT, 'easy'),
            levelBar('medium', Math.min(gs.levelCorrect.medium, Progress.UNLOCK_AT), Progress.UNLOCK_AT, 'medium'),
            levelBar('challenge', gs.stars.challenge, 3, 'challenge')
          ])
        ])
      ]);
      row.addEventListener('click', function () { Progress.setGrade(g.id); App.go('learn'); });
      row.style.cursor = 'pointer';
      return row;
    });

    var resetBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: '🗑️ Start over' });
    resetBtn.addEventListener('click', function () {
      var m = U.modal([
        el('h2', { text: 'Start over?' }),
        el('p', { text: 'This clears every star, badge and lesson tick. It cannot be undone.' }),
        el('div', { class: 'row row-end' }, [
          el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Keep my progress', onclick: function () { m.close(); } }),
          el('button', {
            class: 'btn btn-pink btn-sm', type: 'button', text: 'Yes, clear it',
            onclick: function () { m.close(); Progress.reset(); U.toast('🧹', 'Fresh start!', 'All progress cleared.'); App.go('home'); }
          })
        ])
      ]);
    });

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }], 'My Progress'),
        el('div', { class: 'hero', style: { background: 'linear-gradient(135deg,#12BFB4,#3AA0FF)' } }, [
          el('span', { class: 'hero-mascot', text: '📈' }),
          el('h1', { style: { fontSize: 'clamp(28px,6vw,46px)' }, text: 'My Progress' }),
          el('p', { text: 'Every question you answer makes this grow.' })
        ]),
        el('div', { class: 'stats-grid' }, [
          statCard('❓', d.totals.answered, 'Questions done'),
          statCard('✅', d.totals.correct, 'Correct answers'),
          statCard('🎯', accuracy + '%', 'Accuracy'),
          statCard('📚', d.totals.lessons + '/' + totalLessons, 'Lessons finished'),
          statCard('🔥', d.daily.streak, 'Day streak'),
          statCard('⚡', d.maxStreak, 'Best run'),
          statCard('🏅', Badges.earnedCount() + '/' + Badges.total, 'Badges'),
          statCard('🎮', d.totals.sessions, 'Rounds played')
        ]),
        el('div', { class: 'section-head' }, [
          el('h2', { text: '🛤️ Your learning paths' }),
          el('span', { class: 'hint-text', text: 'Tap a path to jump into it' })
        ]),
        el('div', { class: 'stack' }, gradeRows),
        el('div', { class: 'card card-tight' }, [
          el('h3', { class: 'card-title' }, [el('span', { class: 'emoji', text: '🏅' }), el('span', { text: 'Latest badges' })]),
          Badges.earnedCount() === 0
            ? el('div', { class: 'empty-note', text: 'No badges yet — finish a lesson or a practice round to earn your first one!' })
            : el('div', { class: 'badge-grid' }, Badges.LIST.filter(function (b) { return Progress.hasBadge(b.id); })
                .slice(-4).map(function (b) { return badgeCard(b, true); })),
          el('div', { class: 'row row-end' }, [
            el('button', { class: 'btn btn-yellow btn-sm', type: 'button', text: 'See all badges ▶', onclick: function () { App.go('achievements'); } })
          ])
        ]),
        el('div', { class: 'row row-end' }, [resetBtn])
      ])
    ]);
  }

  function badgeCard(b, earned) {
    var d = Progress.get();
    var t = b.track(d);
    var pct = Math.min(100, Math.round((t.have / t.need) * 100));
    return el('div', { class: 'badge' + (earned ? ' is-earned' : '') }, [
      el('div', { class: 'b-icon', text: b.icon }),
      el('div', { class: 'b-name', text: b.name }),
      el('div', { class: 'b-desc', text: b.desc }),
      earned
        ? el('span', { class: 'tag tag-green', text: 'Earned!' })
        : el('div', { class: 'b-track' }, [el('i', { style: { width: pct + '%' } })]),
      earned ? null : el('div', { class: 'b-desc', text: Math.min(t.have, t.need) + ' / ' + t.need })
    ]);
  }

  function achievements() {
    var earnedFirst = Badges.LIST.slice().sort(function (a, b) {
      var ea = Progress.hasBadge(a.id) ? 0 : 1, eb = Progress.hasBadge(b.id) ? 0 : 1;
      return ea - eb;
    });
    var count = Badges.earnedCount();
    var pct = Math.round((count / Badges.total) * 100);

    return el('div', { class: 'screen' }, [
      el('div', { class: 'wrap stack' }, [
        App.crumb([{ label: '🏠 Home', to: 'home' }], 'Achievements'),
        el('div', { class: 'hero', style: { background: 'linear-gradient(135deg,#FFD23F,#FF9F1C)' } }, [
          el('span', { class: 'hero-mascot', text: '🏅' }),
          el('h1', { style: { fontSize: 'clamp(28px,6vw,46px)' }, text: 'Achievements' }),
          el('p', { text: count + ' of ' + Badges.total + ' badges earned' }),
          el('div', { class: 'progress-track', style: { marginTop: '10px', background: 'rgba(255,255,255,.35)' } }, [
            el('i', { style: { width: pct + '%', background: '#fff' } })
          ])
        ]),
        el('div', { class: 'badge-grid' }, earnedFirst.map(function (b) {
          return badgeCard(b, Progress.hasBadge(b.id));
        })),
        el('div', { class: 'mascot-say' }, [
          el('span', { class: 'ms-face', text: '🐨' }),
          el('span', { class: 'ms-text', text: 'Badges arrive on their own while you learn — no need to chase them!' })
        ])
      ])
    ]);
  }

  return { dashboard: dashboard, achievements: achievements };
})();

/* ==========================================================================
   badges.js — achievement definitions. Each badge reports its own progress
   so the Achievements screen can show "7 / 10" style tracks for locked ones.
   ========================================================================== */
window.Badges = (function () {
  'use strict';

  function n(v) { return v || 0; }

  var LIST = [
    { id: 'first-lesson', icon: '🌱', name: 'First Steps', desc: 'Finish your first lesson',
      track: function (d) { return { have: n(d.totals.lessons), need: 1 }; } },

    { id: 'bookworm', icon: '📗', name: 'Bookworm', desc: 'Finish 3 lessons',
      track: function (d) { return { have: n(d.totals.lessons), need: 3 }; } },

    { id: 'grade-graduate', icon: '🎓', name: 'Grade Graduate', desc: 'Finish every lesson in one grade',
      track: function (d) {
        var best = 0;
        for (var g = 1; g <= 6; g++) best = Math.max(best, Progress.lessonsDoneInGrade(g));
        return { have: best, need: 3 };
      } },

    { id: 'master-learner', icon: '🏛️', name: 'Master Learner', desc: 'Finish all 18 lessons',
      track: function (d) { return { have: n(d.totals.lessons), need: 18 }; } },

    { id: 'warm-up', icon: '✏️', name: 'Warm Up', desc: 'Finish one practice round',
      track: function (d) { return { have: n(d.totals.sessions), need: 1 }; } },

    { id: 'perfect-round', icon: '💯', name: 'Perfect Round', desc: 'Get every question right in a round',
      track: function (d) { return { have: d.flags.perfectRound ? 1 : 0, need: 1 }; } },

    { id: 'solo-solver', icon: '🦉', name: 'Solo Solver', desc: 'A perfect round with no hints',
      track: function (d) { return { have: d.flags.hintlessPerfect ? 1 : 0, need: 1 }; } },

    { id: 'on-fire', icon: '🔥', name: 'On Fire', desc: '10 correct answers in a row',
      track: function (d) { return { have: n(d.maxStreak), need: 10 }; } },

    { id: 'unstoppable', icon: '⚡', name: 'Unstoppable', desc: '20 correct answers in a row',
      track: function (d) { return { have: n(d.maxStreak), need: 20 }; } },

    { id: 'fifty-club', icon: '⭐', name: 'Fifty Club', desc: 'Answer 50 questions',
      track: function (d) { return { have: n(d.totals.answered), need: 50 }; } },

    { id: 'marathon', icon: '🌟', name: 'Marathon', desc: 'Answer 250 questions',
      track: function (d) { return { have: n(d.totals.answered), need: 250 }; } },

    { id: 'brain-power', icon: '🧠', name: 'Brain Power', desc: 'Get 100 answers correct',
      track: function (d) { return { have: n(d.totals.correct), need: 100 }; } },

    { id: 'level-up', icon: '🔓', name: 'Level Up', desc: 'Unlock Medium in any grade',
      track: function (d) {
        var any = 0;
        Object.keys(d.grades).forEach(function (g) { if (d.grades[g].unlocked && d.grades[g].unlocked.medium) any = 1; });
        return { have: any, need: 1 };
      } },

    { id: 'challenge-ready', icon: '🚀', name: 'Challenge Ready', desc: 'Unlock Challenge in any grade',
      track: function (d) {
        var any = 0;
        Object.keys(d.grades).forEach(function (g) { if (d.grades[g].unlocked && d.grades[g].unlocked.challenge) any = 1; });
        return { have: any, need: 1 };
      } },

    { id: 'champion', icon: '🏆', name: 'Champion', desc: 'Earn 3 stars in a Challenge',
      track: function (d) { return { have: d.flags.threeStar ? 1 : 0, need: 1 }; } },

    { id: 'remainder-ranger', icon: '🍕', name: 'Remainder Ranger', desc: '15 remainder questions correct',
      track: function (d) { return { have: n(d.tags.remainder), need: 15 }; } },

    { id: 'decimal-detective', icon: '🔢', name: 'Decimal Detective', desc: '10 decimal questions correct',
      track: function (d) { return { have: n(d.tags.decimal), need: 10 }; } },

    { id: 'fraction-flipper', icon: '🥧', name: 'Fraction Flipper', desc: '10 fraction questions correct',
      track: function (d) { return { have: n(d.tags.fraction), need: 10 }; } },

    { id: 'story-solver', icon: '📖', name: 'Story Solver', desc: '25 word problems correct',
      track: function (d) { return { have: n(d.tags.word), need: 25 }; } },

    { id: 'explorer', icon: '🗺️', name: 'Explorer', desc: 'Visit all 6 grade paths',
      track: function (d) {
        var c = 0;
        Object.keys(d.grades).forEach(function (g) { if (d.grades[g].visited) c++; });
        return { have: c, need: 6 };
      } },

    { id: 'three-day', icon: '📅', name: 'Three Day Streak', desc: 'Practise 3 days in a row',
      track: function (d) { return { have: n(d.daily.best), need: 3 }; } },

    { id: 'week-warrior', icon: '☀️', name: 'Week Warrior', desc: 'Practise 7 days in a row',
      track: function (d) { return { have: n(d.daily.best), need: 7 }; } }
  ];

  var byId = {};
  LIST.forEach(function (b) { byId[b.id] = b; });

  /* Re-checks every badge; returns the ones newly earned right now. */
  function check() {
    var d = Progress.get();
    var earned = [];
    LIST.forEach(function (b) {
      if (Progress.hasBadge(b.id)) return;
      var t = b.track(d);
      if (t.have >= t.need) {
        if (Progress.earnBadge(b.id)) earned.push(b);
      }
    });
    return earned;
  }

  function celebrate(list) {
    if (!list || !list.length) return;
    list.forEach(function (b, i) {
      setTimeout(function () {
        U.Sound.badge();
        U.toast(b.icon, 'Badge earned: ' + b.name, b.desc, 4200);
      }, i * 700);
    });
    U.confetti({ count: 90, emojis: ['🏅', '⭐', '🎉'] });
  }

  function earnedCount() {
    var d = Progress.get();
    return Object.keys(d.badges || {}).length;
  }

  return { LIST: LIST, byId: byId, check: check, celebrate: celebrate, earnedCount: earnedCount, total: LIST.length };
})();

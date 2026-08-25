/* ==========================================================================
   state.js — the whole progress system, saved to localStorage.
   Tracks: questions completed, correct answers, current grade, lessons
   completed, practice streak, badges earned, and per-grade unlocks.
   ========================================================================== */
window.Progress = (function () {
  'use strict';

  var KEY = 'divisionAdventure.v1';
  var LEVELS = ['easy', 'medium', 'challenge'];
  var UNLOCK_AT = 10;   /* correct answers needed in a level to open the next */

  function freshGrade() {
    return {
      visited: false,
      answered: 0,
      correct: 0,
      unlocked: { easy: true, medium: false, challenge: false },
      levelCorrect: { easy: 0, medium: 0, challenge: 0 },
      stars: { easy: 0, medium: 0, challenge: 0 },
      best: { easy: 0, medium: 0, challenge: 0 }
    };
  }

  function fresh() {
    return {
      version: 1,
      name: '',
      grade: 1,
      sound: true,
      totals: { answered: 0, correct: 0, hints: 0, sessions: 0, lessons: 0, challenges: 0 },
      maxStreak: 0,
      tags: {},
      lessons: {},
      grades: {},
      challenges: {},
      badges: {},
      daily: { last: null, streak: 0, best: 0, days: [] },
      flags: { perfectRound: false, hintlessPerfect: false, threeStar: false }
    };
  }

  var data = load();

  function load() {
    var base = fresh();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var saved = JSON.parse(raw);
      /* shallow-merge so new fields appear for returning students */
      Object.keys(base).forEach(function (k) {
        if (saved[k] === undefined) return;
        if (typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k])) {
          base[k] = Object.assign({}, base[k], saved[k]);
        } else {
          base[k] = saved[k];
        }
      });
      return base;
    } catch (e) {
      return base;
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode — run in memory */ }
    listeners.forEach(function (fn) { try { fn(data); } catch (e) {} });
  }

  var listeners = [];
  function onChange(fn) { listeners.push(fn); }

  function get() { return data; }

  function gradeState(g) {
    if (!data.grades[g]) data.grades[g] = freshGrade();
    var gs = data.grades[g];
    if (!gs.levelCorrect) gs.levelCorrect = { easy: 0, medium: 0, challenge: 0 };
    if (!gs.unlocked) gs.unlocked = { easy: true, medium: false, challenge: false };
    if (!gs.stars) gs.stars = { easy: 0, medium: 0, challenge: 0 };
    if (!gs.best) gs.best = { easy: 0, medium: 0, challenge: 0 };
    return gs;
  }

  function setGrade(g) {
    data.grade = g;
    gradeState(g).visited = true;
    save();
  }

  function currentGrade() { return data.grade; }

  function setName(n) { data.name = n; save(); }
  function setSound(on) { data.sound = !!on; save(); }

  /* ---------- daily streak ---------------------------------------------- */
  function touchDay() {
    var today = U.todayKey();
    var d = data.daily;
    if (d.last === today) return false;
    var gap = U.daysBetween(d.last, today);
    if (gap === 1) d.streak += 1;
    else d.streak = 1;
    d.last = today;
    d.best = Math.max(d.best || 0, d.streak);
    d.days = (d.days || []).concat([today]).slice(-60);
    save();
    return true;
  }

  /* ---------- answers ---------------------------------------------------- */
  /* opts: {grade, difficulty, correct, tags:[], usedHint} */
  function recordAnswer(opts) {
    var gs = gradeState(opts.grade);
    data.totals.answered += 1;
    gs.answered += 1;
    if (opts.usedHint) data.totals.hints += 1;
    if (opts.correct) {
      data.totals.correct += 1;
      gs.correct += 1;
      if (opts.difficulty && gs.levelCorrect[opts.difficulty] !== undefined) {
        gs.levelCorrect[opts.difficulty] += 1;
      }
      (opts.tags || []).forEach(function (t) {
        data.tags[t] = (data.tags[t] || 0) + 1;
      });
    }
    /* unlocks */
    var unlockedNow = [];
    for (var i = 0; i < LEVELS.length - 1; i++) {
      var cur = LEVELS[i], next = LEVELS[i + 1];
      if (!gs.unlocked[next] && gs.levelCorrect[cur] >= UNLOCK_AT) {
        gs.unlocked[next] = true;
        unlockedNow.push(next);
      }
    }
    save();
    return { unlocked: unlockedNow };
  }

  function recordStreak(n) {
    if (n > (data.maxStreak || 0)) { data.maxStreak = n; save(); }
  }

  /* ---------- sessions --------------------------------------------------- */
  /* opts: {grade, difficulty, correct, total, hintsUsed, kind} */
  function finishSession(opts) {
    data.totals.sessions += 1;
    var gs = gradeState(opts.grade);
    var pct = opts.total ? opts.correct / opts.total : 0;
    var stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
    if (opts.difficulty && gs.stars[opts.difficulty] !== undefined) {
      gs.stars[opts.difficulty] = Math.max(gs.stars[opts.difficulty], stars);
      gs.best[opts.difficulty] = Math.max(gs.best[opts.difficulty], opts.correct);
    }
    if (opts.total >= 10 && opts.correct === opts.total) {
      data.flags.perfectRound = true;
      if (!opts.hintsUsed) data.flags.hintlessPerfect = true;
    }
    touchDay();
    save();
    return stars;
  }

  function finishChallenge(opts) {
    data.totals.challenges += 1;
    var key = 'g' + opts.grade + ':' + opts.mode;
    var prev = data.challenges[key] || { stars: 0, best: 0, plays: 0 };
    prev.stars = Math.max(prev.stars, opts.stars || 0);
    prev.best = Math.max(prev.best, opts.score || 0);
    prev.plays = (prev.plays || 0) + 1;
    data.challenges[key] = prev;
    if ((opts.stars || 0) >= 3) data.flags.threeStar = true;
    touchDay();
    save();
    return prev;
  }

  /* ---------- lessons ---------------------------------------------------- */
  function completeLesson(id) {
    if (data.lessons[id] && data.lessons[id].done) return false;
    data.lessons[id] = { done: true, at: Date.now() };
    data.totals.lessons = Object.keys(data.lessons).length;
    touchDay();
    save();
    return true;
  }
  function lessonDone(id) { return !!(data.lessons[id] && data.lessons[id].done); }
  function lessonsDoneInGrade(gradeId) {
    return Object.keys(data.lessons).filter(function (id) {
      return id.indexOf('g' + gradeId + '-') === 0 && data.lessons[id].done;
    }).length;
  }

  /* ---------- badges ------------------------------------------------------ */
  function earnBadge(id) {
    if (data.badges[id]) return false;
    data.badges[id] = { at: Date.now() };
    save();
    return true;
  }
  function hasBadge(id) { return !!data.badges[id]; }

  function reset() {
    data = fresh();
    save();
  }

  return {
    LEVELS: LEVELS,
    UNLOCK_AT: UNLOCK_AT,
    get: get,
    save: save,
    onChange: onChange,
    gradeState: gradeState,
    setGrade: setGrade,
    currentGrade: currentGrade,
    setName: setName,
    setSound: setSound,
    touchDay: touchDay,
    recordAnswer: recordAnswer,
    recordStreak: recordStreak,
    finishSession: finishSession,
    finishChallenge: finishChallenge,
    completeLesson: completeLesson,
    lessonDone: lessonDone,
    lessonsDoneInGrade: lessonsDoneInGrade,
    earnBadge: earnBadge,
    hasBadge: hasBadge,
    reset: reset
  };
})();

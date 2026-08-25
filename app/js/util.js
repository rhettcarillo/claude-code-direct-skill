/* ==========================================================================
   util.js — DOM helpers, random helpers, number parsing, sound, confetti.
   Everything hangs off the global `U` so the app can run from file:// with
   no build step and no module loader.
   ========================================================================== */
window.U = (function () {
  'use strict';

  /* ---------- DOM ------------------------------------------------------- */
  function el(tag, props, children) {
    var node = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style' && typeof v === 'object') {
        Object.keys(v).forEach(function (s) {
          if (s.indexOf('--') === 0) node.style.setProperty(s, v[s]);
          else node.style[s] = v[s];
        });
      }
      else if (k === 'dataset') { Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; }); }
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    add(node, children);
    return node;
  }

  function add(parent, child) {
    if (child === null || child === undefined || child === false) return parent;
    if (Array.isArray(child)) { child.forEach(function (c) { add(parent, c); }); return parent; }
    parent.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
    return parent;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Random ---------------------------------------------------- */
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) { return shuffle(arr.slice()).slice(0, n); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* Weighted choice: items = [{w: 3, v: x}, ...] */
  function weighted(items) {
    var total = items.reduce(function (s, i) { return s + (i.w || 1); }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < items.length; i++) {
      r -= (items[i].w || 1);
      if (r <= 0) return items[i].v;
    }
    return items[items.length - 1].v;
  }

  /* ---------- Numbers --------------------------------------------------- */
  /* Accepts "12", "1.5", "3/4", "1 1/2", "1,200". Returns NaN if unreadable. */
  function parseNumeric(raw) {
    if (typeof raw === 'number') return raw;
    if (raw === null || raw === undefined) return NaN;
    var s = String(raw).trim().toLowerCase()
      .replace(/,/g, '')
      .replace(/[$£€]/g, '')
      .replace(/\s+/g, ' ');
    if (!s) return NaN;
    var m = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);           /* mixed number */
    if (m) {
      var sign = s.charAt(0) === '-' ? -1 : 1;
      return sign * (Math.abs(parseInt(m[1], 10)) + parseInt(m[2], 10) / parseInt(m[3], 10));
    }
    m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);                        /* fraction */
    if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
    m = s.match(/^-?(\d+\.?\d*|\.\d+)$/);                         /* plain number */
    if (m) return parseFloat(s);
    return NaN;
  }

  function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-6 : tol); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function simplify(n, d) { var g = gcd(n, d) || 1; return [n / g, d / g]; }
  function fmt(n) {
    if (!isFinite(n)) return String(n);
    var r = Math.round(n * 1e6) / 1e6;
    return String(r);
  }
  function money(n) { return '$' + n.toFixed(2); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  /* ---------- Text ------------------------------------------------------ */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Sound (tiny WebAudio blips, no assets) --------------------- */
  var actx = null;
  function ctx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
    return actx;
  }
  function tone(freq, start, dur, type, vol) {
    var c = ctx();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.03);
  }
  var Sound = {
    enabled: function () { return true; },              /* replaced by app once state loads */
    play: function (notes) {
      if (!Sound.enabled()) return;
      try { notes.forEach(function (n) { tone(n[0], n[1], n[2], n[3], n[4]); }); } catch (e) {}
    },
    click:   function () { Sound.play([[520, 0, 0.07, 'triangle', 0.08]]); },
    correct: function () { Sound.play([[660, 0, 0.1, 'sine', 0.14], [880, 0.09, 0.14, 'sine', 0.14]]); },
    wrong:   function () { Sound.play([[330, 0, 0.12, 'sine', 0.1], [262, 0.11, 0.18, 'sine', 0.1]]); },
    badge:   function () { Sound.play([[784, 0, 0.1, 'triangle', 0.13], [988, 0.1, 0.1, 'triangle', 0.13], [1319, 0.2, 0.24, 'triangle', 0.13]]); },
    win:     function () { Sound.play([[523, 0, 0.12, 'triangle', 0.13], [659, 0.12, 0.12, 'triangle', 0.13], [784, 0.24, 0.12, 'triangle', 0.13], [1047, 0.36, 0.34, 'triangle', 0.14]]); },
    pop:     function () { Sound.play([[440, 0, 0.06, 'square', 0.06]]); }
  };

  /* ---------- Confetti --------------------------------------------------- */
  var confettiRunning = false;
  function confetti(opts) {
    opts = opts || {};
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    var g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colors = ['#7C5CFF', '#FF6FB5', '#FF9F1C', '#12BFB4', '#FFD23F', '#3AA0FF', '#35C46A'];
    var emojis = opts.emojis || ['⭐', '🎉', '✨', '🌟'];
    var count = opts.count || 130;
    var W = window.innerWidth, H = window.innerHeight;
    var parts = [];
    for (var i = 0; i < count; i++) {
      var useEmoji = Math.random() < 0.18;
      parts.push({
        x: W * (0.15 + Math.random() * 0.7),
        y: H * 0.32 + (Math.random() * 60 - 30),
        vx: (Math.random() - 0.5) * 11,
        vy: -7 - Math.random() * 11,
        g: 0.28 + Math.random() * 0.12,
        size: 7 + Math.random() * 9,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
        emoji: useEmoji ? emojis[i % emojis.length] : null,
        life: 0
      });
    }
    var maxLife = opts.duration || 150;
    confettiRunning = true;
    function frame() {
      g.clearRect(0, 0, W, H);
      var alive = 0;
      parts.forEach(function (p) {
        p.life++;
        p.vy += p.g;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < H + 40 && p.life < maxLife) alive++;
        var fade = Math.max(0, 1 - p.life / maxLife);
        g.save();
        g.globalAlpha = fade;
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        if (p.emoji) {
          g.font = (p.size * 2.4) + 'px serif';
          g.textAlign = 'center';
          g.fillText(p.emoji, 0, 0);
        } else {
          g.fillStyle = p.color;
          g.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        g.restore();
      });
      if (alive > 0) { requestAnimationFrame(frame); }
      else { g.clearRect(0, 0, W, H); confettiRunning = false; }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Toast ------------------------------------------------------ */
  function toast(icon, title, sub, ms) {
    var host = document.getElementById('toast-host');
    if (!host) return;
    var node = el('div', { class: 'toast' }, [
      el('span', { class: 't-icon', text: icon }),
      el('div', {}, [
        el('div', { text: title }),
        sub ? el('div', { class: 't-sub', text: sub }) : null
      ])
    ]);
    host.appendChild(node);
    setTimeout(function () {
      node.classList.add('out');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 320);
    }, ms || 3200);
  }

  /* ---------- Modal ------------------------------------------------------ */
  function modal(content, opts) {
    opts = opts || {};
    var host = document.getElementById('modal-host');
    clear(host);
    host.hidden = false;
    var box = el('div', { class: 'modal' }, content);
    host.appendChild(box);
    function close() { host.hidden = true; clear(host); }
    host.onclick = function (e) { if (e.target === host && opts.dismissable !== false) close(); };
    return { close: close, box: box };
  }

  /* ---------- Misc ------------------------------------------------------- */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(aKey, bKey) {
    if (!aKey || !bKey) return null;
    var a = new Date(aKey + 'T00:00:00');
    var b = new Date(bKey + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  return {
    el: el, add: add, clear: clear, $: $, $$: $$,
    randInt: randInt, pick: pick, pickN: pickN, shuffle: shuffle, weighted: weighted,
    parseNumeric: parseNumeric, near: near, gcd: gcd, simplify: simplify, fmt: fmt,
    money: money, plural: plural, cap: cap,
    Sound: Sound, confetti: confetti, toast: toast, modal: modal,
    todayKey: todayKey, daysBetween: daysBetween, delay: delay
  };
})();

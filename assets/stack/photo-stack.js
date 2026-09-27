/*
 * Photo stack — turns each .stage .grid of photos on a job page into a pile of
 * prints. Swipe the top one off either way, or tap it, and it goes to the
 * bottom of the pile; the next one is on top. Arrow keys, Space and Enter do
 * the same for a keyboard.
 *
 * Vertical swipes are left to the page: a drag only belongs to the stack once
 * it is clearly sideways, so nobody gets trapped scrolling past a job.
 *
 * Progressive: this rearranges the grid's own <figure>s, so without it the
 * page is the grid it always was.
 */
(function () {
  'use strict';

  var PILE = [ // how the prints under the top one sit: y offset, scale, tilt
    [0, 1, 0],
    [11, 0.965, -2.4],
    [21, 0.93, 2.1],
    [29, 0.9, -1.2]
  ];
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function build(grid) {
    var figs = Array.prototype.slice.call(grid.children).filter(function (el) {
      return el.tagName === 'FIGURE' && el.querySelector('img');
    });
    if (figs.length < 2) return;

    var wrap = document.createElement('div');
    wrap.className = 'pstack';
    var deck = document.createElement('div');
    deck.className = 'pstack-deck';
    deck.tabIndex = 0;
    deck.setAttribute('role', 'group');
    deck.setAttribute('aria-roledescription', 'photo stack');
    deck.setAttribute('aria-label', figs.length + ' photos. Swipe, tap, or press the arrow keys for the next one.');
    var foot = document.createElement('div');
    foot.className = 'pstack-foot';
    var count = document.createElement('span');
    count.className = 'pstack-count';
    var hint = document.createElement('span');
    hint.className = 'pstack-hint';
    hint.textContent = 'Swipe through';
    foot.appendChild(count);
    foot.appendChild(hint);
    wrap.appendChild(deck);
    wrap.appendChild(foot);

    figs.forEach(function (fig) {
      var img = fig.querySelector('img');
      var fill = document.createElement('div');
      fill.className = 'pstack-fill';
      fig.insertBefore(fill, fig.firstChild);
      fig.classList.add('pstack-card');
      fig.setAttribute('aria-hidden', 'true');
      var setFill = function () { fill.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")'; };
      if (img.complete && img.naturalWidth) setFill(); else img.addEventListener('load', setFill, { once: true });
      deck.appendChild(fig);
    });
    grid.parentNode.replaceChild(wrap, grid);

    // The deck takes the shape of its first photo, held between 3:4 and 4:3.
    var first = figs[0].querySelector('img');
    function shape() {
      if (!first.naturalWidth) return;
      var ar = Math.max(0.75, Math.min(1.3334, first.naturalWidth / first.naturalHeight));
      deck.style.setProperty('--ar', ar.toFixed(4));
    }
    first.loading = 'eager';
    if (first.complete) shape(); else first.addEventListener('load', shape, { once: true });

    var order = figs.slice(); // order[0] is the print on top

    function layout(except) {
      order.forEach(function (fig, i) {
        if (fig === except) return;
        var p = PILE[Math.min(i, PILE.length - 1)];
        fig.style.zIndex = String(order.length - i);
        fig.style.opacity = i < PILE.length ? '1' : '0';
        fig.style.transform = 'translateY(' + p[0] + 'px) scale(' + p[1] + ') rotate(' + p[2] + 'deg)';
        fig.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
        // The next prints load ahead of being needed, so a swipe never shows a
        // blank card.
        if (i < 3) { var im = fig.querySelector('img'); if (im.loading === 'lazy') im.loading = 'eager'; }
      });
      count.textContent = pad(figs.indexOf(order[0]) + 1) + ' / ' + pad(figs.length);
    }

    function toBottom(dir) {
      var top = order[0];
      order = order.slice(1).concat(top);
      wrap.classList.add('touched');
      if (reduced) { layout(); return; }
      var w = deck.clientWidth;
      // Off the side, then in under the pile from the side it left.
      top.classList.remove('is-dragging');
      top.style.transform = 'translateX(' + (dir * w * 1.15) + 'px) rotate(' + (dir * 16) + 'deg)';
      layout(top);
      setTimeout(function () {
        top.style.zIndex = '0';
        var p = PILE[Math.min(order.length - 1, PILE.length - 1)];
        top.style.transform = 'translateX(' + (dir * w * 0.35) + 'px) translateY(' + p[0] + 'px) scale(' + p[1] + ') rotate(' + (dir * 6) + 'deg)';
        setTimeout(function () { layout(); }, 30);
      }, 260);
    }

    // Pointer handling: a sideways drag moves the top print; anything else is
    // the page scrolling, and is left alone.
    var start = null;
    deck.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, dragging: false };
    });
    deck.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!start.dragging) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          start.dragging = true;
          try { deck.setPointerCapture(e.pointerId); } catch (err) { /* already gone */ }
          order[0].classList.add('is-dragging');
        } else if (Math.abs(dy) > 10) { start = null; return; }
        else return;
      }
      order[0].style.transform = 'translate(' + dx + 'px,' + (dy * 0.2) + 'px) rotate(' + (dx * 0.045) + 'deg)';
    });
    function end(e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.x, dt = Math.max(1, Date.now() - start.t);
      var was = start; start = null;
      if (!was.dragging) {
        // A tap: the top print goes to the back.
        if (Math.abs(dx) < 8 && dt < 500) toBottom(1);
        return;
      }
      order[0].classList.remove('is-dragging');
      var w = deck.clientWidth;
      // Far enough, or a real flick: fast AND a proper distance, so a quick
      // nudge springs back instead of throwing the print.
      if (Math.abs(dx) > w * 0.22 || (Math.abs(dx) > 48 && Math.abs(dx) / dt > 0.5)) toBottom(dx < 0 ? -1 : 1);
      else layout();
    }
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', function () {
      if (start && start.dragging) { order[0].classList.remove('is-dragging'); layout(); }
      start = null;
    });
    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toBottom(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); toBottom(-1); }
    });

    layout();
  }

  function init() {
    document.querySelectorAll('.stage .grid').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

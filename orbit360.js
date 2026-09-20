/*
 * PHAÖRA — orbit viewer.
 *
 * Twelve frames shot around a piece on a turntable, every thirty degrees,
 * matted off the cloth so the stone sits on the page rather than in a
 * photograph of a room. Drag to turn it.
 *
 * Deliberately not a 3D model: the frames ARE the piece, lit the way it was
 * actually lit, with the translucency a rendered mesh never gets right.
 *
 * Usage:
 *   Orbit360.mount(container, { dir: 'sculpture/360/IMG_0976', frames: 12 })
 *
 * The container gets a fixed aspect from the first frame, so the layout does
 * not jump once the rest arrive.
 */
(function (global) {
  'use strict';

  var CSS = [
    '.orbit360{position:relative;width:100%;height:100%;overflow:hidden;',
    'cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}',
    '.orbit360.is-dragging{cursor:grabbing}',
    '.orbit360 img{position:absolute;inset:0;width:100%;height:100%;',
    'object-fit:contain;opacity:0;pointer-events:none;',
    'transition:opacity .06s linear}',
    '.orbit360 img.is-on{opacity:1}',
    '.orbit360-hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);',
    'display:flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;',
    'background:rgba(0,0,0,.42);backdrop-filter:blur(6px);',
    'font-size:10px;letter-spacing:.18em;text-transform:uppercase;',
    'color:rgba(255,255,255,.86);pointer-events:none;',
    'transition:opacity .45s ease}',
    '.orbit360-hint.is-gone{opacity:0}',
    '.orbit360-hint svg{width:13px;height:13px;flex:none}',
    '@media (prefers-reduced-motion:reduce){.orbit360 img{transition:none}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('orbit360-css')) return;
    var s = document.createElement('style');
    s.id = 'orbit360-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var HINT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"' +
    ' stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9 5 4 12l5 7"/><path d="m15 5 5 7-5 7"/></svg><span>Drag to turn</span>';

  function mount(container, opts) {
    if (!container || !opts || !opts.dir) return null;
    injectCSS();

    var total = opts.frames || 12;
    var ext = opts.ext || 'webp';
    var dir = opts.dir.replace(/\/$/, '');

    var root = document.createElement('div');
    root.className = 'orbit360';
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', (opts.label || 'The piece') + ', rotating view');

    var imgs = [];
    for (var i = 1; i <= total; i++) {
      var im = document.createElement('img');
      im.src = dir + '/f_' + String(i).padStart(2, '0') + '.' + ext;
      // The first frame carries the weight; the rest can arrive when they do.
      im.loading = i === 1 ? 'eager' : 'lazy';
      im.decoding = 'async';
      im.alt = '';
      if (i === 1) im.className = 'is-on';
      root.appendChild(im);
      imgs.push(im);
    }

    var hint = document.createElement('div');
    hint.className = 'orbit360-hint';
    hint.innerHTML = HINT;
    root.appendChild(hint);

    container.innerHTML = '';
    container.appendChild(root);

    var frame = 0;
    var dragging = false;
    var startX = 0;
    var startFrame = 0;
    var moved = false;

    function show(n) {
      // Wrap both ways so the turntable has no seam.
      n = ((n % total) + total) % total;
      if (n === frame) return;
      imgs[frame].classList.remove('is-on');
      imgs[n].classList.add('is-on');
      frame = n;
    }

    function hideHint() {
      if (!hint.classList.contains('is-gone')) hint.classList.add('is-gone');
    }

    // A full sweep of the container turns the piece all the way round, so the
    // gesture matches the object regardless of how wide it is rendered.
    function stepFrom(dx) {
      var w = root.clientWidth || 1;
      return startFrame + Math.round((dx / w) * total * 1.35);
    }

    function down(x) {
      dragging = true;
      moved = false;
      startX = x;
      startFrame = frame;
      root.classList.add('is-dragging');
    }

    function move(x) {
      if (!dragging) return;
      var dx = x - startX;
      if (Math.abs(dx) > 3) {
        moved = true;
        hideHint();
      }
      show(stepFrom(dx));
    }

    function up() {
      dragging = false;
      root.classList.remove('is-dragging');
    }

    root.addEventListener('mousedown', function (e) {
      e.preventDefault();
      down(e.clientX);
    });
    window.addEventListener('mousemove', function (e) {
      move(e.clientX);
    });
    window.addEventListener('mouseup', up);

    root.addEventListener('touchstart', function (e) {
      down(e.touches[0].clientX);
    }, { passive: true });
    root.addEventListener('touchmove', function (e) {
      // Only claim the gesture once it is clearly horizontal, so the page
      // still scrolls when someone swipes down the phone.
      var dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 8 && e.cancelable) e.preventDefault();
      move(e.touches[0].clientX);
    }, { passive: false });
    root.addEventListener('touchend', up);
    root.addEventListener('touchcancel', up);

    // Keyboard, because a drag-only control is a control some people cannot use.
    root.tabIndex = 0;
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(frame - 1); hideHint(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { show(frame + 1); hideHint(); e.preventDefault(); }
    });

    // One slow turn on first view, so it reads as turnable without being asked
    // to. Stops the moment it is touched, and never runs for a visitor who has
    // asked for less motion.
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && opts.autospin !== false) {
      var spun = 0;
      var timer = setInterval(function () {
        if (moved || spun >= total) {
          clearInterval(timer);
          if (spun >= total) setTimeout(hideHint, 1200);
          return;
        }
        spun++;
        show(frame + 1);
      }, 110);
    }

    return {
      el: root,
      show: show,
      get frame() { return frame; }
    };
  }

  global.Orbit360 = { mount: mount };
})(window);

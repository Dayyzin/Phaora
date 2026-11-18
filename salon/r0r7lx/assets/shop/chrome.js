// The house chrome on every salon page (David, 18 Nov): the logo (the lettering, inlined, never typed), the menu
// (celine.com), the footer (maison margiela) and the sign-up panel (celine.com). Contact details, links and the
// register endpoint are the site's own; nothing here is new.
(function () {
  var D = document, H = D.documentElement, B = D.body;
  var BASE = (D.querySelector('meta[name="salon-base"]') || { content: './' }).content;
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // the logo: the wordmark the salon already uses (assets/logo), in the page's ink
  fetch(BASE + 'assets/logo/wordmark-dark.svg').then(function (r) { return r.text(); }).then(function (t) {
    var svg = t.replace(/<!--[\s\S]*?-->/g, '').replace(/fill="#000000"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/g, '');
    [].forEach.call(D.querySelectorAll('.logo'), function (l) { if (!l.closest('.navband')) l.innerHTML = svg; });   // the book fills its own, light
  }).catch(function () {});

  // the menu (David, 18 Nov): MEN, WOMEN, ACCESSORIES, then each category that has pieces; THE HOUSE (no page exists now that
  // the book is gone, so it is left out), CONTACT. No NEW (no piece is marked new); no search (the site has none).
  var C = [['outerwear', 'Outerwear'], ['dresses', 'Dresses'], ['knit', 'Knitwear'], ['bags', 'Bags'], ['small leather goods', 'Small leather goods'],
           ['belts', 'Belts'], ['gloves', 'Gloves'], ['scarves', 'Scarves'], ['eyewear', 'Eyewear'], ['jewellery', 'Jewellery']];
  var CATS = { accessories: { label: 'Accessories', has: function (c) { return ['bags', 'small leather goods', 'belts', 'gloves', 'scarves', 'jewellery'].indexOf(c) >= 0; } } };
  C.forEach(function (c) { CATS[c[0]] = { label: c[1], has: function (x) { return x === c[0]; } }; });
  window.SALON_CATS = CATS;
  var Q = new URLSearchParams(location.search), side = Q.get('side'), cat = Q.get('cat');
  var li = function (on, href, t) { return '<li><a href="' + href + '"' + (on ? ' aria-current="page"' : '') + '>' + t + '</a></li>'; };
  var menu = '<button class="x" type="button">Close</button>' +
    '<ul>' + li(side === 'men', BASE + '?side=men', 'Men') + li(side === 'women', BASE + '?side=women', 'Women') +
      li(cat === 'accessories', BASE + '?cat=accessories', 'Accessories') +
      C.map(function (c) { return li(cat === c[0], BASE + '?cat=' + encodeURIComponent(c[0]), c[1]); }).join('') + '</ul>' +
    '<ul>' + li(/service/.test(location.pathname) && location.hash === '#contact', BASE + 'service.html#contact', 'Contact') + '</ul>';
  [].forEach.call(D.querySelectorAll('nav.mn'), function (n) { n.innerHTML = menu; n.setAttribute('aria-label', 'Menu'); });
  var mn = D.querySelector('nav.mn'), burger = D.querySelector('.hd .burger');
  function menuOpen(on) {
    if (!mn) return; mn.classList.toggle('open', on); H.classList.toggle('lock', on);
    if (burger) burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { var a = mn.querySelector('a'); if (a) a.focus(); }
  }
  if (burger) burger.addEventListener('click', function () { menuOpen(!mn.classList.contains('open')); });
  if (mn) mn.addEventListener('click', function (e) { if (e.target.closest('.x')) menuOpen(false); });

  // the footer
  var ft = D.querySelector('footer.ft');
  if (ft) ft.innerHTML =
    '<div class="cols">' +
      '<section><h2>Client Care</h2><p>Write to the house</p><ul>' +
        '<li><a href="mailto:hello@phaora.com">hello@phaora.com</a></li>' +
        '<li><button class="lk" type="button" data-nl>Newsletter</button></li></ul>' +
        '<p style="margin-top:14px">Every letter is answered by a person.</p></section>' +
      '<section><h2>Support</h2><ul>' +
        '<li><a href="' + BASE + 'service.html#faq">Frequently asked questions</a></li>' +
        '<li><a href="' + BASE + 'service.html#delivery">Delivery</a></li>' +
        '<li><a href="' + BASE + 'service.html#returns">Returns</a></li>' +
        '<li><a href="' + BASE + 'service.html#care">Care</a></li>' +
        '<li><a href="' + BASE + 'service.html#contact">Contact</a></li></ul></section>' +
    '</div>' +
    '<div class="bt"><span>©2026 PHAÖRA</span><a href="' + BASE + 'service.html#terms">Terms</a><a href="' + BASE + 'service.html#privacy">Privacy</a></div>';

  // the sign-up panel: once per visitor, after about 8 s or half a screen of scrolling, never on the opening page's first
  // screen; never again after Close or a sign-up. The address goes to the register the site already has.
  var KEY = 'phaora-newsletter', LIVE = /(^|\.)phaora\.com$/.test(location.hostname);
  var nl = D.createElement('aside'); nl.className = 'nl'; nl.setAttribute('role', 'dialog'); nl.setAttribute('aria-label', 'Newsletter'); nl.setAttribute('aria-hidden', 'true');
  nl.innerHTML = '<button class="cl" type="button">Close</button>' +
    '<h2>Get the latest news from PHAÖRA</h2>' +
    '<form novalidate><label for="nl-e">Email</label><input id="nl-e" type="email" autocomplete="email" inputmode="email" required>' +
    '<input class="vh" tabindex="-1" autocomplete="off" aria-hidden="true" name="website">' +
    '<button class="btn" type="submit" disabled>Subscribe</button><p class="msg" aria-live="polite"></p></form>' +
    '<p class="pv">To find out more about how your data is used, see our <a href="' + BASE + 'service.html#privacy">Privacy policy</a></p>';
  B.appendChild(nl);
  var form = nl.querySelector('form'), em = nl.querySelector('#nl-e'), hp = nl.querySelector('[name=website]'), go = nl.querySelector('.btn'), msg = nl.querySelector('.msg');
  var OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, sending = false;
  em.addEventListener('input', function () { go.disabled = !OK.test(em.value.trim()); msg.textContent = ''; });
  function show() { nl.classList.add('on'); nl.setAttribute('aria-hidden', 'false'); setTimeout(function () { try { em.focus({ preventScroll: true }); } catch (e) {} }, 400); }
  function hide() { nl.classList.remove('on'); nl.setAttribute('aria-hidden', 'true'); if (ls.get(KEY) !== 'done') ls.set(KEY, 'closed'); }
  nl.querySelector('.cl').addEventListener('click', hide);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (nl.classList.contains('on')) hide(); if (mn && mn.classList.contains('open')) menuOpen(false); } });
  D.addEventListener('click', function (e) { if (e.target.closest('[data-nl]')) { e.preventDefault(); show(); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var v = em.value.trim(); if (!OK.test(v) || sending) return;
    if (!LIVE) { msg.textContent = 'This is the preview. Sign-ups are kept on phaora.com.'; return; }
    sending = true; go.disabled = true; msg.textContent = '';
    fetch('https://crm.phaora.com/api/public/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: v, list: 'chapter-1', website: hp.value || '' }) })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (j) {
        sending = false;
        if (j && j.ok) { ls.set(KEY, 'done'); form.outerHTML = '<p class="ty">Thank you.</p>'; return; }
        go.disabled = false; msg.textContent = (j && j.error) || "That address didn't take. Try it once more.";
      }, function () { sending = false; go.disabled = false; msg.textContent = "The register didn't answer. Try it once more."; });
  });
  if (!ls.get(KEY)) {
    var opening = B.classList.contains('opening'), timed = false, shown = false;
    var check = function () {
      if (shown || ls.get(KEY)) return;
      var half = scrollY > innerHeight * 0.5, past = !opening || scrollY >= innerHeight;
      if ((timed || half) && past) { shown = true; show(); removeEventListener('scroll', check); }
    };
    setTimeout(function () { timed = true; check(); }, 8000);
    addEventListener('scroll', check, { passive: true });
  }
})();

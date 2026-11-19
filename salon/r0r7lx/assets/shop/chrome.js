// The house chrome on every salon page (David, 18 Nov): the logo (the lettering, inlined, never typed), the menu
// (celine.com), the footer (maison margiela) and the sign-up panel (celine.com). Contact details, links and the
// register endpoint are the site's own; nothing here is new.
(function () {
  var D = document, H = D.documentElement, B = D.body;
  var BASE = (D.querySelector('meta[name="salon-base"]') || { content: './' }).content;
  var HOME = (D.querySelector('meta[name="salon-home"]') || { content: BASE }).content;   // the grid this look lives at
  if ((D.querySelector('meta[name="salon-look"]') || {}).content === 'room') { B.classList.add('room-look'); var rm = D.createElement('div'); rm.className = 'room'; rm.setAttribute('aria-hidden', 'true'); B.insertBefore(rm, B.firstChild); }
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // the logo: David's wordmark (assets/brand/wordmark-david.png, traced to wordmark-david-ink.svg; never typed)
  fetch(BASE + 'assets/brand/wordmark-david-ink.svg').then(function (r) { return r.text(); }).then(function (t) {
    var svg = t.replace(/<!--[\s\S]*?-->/g, '').replace(/fill="#000000"/g, 'fill="currentColor"').replace(/\s(width|height)="[^"]*"/g, '');
    [].forEach.call(D.querySelectorAll('.logo'), function (l) { if (!l.closest('.navband')) l.innerHTML = svg; });   // the book fills its own, light
  }).catch(function () {});

  // the menu (David, 18 Nov): MEN, WOMEN, ACCESSORIES, then each category that has pieces; THE HOUSE (no page exists now that
  // the book is gone, so it is left out), CONTACT. No NEW (no piece is marked new); no search (the site has none).
  var C = [['outerwear', 'Outerwear'], ['dresses', 'Dresses'], ['knit', 'Knitwear'], ['bags', 'Bags'], ['small leather goods', 'Small leather goods'],
           ['belts', 'Belts'], ['gloves', 'Gloves'], ['scarves', 'Scarves'], ['eyewear', 'Eyewear'], ['jewellery', 'Jewelry']];
  var CATS = { accessories: { label: 'Accessories', has: function (c) { return ['bags', 'small leather goods', 'belts', 'gloves', 'scarves', 'jewellery'].indexOf(c) >= 0; } } };
  C.forEach(function (c) { CATS[c[0]] = { label: c[1], has: function (x) { return x === c[0]; } }; });
  window.SALON_CATS = CATS;
  var Q = new URLSearchParams(location.search), side = Q.get('side'), cat = Q.get('cat');
  var li = function (on, href, t) { return '<li><a href="' + href + '"' + (on ? ' aria-current="page"' : '') + '>' + t + '</a></li>'; };
  // David, 18 Nov: tight like celine.com - the lines close together, a gap only between the groups
  var cl = function (k) { var c = C.filter(function (x) { return x[0] === k; })[0]; return li(cat === k, HOME + '?cat=' + encodeURIComponent(k), c[1]); };
  var menu = '<button class="x" type="button">Close</button>' +
    '<ul>' + li(false, HOME + '#gifts', 'Gifts') + '</ul>' +
    '<ul>' + li(side === 'women', HOME + '?side=women', 'Women') + li(side === 'men', HOME + '?side=men', 'Men') + '</ul>' +
    '<ul>' + cl('outerwear') + cl('dresses') + cl('knit') + '</ul>' +
    '<ul>' + cl('bags') + cl('small leather goods') + cl('belts') + cl('gloves') + cl('scarves') + '</ul>' +
    '<ul>' + cl('eyewear') + cl('jewellery') + li(cat === 'accessories', HOME + '?cat=accessories', 'All accessories') + '</ul>' +
    '<ul>' + li(/service/.test(location.pathname) && location.hash === '#house', BASE + 'service.html#house', 'The house') + li(/service/.test(location.pathname) && location.hash === '#contact', BASE + 'service.html#contact', 'Contact') + '</ul>';
  [].forEach.call(D.querySelectorAll('nav.mn'), function (n) { n.innerHTML = menu; n.setAttribute('aria-label', 'Menu'); });
  var mn = D.querySelector('nav.mn'), burger = D.querySelector('.hd .burger');
  function menuOpen(on) {
    if (!mn) return; mn.classList.toggle('open', on); H.classList.toggle('lock', on);
    if (burger) burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { var a = mn.querySelector('a'); if (a) a.focus(); }
  }
  if (burger) burger.addEventListener('click', function () { menuOpen(!mn.classList.contains('open')); });
  if (mn) mn.addEventListener('click', function (e) { if (e.target.closest('.x')) menuOpen(false); });

  // the footer: the house footer as it is live (maison/rhztw6), kept as David asked ("Keep this footer"): the Ö mark,
  // three columns, the quiet line, exactly as David approved (no Delivery, no Newsletter).
  var ft = D.querySelector('footer.ft');
  if (ft) { ft.className = 'foot'; ft.innerHTML =
    '<a class="mark" href="' + HOME + '" aria-label="PHAÖRA"><img src="' + BASE + 'assets/brand/mark-ink.png" alt="" width="40" height="40"></a>' +
    '<nav class="flist" aria-label="The house">' +
      '<p class="fcol"><a href="' + BASE + 'service.html#house">The house</a><a href="' + HOME + '">The line</a></p>' +
      '<p class="fcol"><a href="' + BASE + 'service.html#care">Care</a><a href="' + BASE + 'service.html#sizes">Measurements</a><a href="' + BASE + 'service.html#returns">Returns</a><a href="' + BASE + 'service.html#contact">Contact</a></p>' +
      '<p class="fcol"><a href="' + BASE + 'film.html?baked=1">The poem</a><a href="' + BASE + 'service.html#privacy">Privacy</a><a href="' + BASE + 'service.html#terms">Terms</a></p>' +
    '</nav><form class="fsign" novalidate><p class="fsh">The register</p><p class="fst">News of the house, by email.</p>' +
      '<div class="frow"><input type="email" name="email" placeholder="Email" autocomplete="email" aria-label="Email" required><button type="submit">Sign up</button></div>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" class="vh" aria-hidden="true"><p class="fmsg" aria-live="polite"></p></form>' +
    '<p class="fline">PHAÖRA · Chapter I · MMXXVI</p>';
    // the footer's sign-up (David, 18 Nov): the same register as the panel
    var fs = ft.querySelector('.fsign'), fe = fs.querySelector('input[type=email]'), fm = fs.querySelector('.fmsg'), fb = fs.querySelector('button'), fh = fs.querySelector('input[name=website]'), fsend = false;
    fs.addEventListener('submit', function (e) { e.preventDefault(); var v = fe.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { fm.textContent = 'An email address, please.'; return; } if (fsend) return;
      if (!/(^|\.)phaora\.com$/.test(location.hostname)) { fm.textContent = 'This is the preview. Sign-ups are kept on phaora.com.'; return; }
      fsend = true; fb.disabled = true; fm.textContent = '';
      fetch('https://crm.phaora.com/api/public/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v, list: 'chapter-1', website: fh.value || '' }) })
        .then(function (r) { return r.json().catch(function () { return null; }); })
        .then(function (j) { fsend = false; if (j && j.ok) { ls.set(KEY, 'done'); fs.innerHTML = '<p class="fsh">Thank you.</p>'; return; } fb.disabled = false; fm.textContent = (j && j.error) || "That address didn't take. Try it once more."; },
              function () { fsend = false; fb.disabled = false; fm.textContent = "The register didn't answer. Try it once more."; }); });
  }

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

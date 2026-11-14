// A piece with no price (Lustre): "Enquire" opens a short private form. It goes the register's own way: the same
// route on the house's CRM, and only from phaora.com; anywhere else this is the preview and nothing is sent.
(function () {
  var box = document.querySelector('.enq'); if (!box) return;
  var open = box.querySelector('.enq-open'), form = box.querySelector('.enq-form'), err = box.querySelector('.enq-err'),
      done = box.querySelector('.enq-done'), small = box.querySelector('.enq-small'), tel = box.querySelector('.fld.tel'),
      send = form.querySelector('button[type=submit]');
  var LIVE = /(^|\.)phaora\.com$/.test(location.hostname), sending = false;

  open.addEventListener('click', function () {
    var on = form.hidden; form.hidden = !on; small.hidden = !on && done.hidden; open.setAttribute('aria-expanded', on);
    if (on) form.elements.name.focus({ preventScroll: true });
  });
  function via() { var c = form.querySelector('input[name=contact]:checked'); return c ? c.value : 'email'; }
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'contact') return;
    tel.hidden = via() === 'email';
    form.querySelectorAll('.via .sz').forEach(function (l) { l.setAttribute('aria-pressed', l.querySelector('input').checked); });
  });
  form.querySelector('.via .sz input:checked').parentNode.setAttribute('aria-pressed', 'true');

  form.addEventListener('submit', async function (e) {
    e.preventDefault(); if (sending) return;
    var f = form.elements, v = function (k) { return (f[k].value || '').trim(); };
    var name = v('name'), email = v('email'), country = v('country'), contact = via(), phone = v('phone'), note = v('note');
    if (!name) { err.textContent = 'Your name, please.'; f.name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'And an email address.'; f.email.focus(); return; }
    if (!country) { err.textContent = 'And the country it would go to.'; f.country.focus(); return; }
    if (contact !== 'email' && !/[0-9]{6,}/.test(phone.replace(/[^0-9]/g, ''))) { err.textContent = 'And the number to reach you on.'; f.phone.focus(); return; }
    if (!LIVE) { err.textContent = 'This is the preview. Enquiries are sent from phaora.com.'; return; }
    sending = true; send.disabled = true; err.textContent = 'Sending…';
    var body = { email: email, name: name, list: 'chapter-1', tag: box.dataset.tag, enquiry: box.dataset.piece,
                 country: country, contact: contact, phone: contact === 'email' ? '' : phone, note: note, website: v('website') };
    var ok = false;
    try {
      var r = await fetch('https://crm.phaora.com/api/public/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      var j = await r.json().catch(function () { return null; });
      ok = !!(j && j.ok);
      if (!ok) err.textContent = (j && j.error) || 'That did not go through. Try it once more.';
    } catch (x) { err.textContent = 'The house did not answer. Try it once more.'; }
    sending = false; send.disabled = false;
    if (!ok) return;
    form.hidden = true; done.hidden = false; small.hidden = false; open.disabled = true; open.setAttribute('aria-expanded', 'false');
  });
})();

/* PHAÖRA — lead tracking.
 *
 * Google Ads optimises toward conversions. With nothing reporting them it
 * optimises toward clicks, which is how a budget gets spent on traffic that
 * never calls. This is the thing that reports them.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FILL THESE IN. Nothing is tracked until you do, and nothing breaks either.
 *
 *   ADS   Google Ads → Admin → Account settings. Looks like AW-1234567890.
 *   GA    Google Analytics → Admin → Data streams. Looks like G-ABC1234567.
 *         Optional. Leave blank if you have no Analytics property.
 *
 *   LABEL One per conversion action. Google Ads → Goals → Conversions →
 *         create the action → "Install the tag yourself" → the snippet shows
 *         send_to: 'AW-1234567890/AbCdEfGhIj'. The half after the slash is
 *         the label. Paste only that half.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var ADS = "AW-18073886748";
  var GA  = "";
  var LABEL = {
    // Both of these are the "Submit lead form" action. They are the same act
    // — a stranger handing over their number — reached by two doors, and one
    // action counting both beats a second door reporting nothing. Split them
    // when there is a reason to bid on them differently.
    estimate_lead: "zAPQCL3-zZ4cEJzApqpD",  // booked the free visit
    contact_lead:  "zAPQCL3-zZ4cEJzApqpD",  // sent the contact form
    // The "Phone tap" action — Contact, counted once per click, flat $1. On
    // mobile trade traffic this is usually the biggest of the four: there is
    // no form to submit, the number IS the call to action.
    phone_click:   "hU7bCN3W_-8cEJzApqpD",  // tapped the number
    // Still needs its own action in Ads. Blank is silent, not broken: the
    // event still fires, Google is just not told to count it.
    email_click:   "",   // tapped the email address
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var live = !!(ADS || GA);
  if (live) {
    gtag("js", new Date());
    if (ADS) gtag("config", ADS);
    if (GA)  gtag("config", GA);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ADS || GA);
    document.head.appendChild(s);
  }

  /**
   * Report a lead.
   *
   * Never throws. A blocked tag, an ad blocker, or an ID nobody has filled in
   * yet must not take the page down with it — the lead is the thing that
   * matters and it has already been sent by the time this runs.
   */
  window.phaoraTrack = function (name, params) {
    params = params || {};
    try {
      if (!live) return;
      if (GA) gtag("event", name, params);
      if (ADS && LABEL[name]) {
        var conv = { send_to: ADS + "/" + LABEL[name] };
        /* Only send a value when there is one. Passing value:0 does not mean
           "no value" to Google — it overrides the conversion action's own
           default with zero, so a phone tap set to $1 in Ads would report as
           $0 and never appear in value-based bidding. Omit the field and the
           action's default stands. */
        if (params.value > 0) { conv.value = params.value; conv.currency = "USD"; }
        gtag("event", "conversion", conv);
      }
    } catch (e) { /* nothing here is worth a broken page */ }
  };

  /* On a phone, tapping the number IS the lead — there is no form to submit
     and no thank-you page to land on, so it has to be caught here. */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href^='tel:'],a[href^='mailto:']");
    if (!a) return;
    var tel = a.getAttribute("href").lastIndexOf("tel:", 0) === 0;
    window.phaoraTrack(tel ? "phone_click" : "email_click");
  }, true);
})();

/* Where the visitor came from — the link in Instagram's bio is
 * phaora.com/?src=instagram, and a flyer or an ad can carry its own src.
 *
 * The estimate page sends `src` with the booking and the CRM files the lead
 * under it. Most people do not book from the page they landed on: they land
 * on the homepage, look at the work, then press "Price it". So the src is
 * kept for the tab (sessionStorage) and put back onto every link into
 * /estimate, which also carries it when storage is blocked — Instagram's
 * in-app browser included. First touch wins within a visit: a later bare
 * page view does not wipe it. Letters, digits, dot, dash and underscore only,
 * lower-cased and capped, because it ends up in a database column.
 */
(function () {
  "use strict";
  var KEY = "phaora_src";
  function clean(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40); }
  var src = "";
  try { src = clean(new URLSearchParams(location.search).get("src")); } catch (e) {}
  try {
    if (src) sessionStorage.setItem(KEY, src);
    else src = clean(sessionStorage.getItem(KEY));
  } catch (e) { /* storage blocked: the links below still carry it */ }
  window.phaoraSrc = src;
  if (!src) return;

  function decorate() {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      try {
        var u = new URL(a.getAttribute("href"), location.href);
        if (u.origin !== location.origin || u.pathname.indexOf("/estimate") !== 0) continue;
        if (u.pathname === location.pathname) continue;   // an in-page #anchor, not a hop
        if (u.searchParams.get("src")) continue;
        u.searchParams.set("src", src);
        a.setAttribute("href", u.pathname + u.search + u.hash);
      } catch (e) { /* a malformed href is left as it was */ }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
})();

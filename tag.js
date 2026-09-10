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

  /* ── Referral attribution ────────────────────────────────────────────────
     A partner's link is crm.phaora.com/r/{code}: it records the click and
     forwards here with ?ref=. The visitor usually lands on the home page and
     browses before filling anything in, so the code has to outlive the page
     it arrived on — hence localStorage rather than a variable, and rather
     than a cookie, which the CRM's origin cannot set for this one.

     Ninety days matches the window the CRM stamps on the claim. Every access
     is wrapped: Safari private mode throws on setItem, and a lost referral
     must never cost the lead. */
  var REF_KEY = "phaora_ref", REF_TTL = 90 * 24 * 60 * 60 * 1000;

  try {
    var incoming = new URLSearchParams(window.location.search).get("ref");
    if (incoming) {
      localStorage.setItem(REF_KEY, JSON.stringify({ c: incoming, t: Date.now() }));
    }
  } catch (e) { /* storage unavailable — the visit still counts */ }

  /* Returns the live referral code, or "" when there is none. Forms send it
     as `ref`; the CRM resolves it and opens the claim. */
  window.phaoraRef = function () {
    try {
      var v = JSON.parse(localStorage.getItem(REF_KEY) || "null");
      if (!v || !v.c) return "";
      if (Date.now() - v.t > REF_TTL) { localStorage.removeItem(REF_KEY); return ""; }
      return v.c;
    } catch (e) { return ""; }
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

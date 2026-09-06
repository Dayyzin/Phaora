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
    // These need their own conversion actions in Ads. Blank is silent, not
    // broken: the event still fires, Google just isn't told to count it.
    phone_click:   "",   // tapped the number
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
        gtag("event", "conversion", {
          send_to: ADS + "/" + LABEL[name],
          value: params.value || 0,
          currency: "USD",
        });
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

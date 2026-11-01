/*!
 * Enrykez — analytics configuration (single source of truth)
 *
 * Every value here is PUBLIC by design (it ships to every visitor's browser).
 * Never put API keys, admin tokens or passwords in this file.
 *
 * Leave an ID empty ("") to disable that provider. With all IDs empty the
 * site loads no third-party analytics and shows no consent banner.
 * See docs/ANALYTICS.md for where to obtain each value.
 */
window.ENRYKEZ_ANALYTICS = {
  /* Cloudflare Web Analytics — cookieless, aggregate; loads WITHOUT consent.
     Leave empty if the site is proxied by Cloudflare and you enabled
     "automatic setup" in the dashboard (Cloudflare injects the beacon itself;
     setting a token too would count every visit twice). */
  cloudflareToken: "f0709b8779604d9cac60022845eaeb8c", // enrykez.com · manual JS snippet (DNS-only zone)

  /* Google Analytics 4 — Measurement ID, format "G-XXXXXXXXXX".
     Requires prior opt-in consent. */
  ga4MeasurementId: "G-RB7X57DSCK", // property "Enrykez" · stream enrykez.com

  /* Microsoft Clarity — Project ID (short alphanumeric string).
     Requires prior opt-in consent. */
  clarityProjectId: "z6qxbwncjb", // project "Enrykez"

  /* Consent */
  consentStorageKey: "enrykez-consent-v2", // v2: Clarity added → ask everyone again
  consentMaxAgeDays: 365,       // ask again after this many days
  honorGlobalPrivacyControl: true, // GPC signal = decline, no banner
  privacyNoticeUrl: "/privacy.html",

  /* Behaviour */
  trackSectionViews: true,      // one section_view per section per page load
  trackJsErrors: true,          // js_error event (message truncated, no URLs)
  debug: false                  // logs events to the console instead of silence
};

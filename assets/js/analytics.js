/*!
 * Enrykez — analytics loader, consent and event tracking
 *
 * - Cloudflare Web Analytics: cookieless, loads without consent (if configured).
 * - Google Analytics 4 and Microsoft Clarity: load ONLY after opt-in consent.
 * - No IDs configured  → nothing loads, no banner, site unchanged.
 * - Third-party failure or ad-blockers never break the page: every call is guarded.
 * - Public API: window.trackEvent(name, params) and window.enrykezAnalytics.
 *
 * Configuration lives in assets/js/analytics-config.js. Docs: docs/ANALYTICS.md
 */
(function () {
  'use strict';

  var w = window, d = document;
  if (w.enrykezAnalytics) return; // guard against double inclusion

  var C = w.ENRYKEZ_ANALYTICS || {};
  var ID_RX = {
    ga4: /^G-[A-Z0-9]{4,16}$/,
    clarity: /^[a-z0-9]{6,20}$/i,
    cloudflare: /^[a-f0-9]{32}$/i
  };

  function validId(value, rx, label) {
    value = (value || '').trim();
    if (!value) return '';
    if (rx.test(value)) return value;
    if (w.console) console.warn('[analytics] Ignoring invalid ' + label + ' in analytics-config.js');
    return '';
  }

  var gaId = validId(C.ga4MeasurementId, ID_RX.ga4, 'GA4 Measurement ID');
  var clarityId = validId(C.clarityProjectId, ID_RX.clarity, 'Clarity Project ID');
  var cfToken = validId(C.cloudflareToken, ID_RX.cloudflare, 'Cloudflare token');
  var needsConsent = !!(gaId || clarityId);

  var KEY = C.consentStorageKey || 'enrykez-consent-v1';
  var MAX_AGE = (C.consentMaxAgeDays || 365) * 864e5;

  var state = { consent: null, ga: false, clarity: false, cf: false };

  function log() {
    if (C.debug && w.console) console.log.apply(console, ['[analytics]'].concat([].slice.call(arguments)));
  }

  /* Where this script lives, to resolve sibling assets on any page path. */
  var scriptSrc = (d.currentScript && d.currentScript.src) || '';
  var assetsBase = scriptSrc ? scriptSrc.replace(/js\/analytics\.js(\?.*)?$/, '') : '/assets/';

  /* ---------------- consent storage ---------------- */

  function readConsent() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY));
      if (!r || typeof r.analytics !== 'boolean' || typeof r.ts !== 'number') return null;
      if (Date.now() - r.ts > MAX_AGE) return null;
      return r.analytics;
    } catch (e) { return null; }
  }

  function writeConsent(value) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: value, ts: Date.now(), v: 1 })); } catch (e) {}
  }

  function gpcEnabled() {
    return C.honorGlobalPrivacyControl !== false && navigator.globalPrivacyControl === true;
  }

  /* ---------------- loaders ---------------- */

  function addScript(src, attrs) {
    var s = d.createElement('script');
    s.async = true;
    s.src = src;
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) s.setAttribute(k, attrs[k]);
    s.onerror = function () { log('blocked or unavailable:', src); };
    (d.head || d.documentElement).appendChild(s);
    return s;
  }

  /* Page URL for GA4: keeps campaign parameters, drops everything else
     (unknown query parameters could carry personal data) and the #hash. */
  function cleanLocation() {
    var keep = [];
    try {
      new URLSearchParams(location.search).forEach(function (v, k) {
        if (/^utm_(source|medium|campaign|term|content|id)$/.test(k) || k === 'ref') {
          keep.push(encodeURIComponent(k) + '=' + encodeURIComponent(v.slice(0, 100)));
        }
      });
    } catch (e) {}
    return location.origin + location.pathname + (keep.length ? '?' + keep.join('&') : '');
  }

  function loadCloudflare() {
    if (!cfToken || state.cf) return;
    state.cf = true;
    // Cloudflare's automatic setup (proxied zones) injects its own beacon: never add a second one.
    if (d.querySelector('script[src*="cloudflareinsights.com/beacon"]')) { log('Cloudflare beacon already present'); return; }
    addScript('https://static.cloudflareinsights.com/beacon.min.js', {
      type: 'module', // as in Cloudflare's official snippet
      'data-cf-beacon': JSON.stringify({ token: cfToken, spa: false })
    });
    log('Cloudflare Web Analytics loaded');
  }

  function loadGA() {
    if (!gaId || state.ga) return;
    state.ga = true;
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
    w.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    w.gtag('js', new Date());
    w.gtag('config', gaId, {
      page_location: cleanLocation(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId));
    log('GA4 loaded', gaId);
  }

  function loadClarity() {
    if (!clarityId || state.clarity) return;
    state.clarity = true;
    w.clarity = w.clarity || function () { (w.clarity.q = w.clarity.q || []).push(arguments); };
    addScript('https://www.clarity.ms/tag/' + encodeURIComponent(clarityId));
    w.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    log('Clarity loaded', clarityId);
  }

  function enableConsentTools() {
    state.consent = true;
    loadGA();
    loadClarity();
  }

  var TRACKING_COOKIE = /^(_ga|_gid|_gat|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)(_|$)/;

  function clearTrackingCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    d.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!TRACKING_COOKIE.test(name)) return;
      domains.forEach(function (dm) {
        d.cookie = name + '=; Max-Age=0; path=/' + (dm ? '; domain=' + dm : '');
      });
    });
  }

  function setConsent(value) {
    var wasEnabled = state.ga || state.clarity;
    writeConsent(value);
    hideBanner();
    if (value) { enableConsentTools(); return; }
    state.consent = false;
    if (wasEnabled) {
      try { if (w.gtag) w.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (e) {}
      try { if (w.clarity) w.clarity('consent', false); } catch (e) {}
      clearTrackingCookies();
      location.reload(); // fully unload scripts that are already running
    }
  }

  /* ---------------- event tracking ---------------- */

  var NAME_RX = /^[a-z][a-z0-9_]{0,39}$/;
  var EMAIL_RX = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  var URL_RX = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;

  function sanitize(params) {
    var out = {}, n = 0;
    if (!params || typeof params !== 'object') return out;
    for (var k in params) {
      if (!Object.prototype.hasOwnProperty.call(params, k) || !NAME_RX.test(k) || n >= 10) continue;
      var v = params[k];
      if (typeof v === 'number' && isFinite(v)) { out[k] = v; n++; continue; }
      if (typeof v === 'boolean') { out[k] = v; n++; continue; }
      if (typeof v !== 'string') continue;
      out[k] = v.replace(EMAIL_RX, '[redacted]').replace(URL_RX, '[url]').trim().slice(0, 100);
      n++;
    }
    return out;
  }

  /**
   * trackEvent("social_link_click", { platform: "linkedin", location: "footer" })
   * Names and keys: lowercase snake_case, max 40 chars. Values: strings ≤100 chars,
   * numbers or booleans. E-mails and URLs are redacted automatically.
   */
  function trackEvent(name, params) {
    try {
      if (typeof name !== 'string' || !NAME_RX.test(name)) { log('invalid event name', name); return; }
      var p = sanitize(params);
      log('event', name, p, state.consent ? '' : '(not sent: no consent)');
      if (!state.consent) return;
      if (state.ga && w.gtag) w.gtag('event', name, p);
      if (state.clarity && w.clarity) w.clarity('event', name);
    } catch (e) { /* analytics must never break the site */ }
  }

  /* Declarative tracking: <a data-track="event_name" data-track-platform="linkedin"> */
  function paramsFromDataset(el) {
    var params = {};
    var ds = el.dataset || {};
    for (var k in ds) {
      if (k.indexOf('track') !== 0 || k.length <= 5) continue;
      var key = k.slice(5);
      key = key.charAt(0).toLowerCase() + key.slice(1);
      key = key.replace(/[A-Z]/g, function (m) { return '_' + m.toLowerCase(); });
      params[key] = ds[k];
    }
    return params;
  }

  function wireClicks() {
    d.addEventListener('click', function (e) {
      var t = e.target;
      var el = t && t.closest ? t.closest('[data-track]') : null;
      if (el) trackEvent(el.getAttribute('data-track'), paramsFromDataset(el));
      var opener = t && t.closest ? t.closest('[data-consent-open]') : null;
      if (opener) { e.preventDefault(); showBanner(true); }
    }, { capture: true, passive: false });
  }

  function wireSections() {
    if (C.trackSectionViews === false || !('IntersectionObserver' in w)) return;
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (!en.isIntersecting || seen[id]) return;
        seen[id] = true;
        io.unobserve(en.target);
        trackEvent('section_view', { section: id });
      });
    }, { threshold: 0.35 });
    d.querySelectorAll('main section[id], body > section[id]').forEach(function (s) { io.observe(s); });
  }

  function wireLanguage() {
    if (!('MutationObserver' in w) || !d.body) return;
    var last = d.body.classList.contains('lang-es') ? 'es' : 'en';
    new MutationObserver(function () {
      var now = d.body.classList.contains('lang-es') ? 'es' : 'en';
      if (now === last) return;
      last = now;
      trackEvent('language_change', { language: now });
      syncBannerLanguage();
    }).observe(d.body, { attributes: true, attributeFilter: ['class'] });
  }

  function wireErrors() {
    if (C.trackJsErrors === false) return;
    var sent = 0, seen = {};
    w.addEventListener('error', function (ev) {
      if (!state.consent || sent >= 5 || !ev) return;
      var msg = String(ev.message || 'error').slice(0, 100);
      if (seen[msg]) return;
      seen[msg] = true; sent++;
      var file = String(ev.filename || '').split('?')[0].split('/').pop().slice(0, 60);
      trackEvent('js_error', { message: msg, source: file || 'inline', line: Number(ev.lineno) || 0 });
    });
  }

  /* ---------------- consent banner ---------------- */

  var banner = null;

  function currentLang() {
    if (d.body && d.body.classList.contains('lang-es')) return 'es';
    try { if (localStorage.getItem('enrykez-lang') === 'es') return 'es'; } catch (e) {}
    return (d.documentElement.lang || '').indexOf('es') === 0 ? 'es' : 'en';
  }

  function syncBannerLanguage() {
    if (banner) banner.classList.toggle('ek-es', currentLang() === 'es');
  }

  function ensureCss() {
    if (d.getElementById('ek-consent-css')) return;
    var l = d.createElement('link');
    l.id = 'ek-consent-css';
    l.rel = 'stylesheet';
    l.href = assetsBase + 'css/consent.css';
    d.head.appendChild(l);
  }

  function toolNames() {
    var n = [];
    if (gaId) n.push('Google Analytics');
    if (clarityId) n.push('Microsoft Clarity');
    return n.join(' · ');
  }

  function buildBanner() {
    ensureCss();
    var privacy = C.privacyNoticeUrl || '/privacidad';
    var tools = toolNames();
    var el = d.createElement('div');
    el.className = 'ek-consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie preferences / Preferencias de cookies');
    el.hidden = true;
    el.innerHTML =
      '<p class="ek-consent-text">' +
        '<span class="ek-t-en">With your permission, this site uses analytics cookies (' + tools + ') to understand how it is used and improve it. No advertising, and data is never sold. </span>' +
        '<span class="ek-t-es">Con tu permiso, este sitio usa cookies de analítica (' + tools + ') para entender cómo se usa y mejorarlo. Sin publicidad y sin venta de datos. </span>' +
        '<a href="' + privacy + '"><span class="ek-t-en">Privacy notice</span><span class="ek-t-es">Aviso de privacidad</span></a>' +
      '</p>' +
      '<div class="ek-consent-actions">' +
        '<button type="button" class="ek-btn" data-ek-consent="decline"><span class="ek-t-en">Decline</span><span class="ek-t-es">Rechazar</span></button>' +
        '<button type="button" class="ek-btn ek-btn-primary" data-ek-consent="accept"><span class="ek-t-en">Accept</span><span class="ek-t-es">Aceptar</span></button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-ek-consent]') : null;
      if (!b) return;
      setConsent(b.getAttribute('data-ek-consent') === 'accept');
    });
    d.body.appendChild(el);
    return el;
  }

  function showBanner(focus) {
    if (!needsConsent) return;
    if (!banner) banner = buildBanner();
    syncBannerLanguage();
    banner.hidden = false;
    if (focus) { var btn = banner.querySelector('button'); if (btn) btn.focus(); }
  }

  function hideBanner() { if (banner) banner.hidden = true; }

  function revealSettingsLinks() {
    if (!needsConsent) return;
    ensureCss();
    d.querySelectorAll('[data-consent-open]').forEach(function (el) { el.hidden = false; });
  }

  /* ---------------- init ---------------- */

  function init() {
    try {
      loadCloudflare();
      wireClicks();
      wireSections();
      wireLanguage();
      wireErrors();
      if (!needsConsent) return;
      w.addEventListener('hashchange', function () { if (location.hash === '#cookie-settings') showBanner(true); });
      revealSettingsLinks();
      var wantsSettings = location.hash === '#cookie-settings'; // link from /privacidad
      if (gpcEnabled() && readConsent() === null && !wantsSettings) { state.consent = false; log('GPC detected: consent tools stay off'); return; }
      var stored = readConsent();
      if (stored === true) enableConsentTools();
      else if (stored === false) state.consent = false;
      if (stored === null || wantsSettings) showBanner(wantsSettings);
    } catch (e) { /* never break the page */ }
  }

  w.trackEvent = trackEvent;
  w.enrykezAnalytics = {
    trackEvent: trackEvent,
    openConsent: function () { showBanner(true); },
    getConsent: function () { return state.consent; },
    status: function () { return { consent: state.consent, ga4: state.ga, clarity: state.clarity, cloudflare: state.cf }; }
  };

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();

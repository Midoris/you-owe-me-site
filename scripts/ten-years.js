(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    root.YouOweMeTenYears = api;
    api.initialize(root.document, root.Date);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CAMPAIGN_SELECTOR = "[data-ten-years-campaign]";
  const APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?pt=117888502&ct=website_cta&mt=8";
  const APP_STORE_EVENT_URL = `${APP_STORE_URL}&eventid=6802562970`;
  const ANNIVERSARY_DEEP_LINK = "youoweme://events/anniversary";

  const STATES = Object.freeze({
    prelaunch: Object.freeze({
      eyebrow: "10-year anniversary",
      heading: "You Owe Me turns 10 on August 26.",
      body: "The anniversary experience opens in You Owe Me on August 26. Eligible free users can also explore a limited upgrade offer through September 4.",
      primaryLabel: "Open the anniversary preview",
      primaryUrl: ANNIVERSARY_DEEP_LINK,
      secondaryLabel: "View You Owe Me on the App Store",
      secondaryUrl: APP_STORE_URL,
      note: "Existing paid customers receive a thank-you experience. The offer appears only for eligible free users.",
    }),
    active: Object.freeze({
      eyebrow: "10-year anniversary",
      heading: "The anniversary experience is live.",
      body: "Open You Owe Me for the ten-year story. Eligible free users can also explore the anniversary upgrade offer through September 4.",
      primaryLabel: "Open the 10-year experience",
      primaryUrl: ANNIVERSARY_DEEP_LINK,
      secondaryLabel: "View the App Store event",
      secondaryUrl: APP_STORE_EVENT_URL,
      note: "Existing paid customers receive a thank-you experience. The offer appears only for eligible free users.",
    }),
    retrospective: Object.freeze({
      eyebrow: "10-year anniversary",
      heading: "Thank you for ten years.",
      body: "The anniversary offer has ended, but the story remains. Open You Owe Me to revisit the ten-year experience.",
      primaryLabel: "Open the anniversary story",
      primaryUrl: ANNIVERSARY_DEEP_LINK,
      secondaryLabel: "View You Owe Me on the App Store",
      secondaryUrl: APP_STORE_URL,
      note: "The anniversary offer ended September 4, 2026.",
    }),
  });

  function localDateKey(date) {
    if (!date || typeof date.getFullYear !== "function" || Number.isNaN(date.getTime())) {
      return null;
    }

    return (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();
  }

  function phaseForDate(date) {
    const key = localDateKey(date);
    if (key === null) return null;
    if (key < 20260826) return "prelaunch";
    if (key <= 20260904) return "active";
    return "retrospective";
  }

  function applyState(moduleElement, phase) {
    if (!moduleElement || !STATES[phase]) return false;

    const state = STATES[phase];
    const eyebrow = moduleElement.querySelector("[data-campaign-eyebrow]");
    const heading = moduleElement.querySelector("[data-campaign-heading]");
    const body = moduleElement.querySelector("[data-campaign-body]");
    const note = moduleElement.querySelector("[data-campaign-note]");
    const primary = moduleElement.querySelector("[data-campaign-primary]");
    const secondary = moduleElement.querySelector("[data-campaign-secondary]");

    if (!eyebrow || !heading || !body || !note || !primary || !secondary) return false;

    eyebrow.textContent = state.eyebrow;
    heading.textContent = state.heading;
    body.textContent = state.body;
    note.textContent = state.note;
    primary.textContent = state.primaryLabel;
    primary.setAttribute("href", state.primaryUrl);
    secondary.textContent = state.secondaryLabel;
    secondary.setAttribute("href", state.secondaryUrl);
    moduleElement.setAttribute("data-campaign-phase", phase);

    return true;
  }

  function render(documentObject, date) {
    if (!documentObject || typeof documentObject.querySelector !== "function") return false;

    const moduleElement = documentObject.querySelector(CAMPAIGN_SELECTOR);
    const phase = phaseForDate(date);
    return phase ? applyState(moduleElement, phase) : false;
  }

  function initialize(documentObject, DateConstructor) {
    if (!documentObject || typeof DateConstructor !== "function") return;

    const run = function () {
      render(documentObject, new DateConstructor());
    };

    if (documentObject.readyState === "loading") {
      documentObject.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  return Object.freeze({
    ANNIVERSARY_DEEP_LINK,
    APP_STORE_EVENT_URL,
    APP_STORE_URL,
    CAMPAIGN_SELECTOR,
    STATES,
    applyState,
    initialize,
    localDateKey,
    phaseForDate,
    render,
  });
});

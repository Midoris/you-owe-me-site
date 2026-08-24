(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    root.YouOweMeAnniversaryAnnouncement = api;
    api.initialize(
      root.document,
      root.Date,
      typeof root.setInterval === "function" ? root.setInterval.bind(root) : null
    );
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ANNOUNCEMENT_SELECTOR = "[data-anniversary-announcement]";
  const REFRESH_INTERVAL_MS = 60000;
  const initializedDocuments = typeof WeakSet === "function" ? new WeakSet() : null;

  const ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({
        eyebrow: "2016–2026",
        heading: "You Owe Me is 10.",
        body: "Explore a decade of clearer money between people. Eligible free users can also find a limited anniversary upgrade offer in the app through September 4.",
        cta: "Explore the ten-year story",
      }),
      inline: Object.freeze({
        label: "Anniversary live",
        body: "You Owe Me is 10. Eligible free users can also find the limited anniversary offer in the app through September 4.",
      }),
    }),
    final: Object.freeze({
      standard: Object.freeze({
        eyebrow: "Final days",
        heading: "The anniversary offer ends September 4.",
        body: "The ten-year story will remain. If you are an eligible free user, the limited upgrade offer is available in the app through September 4.",
        cta: "Explore the anniversary",
      }),
      inline: Object.freeze({
        label: "Final days",
        body: "The anniversary offer for eligible free users ends September 4. The ten-year story will remain.",
      }),
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
    if (key === null || key < 20260826 || key >= 20260905) return "inactive";
    if (key < 20260902) return "active";
    return "final";
  }

  function setText(moduleElement, selector, value) {
    const node = moduleElement.querySelector(selector);
    if (node) node.textContent = value;
  }

  function applyState(moduleElement, phase) {
    if (!moduleElement || typeof moduleElement.setAttribute !== "function") return false;

    const safePhase = ACTIVE_STATES[phase] ? phase : "inactive";
    moduleElement.setAttribute("data-anniversary-phase", safePhase);

    if (safePhase === "inactive") {
      moduleElement.hidden = true;
      moduleElement.setAttribute("aria-hidden", "true");
      return true;
    }

    if (typeof moduleElement.querySelector !== "function") return false;

    const variant = moduleElement.getAttribute("data-anniversary-variant");
    const state = ACTIVE_STATES[safePhase][variant];
    if (!state) {
      moduleElement.hidden = true;
      moduleElement.setAttribute("aria-hidden", "true");
      moduleElement.setAttribute("data-anniversary-phase", "inactive");
      return false;
    }

    if (variant === "standard") {
      setText(moduleElement, "[data-anniversary-eyebrow]", state.eyebrow);
      setText(moduleElement, "[data-anniversary-heading]", state.heading);
      setText(moduleElement, "[data-anniversary-body]", state.body);
      const cta = moduleElement.querySelector("[data-anniversary-cta]");
      if (cta) {
        cta.textContent = state.cta;
        cta.setAttribute("href", "/10-years/");
      }
    } else {
      setText(moduleElement, "[data-anniversary-inline-label]", state.label);
      setText(moduleElement, "[data-anniversary-inline-body]", state.body);
    }

    moduleElement.hidden = false;
    moduleElement.removeAttribute("aria-hidden");
    return true;
  }

  function render(documentObject, date) {
    if (!documentObject || typeof documentObject.querySelectorAll !== "function") return false;

    const phase = phaseForDate(date);
    const modules = documentObject.querySelectorAll(ANNOUNCEMENT_SELECTOR);
    let updated = false;

    Array.prototype.forEach.call(modules, function (moduleElement) {
      try {
        updated = applyState(moduleElement, phase) || updated;
      } catch (error) {
        try {
          applyState(moduleElement, "inactive");
        } catch (ignoredError) {
          // A malformed module must not prevent the remaining modules from updating.
        }
      }
    });

    return updated;
  }

  function initialize(documentObject, DateConstructor, setIntervalFunction) {
    if (!documentObject || typeof DateConstructor !== "function") return false;
    if (initializedDocuments && initializedDocuments.has(documentObject)) return false;
    if (initializedDocuments) initializedDocuments.add(documentObject);

    const run = function () {
      render(documentObject, new DateConstructor());
    };

    const start = function () {
      run();
      if (typeof setIntervalFunction === "function") {
        setIntervalFunction(run, REFRESH_INTERVAL_MS);
      }
    };

    if (documentObject.readyState === "loading") {
      documentObject.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    return true;
  }

  return Object.freeze({
    ACTIVE_STATES,
    ANNOUNCEMENT_SELECTOR,
    REFRESH_INTERVAL_MS,
    applyState,
    initialize,
    localDateKey,
    phaseForDate,
    render,
  });
});

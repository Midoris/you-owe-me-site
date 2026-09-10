import { createAppStoreCtaViewTracker } from "./app-store-cta-view-tracker.mjs";

export const IPHONE_HANDOFF_OFFER_VIEWED_EVENT = "youoweme:iphone-handoff-offer-viewed";
export const IPHONE_HANDOFF_REQUESTED_EVENT = "youoweme:iphone-handoff-requested";

const MOBILE_USER_AGENT = /iPhone|iPad|iPod|Android|Mobile/i;
const DESKTOP_USER_AGENT = /Windows NT|Macintosh|X11|CrOS|Linux x86_64/i;
const controllersByRoot = new WeakMap();
const lifetimeStateByRoot = new WeakMap();

export function isEligibleForIphoneHandoff(identity = {}) {
  const userAgent = String(identity.userAgent || "");
  const platform = String(identity.platform || "");
  const maxTouchPoints = Number(identity.maxTouchPoints || 0);

  return !MOBILE_USER_AGENT.test(userAgent)
    && !(platform === "MacIntel" && maxTouchPoints > 1)
    && DESKTOP_USER_AGENT.test(userAgent)
    && identity.minimumWidthMatches === true
    && identity.finePointerMatches === true;
}

function browserIdentity(windowRef, minimumWidthQuery, finePointerQuery) {
  const navigatorRef = windowRef.navigator || {};
  return {
    userAgent: navigatorRef.userAgent || "",
    platform: navigatorRef.platform || "",
    maxTouchPoints: navigatorRef.maxTouchPoints || 0,
    minimumWidthMatches: Boolean(minimumWidthQuery.matches),
    finePointerMatches: Boolean(finePointerQuery.matches),
  };
}

function dispatchHandoffEvent(documentRef, name, ctaLocation) {
  if (!documentRef || typeof documentRef.dispatchEvent !== "function") return;

  const CustomEventClass = documentRef.defaultView && documentRef.defaultView.CustomEvent
    ? documentRef.defaultView.CustomEvent
    : globalThis.CustomEvent;
  if (typeof CustomEventClass !== "function") return;

  documentRef.dispatchEvent(new CustomEventClass(name, {
    bubbles: true,
    detail: { cta_location: ctaLocation },
  }));
}

function setPanelOpen(trigger, panel, open) {
  panel.hidden = !open;
  trigger.setAttribute("aria-expanded", open ? "true" : "false");
}

export function createIphoneHandoff(options = {}) {
  const windowRef = options.windowRef || globalThis.window;
  const documentRef = options.documentRef || globalThis.document;
  const root = options.root;
  if (!windowRef || !documentRef || !root || typeof windowRef.matchMedia !== "function") return null;

  const existingController = controllersByRoot.get(root);
  if (existingController) return existingController;

  const trigger = root.querySelector("[data-iphone-handoff-trigger]");
  const panel = root.querySelector("[data-iphone-handoff-panel]");
  const closeButton = root.querySelector("[data-iphone-handoff-close]");
  const ctaLocation = root.dataset.ctaLocation;
  if (!trigger || !panel || !closeButton || !ctaLocation) return null;

  const minimumWidthQuery = windowRef.matchMedia("(min-width: 768px)");
  const finePointerQuery = windowRef.matchMedia("(hover: hover) and (pointer: fine)");
  const lifetimeState = lifetimeStateByRoot.get(root) || {
    offerRecorded: false,
    requestRecorded: false,
  };
  lifetimeStateByRoot.set(root, lifetimeState);
  let destroyed = false;
  let viewTracker = null;

  function recordOffer() {
    if (lifetimeState.offerRecorded) return;
    lifetimeState.offerRecorded = true;
    dispatchHandoffEvent(documentRef, IPHONE_HANDOFF_OFFER_VIEWED_EVENT, ctaLocation);
  }

  function recordRequest() {
    if (lifetimeState.requestRecorded) return;
    lifetimeState.requestRecorded = true;
    dispatchHandoffEvent(documentRef, IPHONE_HANDOFF_REQUESTED_EVENT, ctaLocation);
  }

  function closePanel({ returnFocus = false } = {}) {
    setPanelOpen(trigger, panel, false);
    if (returnFocus && typeof trigger.focus === "function") trigger.focus();
  }

  function startViewTracking() {
    if (viewTracker) viewTracker.disconnect();
    viewTracker = createAppStoreCtaViewTracker(Object.assign({}, options.viewTrackerOptions || {}, {
      documentRef,
      onView: recordOffer,
    }));
    viewTracker.register(trigger);
  }

  function updateEligibility() {
    if (destroyed) return;
    const eligible = isEligibleForIphoneHandoff(browserIdentity(windowRef, minimumWidthQuery, finePointerQuery));
    if (!eligible) {
      root.hidden = true;
      closePanel();
      if (viewTracker) {
        viewTracker.disconnect();
        viewTracker = null;
      }
      return;
    }

    root.hidden = false;
    startViewTracking();
  }

  const onTriggerClick = function () {
    if (panel.hidden) {
      recordOffer();
      recordRequest();
      setPanelOpen(trigger, panel, true);
      if (typeof trigger.focus === "function") trigger.focus();
    }
  };

  const onCloseClick = function () {
    closePanel({ returnFocus: true });
  };

  const onPanelKeydown = function (event) {
    if (event.key !== "Escape" || !panel.contains(documentRef.activeElement)) return;
    event.preventDefault();
    closePanel({ returnFocus: true });
  };

  trigger.addEventListener("click", onTriggerClick);
  closeButton.addEventListener("click", onCloseClick);
  panel.addEventListener("keydown", onPanelKeydown);

  const mediaChange = function () {
    updateEligibility();
  };
  [minimumWidthQuery, finePointerQuery].forEach(function (query) {
    if (typeof query.addEventListener === "function") query.addEventListener("change", mediaChange);
    else if (typeof query.addListener === "function") query.addListener(mediaChange);
  });

  updateEligibility();

  const controller = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (viewTracker) viewTracker.disconnect();
      viewTracker = null;
      trigger.removeEventListener("click", onTriggerClick);
      closeButton.removeEventListener("click", onCloseClick);
      panel.removeEventListener("keydown", onPanelKeydown);
      [minimumWidthQuery, finePointerQuery].forEach(function (query) {
        if (typeof query.removeEventListener === "function") query.removeEventListener("change", mediaChange);
        else if (typeof query.removeListener === "function") query.removeListener(mediaChange);
      });
      if (controllersByRoot.get(root) === controller) controllersByRoot.delete(root);
    },
    updateEligibility,
  };
  controllersByRoot.set(root, controller);
  return controller;
}

export function initializeIphoneHandoffs(documentRef = globalThis.document, windowRef = globalThis.window) {
  if (!documentRef || typeof documentRef.querySelectorAll !== "function") return [];
  return Array.from(documentRef.querySelectorAll("[data-iphone-handoff]")).map(function (root) {
    return createIphoneHandoff({ documentRef, windowRef, root });
  }).filter(Boolean);
}

if (typeof document !== "undefined") initializeIphoneHandoffs();

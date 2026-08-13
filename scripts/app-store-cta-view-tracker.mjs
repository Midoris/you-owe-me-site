const DEFAULT_DWELL_TIME_MS = 1000;
const DEFAULT_VISIBILITY_THRESHOLD = 0.5;

export function createAppStoreCtaViewTracker(options = {}) {
  const onView = typeof options.onView === "function" ? options.onView : function () {};
  const documentRef = options.documentRef || globalThis.document || null;
  const IntersectionObserverClass = options.IntersectionObserverClass || globalThis.IntersectionObserver;
  const setTimer = options.setTimeoutFn || globalThis.setTimeout;
  const clearTimer = options.clearTimeoutFn || globalThis.clearTimeout;
  const dwellTimeMs = Number.isFinite(options.dwellTimeMs)
    ? options.dwellTimeMs
    : DEFAULT_DWELL_TIME_MS;
  const visibilityThreshold = Number.isFinite(options.visibilityThreshold)
    ? options.visibilityThreshold
    : DEFAULT_VISIBILITY_THRESHOLD;
  const registeredLinks = new Set();
  const viewedLinks = new WeakSet();
  const qualifyingLinks = new WeakSet();
  const pendingTimers = new Map();
  let observer = null;

  function documentIsVisible() {
    return !documentRef || documentRef.visibilityState !== "hidden";
  }

  function linkIsEligible(link) {
    if (!link || link.isConnected === false) return false;
    if (typeof link.closest === "function" && link.closest("[hidden]")) return false;
    return true;
  }

  function cancelPendingView(link) {
    const timer = pendingTimers.get(link);
    if (timer !== undefined) {
      clearTimer(timer);
      pendingTimers.delete(link);
    }
  }

  function startPendingView(link) {
    if (viewedLinks.has(link) || pendingTimers.has(link)) return;

    const timer = setTimer(function () {
      pendingTimers.delete(link);
      if (!qualifyingLinks.has(link) || !documentIsVisible() || !linkIsEligible(link)) return;

      viewedLinks.add(link);
      qualifyingLinks.delete(link);
      if (observer) observer.unobserve(link);

      try {
        onView(link);
      } catch (error) {
        // Impression tracking must never interfere with the App Store link.
      }
    }, dwellTimeMs);

    pendingTimers.set(link, timer);
  }

  function handleEntries(entries) {
    entries.forEach(function (entry) {
      const link = entry.target;
      if (viewedLinks.has(link)) return;

      const qualifies = documentIsVisible()
        && entry.isIntersecting
        && entry.intersectionRatio >= visibilityThreshold
        && linkIsEligible(link);

      if (!qualifies) {
        qualifyingLinks.delete(link);
        cancelPendingView(link);
        return;
      }

      qualifyingLinks.add(link);
      startPendingView(link);
    });
  }

  if (typeof IntersectionObserverClass === "function") {
    try {
      observer = new IntersectionObserverClass(handleEntries, {
        threshold: [0, visibilityThreshold],
      });
    } catch (error) {
      observer = null;
    }
  }

  function register(link) {
    if (!link || registeredLinks.has(link)) return false;
    registeredLinks.add(link);
    if (!observer) return false;
    observer.observe(link);
    return true;
  }

  function handleVisibilityChange() {
    if (!documentIsVisible()) {
      pendingTimers.forEach(function (timer) {
        clearTimer(timer);
      });
      pendingTimers.clear();
      registeredLinks.forEach(function (link) {
        qualifyingLinks.delete(link);
      });
      return;
    }

    if (!observer) return;
    registeredLinks.forEach(function (link) {
      if (viewedLinks.has(link)) return;
      observer.unobserve(link);
      observer.observe(link);
    });
  }

  if (documentRef && typeof documentRef.addEventListener === "function") {
    documentRef.addEventListener("visibilitychange", handleVisibilityChange);
  }

  function disconnect() {
    pendingTimers.forEach(function (timer) {
      clearTimer(timer);
    });
    pendingTimers.clear();
    if (observer) observer.disconnect();
    if (documentRef && typeof documentRef.removeEventListener === "function") {
      documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    registeredLinks.clear();
  }

  return {
    register,
    disconnect,
  };
}

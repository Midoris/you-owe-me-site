import assert from "node:assert/strict";
import test from "node:test";

import {
  IPHONE_HANDOFF_OFFER_VIEWED_EVENT,
  IPHONE_HANDOFF_REQUESTED_EVENT,
  IPHONE_QR_VIEWED_EVENT,
  createIphoneHandoff,
  isEligibleForIphoneHandoff,
} from "./iphone-handoff.mjs";

class FakeIntersectionObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.observed = new Set();
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element) {
    this.observed.add(element);
  }

  unobserve(element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
  }

  trigger(element, ratio) {
    this.callback([{ target: element, intersectionRatio: ratio, isIntersecting: ratio > 0 }]);
  }
}

function makeTimers() {
  let nextId = 1;
  const callbacks = new Map();
  return {
    setTimeoutFn(callback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    clearTimeoutFn(id) {
      callbacks.delete(id);
    },
    runAll() {
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach((callback) => callback());
    },
    count() {
      return callbacks.size;
    },
  };
}

function makeElement() {
  const listeners = new Map();
  return {
    hidden: false,
    attributes: new Map(),
    isConnected: true,
    focused: false,
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    removeEventListener(name, callback) {
      listeners.get(name)?.delete(callback);
    },
    dispatch(name, event = {}) {
      for (const callback of listeners.get(name) || []) {
        callback({ key: "", preventDefault() {}, ...event });
      }
    },
    focus() {
      this.focused = true;
    },
  };
}

function makeHarness() {
  FakeIntersectionObserver.instances = [];
  const timers = makeTimers();
  const trigger = makeElement();
  const panel = makeElement();
  const close = makeElement();
  const root = makeElement();
  panel.hidden = true;
  root.hidden = true;
  const events = [];
  const documentListeners = new Map();
  const documentRef = {
    visibilityState: "visible",
    activeElement: null,
    defaultView: {
      CustomEvent: class {
        constructor(type, init) {
          this.type = type;
          this.detail = init.detail;
        }
      },
    },
    addEventListener(name, callback) {
      documentListeners.set(name, callback);
    },
    removeEventListener(name) {
      documentListeners.delete(name);
    },
    dispatchEvent(event) {
      events.push(event);
    },
  };
  root.dataset = { ctaLocation: "homepage_iphone_handoff" };
  root.querySelector = (selector) => ({
    "[data-iphone-handoff-trigger]": trigger,
    "[data-iphone-handoff-panel]": panel,
    "[data-iphone-handoff-close]": close,
  })[selector] || null;
  trigger.closest = (selector) => selector === "[hidden]" && root.hidden ? root : null;
  panel.contains = (element) => element === panel || element === close;
  const queries = new Map();
  function makeQuery(matches) {
    const listeners = new Set();
    return {
      matches,
      addEventListener(name, callback) {
        if (name === "change") listeners.add(callback);
      },
      removeEventListener(name, callback) {
        if (name === "change") listeners.delete(callback);
      },
      change(nextMatches) {
        this.matches = nextMatches;
        listeners.forEach((callback) => callback());
      },
    };
  }
  queries.set("(min-width: 768px)", makeQuery(true));
  queries.set("(hover: hover) and (pointer: fine)", makeQuery(true));
  const windowRef = {
    navigator: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      platform: "MacIntel",
      maxTouchPoints: 0,
    },
    matchMedia(query) {
      return queries.get(query);
    },
  };
  const options = {
    windowRef,
    documentRef,
    root,
    viewTrackerOptions: {
      IntersectionObserverClass: FakeIntersectionObserver,
      setTimeoutFn: timers.setTimeoutFn,
      clearTimeoutFn: timers.clearTimeoutFn,
    },
  };
  const controller = createIphoneHandoff(options);
  return { controller, close, documentRef, events, options, panel, queries, root, timers, trigger };
}

function makeVisibleHarness({ complete = false, naturalWidth = 0 } = {}) {
  FakeIntersectionObserver.instances = [];
  const timers = makeTimers();
  const qr = makeElement();
  const instruction = makeElement();
  const root = makeElement();
  root.hidden = true;
  qr.complete = complete;
  qr.naturalWidth = naturalWidth;
  qr.closest = (selector) => selector === "[hidden]" && (root.hidden || qr.hidden) ? root : null;
  const events = [];
  const documentListeners = new Map();
  const documentRef = {
    visibilityState: "visible",
    defaultView: {
      CustomEvent: class {
        constructor(type, init) {
          this.type = type;
          this.detail = init.detail;
        }
      },
    },
    addEventListener(name, callback) {
      documentListeners.set(name, callback);
    },
    removeEventListener(name) {
      documentListeners.delete(name);
    },
    dispatch(name) {
      documentListeners.get(name)?.();
    },
    dispatchEvent(event) {
      events.push(event);
    },
  };
  root.dataset = {
    ctaLocation: "split_result_iphone_handoff",
    iphoneHandoffMode: "visible",
  };
  root.querySelector = (selector) => ({
    "[data-iphone-handoff-qr]": qr,
    "[data-iphone-handoff-instruction]": instruction,
  })[selector] || null;
  const queries = new Map();
  function makeQuery(matches) {
    const listeners = new Set();
    return {
      matches,
      addEventListener(name, callback) {
        if (name === "change") listeners.add(callback);
      },
      removeEventListener(name, callback) {
        if (name === "change") listeners.delete(callback);
      },
      change(nextMatches) {
        this.matches = nextMatches;
        listeners.forEach((callback) => callback());
      },
    };
  }
  queries.set("(min-width: 768px)", makeQuery(true));
  queries.set("(hover: hover) and (pointer: fine)", makeQuery(true));
  const windowRef = {
    navigator: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      platform: "MacIntel",
      maxTouchPoints: 0,
    },
    matchMedia(query) {
      return queries.get(query);
    },
  };
  const options = {
    windowRef,
    documentRef,
    root,
    viewTrackerOptions: {
      IntersectionObserverClass: FakeIntersectionObserver,
      setTimeoutFn: timers.setTimeoutFn,
      clearTimeoutFn: timers.clearTimeoutFn,
    },
  };
  const controller = createIphoneHandoff(options);
  return { controller, documentRef, events, instruction, options, qr, queries, root, timers };
}

test("uses the conservative desktop eligibility table", () => {
  const desktop = {
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    platform: "Linux x86_64",
    maxTouchPoints: 0,
    minimumWidthMatches: true,
    finePointerMatches: true,
  };
  assert.equal(isEligibleForIphoneHandoff(desktop), true);
  assert.equal(isEligibleForIphoneHandoff({ ...desktop, userAgent: "Mozilla/5.0 (iPhone) Mobile" }), false);
  assert.equal(isEligibleForIphoneHandoff({ ...desktop, userAgent: "Mozilla/5.0 (Android)" }), false);
  assert.equal(isEligibleForIphoneHandoff({ ...desktop, platform: "MacIntel", maxTouchPoints: 5 }), false);
  assert.equal(isEligibleForIphoneHandoff({ ...desktop, minimumWidthMatches: false }), false);
  assert.equal(isEligibleForIphoneHandoff({ ...desktop, finePointerMatches: false }), false);
});

test("records a qualifying view once and resets without events when eligibility changes", () => {
  const { events, panel, queries, root, timers, trigger } = makeHarness();
  assert.equal(root.hidden, false);
  FakeIntersectionObserver.instances[0].trigger(trigger, 0.5);
  assert.equal(timers.count(), 1);
  timers.runAll();
  assert.deepEqual(events.map((event) => event.type), [IPHONE_HANDOFF_OFFER_VIEWED_EVENT]);

  trigger.dispatch("click");
  assert.equal(panel.hidden, false);
  assert.deepEqual(events.map((event) => event.type), [
    IPHONE_HANDOFF_OFFER_VIEWED_EVENT,
    IPHONE_HANDOFF_REQUESTED_EVENT,
  ]);
  queries.get("(min-width: 768px)").change(false);
  assert.equal(root.hidden, true);
  assert.equal(panel.hidden, true);
  assert.equal(trigger.attributes.get("aria-expanded"), "false");
});

test("a quick deliberate request records offer before request and close returns focus", () => {
  const { close, documentRef, events, panel, trigger } = makeHarness();
  trigger.dispatch("click");
  assert.equal(panel.hidden, false);
  assert.deepEqual(events.map((event) => event.type), [
    IPHONE_HANDOFF_OFFER_VIEWED_EVENT,
    IPHONE_HANDOFF_REQUESTED_EVENT,
  ]);
  close.dispatch("click");
  assert.equal(panel.hidden, true);
  assert.equal(trigger.focused, true);

  trigger.focused = false;
  trigger.dispatch("click");
  documentRef.activeElement = close;
  panel.dispatch("keydown", { key: "Escape" });
  assert.equal(panel.hidden, true);
  assert.equal(trigger.focused, true);
  assert.equal(events.length, 2, "close, reopen, and Escape do not duplicate events");
});

test("repeated initialization shares one controller and one offer/request sequence", () => {
  const { controller, events, options, timers, trigger } = makeHarness();
  const duplicateController = createIphoneHandoff(options);
  assert.equal(duplicateController, controller);
  assert.equal(FakeIntersectionObserver.instances.length, 1, "only one visibility observer is created");

  FakeIntersectionObserver.instances[0].trigger(trigger, 0.5);
  timers.runAll();
  trigger.dispatch("click");
  assert.deepEqual(events.map((event) => event.type), [
    IPHONE_HANDOFF_OFFER_VIEWED_EVENT,
    IPHONE_HANDOFF_REQUESTED_EVENT,
  ]);
});

test("visible mode only records a loaded QR after foreground dwell, never a legacy offer or request", () => {
  const { documentRef, events, qr, root, timers } = makeVisibleHarness();
  assert.equal(root.hidden, false, "the automatic card is visible only after the desktop gate passes");
  assert.equal(FakeIntersectionObserver.instances.length, 0, "an unloaded QR is not an exposure target");

  qr.complete = true;
  qr.naturalWidth = 472;
  qr.dispatch("load");
  const observer = FakeIntersectionObserver.instances.at(-1);
  observer.trigger(qr, 0.5);
  assert.equal(timers.count(), 1);

  documentRef.visibilityState = "hidden";
  documentRef.dispatch("visibilitychange");
  timers.runAll();
  assert.equal(events.length, 0, "background time is not counted toward QR exposure");

  documentRef.visibilityState = "visible";
  documentRef.dispatch("visibilitychange");
  observer.trigger(qr, 0.5);
  timers.runAll();
  assert.deepEqual(events.map((event) => event.type), [IPHONE_QR_VIEWED_EVENT]);
  assert.deepEqual(events[0].detail, { cta_location: "split_result_iphone_handoff" });
});

test("visible mode hides a broken QR and cancels/deduplicates through breakpoint and lifecycle changes", () => {
  const broken = makeVisibleHarness({ complete: true, naturalWidth: 0 });
  assert.equal(broken.root.hidden, false);
  assert.equal(broken.qr.hidden, true, "a broken image does not leave a browser error icon");
  assert.equal(broken.instruction.hidden, true, "camera instructions disappear when there is nothing to scan");
  assert.equal(FakeIntersectionObserver.instances.length, 0, "a broken image cannot create an exposure");

  const harness = makeVisibleHarness({ complete: true, naturalWidth: 472 });
  const observer = FakeIntersectionObserver.instances.at(-1);
  observer.trigger(harness.qr, 1);
  assert.equal(harness.timers.count(), 1);
  harness.queries.get("(min-width: 768px)").change(false);
  assert.equal(harness.root.hidden, true);
  assert.equal(harness.timers.count(), 0, "hiding the result card cancels its pending dwell");
  harness.timers.runAll();
  assert.equal(harness.events.length, 0);

  harness.queries.get("(min-width: 768px)").change(true);
  FakeIntersectionObserver.instances.at(-1).trigger(harness.qr, 1);
  harness.timers.runAll();
  assert.deepEqual(harness.events.map((event) => event.type), [IPHONE_QR_VIEWED_EVENT]);

  harness.controller.destroy();
  const recreated = createIphoneHandoff(harness.options);
  assert.ok(recreated);
  assert.equal(FakeIntersectionObserver.instances.length, 2, "a recorded root is not registered again after recreation");
  assert.equal(harness.timers.count(), 0, "shared lifetime state prevents a second exposure");
});

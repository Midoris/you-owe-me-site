import assert from "node:assert/strict";
import test from "node:test";

import { createAppStoreCtaViewTracker } from "./app-store-cta-view-tracker.mjs";

class FakeIntersectionObserver {
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = new Set();
    this.observeCalls = 0;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target) {
    this.observeCalls += 1;
    this.observed.add(target);
  }

  unobserve(target) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
  }

  trigger(target, intersectionRatio, isIntersecting = intersectionRatio > 0) {
    this.callback([{ target, intersectionRatio, isIntersecting }]);
  }
}

function makeTimers() {
  let nextId = 1;
  const callbacks = new Map();
  const delays = [];

  return {
    setTimeoutFn(callback, delay) {
      const id = nextId++;
      callbacks.set(id, callback);
      delays.push(delay);
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
    delays,
  };
}

function makeDocument() {
  const listeners = new Map();
  return {
    visibilityState: "visible",
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    removeEventListener(name) {
      listeners.delete(name);
    },
    dispatch(name) {
      const callback = listeners.get(name);
      if (callback) callback();
    },
  };
}

function makeLink() {
  return {
    isConnected: true,
    hiddenAncestor: false,
    closest(selector) {
      return selector === "[hidden]" && this.hiddenAncestor ? {} : null;
    },
  };
}

function makeHarness() {
  FakeIntersectionObserver.instances = [];
  const timers = makeTimers();
  const documentRef = makeDocument();
  const views = [];
  const tracker = createAppStoreCtaViewTracker({
    onView: (link) => views.push(link),
    documentRef,
    IntersectionObserverClass: FakeIntersectionObserver,
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  return {
    tracker,
    observer: FakeIntersectionObserver.instances[0],
    timers,
    documentRef,
    views,
  };
}

test("logs once after one continuous qualifying interval", () => {
  const { tracker, observer, timers, views } = makeHarness();
  const link = makeLink();

  assert.equal(tracker.register(link), true);
  assert.equal(tracker.register(link), false);
  assert.deepEqual(observer.options.threshold, [0, 0.5]);
  assert.equal(observer.observeCalls, 1);

  observer.trigger(link, 0.5);
  assert.equal(views.length, 0);
  assert.equal(timers.count(), 1);
  assert.deepEqual(timers.delays, [1000]);
  timers.runAll();
  assert.deepEqual(views, [link]);

  observer.trigger(link, 0.8);
  timers.runAll();
  assert.deepEqual(views, [link]);
});

test("cancels a pending view when visibility drops below half", () => {
  const { tracker, observer, timers, views } = makeHarness();
  const link = makeLink();
  tracker.register(link);

  observer.trigger(link, 0.75);
  assert.equal(timers.count(), 1);
  observer.trigger(link, 0.2, true);
  assert.equal(timers.count(), 0);
  timers.runAll();
  assert.equal(views.length, 0);

  observer.trigger(link, 0.6);
  timers.runAll();
  assert.deepEqual(views, [link]);
});

test("tracks separate links independently, including an initially hidden link", () => {
  const { tracker, observer, timers, views } = makeHarness();
  const firstLink = makeLink();
  const secondLink = makeLink();
  secondLink.hiddenAncestor = true;

  tracker.register(firstLink);
  tracker.register(secondLink);
  observer.trigger(firstLink, 1);
  observer.trigger(secondLink, 0.75);
  assert.equal(timers.count(), 1);
  timers.runAll();
  assert.deepEqual(views, [firstLink]);

  secondLink.hiddenAncestor = false;
  observer.trigger(secondLink, 0.55);
  timers.runAll();
  assert.deepEqual(views, [firstLink, secondLink]);
});

test("a hidden document cancels pending time and re-observes unviewed links", () => {
  const { tracker, observer, timers, documentRef, views } = makeHarness();
  const link = makeLink();
  tracker.register(link);
  observer.trigger(link, 1);

  documentRef.visibilityState = "hidden";
  documentRef.dispatch("visibilitychange");
  assert.equal(timers.count(), 0);
  timers.runAll();
  assert.equal(views.length, 0);

  documentRef.visibilityState = "visible";
  documentRef.dispatch("visibilitychange");
  assert.equal(observer.observeCalls, 2);
  observer.trigger(link, 1);
  timers.runAll();
  assert.deepEqual(views, [link]);
});

test("does not throw or schedule views without IntersectionObserver", () => {
  const timers = makeTimers();
  const tracker = createAppStoreCtaViewTracker({
    IntersectionObserverClass: null,
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
    documentRef: makeDocument(),
  });

  assert.equal(tracker.register(makeLink()), false);
  assert.equal(timers.count(), 0);
  tracker.disconnect();
});

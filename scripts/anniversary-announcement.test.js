const test = require("node:test");
const assert = require("node:assert/strict");
const anniversary = require("./anniversary-announcement.js");

class FakeNode {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.hidden = this.attributes.has("hidden");
    this.textContent = "";
    this.nodes = new Map();
  }

  add(selector, node = new FakeNode()) {
    this.nodes.set(selector, node);
    return node;
  }

  querySelector(selector) {
    return this.nodes.get(selector) || null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

class FakeDocument {
  constructor(modules, readyState = "complete") {
    this.modules = modules;
    this.readyState = readyState;
    this.listeners = new Map();
  }

  querySelectorAll(selector) {
    return selector === anniversary.ANNOUNCEMENT_SELECTOR ? this.modules : [];
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }
}

function standardModule() {
  const moduleElement = new FakeNode({
    "data-anniversary-variant": "standard",
    hidden: "",
    "aria-hidden": "true",
  });
  moduleElement.add("[data-anniversary-eyebrow]");
  moduleElement.add("[data-anniversary-heading]");
  moduleElement.add("[data-anniversary-body]");
  moduleElement.add("[data-anniversary-cta]");
  return moduleElement;
}

function inlineModule() {
  const moduleElement = new FakeNode({
    "data-anniversary-variant": "inline",
    hidden: "",
    "aria-hidden": "true",
  });
  moduleElement.add("[data-anniversary-inline-label]");
  moduleElement.add("[data-anniversary-inline-body]");
  return moduleElement;
}

test("campaign dates resolve using local calendar boundaries", () => {
  assert.equal(anniversary.phaseForDate(new Date(2026, 7, 25, 12)), "inactive");
  assert.equal(anniversary.phaseForDate(new Date(2026, 7, 26, 0, 0)), "active");
  assert.equal(anniversary.phaseForDate(new Date(2026, 8, 1, 23, 59)), "active");
  assert.equal(anniversary.phaseForDate(new Date(2026, 8, 2, 0, 0)), "final");
  assert.equal(anniversary.phaseForDate(new Date(2026, 8, 4, 23, 59)), "final");
  assert.equal(anniversary.phaseForDate(new Date(2026, 8, 5, 0, 0)), "inactive");
  assert.equal(anniversary.phaseForDate(new Date("invalid")), "inactive");
});

test("active standard state uses the exact copy and destination", () => {
  const moduleElement = standardModule();
  anniversary.applyState(moduleElement, "active");

  assert.equal(moduleElement.querySelector("[data-anniversary-heading]").textContent, "You Owe Me is 10.");
  assert.equal(moduleElement.querySelector("[data-anniversary-body]").textContent, "Explore a decade of clearer money between people. Eligible free users can also find a limited anniversary upgrade offer in the app through September 4.");
  assert.equal(moduleElement.querySelector("[data-anniversary-cta]").textContent, "Explore the ten-year story");
  assert.equal(moduleElement.querySelector("[data-anniversary-cta]").getAttribute("href"), "/10-years/");
  assert.equal(moduleElement.hidden, false);
});

test("final standard state uses the exact copy and destination", () => {
  const moduleElement = standardModule();
  anniversary.applyState(moduleElement, "final");

  assert.equal(moduleElement.querySelector("[data-anniversary-eyebrow]").textContent, "Final days");
  assert.equal(moduleElement.querySelector("[data-anniversary-heading]").textContent, "The anniversary offer ends September 4.");
  assert.equal(moduleElement.querySelector("[data-anniversary-body]").textContent, "The ten-year story will remain. If you are an eligible free user, the limited upgrade offer is available in the app through September 4.");
  assert.equal(moduleElement.querySelector("[data-anniversary-cta]").textContent, "Explore the anniversary");
  assert.equal(moduleElement.querySelector("[data-anniversary-cta]").getAttribute("href"), "/10-years/");
});

test("active and final inline states use the exact copy", () => {
  const moduleElement = inlineModule();
  anniversary.applyState(moduleElement, "active");
  assert.equal(moduleElement.querySelector("[data-anniversary-inline-label]").textContent, "Anniversary live");
  assert.equal(moduleElement.querySelector("[data-anniversary-inline-body]").textContent, "You Owe Me is 10. Eligible free users can also find the limited anniversary offer in the app through September 4.");

  anniversary.applyState(moduleElement, "final");
  assert.equal(moduleElement.querySelector("[data-anniversary-inline-label]").textContent, "Final days");
  assert.equal(moduleElement.querySelector("[data-anniversary-inline-body]").textContent, "The anniversary offer for eligible free users ends September 4. The ten-year story will remain.");
});

test("inactive restores hidden and aria-hidden after a visible phase", () => {
  const moduleElement = standardModule();
  anniversary.applyState(moduleElement, "active");
  anniversary.applyState(moduleElement, "inactive");

  assert.equal(moduleElement.hidden, true);
  assert.equal(moduleElement.getAttribute("aria-hidden"), "true");
  assert.equal(moduleElement.getAttribute("data-anniversary-phase"), "inactive");
});

test("render updates multiple modules", () => {
  const standard = standardModule();
  const inline = inlineModule();
  const documentObject = new FakeDocument([standard, inline]);

  assert.equal(anniversary.render(documentObject, new Date(2026, 7, 26, 12)), true);
  assert.equal(standard.getAttribute("data-anniversary-phase"), "active");
  assert.equal(inline.getAttribute("data-anniversary-phase"), "active");
});

test("missing optional nodes fail safely", () => {
  const incomplete = new FakeNode({ "data-anniversary-variant": "standard" });
  assert.doesNotThrow(() => anniversary.applyState(incomplete, "active"));
  assert.equal(incomplete.hidden, false);
  assert.equal(incomplete.getAttribute("data-anniversary-phase"), "active");
});

test("initialize uses the injected timer seam once after DOM readiness", () => {
  const moduleElement = standardModule();
  const documentObject = new FakeDocument([moduleElement], "loading");
  const timerCalls = [];
  const FixedDate = class extends Date {
    constructor() {
      super(2026, 7, 26, 12);
    }
  };

  anniversary.initialize(documentObject, FixedDate, (callback, delay) => {
    timerCalls.push({ callback, delay });
    return 1;
  });

  assert.equal(timerCalls.length, 0);
  documentObject.listeners.get("DOMContentLoaded")();
  assert.equal(timerCalls.length, 1);
  assert.equal(timerCalls[0].delay, anniversary.REFRESH_INTERVAL_MS);
  assert.equal(moduleElement.getAttribute("data-anniversary-phase"), "active");
  assert.equal(anniversary.initialize(documentObject, FixedDate, () => {}), false);
});

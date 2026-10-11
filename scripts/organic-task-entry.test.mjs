import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import test from "node:test";
import vm from "node:vm";
import { createRequire } from "node:module";
import { parseStaticPage } from "../tests/helpers/static-dom.mjs";

const require = createRequire(import.meta.url);
const transfer = require("./tool-transfer.js");
const root = new URL("../", import.meta.url);
const read = file => readFile(new URL(file, root), "utf8");
const splitPage = await read("tools/split-expense-calculator/index.html");
const splitScript = await read("scripts/split-expense-calculator.js");
const articlePage = await read("blog/how-to-ask-someone-to-pay-you-back-without-being-rude/index.html");
const copyScript = await read("scripts/repayment-reminder-text-examples.js");
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));

function runtime(html, options = {}) {
  const document = parseStaticPage(html);
  const events = [], copied = [], fetches = [], navigations = [], timers = [];
  const storage = new Map(options.storage || []);
  const window = {
    isSecureContext: true,
    UomiToolTransfer: transfer,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout(callback) { timers.push(callback); return timers.length; },
    clearTimeout() {},
    dispatchEvent(event) { events.push(plain(event)); },
  };
  const navigator = {
    userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 1,
    clipboard: { async writeText(text) {
      if (options.clipboardFails) throw new Error("denied");
      copied.push(text);
    } },
    share: options.share,
  };
  document.execCommand = command => {
    assert.equal(command, "copy");
    const textarea = document.querySelector("textarea");
    assert.ok(textarea?.selectionMade, "fallback selects only its temporary textarea");
    if (options.fallbackFails) return false;
    copied.push(textarea.value);
    return true;
  };
  const context = vm.createContext({
    window, document, navigator, crypto: webcrypto, AbortController,
    location: { assign(url) { navigations.push(url); } },
    sessionStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    fetch: async (...args) => { fetches.push(args); return options.fetch ? options.fetch(...args) : { ok: true }; },
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
  });
  const query = selector => {
    const node = document.querySelector(selector);
    assert.ok(node, `fixture contains ${selector}`);
    return node;
  };
  const click = selector => query(selector).dispatchEvent({ type: "click" });
  const edit = (selector, value, type = "input") => {
    const node = query(selector);
    if (typeof value === "boolean") node.checked = value; else node.value = value;
    node.dispatchEvent({ type });
  };
  return { document, window, context, events, copied, fetches, navigations, storage, timers, query, click, edit };
}

function calculator(options) {
  const env = runtime(splitPage, options);
  // Expose existing functions in the test VM only; production has no test API.
  vm.runInContext(splitScript.replace('  if (document.readyState === "loading")',
    '  window.testCalculator = { state, calculate, buildSummaryText };\n  if (document.readyState === "loading")'), env.context);
  env.snapshot = () => plain(env.window.testCalculator.state);
  env.result = () => plain(env.window.testCalculator.calculate());
  env.action = name => env.click(`[data-action="${name}"]`);
  env.expenseInput = prefix => `#${prefix}-${env.snapshot().expenses[0].id}`;
  return env;
}

test("People disclosure preserves node, open state, identities and results across edits", () => {
  const env = calculator();
  const details = env.query(".people-disclosure");
  const summary = env.query("[data-people-summary]");
  const before = env.snapshot(), result = env.result();
  assert.equal(details.open, false);
  assert.equal(env.query('[data-action="add-person"]').closest("details"), null);
  assert.equal(env.query("[data-example-marker]").hidden, false);
  for (const open of [true, false, true]) {
    details.open = open;
    summary.dispatchEvent({ type: "click" });
    details.dispatchEvent({ type: "toggle" });
    assert.deepEqual(env.snapshot(), before);
    assert.deepEqual(env.result(), result);
  }
  assert.deepEqual(env.events, []);
  assert.equal(env.query("[data-example-marker]").hidden, false);
  env.edit(`#person-${before.people[0].id}`, "Alex");
  env.edit(`#person-${before.people[1].id}`, "Alex");
  env.edit(env.expenseInput("paid"), before.people[1].id, "change");
  env.edit(env.expenseInput("amount"), "120");
  env.edit("#currency-symbol", "EUR");
  env.edit(`#included-${before.expenses[0].id}-${before.people[2].id}`, false, "change");
  env.action("add-expense");
  assert.equal(env.query(".people-disclosure"), details);
  assert.equal(env.query("[data-people-summary]"), summary);
  assert.equal(details.open, true);
  const edited = env.snapshot();
  assert.deepEqual(edited.people.map(p => p.id), before.people.map(p => p.id));
  assert.deepEqual(edited.people.map(p => p.name), ["Alex", "Alex", "Person 3"]);
  assert.equal(edited.currency, "EUR");
  assert.equal(edited.expenses[0].paidBy, before.people[1].id);
  assert.deepEqual(edited.expenses[0].includedPeople, before.people.slice(0, 2).map(p => p.id));
  assert.equal(edited.expenses[1].paidBy, before.people[0].id);
  assert.equal(env.result().total, 120);
  assert.deepEqual(env.result().transfers, [{ from: "Alex", to: "Alex", amount: 60 }]);
  assert.equal(env.query("[data-example-marker]").hidden, true);
  assert.deepEqual(env.fetches, []);
  assert.deepEqual(env.navigations, []);
  assert.deepEqual(env.events.map(e => e.detail), [{ eventName: "split_result_ready" }, { eventName: "split_transfer_offer_viewed" }]);
});

test("expense DOM and keyboard order puts amount and payer before participants and optional description", () => {
  const env = calculator();
  const controls = env.query(".expense-card").querySelectorAll("input, select");
  assert.match(controls[0].id, /^amount-/);
  assert.match(controls[1].id, /^paid-/);
  assert.ok(controls.slice(2, -1).every(n => n.id.startsWith("included-")));
  assert.match(controls.at(-1).id, /^description-/);
  assert.equal(env.query(".expense-card").querySelectorAll("label").at(-1).textContent, "Description (optional)");
});

test("existing person/expense limits, payer removal, validation and reset semantics survive compact entry", () => {
  const env = calculator();
  const details = env.query(".people-disclosure"); details.open = true;
  for (let i = 0; i < 10; i++) env.action("add-person");
  assert.equal(env.snapshot().people.length, 12);
  assert.match(env.query("[data-people-summary]").textContent, /^People \(12\)/);
  assert.match(env.query("#people-message").textContent, /up to 12/);
  details.open = false;
  env.action("add-person");
  assert.equal(env.query("#people-message").closest("details"), null, "limit feedback remains visible with People closed");
  assert.match(env.query("#people-message").textContent, /up to 12/);
  assert.equal(env.snapshot().expenses[0].includedPeople.length, 12);
  for (let i = 0; i < 31; i++) env.action("add-expense");
  assert.equal(env.snapshot().expenses.length, 30);
  assert.match(env.query("#people-message").textContent, /up to 30/);
  assert.equal(details.open, false);
  assert.equal(env.query("#people-message").closest("details"), null);
  const atLimit = env.snapshot();
  env.action("add-expense");
  assert.deepEqual(env.snapshot(), atLimit);
  details.open = true;
  env.action("clear-all");
  assert.equal(details.open, true);
  assert.equal(env.snapshot().expenses[0].amount, "");
  assert.equal(env.result().validCount, 0);
  assert.equal(env.query("[data-example-marker]").hidden, true);
  const payer = env.snapshot().people[0].id;
  env.click(`#person-${payer}`); // Name focus alone is not a meaningful edit.
  env.query(`#person-${payer}`).parentNode.parentNode.querySelector("button").dispatchEvent({ type: "click" });
  assert.equal(env.snapshot().people.length, 2);
  assert.equal(env.snapshot().expenses[0].paidBy, env.snapshot().people[0].id);
  assert.ok(!env.snapshot().expenses[0].includedPeople.includes(payer));
  env.query(".person-row").querySelector("button").dispatchEvent({ type: "click" });
  assert.equal(env.snapshot().people.length, 2);
  for (const amount of ["", "0", "-1"]) {
    env.edit(env.expenseInput("amount"), amount);
    assert.equal(env.result().validCount, 0);
  }
  assert.match(env.query(".expense-validation").textContent, /greater than zero/);
  env.action("use-example");
  assert.equal(env.snapshot().people.length, 3);
  assert.equal(env.snapshot().expenses.length, 3);
  assert.equal(env.result().total, 180);
  assert.deepEqual(env.result().transfers, [{ from: "Sam", to: "Alex", amount: 25 }, { from: "Sam", to: "Mia", amount: 10 }]);
  assert.equal(env.query("[data-example-marker]").hidden, false);
  assert.deepEqual(env.fetches, []);
});

test("copy/share success, cancellation and fallback keep canonical URLs and fixed action metadata", async () => {
  const shared = [];
  const env = calculator({ share: async data => shared.push(plain(data)) });
  env.edit(env.expenseInput("amount"), "60");
  env.action("copy-summary"); await flush();
  env.action("share-summary"); await flush();
  assert.match(env.copied[0], /Person 2 owes Person 1 \$20/);
  assert.equal(shared[0].url, "https://you-owe-me.com/tools/split-expense-calculator/");
  assert.deepEqual(env.events.map(e => e.detail), ["split_result_ready", "split_transfer_offer_viewed", "split_summary_copied", "split_summary_shared"].map(eventName => ({ eventName })));
  const cancelled = calculator({ share: async () => { throw Object.assign(new Error("cancel"), { name: "AbortError" }); } });
  cancelled.edit(cancelled.expenseInput("amount"), "60");
  cancelled.action("share-summary"); await flush();
  assert.deepEqual(cancelled.copied, []);
  assert.ok(!cancelled.events.some(e => e.detail.eventName.includes("shared")));
  const fallback = calculator({ clipboardFails: true, share: async () => { throw new Error("unsupported"); } });
  fallback.edit(fallback.expenseInput("amount"), "60");
  fallback.action("share-summary"); await flush();
  assert.equal(fallback.copied.length, 1);
  assert.equal(fallback.events.at(-1).detail.eventName, "split_share_fallback_copied");
  assert.equal(fallback.document.querySelector("textarea"), null);
  for (const fixture of [env, cancelled, fallback]) {
    assert.deepEqual(fixture.fetches, []);
    assert.deepEqual(fixture.navigations, []);
    assert.ok(fixture.events.every(e => Object.keys(e.detail).join() === "eventName"));
  }
});

test("only explicit continuation uploads, rejects stale replies and restores edited state on Back", async () => {
  const env = calculator();
  env.action("track-split"); await flush();
  assert.deepEqual(env.fetches, []);
  env.edit(env.expenseInput("amount"), "60");
  env.action("track-split"); await flush();
  assert.equal(env.fetches.length, 1);
  assert.equal(env.navigations.length, 1);
  assert.match(env.navigations[0], /^https:\/\/continue.you-owe-me.com\/split\/\?ref=[a-f0-9]{64}$/);
  const saved = env.snapshot();
  const restored = calculator({ storage: [...env.storage] });
  assert.deepEqual(restored.snapshot(), saved);
  assert.equal(restored.storage.size, 0);
  assert.equal(restored.query("[data-example-marker]").hidden, true);
  assert.deepEqual(restored.fetches, []);
  let complete;
  const stale = calculator({ fetch: () => new Promise(resolve => { complete = resolve; }) });
  stale.edit(stale.expenseInput("amount"), "60");
  stale.action("track-split");
  stale.edit(stale.expenseInput("amount"), "90");
  complete({ ok: true }); await flush();
  assert.deepEqual(stale.navigations, []);
  assert.match(stale.query("[data-transfer-status]").textContent, /split is still here/);
});

test("three article messages are selectable before the image, with matching templates and one shared controller", () => {
  const document = parseStaticPage(articlePage);
  const cards = document.querySelectorAll(".template-card");
  assert.equal(cards.length, 3);
  assert.equal(document.querySelectorAll("[data-copy-status]").length, 1);
  assert.equal((articlePage.match(/src="\/scripts\/repayment-reminder-text-examples.js"/g) || []).length, 1);
  assert.doesNotMatch(articlePage, /polite-reminder-post-copy.js|data-post-copy-app-prompt|repayment-customizer|data-filter=/);
  for (const card of cards) {
    const message = card.querySelector(".template-card__message");
    assert.equal(message.textContent, message.getAttribute("data-template"));
    assert.ok(message.textContent.length > 50);
    const id = card.getAttribute("data-template-id");
    assert.ok(articlePage.indexOf(`data-copy-template="${id}"`) < articlePage.indexOf('<figure class="lt-articleImage">'));
  }
  assert.equal((articlePage.match(/href="\/blog\/how-to-remind-someone-they-owe-you-money-politely\/"/g) || []).length, 1);
  assert.match(articlePage, /"datePublished": "2026-02-16"/);
});

test("all three article copies emit only existing fixed metadata and leave app actions in place", async () => {
  const env = runtime(articlePage);
  const app = env.query('[data-track-location="blog_article_end_cta"]');
  const parent = app.parentNode;
  const messages = env.document.querySelectorAll(".template-card__message").map(n => n.textContent);
  vm.runInContext(copyScript, env.context);
  for (const button of env.document.querySelectorAll("[data-copy-template]")) {
    button.dispatchEvent({ type: "click" }); await flush();
    assert.equal(button.textContent, "Copied");
  }
  assert.deepEqual(env.copied, messages);
  assert.equal(env.events.length, 3);
  for (const [index, event] of env.events.entries()) {
    assert.equal(event.type, "youoweme:tool-template-copy");
    assert.deepEqual(Object.keys(event.detail).sort(), ["category", "page", "template_id", "tone"]);
    assert.equal(event.detail.page, "blog_how_to_ask_someone_to_pay_you_back_without_being_rude");
    assert.equal(event.detail.tone, "polite");
    assert.equal(event.detail.category, "first-request");
    assert.equal(event.detail.template_id, env.document.querySelectorAll(".template-card")[index].getAttribute("data-template-id"));
  }
  assert.equal(app.parentNode, parent);
  assert.deepEqual(env.navigations, []);
  assert.deepEqual(env.fetches, []);
  env.timers.forEach(callback => callback());
  assert.ok(env.document.querySelectorAll("[data-copy-template]").every(n => n.textContent === "Copy message"));
});

test("article clipboard denial falls back; complete failure reports manual copying without a success event", async () => {
  for (const fallbackFails of [false, true]) {
    const env = runtime(articlePage, { clipboardFails: true, fallbackFails });
    vm.runInContext(copyScript, env.context);
    env.click('[data-copy-template="first-request-loan-no-date"]'); await flush();
    assert.equal(env.document.querySelector("textarea"), null);
    assert.equal(env.events.length, fallbackFails ? 0 : 1);
    assert.equal(env.copied.length, fallbackFails ? 0 : 1);
    assert.match(env.query("[data-copy-status]").textContent, fallbackFails ? /Select the message text/ : /Copied Money lent/);
    assert.deepEqual(env.fetches, []);
    assert.deepEqual(env.navigations, []);
  }
});

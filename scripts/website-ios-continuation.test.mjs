import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { parseStaticPage } from "../tests/helpers/static-dom.mjs";
import { createIphoneHandoff } from "./iphone-handoff.mjs";

const require = createRequire(import.meta.url);
const language = require("./app-language-support.js");
const read = file => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const reminder = await read("blog/how-to-remind-someone-they-owe-you-money-politely/index.html");
const guide = await read("blog/how-to-ask-someone-to-pay-you-back-without-being-rude/index.html");
const roommate = await read("tools/roommate-bill-split-calculator/index.html");
const copyScript = await read("scripts/repayment-reminder-text-examples.js");
const movementScript = await read("scripts/polite-reminder-post-copy.js");
const reminderStyles = await read("styles/polite-money-reminder-answer.css");
const flush = () => new Promise(resolve => setImmediate(resolve));

// Execute the real controllers on authored markup. This fixture has no layout;
// Safari width, keyboard, zoom and clipboard acceptance is a separate gate.
function documentFor(html) {
  const document = parseStaticPage(html);
  document.visibilityState = "visible";
  document.getElementById = id => document.querySelector(`#${id}`);
  document.defaultView = { CustomEvent: class {
    constructor(type, init) { this.type = type; this.detail = init.detail; }
  } };
  for (const node of [document, ...document.querySelectorAll("*")]) decorate(node);
  function decorate(node) {
    const matches = node.matches.bind(node);
    node.matches = selector => selector.split(",").some(part => {
      const substring = part.trim().match(/^\[([\w-]+)\*=['"]([^'"]+)['"]\]$/);
      return substring ? (node.getAttribute(substring[1]) || "").includes(substring[2]) : matches(part);
    });
    Object.defineProperty(node, "dataset", { get: () => Object.fromEntries(
      [...node.attributes].filter(([key]) => key.startsWith("data-")).map(([key, value]) =>
        [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value]),
    ) });
    Object.defineProperty(node, "isConnected", { get: () => document.contains(node) });
    node.removeAttribute = name => node.attributes.delete(name);
    node.removeEventListener = (type, callback) => node.listeners.set(type,
      (node.listeners.get(type) || []).filter(item => item.callback !== callback));
    node.replaceChildren = (...children) => { node.textContent = ""; node.append(...children); };
    const classList = node.classList;
    Object.defineProperty(node, "classList", { value: {
      ...classList,
      add: name => { node.className = [...new Set([...node.className.split(/\s+/), name])].join(" ").trim(); },
    } });
    node.insertAdjacentElement = (position, moved) => {
      assert.equal(position, "afterend");
      if (moved.parentNode) moved.parentNode.removeChild(moved);
      node.parentNode.children.splice(node.parentNode.children.indexOf(node) + 1, 0, moved);
      moved.parentNode = node.parentNode;
    };
    node.focus = () => { document.activeElement = node; };
  }
  return document;
}

test("reminder containment requires its unique document class and leaves other articles on shared mobile sizing", async () => {
  assert.match(reminder, /<html lang="en" class="polite-reminder-document">/);
  const rules = [...reminderStyles.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(match => match[1].includes("html.polite-reminder-document"));
  assert.equal(rules.length, 3);
  for (const rule of rules) {
    for (const selector of rule[1].split(",")) assert.ok(selector.trim().startsWith("html.polite-reminder-document"));
  }
  // Cards follow the available parent width as the reading gutter changes.
  assert.match(reminderStyles, /body\.polite-reminder-answer-page \.lt-finalCta \{\s*width: 100%;\s*max-width: 100%;/);
  for (const slug of ["how-to-politely-say-no-when-people-ask-for-money", "how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship", "how-to-handle-a-friend-who-keeps-borrowing-money", "how-to-follow-up-after-a-partial-repayment", "am-i-wrong-for-asking-for-my-money-back"]) {
    const html = await read(`blog/${slug}/index.html`);
    assert.match(html, /polite-reminder-answer-page/);
    assert.doesNotMatch(html, /polite-reminder-document/);
  }
});

test("each continuation preserves one historical action, language anchor and unique IDs outside hidden QR roots", () => {
  for (const [html, selector, location, ppid] of [
    [reminder, "[data-post-copy-app-prompt]", "polite_reminder_post_copy_app_store_cta", "0ad25f49-9026-4d8b-99ea-9581a98702db"],
    [guide, ".first-request-continuation", "blog_article_end_cta", "0ad25f49-9026-4d8b-99ea-9581a98702db"],
    [roommate, ".roommate-app-continuation", "roommate_calculator_bottom_app_store_cta", "18039f2b-da9e-4d5f-9ba1-b60f117ecf12"],
  ]) {
    const document = documentFor(html), common = document.querySelector(selector);
    const anchors = document.querySelectorAll(`[data-track-location="${location}"]`);
    assert.equal(anchors.length, 1);
    assert.equal(anchors[0].getAttribute("href"), `https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=${ppid}&pt=117888502&ct=website_cta&mt=8`);
    assert.ok(common.contains(anchors[0]));
    assert.equal(anchors[0].closest("[hidden]"), null, "static/no-JS ordinary action is visible");
    const languageAnchors = document.querySelectorAll("[data-app-language-support-anchor]");
    assert.equal(languageAnchors.length, 1);
    assert.ok(common.contains(languageAnchors[0]));
    assert.equal(languageAnchors[0].closest("[data-iphone-handoff]"), null);
    const ids = document.querySelectorAll("[id]").map(node => node.id);
    assert.equal(new Set(ids).size, ids.length);
  }
  const doc = documentFor(guide), common = doc.querySelector(".first-request-continuation");
  assert.equal(common.closest(".first-request-templates"), null);
  assert.ok(guide.indexOf("first-request-follow-up") < guide.indexOf('class="first-request-continuation"'));
  assert.ok(guide.indexOf('class="first-request-continuation"') < guide.indexOf('<figure class="lt-articleImage">'));
  const contextual = common.querySelector('a[href="/solutions/app-to-track-money-owed/"]');
  assert.equal(contextual.textContent, "See how repayment tracking works");
  assert.equal(contextual.hasAttribute("data-track-event"), false);
  assert.equal(contextual.hasAttribute("data-track-location"), false);
  // The useful related-page link remains at the bottom; only the contextual link moves.
  assert.equal(doc.querySelectorAll('a[href="/solutions/app-to-track-money-owed/"]').length, 3);
  assert.doesNotMatch(guide, /Looking for the product-focused version/);
});

test("supported and unsupported local language previews use the relocated common anchor and dedupe", () => {
  for (const html of [reminder, guide, roommate]) {
    const doc = documentFor(html), anchor = doc.querySelector(language.ANCHOR_SELECTOR);
    const rendered = language.render(doc, { language: "en-US" }, { hostname: "localhost", search: "?app-language-preview=fr" });
    assert.equal(rendered, anchor);
    assert.equal(anchor.hidden, false);
    assert.equal(anchor.getAttribute("lang"), "fr");
    assert.equal(language.render(doc, { language: "fr" }, {}), anchor);
    assert.equal(doc.querySelectorAll(language.RENDERED_SELECTOR).length, 1);
    const unsupported = documentFor(html);
    assert.equal(language.render(unsupported, { language: "en-US" }, { hostname: "localhost", search: "?app-language-preview=uk" }), null);
    assert.equal(unsupported.querySelector(language.ANCHOR_SELECTOR).hidden, true);
  }
});

test("real successful reminder copies move the same prompt; gift/help restore its new home; failure and focus stay put", async () => {
  const document = documentFor(reminder), listeners = new Map(), copied = [], events = [];
  let fail = false;
  const window = {
    isSecureContext: true, setTimeout() {},
    addEventListener(type, callback) { listeners.set(type, callback); },
    dispatchEvent(event) { events.push(event); listeners.get(event.type)?.(event); },
  };
  document.execCommand = () => false;
  const context = vm.createContext({ document, window,
    navigator: { clipboard: { async writeText(text) { if (fail) throw Error("denied"); copied.push(text); } } },
    CustomEvent: document.defaultView.CustomEvent,
    fetch() { assert.fail("copy must not fetch"); }, location: { assign() { assert.fail("copy must not navigate"); } },
  });
  vm.runInContext(copyScript, context); vm.runInContext(movementScript, context);
  const prompt = document.querySelector("[data-post-copy-app-prompt]"), home = document.querySelector("[data-reminder-tracking-home]");
  for (const id of ["friendly-reminder", "partial-repayment-reminder", "promised-gift-timing", "promised-help-check-in", "polite-clear-reminder"]) {
    const button = document.querySelector(`[data-copy-template="${id}"]`);
    button.focus(); button.dispatchEvent({ type: "click" }); await flush();
    assert.equal(document.activeElement, button);
    assert.equal(document.querySelectorAll("[data-post-copy-app-prompt]").length, 1);
    assert.equal(document.querySelector("[data-post-copy-app-prompt]"), prompt);
    assert.equal(prompt.parentNode, id.startsWith("promised-") ? home : button.parentNode);
    assert.equal(prompt.querySelector("[data-reminder-tracking-eyebrow]").textContent, id.startsWith("promised-") ? "After the reminder" : "Reminder copied");
  }
  assert.equal(copied.length, 5); assert.equal(events.length, 5);
  fail = true;
  const parent = prompt.parentNode, button = document.querySelector('[data-copy-template="friendly-reminder"]');
  button.focus(); button.dispatchEvent({ type: "click" }); await flush();
  assert.equal(prompt.parentNode, parent); assert.equal(document.activeElement, button); assert.equal(events.length, 5);
});

function handoff(identity = { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 0 }) {
  const document = documentFor(roommate), events = [], queries = new Map();
  const root = document.querySelector("[data-iphone-handoff]"), badge = document.getElementById("roommate-calculator-primary-download"), qr = root.querySelector("[data-iphone-handoff-qr]");
  qr.complete = false; qr.naturalWidth = 0;
  for (const query of ["(min-width: 768px)", "(hover: hover) and (pointer: fine)"]) {
    const listeners = new Set();
    queries.set(query, { matches: true, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
      change(matches) { this.matches = matches; listeners.forEach(fn => fn()); } });
  }
  document.dispatchEvent = event => { events.push(event); };
  const observer = class { observe() {} unobserve() {} disconnect() {} };
  const controller = createIphoneHandoff({ documentRef: document, root,
    windowRef: { navigator: identity, matchMedia: query => queries.get(query) },
    viewTrackerOptions: { IntersectionObserverClass: observer, setTimeoutFn() {}, clearTimeoutFn() {} },
  });
  return { document, root, badge, qr, controller, queries, events };
}

test("roommate authored pairing keeps mobile/no-JS common content and badge independent of desktop QR", () => {
  for (const identity of [
    { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 1 },
    { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 },
    { userAgent: "Android Mobile", platform: "Linux", maxTouchPoints: 1 },
  ]) {
    const env = handoff(identity);
    assert.equal(env.root.hidden, true); assert.equal(env.badge.hidden, false);
    assert.equal(env.document.querySelector(".roommate-app-continuation").hidden, false);
    env.controller.destroy();
  }
  const doc = documentFor(roommate), common = doc.querySelector(".roommate-app-continuation");
  assert.equal(common.querySelector("[data-iphone-handoff]").hidden, true);
  assert.equal(common.querySelector("[data-iphone-handoff-replaceable]").hidden, false);
  assert.equal(common.textContent.split("Your calculator result is not transferred.").length - 1, 1);
  assert.equal(common.textContent.split("Free download").length - 1, 1);
});

test("roommate real markup pairing protects focus, handles load/error and restores badge on resize", () => {
  const env = handoff();
  assert.equal(env.root.hidden, false); assert.equal(env.badge.hidden, false);
  env.badge.focus(); env.qr.complete = true; env.qr.naturalWidth = 472;
  env.qr.dispatchEvent({ type: "load" });
  assert.equal(env.badge.hidden, false); assert.equal(env.document.activeElement, env.badge);
  env.document.activeElement = null; env.badge.dispatchEvent({ type: "focusout" });
  assert.equal(env.badge.hidden, true);
  env.queries.get("(min-width: 768px)").change(false);
  assert.equal(env.root.hidden, true); assert.equal(env.badge.hidden, false);
  env.queries.get("(min-width: 768px)").change(true);
  assert.equal(env.badge.hidden, true);
  env.qr.dispatchEvent({ type: "error" });
  assert.equal(env.qr.hidden, true); assert.equal(env.badge.hidden, false);
  assert.equal(env.root.querySelector(".iphone-handoff__fallback").closest("[hidden]"), null);
  assert.equal(env.events.some(event => event.type === "youoweme:iphone-handoff-requested"), false);
  env.controller.destroy();
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SENDER_PATH = "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/";
const RECIPIENT_PATH = "/repayment-plan/";
const ORIGIN = "https://you-owe-me.com";
let fixtureId = 0;

async function browserFixture(t, pathname) {
  const outgoing = [];
  const frames = [];
  const listeners = new Map();
  const document = {
    referrer: "",
    getElementById: id => id === "what-to-say" ? {} : null,
    createElement(type) {
      assert.equal(type, "iframe");
      return { contentWindow: { postMessage: (...args) => outgoing.push(args) } };
    },
    body: { append: frame => frames.push(frame) },
  };
  const context = {
    location: new URL(pathname, ORIGIN),
    document,
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: type => listeners.delete(type),
  };

  const originalWindow = globalThis.window;
  globalThis.window = context;
  t.after(() => { globalThis.window = originalWindow; });
  const loadEvents = () => import(`./repayment-proposal-events.mjs?fixture=${++fixtureId}`);
  const events = await loadEvents();
  return { context, document, events, frames, listeners, loadEvents, outgoing };
}

test("the sender bridge is installed on the one article that contains the proposal builder", async t => {
  const { events } = await browserFixture(t, SENDER_PATH);
  const siteRoot = new URL("../", import.meta.url);
  const html = await readFile(new URL(`.${SENDER_PATH}index.html`, siteRoot), "utf8");
  assert.match(html, /data-proposal-builder/);
  assert.match(html, /\/scripts\/analytics\.js\?v=repayment-proposal-20261121/);
  assert.equal(events.PROPOSAL_SENDER_PATH, SENDER_PATH);
  assert.equal(events.isProposalSenderPath(`${SENDER_PATH}index.html`), true);
  assert.equal(events.isProposalSenderPath("/blog/how-to-suggest-a-repayment-plan-to-someone-who-owes-you-money/"), false);
});

test("sender buffers a bounded list of fixed, event-only names before Firebase is ready", async t => {
  const { context, document, events } = await browserFixture(t, SENDER_PATH);
  const sent = [];
  events.trackProposal({ stage: "builder_opened", amount: 800 });
  events.trackProposal("recipient_opened");
  events.trackProposal("constructor");
  events.trackProposal("builder_opened", { amount: 800 });
  for (let index = 0; index < 20; index++) events.trackProposal("link_copied");
  events.bindProposalSenderAnalytics((...args) => sent.push(args));
  assert.equal(sent.length, 16);
  assert.deepEqual(sent[0], ["uomi_web_plan_builder_opened"]);
  assert.ok(sent.slice(1).every(([name]) => name === "uomi_web_plan_link_copied"));
  events.trackProposal("link_shared");
  assert.deepEqual(sent.at(-1), ["uomi_web_plan_link_shared"]);

  context.location = new URL(`${SENDER_PATH}#what-to-say`, ORIGIN);
  assert.deepEqual(events.proposalSenderAnalyticsConfig(context.location, document), {
    page_location: `${ORIGIN}${SENDER_PATH}`,
    page_referrer: "",
  });
  for (const suffix of ["?private=100", "#p=private", "?private#what-to-say", "?utm_source=WzEsImalformedProposal"]) {
    context.location = new URL(SENDER_PATH + suffix, ORIGIN);
    assert.equal(events.proposalSenderAnalyticsConfig(context.location, document), null);
    events.trackProposal("link_shared");
  }
  context.location = new URL(SENDER_PATH, ORIGIN);
  document.referrer = `${ORIGIN}${RECIPIENT_PATH}?amount=800`;
  assert.equal(events.proposalSenderAnalyticsConfig(context.location, document), null);
  events.trackProposal("link_shared");
  context.location = new URL(`${SENDER_PATH}?utm_source=chatgpt.com`, ORIGIN);
  document.referrer = "https://www.google.com/search?q=borrow+money";
  assert.deepEqual(events.proposalSenderAnalyticsConfig(context.location, document), {
    page_location: `${ORIGIN}${SENDER_PATH}?utm_source=chatgpt.com`,
    page_referrer: "https://www.google.com",
  });
  context["ga-disable-G-TJDLPVM702"] = true;
  events.trackProposal("link_shared");
  assert.equal(sent.length, 17);
});

test("recipient frame receives exactly three allowlisted actions after a verified frame handshake", async t => {
  const { context, document, events, frames, listeners, outgoing } = await browserFixture(t, RECIPIENT_PATH);
  events.trackProposal("recipient_opened");
  for (const suffix of ["#p=private", "?amount=100", "#", "?"]) {
    context.location = new URL(RECIPIENT_PATH + suffix, ORIGIN);
    events.startProposalRecipientAnalytics();
  }
  context.location = new URL(RECIPIENT_PATH, ORIGIN);
  for (const referrer of ["https://mail.example/?private", "https://mail.example/thread/123", `${ORIGIN}${SENDER_PATH}#private`]) {
    document.referrer = referrer;
    events.startProposalRecipientAnalytics();
  }
  assert.equal(frames.length, 0);

  document.referrer = "https://mail.example/";
  events.startProposalRecipientAnalytics();
  events.startProposalRecipientAnalytics();
  assert.equal(frames.length, 1);
  assert.equal(frames[0].hidden, true);
  assert.equal(frames[0].referrerPolicy, "no-referrer");
  assert.equal(frames[0].src, `${RECIPIENT_PATH}analytics/`);
  events.trackProposal("recipient_opened", { url: "private", id: "abc" });
  events.trackProposal("recipient_engaged");
  events.trackProposal("link_copied");
  const ready = listeners.get("message");
  const handshake = { source: frames[0].contentWindow, origin: ORIGIN, data: events.PROPOSAL_ANALYTICS_READY };
  ready({ ...handshake, source: {} });
  ready({ ...handshake, origin: "https://other.example" });
  ready({ ...handshake, data: "wrong" });
  assert.deepEqual(outgoing, []);
  ready(handshake);
  context.location = new URL(`${RECIPIENT_PATH}#p=next-private`, ORIGIN);
  events.trackProposal("recipient_opened");
  context.location = new URL(RECIPIENT_PATH, ORIGIN);
  events.trackProposal("recipient_saved");
  assert.deepEqual(outgoing, [
    ["uomi_web_plan_recipient_opened", ORIGIN],
    ["uomi_web_plan_recipient_engaged", ORIGIN],
    ["uomi_web_plan_recipient_saved", ORIGIN],
  ]);
  assert.ok(outgoing.every(([name]) => events.isProposalRecipientEvent(name) && name.length <= 40));
  assert.equal(events.isProposalRecipientEvent("uomi_web_plan_link_shared"), false);
});

function memoryStorage() {
  const store = new Map();
  return { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) };
}

test("sender markers persist locally, stay bounded and have a session fallback", async t => {
  const { context, events, loadEvents } = await browserFixture(t, SENDER_PATH);
  const ids = Array.from({ length: 33 }, (_, index) => {
    const bytes = Buffer.alloc(16);
    bytes[0] = index;
    return bytes.toString("base64url");
  });
  context.localStorage = memoryStorage();
  for (const id of ids) events.markProposalSender(id);
  events.markProposalSender(`${ids.at(-1)}\n`);
  const otherTab = await loadEvents();
  assert.equal(otherTab.isProposalSender(ids[0]), false);
  assert.equal(otherTab.isProposalSender(ids[1]), true);
  assert.equal(otherTab.isProposalSender(ids[32]), true);
  assert.equal(otherTab.isProposalSender(`${ids[32]}\n`), false);

  Object.defineProperty(context, "localStorage", { get() { throw Error("blocked storage"); } });
  context.sessionStorage = memoryStorage();
  events.markProposalSender(ids[0]);
  const sameTab = await loadEvents();
  assert.equal(sameTab.isProposalSender(ids[0]), true);
});

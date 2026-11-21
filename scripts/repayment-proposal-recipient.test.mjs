import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { parseStaticPage, StaticNode } from "../tests/helpers/static-dom.mjs";
import * as model from "./repayment-proposal-model.mjs";

const html = readFileSync(new URL("../repayment-plan/index.html", import.meta.url), "utf8");
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const controller = readFileSync(new URL("./repayment-proposal-recipient.mjs", import.meta.url), "utf8")
  .replace(/^import .+;\n/gm, "");
const route = "https://you-owe-me.com/repayment-plan/";

function storage() {
  const entries = new Map();
  return {
    get length() { return entries.size; },
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    key: index => [...entries.keys()][index] ?? null,
  };
}

function tokenFor(overrides = {}) {
  return model.encodeProposal({
    id: "AAAAAAAAAAAAAAAAAAAAAA",
    currency: "USD",
    totalMinor: 10003,
    count: 3,
    cadence: "monthly",
    firstDate: "2027-01-31",
    ...overrides,
  });
}

function page(address, {
  local = storage(),
  session = storage(),
  restored = null,
  blockedHistory = false,
  sender = false,
  visibility = "visible",
  prerendering = false,
} = {}) {
  const document = parseStaticPage(html);
  const byId = id => document.querySelector("#" + id);
  document.getElementById = byId;
  document.visibilityState = visibility;
  document.prerendering = prerendering;
  let focused;
  document.createElement = tag => new TestNode(tag);
  class TestNode extends StaticNode {
    replaceChildren(...nodes) { this.textContent = ""; this.append(...nodes); }
  }
  for (const node of document.querySelectorAll("[id]")) {
    node.replaceChildren = TestNode.prototype.replaceChildren;
    node.focus = () => { focused = node; };
  }

  const location = new URL(address);
  const history = {
    state: restored,
    replaceState(state, _title, path) {
      if (blockedHistory) throw new Error("Blocked browser history");
      location.href = new URL(path, location.href);
      this.state = state;
    },
  };
  const window = new StaticNode("window");
  Object.assign(window, { localStorage: local, sessionStorage: session, navigator: {} });

  const stages = [];
  const context = {
    window,
    document,
    location,
    history,
    ...model,
    isProposalSender: () => sender,
    startProposalRecipientAnalytics() {
      assert.equal(location.href, route);
      assert.equal(byId("proposal").hidden, false);
    },
    trackProposal(stage) {
      assert.equal(location.href, route);
      stages.push(stage);
    },
  };
  runInNewContext(bootstrap, context);
  runInNewContext(controller, context);

  return {
    byId,
    stages,
    history,
    location,
    get focused() { return focused; },
    click: (id, isTrusted = true) => {
      const element = typeof id === "string" ? byId(id) : id;
      const [listener] = element.listeners.get("click");
      return listener.callback({ isTrusted });
    },
    activate() {
      document.visibilityState = "visible";
      document.prerendering = false;
      document.dispatchEvent({ type: "visibilitychange" });
    },
    visitHash(hash) {
      location.hash = hash;
      window.dispatchEvent({ type: "hashchange" });
    },
  };
}

test("recipient route is private and captures the URL before loading resources", () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive"/);
  assert.ok(html.indexOf('name="referrer" content="no-referrer"') < html.indexOf("<script>"));
  assert.ok(html.indexOf("<script>") < html.indexOf("<link"));
  assert.doesNotMatch(html, /(?:src|href)="(?:https?:)?\/\//i);
  assert.doesNotMatch(html, /analytics[.]js|apple-itunes-app|data-track-/i);
  const sitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
  assert.doesNotMatch(sitemap, /\/repayment-plan\//);
});

test("raw links render exact amounts while the address bar and analytics stay clean", () => {
  const opened = page(route + "#p=" + tokenFor());
  assert.equal(opened.location.href, route);
  assert.equal(opened.byId("proposal").hidden, false);
  assert.match(opened.byId("proposal-total").textContent, /100[.]03/);
  assert.equal(opened.byId("proposal-total").parentNode.querySelector(".rp-label").textContent, "Amount requested");
  assert.equal(opened.byId("schedule-count").textContent, "3 payments");
  assert.equal(opened.byId("save-detail").textContent, "Keep a copy of the schedule in this browser.");
  assert.equal(opened.byId("save-detail").hidden, false);
  const rows = opened.byId("payment-dates").children;
  assert.equal(rows.length, 3);
  assert.match(rows[1].textContent, /February 28, 2027/);
  assert.match(rows[2].textContent, /33[.]35/);
  assert.equal(opened.byId("show-all-dates").hidden, true);
  assert.deepEqual(opened.stages, ["recipient_opened"]);
  const refreshed = page(route, { restored: opened.history.state });
  assert.equal(refreshed.byId("proposal").hidden, false);
  assert.deepEqual(refreshed.stages, []);
});

test("query-bearing links and blocked URL cleanup allow reading without analytics", async () => {
  for (const [address, blockedHistory] of [
    [route + "?unexpected=private#p=" + tokenFor(), false],
    [route + "#p=" + tokenFor(), true],
  ]) {
    const opened = page(address, { blockedHistory });
    assert.equal(opened.byId("proposal").hidden, false);
    assert.equal(opened.location.href, blockedHistory ? address : route);
    await opened.click("save-proposal");
    assert.deepEqual(opened.stages, []);
    assert.equal(opened.byId("saved-label").hidden, false);
  }
});

test("opens only when visible and counts one deliberate action per plan and tab", () => {
  const session = storage();
  const token = tokenFor({ count: 10 });
  const opened = page(route + "#p=" + token, { session, visibility: "hidden", prerendering: true });
  assert.equal(opened.byId("payment-dates").children.length, 6);
  assert.equal(opened.byId("remaining-dates").hidden, true);
  assert.deepEqual(opened.stages, []);
  opened.activate();
  opened.activate();
  assert.deepEqual(opened.stages, ["recipient_opened"]);
  opened.click("show-all-dates", false);
  assert.deepEqual(opened.stages, ["recipient_opened"]);
  opened.click("show-all-dates");
  opened.click("show-all-dates");
  assert.equal(opened.byId("remaining-dates").hidden, false);
  assert.deepEqual(opened.stages, ["recipient_opened", "recipient_engaged"]);
  const repeated = page(route + "#p=" + token, { session });
  repeated.click("show-all-dates");
  assert.deepEqual(repeated.stages, []);
});

test("saved copies are independently selectable, protected from accidental removal and deduped", async () => {
  const local = storage();
  const firstToken = tokenFor();
  const secondToken = tokenFor({ id: "AAAAAAAAAAAAAAAAAAAAAQ", totalMinor: 20000 });
  const first = page(route + "#p=" + firstToken, { local });
  await first.click("save-proposal");
  assert.deepEqual(first.stages, ["recipient_opened", "recipient_engaged", "recipient_saved"]);
  assert.equal(first.byId("saved-label").hidden, false);
  assert.equal(first.byId("save-proposal").hidden, true);
  assert.equal(first.byId("save-detail").hidden, true);
  assert.equal(first.byId("saved-detail").hidden, false);
  assert.equal(first.focused, first.byId("saved-label"));
  const second = page(route + "#p=" + secondToken, { local });
  await second.click("save-proposal");

  const library = page(route, { local });
  assert.equal(library.byId("saved-library").hidden, false);
  const items = library.byId("saved-plans").children;
  assert.equal(items.length, 2);
  const firstItem = items.find(item => item.textContent.includes("100.03"));
  library.click(firstItem.children[0]);
  assert.match(library.byId("proposal-total").textContent, /100[.]03/);
  assert.deepEqual(library.stages, []);
  library.click("remove-proposal");
  assert.equal(library.byId("remove-confirmation").hidden, false);
  library.click("cancel-removal");
  assert.equal(library.byId("remove-confirmation").hidden, true);
  assert.equal(library.focused, library.byId("remove-proposal"));
  library.click("remove-proposal");
  await library.click("confirm-removal");
  assert.equal(library.byId("saved-plans").children.length, 1);
  assert.match(library.byId("library-status").textContent, /removed/);
  assert.equal(library.byId("proposal-total").textContent, "");
  assert.equal(library.byId("payment-dates").children.length, 0);
  assert.doesNotMatch(JSON.stringify(library.history.state), new RegExp(firstToken));

  const reopened = page(route + "#p=" + firstToken, { local });
  await reopened.click("save-proposal");
  assert.deepEqual(reopened.stages, ["recipient_opened", "recipient_engaged"]);
});

test("invalid links do not expose saved copies, even after navigating within the same tab", async () => {
  const local = storage();
  const opened = page(route + "#p=" + tokenFor(), { local });
  await opened.click("save-proposal");
  opened.visitHash("p=thisisnotaproposal");
  assert.equal(opened.location.href, route);
  assert.equal(opened.byId("invalid-link").hidden, false);
  assert.equal(opened.byId("saved-library").hidden, true);
  assert.equal(opened.byId("proposal").hidden, true);
  assert.deepEqual(opened.stages, ["recipient_opened", "recipient_engaged", "recipient_saved"]);
  assert.equal(opened.byId("proposal-total").textContent, "");
  assert.equal(opened.byId("payment-dates").children.length, 0);
  assert.doesNotMatch(JSON.stringify(opened.history.state), /thisisnotaproposal/);
  opened.click("invalid-show-saved");
  assert.equal(opened.byId("saved-library").hidden, false);
});

test("different terms with the same ID cannot overwrite or remove an existing copy", async () => {
  const local = storage();
  const first = page(route + "#p=" + tokenFor(), { local });
  await first.click("save-proposal");

  const changed = page(route + "#p=" + tokenFor({ totalMinor: 20000 }), { local });
  assert.match(changed.byId("proposal-total").textContent, /200[.]00/);
  assert.equal(changed.byId("copy-conflict").hidden, false);
  assert.equal(changed.byId("saved-label").hidden, true);
  assert.equal(changed.byId("save-proposal").hidden, true);
  assert.equal(changed.byId("remove-proposal").hidden, true);
  changed.click("show-saved-plans");
  const [saved] = changed.byId("saved-plans").children;
  changed.click(saved.children[0]);
  assert.match(changed.byId("proposal-total").textContent, /100[.]03/);
  assert.equal(changed.byId("copy-conflict").hidden, true);
  assert.equal(changed.byId("saved-label").hidden, false);
  assert.deepEqual(changed.stages, []);
});

test("sender tests and failed browser storage do not create a recipient save event", async () => {
  const sender = page(route + "#p=" + tokenFor(), { sender: true });
  await sender.click("save-proposal");
  assert.equal(sender.byId("saved-label").hidden, false);
  assert.deepEqual(sender.stages, []);

  const failingStorage = storage();
  failingStorage.setItem = () => { throw new Error("Quota exceeded"); };
  const opened = page(route + "#p=" + tokenFor(), { local: failingStorage });
  await opened.click("save-proposal");
  assert.equal(opened.byId("saved-label").hidden, true);
  assert.match(opened.byId("proposal-status").textContent, /couldn’t save/);
  assert.deepEqual(opened.stages, ["recipient_opened", "recipient_engaged"]);
});

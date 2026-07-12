const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const connectHTML = fs.readFileSync(path.join(root, "connect/index.html"), "utf8");
const connectCSS = fs.readFileSync(path.join(root, "styles/connect.css"), "utf8");
const connectJS = fs.readFileSync(path.join(root, "scripts/connect.js"), "utf8");

function fakeElement(textContent = "") {
  const listeners = new Map();
  return {
    hidden: true,
    disabled: false,
    textContent,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    listener(type) {
      return listeners.get(type);
    },
  };
}

function browserLocation(rawURL) {
  const url = new URL(rawURL);
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    username: url.username,
    password: url.password,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    href: url.href,
  };
}

function runConnectPage(rawURL, writeText) {
  const elements = {
    "invitation-ready": fakeElement(),
    "invitation-missing": fakeElement(),
    "copy-invitation": fakeElement("Copy Invitation Link"),
    "copy-status": fakeElement("The invitation remains private in this browser unless you choose to copy it."),
  };
  const clipboardWrites = [];
  const networkCalls = [];
  const logCalls = [];

  const clipboard = {
    async writeText(value) {
      clipboardWrites.push(value);
      if (writeText) await writeText(value);
    },
  };

  const context = {
    window: { location: browserLocation(rawURL) },
    document: {
      getElementById(id) {
        return elements[id] || null;
      },
    },
    navigator: {
      clipboard,
      sendBeacon(...args) {
        networkCalls.push(["sendBeacon", ...args]);
      },
    },
    fetch(...args) {
      networkCalls.push(["fetch", ...args]);
      throw new Error("Unexpected network call");
    },
    XMLHttpRequest: function XMLHttpRequest() {
      networkCalls.push(["XMLHttpRequest"]);
      throw new Error("Unexpected network call");
    },
    Image: function Image() {
      networkCalls.push(["Image"]);
      throw new Error("Unexpected network call");
    },
    console: new Proxy({}, {
      get(_target, method) {
        return (...args) => logCalls.push([method, ...args]);
      },
    }),
  };

  vm.runInNewContext(connectJS, context, { filename: "scripts/connect.js" });
  return { elements, clipboardWrites, networkCalls, logCalls };
}

test("connect page has static privacy, security, and accessibility protections", () => {
  assert.match(connectHTML, /name="robots" content="noindex,nofollow"/i);
  assert.match(connectHTML, /name="referrer" content="no-referrer"/i);
  assert.match(connectHTML, /http-equiv="Content-Security-Policy"/i);
  assert.match(connectHTML, /default-src 'self'/i);
  assert.match(connectHTML, /script-src 'self'/i);
  assert.match(connectHTML, /connect-src 'none'/i);
  assert.match(connectHTML, /object-src 'none'/i);
  assert.match(connectHTML, /frame-src 'none'/i);
  assert.match(connectHTML, /frame-ancestors 'none'/i);
  assert.match(connectHTML, /aria-live="polite"/i);
  assert.match(connectHTML, /aria-label="Primary navigation"/i);
  assert.doesNotMatch(connectHTML, /name="apple-itunes-app"/i);
  assert.doesNotMatch(connectHTML, /data-track-/i);

  const scriptSources = [...connectHTML.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map((match) => match[1]);
  assert.deepEqual(scriptSources, ["../scripts/connect.js"]);

  const remoteSubresourceSources = [...connectHTML.matchAll(/<(?:script|img|link)\b[^>]*\b(?:src|href)="(https?:\/\/[^"]+)"/gi)]
    .map((match) => match[1]);
  assert.deepEqual(remoteSubresourceSources, []);

  const stylesheetHrefs = [...connectHTML.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi)]
    .map((match) => match[1]);
  assert.deepEqual(stylesheetHrefs, ["../styles/site-nav.css", "../styles/connect.css"]);
  for (const stylesheetHref of stylesheetHrefs) {
    const stylesheetPath = path.resolve(root, "connect", stylesheetHref);
    assert.ok(stylesheetPath.startsWith(`${root}${path.sep}`));
    const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
    assert.doesNotMatch(stylesheet, /@import\s+(?:url\()?\s*["']?https?:\/\//i);
    assert.doesNotMatch(stylesheet, /url\(\s*["']?https?:\/\//i);
  }

  assert.match(connectCSS, /@media screen and \(max-width: 980px\)/);
  assert.match(connectCSS, /@media screen and \(max-width: 736px\)/);
  assert.match(connectCSS, /outline: 3px solid rgba\(53, 84, 40, 0\.32\)/);
  assert.doesNotMatch(connectJS, /\b(?:fetch|XMLHttpRequest|sendBeacon|console\.)\b/);
  assert.doesNotMatch(connectJS, /innerHTML|outerHTML|\.dataset\b/);

  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /you-owe-me\.com\/connect\/?/i);
});

test("only the connect utility route may omit content-registry metadata", () => {
  const auditPaths = [
    "scripts/audit-content-routing.mjs",
    "scripts/audit-seo-ai-hygiene.mjs",
    "scripts/validate-content-registry.js",
  ];

  for (const relativePath of auditPaths) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(source, /registryOptionalNoindexRoutes\s*=\s*new Set\(\["\/connect\/"\]\)/);
    assert.match(source, /registryOptionalNoindexRoutes\.has\(route\)/);
    assert.doesNotMatch(source, /!byUrl\.has\(route\)\s*&&\s*!isNoindex\(html\)/);
  }
});

test("AASA copies are byte-identical, valid, and preserve every prior route", () => {
  const rootAASA = fs.readFileSync(path.join(root, "apple-app-site-association"));
  const wellKnownAASA = fs.readFileSync(path.join(root, ".well-known/apple-app-site-association"));
  assert.deepEqual(rootAASA, wellKnownAASA);

  const document = JSON.parse(rootAASA.toString("utf8"));
  assert.equal(document.applinks.details[0].appID, "3YKZSY3MBA.com.midori.s.You-owe-me");
  assert.deepEqual(document.applinks.details[0].paths, [
    "/redeem",
    "/redeem/",
    "/redeem/*",
    "/events/live-link",
    "/events/timeline",
    "/connect",
    "/connect/",
    "/connect/*",
  ]);
});

test("a canonical fragment invitation is never rendered, logged, or networked and copies exactly", async () => {
  const opaqueValue = "A".repeat(43);
  const invitationURL = `https://you-owe-me.com/connect/#t=${opaqueValue}`;
  const page = runConnectPage(invitationURL);

  assert.equal(page.elements["invitation-ready"].hidden, false);
  assert.equal(page.elements["invitation-missing"].hidden, true);
  assert.deepEqual(page.networkCalls, []);
  assert.deepEqual(page.logCalls, []);
  assert.deepEqual(page.clipboardWrites, []);

  for (const element of Object.values(page.elements)) {
    assert.equal(String(element.textContent).includes(opaqueValue), false);
  }

  const click = page.elements["copy-invitation"].listener("click");
  assert.equal(typeof click, "function");
  await click();

  assert.deepEqual(page.clipboardWrites, [invitationURL]);
  assert.deepEqual(page.networkCalls, []);
  assert.deepEqual(page.logCalls, []);
  assert.equal(page.elements["copy-status"].textContent.includes(opaqueValue), false);
  assert.equal(page.elements["copy-invitation"].disabled, false);
  assert.equal(page.elements["copy-invitation"].textContent, "Copy Invitation Link");
});

test("missing, misplaced, malformed, and noncanonical invitations show only the missing state", () => {
  const opaqueValue = "B".repeat(43);
  const rejectedURLs = [
    "https://you-owe-me.com/connect/",
    `https://you-owe-me.com/connect/?t=${opaqueValue}`,
    "https://you-owe-me.com/connect/#t=short",
    `https://you-owe-me.com/connect/#t=${opaqueValue}&t=${opaqueValue}`,
    `https://you-owe-me.com/connect/?campaign=message#t=${opaqueValue}`,
    `https://you-owe-me.com.evil.example/connect/#t=${opaqueValue}`,
    `http://you-owe-me.com/connect/#t=${opaqueValue}`,
    `https://you-owe-me.com/other/#t=${opaqueValue}`,
    `https://person@you-owe-me.com/connect/#t=${opaqueValue}`,
    `https://you-owe-me.com:444/connect/#t=${opaqueValue}`,
  ];

  for (const rawURL of rejectedURLs) {
    const page = runConnectPage(rawURL);
    assert.equal(page.elements["invitation-ready"].hidden, true, rawURL);
    assert.equal(page.elements["invitation-missing"].hidden, false, rawURL);
    assert.equal(page.elements["copy-invitation"].listener("click"), undefined, rawURL);
    assert.deepEqual(page.clipboardWrites, [], rawURL);
    assert.deepEqual(page.networkCalls, [], rawURL);
    assert.deepEqual(page.logCalls, [], rawURL);
  }
});

test("clipboard failure gives recovery guidance without exposing the invitation", async () => {
  const opaqueValue = "C".repeat(43);
  const invitationURL = `https://you-owe-me.com/connect/#t=${opaqueValue}`;
  const page = runConnectPage(invitationURL, async () => {
    throw new Error("Denied");
  });

  await page.elements["copy-invitation"].listener("click")();
  assert.equal(page.elements["copy-status"].textContent, "Copy failed. Return to the original message and use its invitation link.");
  assert.equal(page.elements["copy-status"].textContent.includes(opaqueValue), false);
  assert.deepEqual(page.networkCalls, []);
  assert.deepEqual(page.logCalls, []);
});

test("both privacy pages disclose the same Balance Sync lifecycle and data boundaries", () => {
  const overview = fs.readFileSync(path.join(root, "privacy-and-data/index.html"), "utf8");
  const policy = fs.readFileSync(path.join(root, "privacy-policy/index.html"), "utf8");
  const requiredDisclosures = [
    /Balance Sync/i,
    /two authenticated participants/i,
    /Cloud Firestore/i,
    /Cloud Functions/i,
    /amounts/i,
    /currencies/i,
    /dates/i,
    /notes/i,
    /interest settings/i,
    /archive state/i,
    /loan\s+relationships/i,
    /Both participants/i,
    /invitation/i,
    /expires/i,
    /images/i,
    /recurrence rules/i,
    /Disconnecting/i,
    /30-day/i,
    /Deleting an? (?:Cloud )?Account/i,
    /already downloaded/i,
    /not\s+end-to-end encrypted/i,
    /opaque deletion fence/i,
  ];

  for (const pattern of requiredDisclosures) {
    assert.match(overview, pattern, `privacy overview missing ${pattern}`);
    assert.match(policy, pattern, `privacy policy missing ${pattern}`);
  }

  assert.match(overview, /Updated July 11, 2026/);
  assert.match(policy, /Last updated: July 11, 2026/);
  assert.match(overview, /"dateModified": "2026-07-11"/);
  assert.match(policy, /"dateModified": "2026-07-11"/);
});

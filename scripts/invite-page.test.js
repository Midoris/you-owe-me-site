const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const inviteHTML = fs.readFileSync(path.join(root, "invite/index.html"), "utf8");
const connectCSS = fs.readFileSync(path.join(root, "styles/connect.css"), "utf8");
const inviteJS = fs.readFileSync(path.join(root, "scripts/invite.js"), "utf8");

function fakeElement(textContent) {
  const listeners = new Map();
  return {
    hidden: true,
    disabled: false,
    textContent: textContent || "",
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

function runInvitePage(rawURL, options) {
  const settings = options || {};
  const elements = {
    "invitation-ready": fakeElement(),
    "invitation-missing": fakeElement(),
    "copy-invitation": fakeElement("Copy Invitation Link"),
    "copy-status": fakeElement(
      "The invitation remains private in this browser unless you choose to copy it."
    ),
  };
  const clipboardWrites = [];
  const networkCalls = [];
  const logCalls = [];
  const navigator = {
    sendBeacon() {
      networkCalls.push(["sendBeacon"].concat(Array.from(arguments)));
    },
  };
  if (settings.clipboard !== false) {
    navigator.clipboard = {
      async writeText(value) {
        clipboardWrites.push(value);
        if (settings.writeText) await settings.writeText(value);
      },
    };
  }
  const context = {
    window: {location: browserLocation(rawURL)},
    document: {
      getElementById(id) {
        return elements[id] || null;
      },
    },
    navigator,
    fetch() {
      networkCalls.push(["fetch"].concat(Array.from(arguments)));
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
        return function () {
          logCalls.push([method].concat(Array.from(arguments)));
        };
      },
    }),
  };

  vm.runInNewContext(inviteJS, context, {filename: "scripts/invite.js"});
  return {elements, clipboardWrites, networkCalls, logCalls};
}

test("invite page has local-only privacy, CSP, accessibility, and restrained Boost Pack copy", () => {
  assert.match(inviteHTML, /name="robots" content="noindex,nofollow"/i);
  assert.match(inviteHTML, /name="referrer" content="no-referrer"/i);
  assert.match(inviteHTML, /http-equiv="Content-Security-Policy"/i);
  for (const policy of [
    /default-src 'self'/i,
    /script-src 'self'/i,
    /style-src 'self'/i,
    /connect-src 'none'/i,
    /object-src 'none'/i,
    /frame-src 'none'/i,
    /frame-ancestors 'none'/i,
    /form-action 'none'/i,
  ]) {
    assert.match(inviteHTML, policy);
  }
  assert.match(inviteHTML, /aria-live="polite"/i);
  assert.match(inviteHTML, /aria-label="Primary navigation"/i);
  assert.match(inviteHTML, /2 extra people or borrowers/i);
  assert.match(inviteHTML, /20 extra entries/i);
  assert.match(inviteHTML, /2 extra reminders/i);
  assert.match(inviteHTML, /additional smart-tool allowances/i);
  assert.match(inviteHTML, /Boost Pack/i);
  assert.doesNotMatch(inviteHTML, /\bunlimited access\b|\bsubscription\b|\bcash\b|\bSpaces\b/);
  assert.doesNotMatch(inviteHTML, /name="apple-itunes-app"|data-track-/i);
  assert.doesNotMatch(inviteHTML, /automatic deferred|automatically redirect/i);

  const scriptSources = Array.from(
    inviteHTML.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),
    (match) => match[1]
  );
  assert.deepEqual(scriptSources, ["../scripts/invite.js"]);
  const remoteSubresources = Array.from(
    inviteHTML.matchAll(/<(?:script|img|link)\b[^>]*\b(?:src|href)="(https?:\/\/[^"]+)"/gi),
    (match) => match[1]
  );
  assert.deepEqual(remoteSubresources, []);
  const stylesheets = Array.from(
    inviteHTML.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi),
    (match) => match[1]
  );
  assert.deepEqual(stylesheets, ["../styles/site-nav.css", "../styles/connect.css"]);
  assert.match(connectCSS, /@media screen and \(max-width: 980px\)/);
  assert.match(connectCSS, /@media screen and \(max-width: 736px\)/);
  assert.match(connectCSS, /outline: 3px solid rgba\(53, 84, 40, 0\.32\)/);
  assert.match(connectCSS, /\.connect-skip-link:focus/);
  assert.doesNotMatch(inviteJS, /\b(?:fetch|XMLHttpRequest|sendBeacon|console\.)\b/);
  assert.doesNotMatch(inviteJS, /innerHTML|outerHTML|\.dataset\b|location\.assign|location\.replace/);
});

test("canonical invitation fragments show the ready state and copy only after a click", async () => {
  for (const finalCharacter of ["A", "Q", "g", "w"]) {
    const token = "A".repeat(42) + finalCharacter;
    const invitationURL = "https://you-owe-me.com/invite/#t=" + token;
    const page = runInvitePage(invitationURL);
    assert.equal(page.elements["invitation-ready"].hidden, false);
    assert.equal(page.elements["invitation-missing"].hidden, true);
    assert.deepEqual(page.clipboardWrites, []);
    assert.deepEqual(page.networkCalls, []);
    assert.deepEqual(page.logCalls, []);
    for (const element of Object.values(page.elements)) {
      assert.equal(String(element.textContent).includes(token), false);
    }

    const click = page.elements["copy-invitation"].listener("click");
    assert.equal(typeof click, "function");
    await click();
    assert.deepEqual(page.clipboardWrites, [invitationURL]);
    assert.deepEqual(page.networkCalls, []);
    assert.deepEqual(page.logCalls, []);
    assert.equal(page.elements["copy-status"].textContent.includes(token), false);
    assert.equal(page.elements["copy-invitation"].disabled, false);
    assert.equal(page.elements["copy-invitation"].textContent, "Copy Invitation Link");
  }
});

test("missing, query, ambiguous, unsafe, and noncanonical invitations show only missing state", () => {
  const token = "A".repeat(43);
  const rejected = [
    "https://you-owe-me.com/invite/",
    "https://you-owe-me.com/invite/?t=" + token,
    "https://you-owe-me.com/invite/?#t=" + token,
    "https://you-owe-me.com/invite/#t=short",
    "https://you-owe-me.com/invite/#t=" + token + "&x=1",
    "https://you-owe-me.com/invite/#x=1&t=" + token,
    "https://you-owe-me.com/invite/#t=" + token + "&t=" + token,
    "https://you-owe-me.com/invite/?campaign=message#t=" + token,
    "https://you-owe-me.com.evil.example/invite/#t=" + token,
    "http://you-owe-me.com/invite/#t=" + token,
    "https://person@you-owe-me.com/invite/#t=" + token,
    "https://you-owe-me.com:444/invite/#t=" + token,
    "https://you-owe-me.com/invite/extra#t=" + token,
    "https://you-owe-me.com/connect/#t=" + token,
    "https://you-owe-me.com/invite/#T=" + token,
    "https://you-owe-me.com/invite/#t=%41" + token.slice(1),
    "https://you-owe-me.com/invite/#t=" + "A".repeat(42) + "B",
  ];
  for (const rawURL of rejected) {
    const page = runInvitePage(rawURL);
    assert.equal(page.elements["invitation-ready"].hidden, true, rawURL);
    assert.equal(page.elements["invitation-missing"].hidden, false, rawURL);
    assert.equal(page.elements["copy-invitation"].listener("click"), undefined, rawURL);
    assert.deepEqual(page.clipboardWrites, [], rawURL);
    assert.deepEqual(page.networkCalls, [], rawURL);
    assert.deepEqual(page.logCalls, [], rawURL);
  }
});

test("clipboard denial or absence gives recovery guidance without exposing the token", async () => {
  const token = "A".repeat(43);
  const invitationURL = "https://you-owe-me.com/invite/#t=" + token;
  const denied = runInvitePage(invitationURL, {
    async writeText() {
      throw new Error("Denied");
    },
  });
  await denied.elements["copy-invitation"].listener("click")();
  assert.equal(
    denied.elements["copy-status"].textContent,
    "Copy failed. Return to the original message and use its invitation link."
  );
  assert.equal(denied.elements["copy-status"].textContent.includes(token), false);
  assert.deepEqual(denied.networkCalls, []);
  assert.deepEqual(denied.logCalls, []);

  const absent = runInvitePage(invitationURL, {clipboard: false});
  await absent.elements["copy-invitation"].listener("click")();
  assert.deepEqual(absent.clipboardWrites, []);
  assert.equal(absent.elements["copy-status"].textContent.includes(token), false);
});

test("AASA copies are identical, preserve prior routes, and add only exact invite paths", () => {
  const rootAASA = fs.readFileSync(path.join(root, "apple-app-site-association"));
  const wellKnownAASA = fs.readFileSync(
    path.join(root, ".well-known/apple-app-site-association")
  );
  assert.deepEqual(rootAASA, wellKnownAASA);
  const document = JSON.parse(rootAASA.toString("utf8"));
  assert.equal(
    document.applinks.details[0].appID,
    "3YKZSY3MBA.com.midori.s.You-owe-me"
  );
  assert.deepEqual(document.applinks.details[0].paths, [
    "/redeem",
    "/redeem/",
    "/redeem/*",
    "/events/live-link",
    "/events/timeline",
    "/connect",
    "/connect/",
    "/connect/*",
    "/invite",
    "/invite/",
  ]);
  assert.equal(document.applinks.details[0].paths.includes("/invite/*"), false);
});

test("invite stays outside sitemap and registry while all audits keep scoped noindex checks", () => {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const registry = fs.readFileSync(
    path.join(root, "content/content-registry.mjs"),
    "utf8"
  );
  assert.doesNotMatch(sitemap, /you-owe-me\.com\/invite\/?/i);
  assert.doesNotMatch(registry, /["']\/invite\/["']/);

  for (const relativePath of [
    "scripts/audit-content-routing.mjs",
    "scripts/audit-seo-ai-hygiene.mjs",
    "scripts/validate-content-registry.js",
  ]) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(
      source,
      /registryOptionalNoindexRoutes\s*=\s*new Set\(\["\/connect\/", "\/invite\/"\]\)/
    );
    assert.match(source, /registryOptionalNoindexRoutes\.has\(route\)/);
  }
});

test("both privacy pages disclose the same minimal referral metadata and lifecycle", () => {
  const overview = fs.readFileSync(
    path.join(root, "privacy-and-data/index.html"),
    "utf8"
  );
  const policy = fs.readFileSync(
    path.join(root, "privacy-policy/index.html"),
    "utf8"
  );
  const disclosures = [
    /Referral Boost Packs/i,
    /Apple-linked/i,
    /App Check/i,
    /Cloud Functions/i,
    /Cloud Firestore/i,
    /Keychain/i,
    /SHA-256 hash/i,
    /Firebase user IDs/i,
    /invitation state and timestamps/i,
    /anti-abuse attempt state/i,
    /account-deletion fence/i,
    /names/i,
    /email addresses/i,
    /contacts/i,
    /balances/i,
    /ledger entries/i,
    /identity is not/i,
    /seven days/i,
    /30-day/i,
    /Authentication deletion/i,
    /boost_pack_v1/i,
  ];
  for (const pattern of disclosures) {
    assert.match(overview, pattern, "privacy overview missing " + pattern);
    assert.match(policy, pattern, "privacy policy missing " + pattern);
  }
  assert.match(overview, /Updated August 11, 2026/);
  assert.match(policy, /Last updated: August 11, 2026/);
  assert.match(overview, /"dateModified": "2026-08-11"/);
  assert.match(policy, /"dateModified": "2026-08-11"/);
});

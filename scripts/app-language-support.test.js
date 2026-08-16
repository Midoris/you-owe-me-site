const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const languageSupport = require("./app-language-support.js");

class FakeTextNode {
  constructor(text) {
    this.textContent = text;
  }
}

class FakeElement {
  constructor(tagName, closestMatch = null) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.className = "";
    this.textContent = "";
    this.closestMatch = closestMatch;
    this.classList = {
      add: (className) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        classes.add(className);
        this.className = [...classes].join(" ");
      },
    };
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  closest() {
    return this.closestMatch;
  }
}

class FakeDocument {
  constructor({ withAnchor = true, unsafeAnchor = false } = {}) {
    this.queries = [];
    this.readyState = "complete";
    this.listeners = new Map();
    this.anchor = withAnchor ? new FakeElement("div", unsafeAnchor ? new FakeElement("nav") : null) : null;
    if (this.anchor) {
      this.anchor.setAttribute("data-app-language-support-anchor", "");
      this.anchor.setAttribute("hidden", "");
    }
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  createTextNode(text) {
    return new FakeTextNode(text);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  querySelector(selector) {
    this.queries.push(selector);
    if (!this.anchor) return null;
    if (selector === languageSupport.RENDERED_SELECTOR) {
      return this.anchor.hasAttribute("data-app-language-support-rendered") ? this.anchor : null;
    }
    if (selector === languageSupport.ANCHOR_SELECTOR) return this.anchor;
    return null;
  }
}

function flattenedText(node) {
  return [node.textContent, ...(node.children || []).map(flattenedText)].join("");
}

test("normalizes valid locale variants and rejects malformed input", () => {
  const cases = new Map([
    ["en", "en"],
    [" EN-us ", "en-us"],
    ["De-dE", "de-de"],
    ["pt_BR", "pt-br"],
    ["ZH_hant_TW", "zh-hant-tw"],
    ["de-DE-u-co-phonebk", "de-de-u-co-phonebk"],
    ["", null],
    ["  ", null],
    ["not a locale", null],
    ["e", null],
    [null, null],
    [undefined, null],
  ]);

  for (const [input, expected] of cases) {
    assert.equal(languageSupport.normalizeLocale(input), expected, String(input));
  }
});

test("uses only the primary browser language and falls back to navigator.language", () => {
  assert.equal(languageSupport.primaryBrowserLocale({ languages: ["nl-NL", "de-DE"], language: "fr-FR" }), "nl-NL");
  assert.equal(languageSupport.primaryBrowserLocale({ languages: { 0: "de-DE" }, language: "fr-FR" }), "de-DE");
  assert.equal(languageSupport.primaryBrowserLocale({ languages: [], language: "fr-FR" }), "fr-FR");
  assert.equal(languageSupport.primaryBrowserLocale({ languages: [""], language: "es-MX" }), "es-MX");
  assert.equal(languageSupport.primaryBrowserLocale(null), null);
  assert.equal(languageSupport.primaryBrowserLocale({}), null);
});

test("the visual-QA locale override works only on local development hosts", () => {
  assert.equal(
    languageSupport.localPreviewLocale({ hostname: "localhost", search: "?app-language-preview=ar-SA" }),
    "ar-SA",
  );
  assert.equal(
    languageSupport.localPreviewLocale({ hostname: "127.0.0.1", search: "?app-language-preview=de-DE" }),
    "de-DE",
  );
  assert.equal(
    languageSupport.localPreviewLocale({ hostname: "::1", search: "?app-language-preview=ja-JP" }),
    "ja-JP",
  );
  assert.equal(
    languageSupport.localPreviewLocale({ hostname: "you-owe-me.com", search: "?app-language-preview=ar-SA" }),
    null,
  );
  assert.equal(languageSupport.localPreviewLocale(null), null);
});

test("local preview takes precedence without changing production detection", () => {
  const localDocument = new FakeDocument();
  languageSupport.render(
    localDocument,
    { language: "en-US" },
    { hostname: "localhost", search: "?app-language-preview=fr-CA" },
  );
  assert.equal(localDocument.anchor.getAttribute("lang"), "fr");

  const productionDocument = new FakeDocument();
  assert.equal(
    languageSupport.render(
      productionDocument,
      { language: "en-US" },
      { hostname: "you-owe-me.com", search: "?app-language-preview=fr-CA" },
    ),
    null,
  );
});

test("matches all supported non-English regional variants", () => {
  const cases = new Map([
    ["ar", "ar"],
    ["ar-SA", "ar"],
    ["de-DE", "de"],
    ["es-ES", "es"],
    ["es-MX", "es"],
    ["fr-FR", "fr"],
    ["fr-CA", "fr"],
    ["it-IT", "it"],
    ["ja-JP", "ja"],
    ["ko-KR", "ko"],
    ["pl-PL", "pl"],
    ["pt-BR", "pt"],
    ["pt-PT", "pt"],
    ["PT_br", "pt"],
  ]);

  for (const [input, expected] of cases) {
    assert.equal(languageSupport.matchedAppLanguage(input), expected, input);
  }
});

test("suppresses English, unsupported, blank, and malformed languages", () => {
  for (const input of ["en", "en-US", "en-GB", "nl-NL", "uk-UA", "", "bad locale", null, undefined]) {
    assert.equal(languageSupport.matchedAppLanguage(input), null, String(input));
  }
});

test("provides the exact localized copy for every supported non-English language", () => {
  const expected = {
    ar: "تطبيق You Owe Me متوفر باللغة العربية.",
    de: "You Owe Me ist auf Deutsch verfügbar.",
    es: "You Owe Me está disponible en español.",
    fr: "You Owe Me est disponible en français.",
    it: "You Owe Me è disponibile in italiano.",
    ja: "You Owe Meは日本語に対応しています。",
    ko: "You Owe Me는 한국어를 지원해요.",
    pl: "Aplikacja You Owe Me jest dostępna po polsku.",
    pt: "You Owe Me está disponível em português.",
  };

  assert.deepEqual(Object.keys(languageSupport.MESSAGES).sort(), Object.keys(expected).sort());
  for (const [language, copy] of Object.entries(expected)) {
    assert.equal(languageSupport.messageText(language), copy);
  }
});

test("renders one passive localized label and is idempotent", () => {
  const documentObject = new FakeDocument();
  const first = languageSupport.render(documentObject, { languages: ["de-DE"], language: "de-DE" });
  const second = languageSupport.render(documentObject, { languages: ["fr-FR"], language: "fr-FR" });

  assert.equal(first, documentObject.anchor);
  assert.equal(second, first);
  assert.equal(first.getAttribute("lang"), "de");
  assert.equal(first.getAttribute("dir"), "ltr");
  assert.equal(first.hasAttribute("hidden"), false);
  assert.equal(first.children.length, 2);
  assert.equal(flattenedText(first), "✓You Owe Me ist auf Deutsch verfügbar.");
});

test("renders Arabic with rtl direction and an isolated product name", () => {
  const documentObject = new FakeDocument();
  const rendered = languageSupport.render(documentObject, { language: "ar-AE" });
  const textContainer = rendered.children[1];

  assert.equal(rendered.getAttribute("lang"), "ar");
  assert.equal(rendered.getAttribute("dir"), "rtl");
  assert.equal(textContainer.children[1].tagName, "BDI");
  assert.equal(textContainer.children[1].textContent, "You Owe Me");
  assert.equal(flattenedText(rendered), "✓تطبيق You Owe Me متوفر باللغة العربية.");
});

test("does not render for English, unsupported languages, or a missing target", () => {
  for (const language of ["en-US", "nl-NL", "uk-UA", "bad locale", ""]) {
    const documentObject = new FakeDocument();
    assert.equal(languageSupport.render(documentObject, { language }), null, language);
    assert.equal(documentObject.anchor.hasAttribute("hidden"), true);
    assert.equal(documentObject.anchor.children.length, 0);
  }

  assert.equal(languageSupport.render(new FakeDocument({ withAnchor: false }), { language: "fr-FR" }), null);
  assert.equal(languageSupport.render(new FakeDocument(), {}), null);
  assert.equal(languageSupport.render(new FakeDocument(), null), null);

  const secondarySupportedLanguage = new FakeDocument();
  assert.equal(
    languageSupport.render(secondarySupportedLanguage, { languages: ["nl-NL", "de-DE"], language: "nl-NL" }),
    null,
  );
  assert.equal(secondarySupportedLanguage.anchor.hasAttribute("hidden"), true);
});

test("never renders into navigation or sticky UI", () => {
  const documentObject = new FakeDocument({ unsafeAnchor: true });
  assert.equal(languageSupport.render(documentObject, { language: "de-DE" }), null);
  assert.equal(documentObject.anchor.hasAttribute("hidden"), true);
  assert.equal(documentObject.anchor.children.length, 0);
});

test("initializes safely both before and after DOMContentLoaded", () => {
  const loadingDocument = new FakeDocument();
  loadingDocument.readyState = "loading";
  languageSupport.initialize(loadingDocument, { language: "fr-FR" });
  assert.equal(loadingDocument.anchor.hasAttribute("hidden"), true);
  loadingDocument.listeners.get("DOMContentLoaded")();
  assert.equal(loadingDocument.anchor.getAttribute("lang"), "fr");

  const readyDocument = new FakeDocument();
  languageSupport.initialize(readyDocument, { language: "ja-JP" });
  assert.equal(readyDocument.anchor.getAttribute("lang"), "ja");
});

test("rendering never reads or mutates links and does not require analytics", () => {
  const documentObject = new FakeDocument();
  const beforeKeys = Object.keys(globalThis).filter((key) => /analytics|firebase/i.test(key));
  languageSupport.render(documentObject, { languages: ["es-MX"] });
  const afterKeys = Object.keys(globalThis).filter((key) => /analytics|firebase/i.test(key));

  assert.deepEqual(afterKeys, beforeKeys);
  assert.equal(flattenedText(documentObject.anchor), "✓You Owe Me está disponible en español.");
  assert.deepEqual(documentObject.queries, [languageSupport.RENDERED_SELECTOR, languageSupport.ANCHOR_SELECTOR]);
});

test("the production component contains no tracking, storage, network, or debug hooks", () => {
  const source = fs.readFileSync(require.resolve("./app-language-support.js"), "utf8");
  assert.doesNotMatch(
    source,
    /analytics|firebase|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|fetch\s*\(|console\./i,
  );
});

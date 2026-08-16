(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    root.YouOweMeLanguageSupport = api;
    api.initialize(root.document, root.navigator, root.location);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PRODUCT_NAME = "You Owe Me";
  const LOCAL_PREVIEW_PARAMETER = "app-language-preview";
  const ANCHOR_SELECTOR = "[data-app-language-support-anchor]";
  const RENDERED_SELECTOR = "[data-app-language-support-rendered]";
  const SUPPORTED_APP_LOCALES = Object.freeze([
    "en",
    "ar",
    "de",
    "es",
    "fr",
    "it",
    "ja",
    "ko",
    "pl",
    "pt",
  ]);

  const MESSAGES = Object.freeze({
    ar: Object.freeze({ before: "تطبيق ", after: " متوفر باللغة العربية.", direction: "rtl" }),
    de: Object.freeze({ before: "", after: " ist auf Deutsch verfügbar.", direction: "ltr" }),
    es: Object.freeze({ before: "", after: " está disponible en español.", direction: "ltr" }),
    fr: Object.freeze({ before: "", after: " est disponible en français.", direction: "ltr" }),
    it: Object.freeze({ before: "", after: " è disponibile in italiano.", direction: "ltr" }),
    ja: Object.freeze({ before: "", after: "は日本語に対応しています。", direction: "ltr" }),
    ko: Object.freeze({ before: "", after: "는 한국어를 지원해요.", direction: "ltr" }),
    pl: Object.freeze({ before: "Aplikacja ", after: " jest dostępna po polsku.", direction: "ltr" }),
    pt: Object.freeze({ before: "", after: " está disponível em português.", direction: "ltr" }),
  });

  function normalizeLocale(value) {
    if (typeof value !== "string") return null;

    const normalized = value.trim().replace(/_/g, "-");
    if (!normalized) return null;

    if (typeof Intl === "object" && typeof Intl.getCanonicalLocales === "function") {
      try {
        return Intl.getCanonicalLocales(normalized)[0]?.toLowerCase() || null;
      } catch (error) {
        return null;
      }
    }

    const fallback = normalized.toLowerCase();
    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(fallback)) return null;

    return fallback;
  }

  function primaryBrowserLocale(navigatorLike) {
    if (!navigatorLike || typeof navigatorLike !== "object") return null;

    const preferred = navigatorLike.languages && typeof navigatorLike.languages === "object"
      ? navigatorLike.languages[0]
      : null;

    return preferred || navigatorLike.language || null;
  }

  function matchedAppLanguage(value) {
    const normalized = normalizeLocale(value);
    if (!normalized) return null;

    const baseLanguage = normalized.split("-")[0];
    if (baseLanguage === "en") return null;

    return Object.prototype.hasOwnProperty.call(MESSAGES, baseLanguage)
      ? baseLanguage
      : null;
  }

  function localPreviewLocale(locationLike) {
    if (!locationLike || typeof locationLike !== "object") return null;

    const hostname = String(locationLike.hostname || "").toLowerCase();
    if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) return null;

    try {
      const parameters = new URLSearchParams(String(locationLike.search || ""));
      return parameters.get(LOCAL_PREVIEW_PARAMETER);
    } catch (error) {
      return null;
    }
  }

  function messageText(language) {
    const message = MESSAGES[language];
    if (!message) return null;
    return message.before + PRODUCT_NAME + message.after;
  }

  function populateAnchor(documentObject, anchor, language) {
    const message = MESSAGES[language];
    if (!documentObject || !anchor || !message) return null;

    const icon = documentObject.createElement("span");
    icon.className = "app-language-support__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✓";

    const text = documentObject.createElement("span");
    text.className = "app-language-support__text";
    if (message.before) text.appendChild(documentObject.createTextNode(message.before));

    const productName = documentObject.createElement("bdi");
    productName.textContent = PRODUCT_NAME;
    text.appendChild(productName);

    if (message.after) text.appendChild(documentObject.createTextNode(message.after));

    anchor.replaceChildren(icon, text);
    anchor.classList.add("app-language-support");
    anchor.setAttribute("data-app-language-support-rendered", "");
    anchor.setAttribute("lang", language);
    anchor.setAttribute("dir", message.direction);
    anchor.removeAttribute("hidden");

    return anchor;
  }

  function render(documentObject, navigatorLike, locationLike) {
    if (!documentObject || typeof documentObject.querySelector !== "function") return null;

    const existing = documentObject.querySelector(RENDERED_SELECTOR);
    if (existing) return existing;

    const language = matchedAppLanguage(
      localPreviewLocale(locationLike) || primaryBrowserLocale(navigatorLike),
    );
    if (!language) return null;

    const anchor = documentObject.querySelector(ANCHOR_SELECTOR);
    if (!anchor) return null;

    if (typeof anchor.closest === "function") {
      const unsafeContainer = anchor.closest("#nav, nav, [class*='sticky'], [id*='sticky']");
      if (unsafeContainer) return null;
    }

    return populateAnchor(documentObject, anchor, language);
  }

  function initialize(documentObject, navigatorLike, locationLike) {
    if (!documentObject) return;

    const run = function () {
      render(documentObject, navigatorLike, locationLike);
    };

    if (documentObject.readyState === "loading") {
      documentObject.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  return Object.freeze({
    ANCHOR_SELECTOR,
    LOCAL_PREVIEW_PARAMETER,
    MESSAGES,
    PRODUCT_NAME,
    RENDERED_SELECTOR,
    SUPPORTED_APP_LOCALES,
    initialize,
    localPreviewLocale,
    matchedAppLanguage,
    messageText,
    normalizeLocale,
    populateAnchor,
    primaryBrowserLocale,
    render,
  });
});

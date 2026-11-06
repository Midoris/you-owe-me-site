/* Polish input boundary. Raw fields remain untouched. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.UomiPolishNumberInput = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  function normalizeAmount(value) {
    // Numeric model values already have canonical meaning. Native punctuation
    // rules apply only to user strings, never to a decoded numeric value.
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0 ||
          Math.round(value * 100) / 100 !== value) return null;
      return String(value);
    }
    if (typeof value !== "string") return null;
    const text = value.trim().replace(/[\u00a0\u202f]/g, " ");
    if (!text) return null;
    let canonical;
    // Only spaces may group thousands; punctuation is decimal with 1–2 digits.
    if (/^[1-9]\d{0,2}(?: \d{3})+(?:[,.]\d{1,2})?$/.test(text)) {
      canonical = text.replaceAll(" ", "").replace(",", ".");
    } else if (/^\d+(?:[,.]\d{1,2})?$/.test(text)) {
      canonical = text.replace(",", ".");
    } else return null;
    return Number.isFinite(Number(canonical)) ? canonical : null;
  }
  return Object.freeze({ normalizeAmount });
});

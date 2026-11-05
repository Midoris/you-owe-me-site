/* Italian input boundary. Raw fields remain untouched. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.UomiItalianNumberInput = api;
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
    const text = String(value ?? "").trim().replace(/[\u00a0\u202f]/g, " ");
    if (!text) return null;
    let canonical;
    // A grouped integer must start with a nonzero 1–3 digit group. This
    // distinguishes native 1.234 from invalid fractional/zero groups 0.001.
    if (/^[1-9]\d{0,2}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) {
      canonical = text.replaceAll(".", "").replace(",", ".");
    } else if (/^[1-9]\d{0,2}(?: \d{3})+(?:[,.]\d{1,2})?$/.test(text)) {
      canonical = text.replaceAll(" ", "").replace(",", ".");
    } else if (/^\d+(?:[,.]\d{1,2})?$/.test(text)) {
      canonical = text.replace(",", ".");
    } else return null;
    return Number.isFinite(Number(canonical)) ? canonical : null;
  }
  return Object.freeze({ normalizeAmount });
});

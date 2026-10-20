/* French input boundary. Raw fields remain untouched; output is model input. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.UomiFrenchNumberInput = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  function normalizeAmount(value) {
    let text = String(value ?? "").trim();
    if (!text) return null;
    // Only ordinary French grouping spaces are interchangeable. Never erase
    // arbitrary whitespace, currency text, or punctuation into another value.
    text = text.replace(/[\u00a0\u202f]/g, " ");
    if (!/^-?(?:\d+|\d{1,3}(?: \d{3})+)(?:[.,]\d{1,2})?$/.test(text)) return null;
    const canonical = text.replaceAll(" ", "").replace(",", ".");
    return Number.isFinite(Number(canonical)) ? canonical : null;
  }
  return Object.freeze({ normalizeAmount });
});

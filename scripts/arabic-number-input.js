/* Arabic input boundary only. Canonical output feeds the existing money model. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.UomiArabicNumberInput = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  function normalizeAmount(value) {
    let text = String(value ?? "").trim();
    if (!text) return null;
    text = text.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0));
    // Arabic and Western separator systems are each accepted. Mixing them is
    // ambiguous, so never strip arbitrary punctuation into a different amount.
    const arabicSeparators = /[٫٬]/.test(text);
    if (arabicSeparators && /[.,]/.test(text)) return null;
    if (arabicSeparators) text = text.replaceAll("٫", ".").replaceAll("٬", ",");
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text)) return null;
    const canonical = text.replaceAll(",", "");
    return Number.isFinite(Number(canonical)) ? canonical : null;
  }
  return Object.freeze({ normalizeAmount });
});

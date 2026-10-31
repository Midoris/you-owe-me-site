(function () {
  "use strict";
  var root = document.querySelector("body.roommate-template-page.site-lang-fr");
  if (!root) return;
  var button = root.querySelector("[data-copy-target]");
  var source = button && document.getElementById(button.getAttribute("data-copy-target"));
  var status = root.querySelector(".roommate-template-copy-status");
  if (!button || !source || !status) return;
  var initialLabel = "Copier le message";
  var busy = false;
  var resetTimer;

  function legacyCopy(text) {
    var textarea = document.createElement("textarea");
    var focused = document.activeElement;
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(textarea);
    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      return Boolean(document.execCommand && document.execCommand("copy"));
    } catch (error) {
      return false;
    } finally {
      textarea.remove();
      if (focused && typeof focused.focus === "function") focused.focus({ preventScroll: true });
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Retain a copy path when the browser denies Clipboard API access.
    }
    return legacyCopy(text);
  }

  function selectText() {
    if (!window.getSelection || !document.createRange) return false;
    try {
      var selection = window.getSelection();
      if (!selection) return false;
      var range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      source.scrollIntoView({ block: "nearest" });
      return selection.toString() === source.textContent.trim();
    } catch (error) {
      return false;
    }
  }

  button.addEventListener("click", async function () {
    if (busy) return;
    busy = true;
    window.clearTimeout(resetTimer);
    button.setAttribute("aria-busy", "true");
    button.textContent = "Copie en cours…";
    status.textContent = "";
    try {
      if (await copyText(source.textContent.trim())) {
        button.textContent = "Copié";
        status.textContent = "Le message a été copié.";
      } else if (selectText()) {
        button.textContent = initialLabel;
        status.textContent = "Le texte est sélectionné. Utilisez la commande Copier de votre appareil.";
      } else {
        button.textContent = initialLabel;
        status.textContent = "La copie a échoué. Sélectionnez le message et copiez-le manuellement.";
      }
    } finally {
      busy = false;
      button.removeAttribute("aria-busy");
      resetTimer = window.setTimeout(function () { button.textContent = initialLabel; }, 2400);
    }
  });
  button.hidden = false;
})();

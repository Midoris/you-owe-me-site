(function () {
  "use strict";

  var root = document.querySelector("body.roommate-template-page.site-lang-pt");
  if (!root) return;
  var button = root.querySelector("[data-copy-target]");
  var source = button && document.getElementById(button.getAttribute("data-copy-target"));
  var card = button && button.closest(".roommate-template-message-card");
  var status = card && card.querySelector(".roommate-template-copy-status");
  if (!button || !source || !root.contains(source) || !source.textContent.trim() || !status) return;

  var initialLabel = "Copiar mensagem";
  var busy = false;
  var generation = 0;
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
      try {
        if (focused && typeof focused.focus === "function") focused.focus({ preventScroll: true });
      } catch (error) {
        // Focus restoration must not prevent honest copy feedback.
      }
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // A denied Clipboard API can still use the established local fallback.
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
    var attempt = ++generation;
    window.clearTimeout(resetTimer);
    button.setAttribute("aria-busy", "true");
    button.textContent = "Copiando…";
    status.textContent = "";
    try {
      if (await copyText(source.textContent.trim())) {
        button.textContent = "Copiado";
        status.textContent = "Mensagem copiada.";
      } else if (selectText()) {
        button.textContent = initialLabel;
        status.textContent = "O texto está selecionado. Use a opção de copiar do seu dispositivo.";
      } else {
        button.textContent = initialLabel;
        status.textContent = "Não foi possível copiar automaticamente. Selecione o texto e copie.";
      }
    } finally {
      busy = false;
      button.removeAttribute("aria-busy");
      resetTimer = window.setTimeout(function () {
        if (generation === attempt && !busy) button.textContent = initialLabel;
      }, 2400);
    }
  });

  // Reveal only after the scoped handler, source and live region are ready.
  button.hidden = false;
  var hint = card.querySelector("[data-roommate-copy-hint]");
  if (hint) hint.hidden = true;
})();

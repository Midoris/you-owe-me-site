(function () {
  "use strict";
  // Keep this localized interaction scoped to the Italian repayment guide.
  var root = document.querySelector("body.repayment-it-page");
  if (!root) return;
  var timers = new WeakMap();
  var copying = new WeakSet();
  var attempts = new WeakMap();

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
      // Browsers may deny Clipboard API access; retain the established fallback.
    }
    return legacyCopy(text);
  }

  function selectText(source) {
    if (!source || !window.getSelection || !document.createRange) return false;
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

  root.addEventListener("click", async function (event) {
    var button = event.target.closest("[data-copy-template]");
    if (!button || !root.contains(button) || copying.has(button)) return;
    var card = button.closest(".repayment-it-card");
    var source = card && card.querySelector(".template-card__message");
    var status = card && card.querySelector("[data-copy-status]");
    if (!source || !source.textContent.trim() || !status) return;
    var text = source.textContent.trim();
    var record = button.hasAttribute("data-copy-record");
    var originalText = record ? "Copia il modello di registro" : "Copia il messaggio";
    var attempt = (attempts.get(button) || 0) + 1;
    attempts.set(button, attempt);
    window.clearTimeout(timers.get(button));
    copying.add(button);
    button.setAttribute("aria-busy", "true");
    button.textContent = "Copia in corso…";
    status.textContent = "";
    try {
      var copied = await copyText(text);
      if (copied) {
        button.textContent = "Copiato";
        status.textContent = "Testo copiato.";
        window.dispatchEvent(new CustomEvent("youoweme:tool-template-copy", {
          detail: {
            page: "it_repayment_messages",
            template_id: button.dataset.copyTemplate,
            tone: button.dataset.tone,
            category: "repayment",
          },
        }));
      } else if (selectText(source)) {
        button.textContent = originalText;
        status.textContent = "Non è stato possibile copiare automaticamente. Il testo è selezionato: usa il comando di copia del dispositivo.";
      } else {
        button.textContent = originalText;
        status.textContent = "Non è stato possibile copiare automaticamente. Seleziona il testo e copialo.";
      }
    } finally {
      copying.delete(button);
      button.removeAttribute("aria-busy");
      timers.set(button, window.setTimeout(function () {
        if (attempts.get(button) === attempt && !copying.has(button)) button.textContent = originalText;
      }, 2200));
    }
  });
  // Show only controls with a source and a live status region after the handler exists.
  root.querySelectorAll("[data-copy-template]").forEach(function (button) {
    var card = button.closest(".repayment-it-card");
    if (!card || !card.querySelector(".template-card__message")?.textContent.trim() || !card.querySelector("[data-copy-status]")) return;
    button.hidden = false;
    var hint = card.querySelector("[data-copy-hint]");
    if (hint) hint.hidden = true;
  });
})();

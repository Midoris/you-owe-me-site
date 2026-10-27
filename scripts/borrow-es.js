(function () {
  "use strict";
  // Keep this localized interaction scoped to the Spanish borrowing guide.
  var root = document.querySelector("body.borrow-es-page");
  if (!root) return;
  var timers = new WeakMap();
  var copying = new WeakSet();

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
    var button = event.target.closest("[data-copy-template], [data-copy-text-target]");
    if (!button || !root.contains(button) || copying.has(button)) return;
    var card = button.closest(".borrow-es-card");
    var source = card && card.querySelector(".template-card__message");
    var status = card && card.querySelector("[data-copy-status]");
    if (!source || !status) return;
    var text = source.textContent.trim();
    var record = button.hasAttribute("data-copy-text-target");
    var originalText = record ? "Copiar registro" : "Copiar mensaje";
    window.clearTimeout(timers.get(button));
    copying.add(button);
    button.setAttribute("aria-busy", "true");
    status.textContent = "";
    try {
      var copied = await copyText(text);
      if (copied) {
        button.textContent = "Copiado";
        status.textContent = record ? "Registro copiado." : "Mensaje copiado. Revisa los datos antes de enviarlo.";
        window.dispatchEvent(new CustomEvent("youoweme:tool-template-copy", {
          detail: {
            page: "es_blog_como_pedir_dinero_prestado_a_un_amigo",
            template_id: record ? "es_friend_borrow_record" : "es_friend_borrow_" + button.dataset.copyTemplate.replace(/-/g, "_"),
            tone: record ? "clear" : "respectful",
            category: record ? "record" : "friend_borrow",
          },
        }));
      } else if (selectText(source)) {
        button.textContent = "Seleccionado";
        status.textContent = "Texto seleccionado. Usa la opción de copiar de tu dispositivo.";
      } else {
        button.textContent = originalText;
        status.textContent = "No se pudo copiar. Selecciona el mensaje y cópialo manualmente.";
      }
    } finally {
      copying.delete(button);
      button.removeAttribute("aria-busy");
      timers.set(button, window.setTimeout(function () { button.textContent = originalText; }, 2200));
    }
  });
})();

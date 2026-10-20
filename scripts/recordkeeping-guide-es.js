// Shared recordkeeping copy UI. Retain this public filename for Spanish compatibility.
// Templates come from static localized HTML; event fields never contain their text.
(function () {
  var messages = {
    fr: { copied: "Copié", prefix: "Copié : ", fallback: "message", failure: "La copie a échoué. Sélectionnez le texte et copiez-le manuellement." },
    ar: { copied: "تم النسخ", prefix: "تم نسخ: ", fallback: "الرسالة", failure: "تعذّر النسخ. حدّد النص وانسخه يدويًا." },
    en: { copied: "Copied", prefix: "Copied: ", fallback: "message", failure: "Could not copy. Select the text and copy it manually." },
    es: { copied: "Copiado", prefix: "Copiado: ", fallback: "mensaje", failure: "No se pudo copiar. Selecciona el texto y cópialo manualmente." },
    de: { copied: "Kopiert", prefix: "Kopiert: ", fallback: "Text", failure: "Kopieren nicht möglich. Markiere den Text und kopiere ihn manuell." },
  };
  var copyUi = messages[document.documentElement.lang] || messages.en;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function copyTextWithTextarea(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var success = document.execCommand("copy");
        document.body.removeChild(textarea);
        success ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return copyTextWithTextarea(text);
      });
    }

    return copyTextWithTextarea(text);
  }

  function getCopyPage(card) {
    var source = card.closest("[data-copy-page]");
    return source ? source.getAttribute("data-copy-page") || "repayment_reminder_text_examples" : "repayment_reminder_text_examples";
  }

  function trackTemplateCopy(card) {
    window.dispatchEvent(new CustomEvent("youoweme:tool-template-copy", {
      detail: {
        page: getCopyPage(card),
        template_id: card.getAttribute("data-template-id") || "unknown",
        tone: card.getAttribute("data-tone") || "unknown",
        category: card.getAttribute("data-category") || "unknown",
      },
    }));
  }

  function initCopyButtons(cards, status) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-copy-template]"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var templateId = button.getAttribute("data-copy-template");
        var card = cards.find(function (item) {
          return item.getAttribute("data-template-id") === templateId;
        });
        var message = card ? card.querySelector(".template-card__message") : null;

        if (!message) return;

        var originalText = button.textContent;
        var textToCopy = (message.getAttribute("data-template") || message.textContent).trim();

        copyText(textToCopy).then(function () {
          button.textContent = copyUi.copied;
          if (status) status.textContent = copyUi.prefix + (card.querySelector("h3") ? card.querySelector("h3").textContent : copyUi.fallback) + ".";
          trackTemplateCopy(card);

          window.setTimeout(function () {
            button.textContent = originalText;
            if (status) status.textContent = "";
          }, 1800);
        }).catch(function () {
          if (status) status.textContent = copyUi.failure;
        });
      });
    });
  }

  ready(function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".template-card"));
    var status = document.querySelector("[data-copy-status]");

    initCopyButtons(cards, status);
  });
})();

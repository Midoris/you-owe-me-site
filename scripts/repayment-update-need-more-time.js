(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopyText(text);
      });
    }

    return legacyCopyText(text);
  }

  function legacyCopyText(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

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

  function findStatus(button) {
    var scope = button.closest("[data-copy-scope]") || button.closest("section") || document;
    return scope.querySelector("[data-copy-status]") || document.querySelector("[data-copy-status]");
  }

  function announce(button, message) {
    var status = findStatus(button);
    if (!status) return;

    status.textContent = message;
    window.setTimeout(function () {
      status.textContent = "";
    }, 1800);
  }

  function getTemplateText(templateId) {
    var card = document.querySelector('[data-template-id="' + templateId + '"]');
    var message = card ? card.querySelector(".template-card__message") : null;
    return {
      text: message ? message.textContent.trim() : "",
      title: card && card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "message",
    };
  }

  function trackCopy(type, id) {
    window.dispatchEvent(new CustomEvent("youoweme:repayment-update-copy", {
      detail: {
        page: "repayment_update_need_more_time",
        copy_type: type,
        id: id || "unknown",
      },
    }));
  }

  function handleCopy(button, text, label, type, id) {
    if (!text || button.disabled) return;

    var originalText = button.textContent;

    copyText(text).then(function () {
      button.textContent = "Copied";
      announce(button, "Copied " + label + ".");
      trackCopy(type, id);

      window.setTimeout(function () {
        button.textContent = originalText;
      }, 1800);
    }).catch(function () {
      announce(button, "Copy did not work. Select the text and copy it manually.");
    });
  }

  function initCopyButtons() {
    document.addEventListener("click", function (event) {
      var templateButton = event.target.closest("[data-copy-template]");
      if (!templateButton) return;

      var templateId = templateButton.getAttribute("data-copy-template");
      var template = getTemplateText(templateId);
      handleCopy(templateButton, template.text, template.title, "template", templateId);
    });
  }

  ready(initCopyButtons);
}());

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function copyText(text) {
    var clipboard = window.navigator && window.navigator.clipboard;

    if (clipboard && typeof clipboard.writeText === "function") {
      return clipboard.writeText(text).catch(function () {
        return copyTextFallback(text);
      });
    }

    return copyTextFallback(text);
  }

  function copyTextFallback(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      try {
        var success = document.execCommand && document.execCommand("copy");
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

  function getTemplate(templateId) {
    var card = document.querySelector('[data-template-id="' + templateId + '"]');
    var message = card ? card.querySelector(".template-card__message") : null;

    return {
      card: card,
      message: message,
      title: card && card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "message",
      text: message ? message.textContent.trim() : "",
    };
  }

  function trackCopy(type, id) {
    window.dispatchEvent(new CustomEvent("youoweme:temporary-financial-help-copy", {
      detail: {
        copy_type: type,
        id: id || "unknown",
      },
    }));
  }

  function selectVisibleText(element) {
    if (!element || !window.getSelection || !document.createRange) return false;

    var selection = window.getSelection();
    var range = document.createRange();

    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    element.scrollIntoView({ block: "nearest" });

    return true;
  }

  function handleCopy(button, text, label, type, id, sourceElement) {
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
      var selected = selectVisibleText(sourceElement);
      button.textContent = selected ? "Selected" : originalText;
      announce(button, selected ? "Text selected. Use your keyboard to copy it." : "Copy did not work. Select the text and copy it manually.");

      if (selected) {
        window.setTimeout(function () {
          button.textContent = originalText;
        }, 1800);
      }
    });
  }

  ready(function () {
    document.addEventListener("click", function (event) {
      var templateButton = event.target.closest("[data-copy-template]");
      if (templateButton) {
        var templateId = templateButton.getAttribute("data-copy-template");
        var template = getTemplate(templateId);
        handleCopy(templateButton, template.text, template.title, "template", templateId, template.message);
        return;
      }

      var targetButton = event.target.closest("[data-copy-text-target]");
      if (targetButton) {
        var targetId = targetButton.getAttribute("data-copy-text-target");
        var target = document.getElementById(targetId);
        handleCopy(targetButton, target ? target.textContent.trim() : "", "record", "record", targetId, target);
      }
    });
  });
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function fallbackCopy(text) {
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
        var copied = document.execCommand && document.execCommand("copy");
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copy(text) {
    var clipboard = window.navigator && window.navigator.clipboard;

    if (clipboard && typeof clipboard.writeText === "function") {
      return clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }

    return fallbackCopy(text);
  }

  function selectMessage(message) {
    if (!message || !window.getSelection || !document.createRange) return;

    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(message);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function statusFor(button) {
    var scope = button.closest("[data-copy-scope]") || document;
    return scope.querySelector("[data-copy-status]");
  }

  function announce(status, text) {
    if (!status) return;

    status.textContent = text;
    window.setTimeout(function () {
      status.textContent = "";
    }, 2200);
  }

  ready(function () {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-copy-template]");
      if (!button || button.disabled) return;

      var card = document.querySelector('[data-template-id="' + button.getAttribute("data-copy-template") + '"]');
      var message = card && card.querySelector(".template-card__message");
      var text = message && message.textContent.trim();
      if (!text) return;

      var originalLabel = button.textContent;
      var status = statusFor(button);
      button.disabled = true;

      copy(text).then(function () {
        button.textContent = "Copied";
        announce(status, "Copied");
      }).catch(function () {
        selectMessage(message);
        button.textContent = "Select and copy manually";
        announce(status, "Select and copy manually");
      }).finally(function () {
        window.setTimeout(function () {
          button.textContent = originalLabel;
          button.disabled = false;
        }, 2200);
      });
    });
  });
})();

(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function copyWithTextarea(text) {
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
        var copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      var clipboardAttempt = navigator.clipboard.writeText(text);
      var clipboardTimeout = new Promise(function (_, reject) {
        window.setTimeout(function () {
          reject(new Error("Clipboard write timed out"));
        }, 800);
      });

      return Promise.race([clipboardAttempt, clipboardTimeout]).catch(function () {
        return copyWithTextarea(text);
      });
    }

    return copyWithTextarea(text);
  }

  ready(function () {
    var status = document.querySelector("[data-copy-status]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-copy-text]"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var card = button.closest(".template-card");
        var message = card ? card.querySelector(".template-card__message") : null;

        if (!message) return;

        copyText(message.textContent.trim()).then(function () {
          button.textContent = "Copied";
          if (status) status.textContent = "Copied";

          window.setTimeout(function () {
            button.textContent = "Copy text";
            if (status) status.textContent = "";
          }, 1800);
        }).catch(function () {
          if (status) status.textContent = "Couldn’t copy—select the text instead.";
        });
      });
    });
  });
})();

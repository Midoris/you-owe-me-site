(function () {
  "use strict";

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

  function selectText(element) {
    if (!element || !window.getSelection || !document.createRange) return;
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function announce(message) {
    var status = document.querySelector("[data-copy-status]");
    if (!status) return;
    status.textContent = message;
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(function () {
      status.textContent = "";
    }, 2600);
  }

  ready(function () {
    document.querySelectorAll("[data-copy-source]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) return;

        var source = document.getElementById(button.getAttribute("data-copy-source"));
        var text = source && source.textContent.trim();
        if (!text) return;

        button.disabled = true;

        copy(text).then(function () {
          announce(button.getAttribute("data-copy-success") || "Copied");
        }).catch(function () {
          selectText(source);
          announce(button.getAttribute("data-copy-failure") || "Couldn’t copy automatically. Select the text and copy it manually.");
        }).finally(function () {
          window.setTimeout(function () {
            button.disabled = false;
          }, 650);
        });
      });
    });
  });
})();

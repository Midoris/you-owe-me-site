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
      return navigator.clipboard.writeText(text);
    }

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

  function findStatus(button) {
    var scope = button.closest("[data-copy-scope]") || button.closest("section") || document;
    return scope.querySelector("[data-copy-status]") || document.querySelector("[data-copy-status]");
  }

  function setStatus(button, message) {
    var status = findStatus(button);
    if (!status) return;

    status.textContent = message;
    window.clearTimeout(status.copyTimer);
    status.copyTimer = window.setTimeout(function () {
      if (status.textContent === message) status.textContent = "";
    }, 1800);
  }

  function trackCopy(targetId) {
    window.dispatchEvent(new CustomEvent("youoweme:roommate-splitting-copy", {
      detail: {
        page: "roommate_splitting_guide",
        target: targetId || "unknown",
      },
    }));
  }

  function initCopyButtons() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-copy-target]");
      if (!button) return;

      var targetId = button.getAttribute("data-copy-target");
      var target = document.getElementById(targetId);
      var text = target ? target.textContent.trim() : "";
      var originalText = button.textContent;

      if (!text || button.disabled) return;

      button.disabled = true;
      copyText(text).then(function () {
        button.textContent = "Copied";
        setStatus(button, "Copied.");
        trackCopy(targetId);

        window.setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 1400);
      }).catch(function () {
        button.disabled = false;
        setStatus(button, "Copy did not work. Select the text and copy it manually.");
      });
    });
  }

  ready(initCopyButtons);
})();

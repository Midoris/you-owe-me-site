(function () {
  "use strict";

  function copyWithFallback(text) {
    if (navigator.clipboard && window.isSecureContext && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }

    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("Copy command failed."));
        }
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  function updateStatus(button, kind, message) {
    var scope = button.closest(".plg-hero, .plg-template-card") || document;
    var status = scope.querySelector('[data-copy-status="' + kind + '"]');
    if (status) status.textContent = message;
  }

  function restoreButtons(kind) {
    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
      var target = button.getAttribute("data-copy-target");
      var targetKind = target === "migration-note" ? "migration" : "record";
      if (targetKind === kind) button.textContent = button.getAttribute("data-copy-label");
    });
  }

  function handleCopy(button) {
    var targetId = button.getAttribute("data-copy-target");
    var target = document.getElementById(targetId);
    var kind = targetId === "migration-note" ? "migration" : "record";
    var successLabel = kind === "migration" ? "Note copied" : "Record copied";
    var successMessage = kind === "migration" ? "Existing-loan migration note copied." : "Personal loan record copied.";
    var failureMessage = kind === "migration" ? "Couldn’t copy automatically. Select and copy the note above." : "Couldn’t copy automatically. Select and copy the template below.";

    if (!target) return;

    copyWithFallback(target.textContent.trim()).then(function () {
      document.querySelectorAll('[data-copy-target="' + targetId + '"]').forEach(function (copyButton) {
        copyButton.textContent = successLabel;
      });
      updateStatus(button, kind, successMessage);
      window.setTimeout(function () {
        restoreButtons(kind);
        updateStatus(button, kind, "");
      }, 2200);
    }).catch(function () {
      restoreButtons(kind);
      updateStatus(button, kind, failureMessage);
    });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy-target]");
    if (button) handleCopy(button);
  });
}());

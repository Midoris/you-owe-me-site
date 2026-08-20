(function () {
  "use strict";

  var button = document.querySelector("[data-copy-template]");
  var template = document.getElementById("debt-record-template-text");
  var status = document.querySelector("[data-copy-status]");

  if (!button || !template || !status) return;

  var defaultLabel = "Copy debt record template";
  var successLabel = "Debt record template copied";
  var resetTimer = null;

  function fallbackCopy(text) {
    var selection = window.getSelection();
    var savedRanges = [];

    if (selection) {
      for (var index = 0; index < selection.rangeCount; index += 1) {
        savedRanges.push(selection.getRangeAt(index).cloneRange());
      }

      var range = document.createRange();
      range.selectNodeContents(template);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    if (selection) {
      selection.removeAllRanges();
      savedRanges.forEach(function (range) {
        selection.addRange(range);
      });
    }

    if (!copied) return Promise.reject(new Error("Copy command failed"));
    return Promise.resolve(text);
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }

    return fallbackCopy(text);
  }

  function showSuccess() {
    window.clearTimeout(resetTimer);
    button.textContent = successLabel;
    status.textContent = successLabel;
    resetTimer = window.setTimeout(function () {
      button.textContent = defaultLabel;
      status.textContent = "";
    }, 3000);
  }

  function showFailure() {
    window.clearTimeout(resetTimer);
    button.textContent = defaultLabel;
    status.textContent = "Copy failed. Select the template and copy it manually.";
  }

  button.hidden = false;
  button.addEventListener("click", function () {
    copyText(template.textContent).then(showSuccess, showFailure);
  });
}());

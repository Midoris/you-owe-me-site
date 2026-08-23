(function () {
  "use strict";

  var button = document.querySelector("[data-copy-target]");
  if (!button) return;

  var status = document.querySelector(".roommate-template-copy-status");
  var defaultLabel = "Copy summary message";
  var resetTimer = null;

  function setFeedback(label, message) {
    button.textContent = label;
    if (status) status.textContent = message;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      button.textContent = defaultLabel;
      if (status) status.textContent = "";
    }, 2400);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    var copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("Copy command was not accepted");
  }

  button.addEventListener("click", function () {
    var target = document.getElementById(button.getAttribute("data-copy-target"));
    if (!target) return;
    var text = target.textContent.trim();
    var action = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text)
      : Promise.resolve().then(function () { fallbackCopy(text); });

    action.then(function () {
      setFeedback("Copied", "Summary message copied.");
    }).catch(function () {
      setFeedback(defaultLabel, "Copy did not work. Select the message and copy it manually.");
    });
  });
})();

(function () {
  "use strict";

  const root = document.querySelector("[data-support-email]");
  if (!root) return;

  const revealButton = root.querySelector("[data-support-email-reveal]");
  const actions = root.querySelector("[data-support-email-actions]");
  const copyButton = root.querySelector("[data-support-email-copy]");

  const XOR_KEY = 37;
  const ENCODED_EMAIL = [
    64, 80, 66, 64, 75, 122, 92, 68, 71, 73,
    74, 75, 86, 78, 76, 101, 92, 68, 77, 74,
    74, 11, 70, 74, 72,
  ];

  let revealedEmail = null;
  let copyResetTimer = null;

  function dispatchAnalyticsEvent(name) {
    window.dispatchEvent(new CustomEvent(name));
  }

  function decodeEmail() {
    if (revealedEmail) return revealedEmail;

    revealedEmail = ENCODED_EMAIL.map(function (value) {
      return String.fromCharCode(value ^ XOR_KEY);
    }).join("");

    return revealedEmail;
  }

  function setCopyButtonLabel(label) {
    if (!copyButton) return;
    copyButton.textContent = label;
  }

  function revealEmail() {
    decodeEmail();
    actions.hidden = false;
    revealButton.hidden = true;
    copyButton.focus();
    dispatchAnalyticsEvent("youoweme:support-email-revealed");
  }

  async function copyEmail() {
    const email = decodeEmail();

    try {
      await navigator.clipboard.writeText(email);
      window.clearTimeout(copyResetTimer);
      setCopyButtonLabel("Copied");
      copyResetTimer = window.setTimeout(function () {
        setCopyButtonLabel("Copy email");
      }, 1600);
      dispatchAnalyticsEvent("youoweme:support-email-copied");
    } catch (error) {
      window.prompt("Copy support email:", email);
    }
  }

  revealButton.addEventListener("click", revealEmail);
  copyButton.addEventListener("click", copyEmail);
})();

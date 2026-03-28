(function () {
  "use strict";

  const root = document.querySelector("[data-support-email]");
  if (!root) return;

  const revealButton = root.querySelector("[data-support-email-reveal]");
  const emailValue = root.querySelector("[data-support-email-value]");
  const actions = root.querySelector("[data-support-email-actions]");
  const copyButton = root.querySelector("[data-support-email-copy]");
  const openLink = root.querySelector("[data-support-email-open]");
  const status = root.querySelector("[data-support-email-status]");

  const XOR_KEY = 37;
  const ENCODED_EMAIL = [
    64, 80, 66, 64, 75, 122, 92, 68, 71, 73,
    74, 75, 86, 78, 76, 101, 92, 68, 77, 74,
    74, 11, 70, 74, 72,
  ];

  let revealedEmail = null;

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

  function setStatus(message) {
    if (!status) return;
    status.textContent = message || "";
  }

  function revealEmail() {
    const email = decodeEmail();

    emailValue.textContent = email;
    emailValue.hidden = false;
    actions.hidden = false;
    openLink.hidden = false;
    openLink.href = "mailto:" + email;
    revealButton.disabled = true;
    revealButton.textContent = "Email revealed";
    revealButton.setAttribute("aria-expanded", "true");
    setStatus("You can now copy the address or open it in your mail app.");
    dispatchAnalyticsEvent("youoweme:support-email-revealed");
  }

  async function copyEmail() {
    const email = decodeEmail();

    try {
      await navigator.clipboard.writeText(email);
      setStatus("Support email copied.");
      dispatchAnalyticsEvent("youoweme:support-email-copied");
    } catch (error) {
      window.prompt("Copy support email:", email);
      setStatus("Support email ready to copy.");
    }
  }

  revealButton.addEventListener("click", revealEmail);
  copyButton.addEventListener("click", copyEmail);
})();

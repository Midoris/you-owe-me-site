(function () {
  "use strict";

  const invitationPanel = document.getElementById("invitation-ready");
  const missingPanel = document.getElementById("invitation-missing");
  const copyButton = document.getElementById("copy-invitation");
  const copyStatus = document.getElementById("copy-status");

  if (!invitationPanel || !missingPanel || !copyButton || !copyStatus) return;

  const location = window.location;
  const isCanonicalInvitation =
    location.protocol === "https:" &&
    location.hostname.toLowerCase() === "you-owe-me.com" &&
    location.port === "" &&
    location.username === "" &&
    location.password === "" &&
    (location.pathname === "/connect" || location.pathname === "/connect/") &&
    location.search === "" &&
    /^#t=[A-Za-z0-9_-]{43}$/.test(location.hash);

  invitationPanel.hidden = !isCanonicalInvitation;
  missingPanel.hidden = isCanonicalInvitation;

  if (!isCanonicalInvitation) return;

  copyButton.addEventListener("click", async function () {
    copyButton.disabled = true;
    copyButton.textContent = "Copying…";
    let invitationURL = window.location.href;

    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(invitationURL);
      copyStatus.textContent = "Invitation link copied. Share it only with the person you intend to invite.";
    } catch (_error) {
      copyStatus.textContent = "Copy failed. Return to the original message and use its invitation link.";
    } finally {
      invitationURL = "";
      copyButton.textContent = "Copy Invitation Link";
      copyButton.disabled = false;
    }
  });
})();

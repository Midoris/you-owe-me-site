(function () {
  "use strict";

  const invitationPanel = document.getElementById("invitation-ready");
  const missingPanel = document.getElementById("invitation-missing");
  const copyButton = document.getElementById("copy-invitation");
  const copyStatus = document.getElementById("copy-status");

  if (!invitationPanel || !missingPanel || !copyButton || !copyStatus) return;

  const hasCanonicalInvitation = function () {
    return /^https:\/\/you-owe-me\.com\/invite\/?#t=[A-Za-z0-9_-]{42}[AQgw]$/.test(
      window.location.href
    );
  };
  let copyListenerInstalled = false;

  const copyInvitation = async function () {
    if (!hasCanonicalInvitation()) {
      renderInvitationState();
      return;
    }

    copyButton.disabled = true;
    copyButton.textContent = "Copying…";
    let invitationURL = window.location.href;

    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(invitationURL);
      copyStatus.textContent = "Invitation link copied. Share it only with the intended recipient.";
    } catch (_error) {
      copyStatus.textContent = "Copy failed. Return to the original message and use its invitation link.";
    } finally {
      invitationURL = "";
      copyButton.textContent = "Copy Invitation Link";
      copyButton.disabled = false;
    }
  };

  function renderInvitationState() {
    const isCanonicalInvitation = hasCanonicalInvitation();
    invitationPanel.hidden = !isCanonicalInvitation;
    missingPanel.hidden = isCanonicalInvitation;

    if (isCanonicalInvitation && !copyListenerInstalled) {
      copyButton.addEventListener("click", copyInvitation);
      copyListenerInstalled = true;
    }
  }

  renderInvitationState();
  window.addEventListener("hashchange", renderInvitationState);
  window.addEventListener("pageshow", renderInvitationState);
})();

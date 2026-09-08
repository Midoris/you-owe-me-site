/* Unlisted synthetic review entry point. No change to the public offer flag,
   payload validation, retention, import or repayment behavior. */
(() => {
  "use strict";
  const button = document.getElementById("prepare");
  const status = document.getElementById("status");
  const link = document.getElementById("open");
  const draft = {
    version: 1, source: "split-calculator", type: "payer-split",
    organizerID: "alex", currencyLabel: "USD",
    participants: [{id: "alex", name: "Alex"}, {id: "mia", name: "Mia"}, {id: "sam", name: "Sam"}],
    costs: [{id: "dinner", label: "Dinner", amount: 9000, payerID: "alex", participantIDs: ["alex", "mia", "sam"]}]
  };
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    link.hidden = true;
    link.removeAttribute("href");
    status.textContent = "Preparing sample…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const config = window.UomiToolTransfer.config;
      const bytes = crypto.getRandomValues(new Uint8Array(26));
      const reference = Date.now().toString(16).padStart(12, "0") + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
      const response = await fetch(config.endpoint, {
        method: "POST", headers: {"Content-Type": "application/json"},
        credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
        signal: controller.signal, body: JSON.stringify({action: "create", reference, draft})
      });
      if (!response.ok) throw new Error("Preparation failed");
      link.href = config.continuation + "?ref=" + reference;
      link.hidden = false;
      status.textContent = "Ready. Open the prepared split below. This link expires in 24 hours.";
    } catch (_) {
      status.textContent = "Could not prepare the sample. Check your connection and try again.";
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
})();

(function () {
  "use strict";

  const ENDPOINT_URL = "https://us-central1-you-owe-me-app.cloudfunctions.net/sendWebsiteSupportMessage";
  const FORM_SENT_EVENT = "youoweme:support-form-sent";
  const FORM_ERROR_EVENT = "youoweme:support-form-error";

  const root = document.querySelector("[data-support-form-root]");
  if (!root) return;

  const form = root.querySelector("[data-support-form]");
  const submitButton = root.querySelector("[data-support-submit]");
  const status = root.querySelector("[data-support-status]");
  const startedAt = root.querySelector("[data-support-started-at]");

  if (!form || !submitButton || !status || !startedAt) return;

  startedAt.value = String(Date.now());

  function dispatchAnalyticsEvent(name) {
    window.dispatchEvent(new CustomEvent(name));
  }

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "";
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Sending" : "Send message";
  }

  function getPayload() {
    const data = new FormData(form);

    return {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
      company: String(data.get("company") || ""),
      startedAt: Number(data.get("startedAt") || 0),
      page: window.location.href,
    };
  }

  async function sendSupportMessage(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    setSubmitting(true);
    setStatus("", "");

    try {
      const response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getPayload()),
      });

      if (!response.ok) {
        let errorMessage = "Message could not be sent. Please try again later.";

        try {
          const body = await response.json();
          if (body && typeof body.error === "string") {
            errorMessage = body.error;
          }
        } catch (error) {
          // Keep the generic message when the server does not return JSON.
        }

        throw new Error(errorMessage);
      }

      form.reset();
      startedAt.value = String(Date.now());
      setStatus("Message sent. Thank you.", "success");
      dispatchAnalyticsEvent(FORM_SENT_EVENT);
    } catch (error) {
      setStatus(error && error.message ? error.message : "Message could not be sent. Please try again later.", "error");
      dispatchAnalyticsEvent(FORM_ERROR_EVENT);
    } finally {
      setSubmitting(false);
    }
  }

  form.addEventListener("submit", sendSupportMessage);
})();

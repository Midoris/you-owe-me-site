import {
  CURRENCIES,
  createProposal,
  encodeProposal,
  formatDate,
  formatMoney,
  scheduleFor,
  validateProposalInputs,
} from "./repayment-proposal-model.mjs";
import { markProposalSender, trackProposal } from "./repayment-proposal-events.mjs";

function proposalMessage(plan) {
  const amount = formatMoney(plan.totalMinor, plan.currency);
  const firstDate = formatDate(plan.firstDate);
  const repayment = plan.count === 1
    ? `I could pay you back on ${firstDate}.`
    : `I could pay you back in ${plan.count} ${plan.cadence} payments starting ${firstDate}.`;
  const url = new URL("/repayment-plan/", window.location.origin);
  url.hash = `p=${encodeProposal(plan)}`;

  return `Could I borrow ${amount}? ${repayment} It’s okay if you can’t.\n\nHere’s the plan: ${url}`;
}

function bindBuilder(builder) {
  const controls = builder.querySelector("[data-proposal-controls]");
  const fields = {
    amount: controls.querySelector("#proposal-amount"),
    currency: controls.querySelector("#proposal-currency"),
    count: controls.querySelector("#proposal-count"),
    cadence: controls.querySelector("#proposal-cadence"),
    firstDate: controls.querySelector("#proposal-first-date"),
  };
  const cadenceField = controls.querySelector("[data-proposal-cadence]");
  const preview = controls.querySelector("[data-proposal-preview]");
  const total = preview.querySelector("[data-proposal-total]");
  const firstLabel = preview.querySelector("[data-proposal-first-label]");
  const firstAmount = preview.querySelector("[data-proposal-first-amount]");
  const first = preview.querySelector("[data-proposal-first]");
  const lastRow = preview.querySelector("[data-proposal-last-row]");
  const lastAmount = lastRow.querySelector("[data-proposal-last-amount]");
  const last = lastRow.querySelector("[data-proposal-last]");
  const status = controls.querySelector("[data-proposal-status]");
  const fallback = controls.querySelector("[data-proposal-fallback]");
  const fallbackText = document.createElement("textarea");
  fallbackText.id = "proposal-message";
  fallbackText.rows = 4;
  fallbackText.readOnly = true;
  fallbackText.spellcheck = false;
  fallback.append(fallbackText);
  const copyButton = controls.querySelector("[data-proposal-copy]");
  const shareButton = controls.querySelector("[data-proposal-share]");

  let previousPlan;
  let invalidField;
  let revision = 0;
  let delivering = false;

  fields.currency.replaceChildren(...CURRENCIES.map((code) => new Option(code, code)));
  shareButton.hidden = typeof navigator.share !== "function";

  function readInputs() {
    return {
      amount: fields.amount.value,
      currency: fields.currency.value,
      count: fields.count.value,
      cadence: fields.cadence.disabled ? "monthly" : fields.cadence.value,
      firstDate: fields.firstDate.value,
    };
  }

  function renderPreview(terms) {
    const payments = scheduleFor(terms);
    const single = payments.length === 1;
    const firstPayment = payments[0];
    const lastPayment = payments.at(-1);

    total.textContent = formatMoney(terms.totalMinor, terms.currency);
    firstLabel.textContent = single ? "Payment date" : "First payment";
    firstAmount.hidden = single;
    firstAmount.textContent = single ? "" : formatMoney(firstPayment.amountMinor, terms.currency);
    first.textContent = formatDate(firstPayment.date);
    lastRow.hidden = single;
    lastAmount.textContent = single ? "" : formatMoney(lastPayment.amountMinor, terms.currency);
    last.textContent = single ? "" : formatDate(lastPayment.date);
    preview.hidden = false;
  }

  function fieldError(field, message) {
    document.getElementById(field.getAttribute("aria-describedby")).textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  function clearFeedback() {
    if (invalidField) fieldError(invalidField, "");
    invalidField = undefined;
    status.textContent = "";
    fallback.hidden = true;
    fallbackText.value = "";
  }

  function onEdit() {
    revision += 1;
    clearFeedback();
    cadenceField.hidden = fields.cadence.disabled = Number(fields.count.value) === 1;

    try {
      const terms = validateProposalInputs(readInputs());
      if (previousPlan && previousPlan.key !== JSON.stringify(terms)) previousPlan = undefined;
      renderPreview(terms);
    } catch {
      preview.hidden = true;
    }
  }

  async function deliver(share) {
    if (delivering) return;
    clearFeedback();

    let message;
    try {
      const input = readInputs();
      const terms = validateProposalInputs(input);
      const key = JSON.stringify(terms);
      if (previousPlan?.key !== key) previousPlan = { key, plan: createProposal(input) };
      markProposalSender(previousPlan.plan.id);
      message = proposalMessage(previousPlan.plan);
    } catch (error) {
      invalidField = fields[error?.field];
      if (invalidField) {
        fieldError(invalidField, error.message);
        invalidField.focus();
      } else {
        status.textContent = "Couldn’t prepare the proposal. Try again.";
      }
      return;
    }

    delivering = true;
    const deliveryRevision = revision;
    try {
      if (share) await navigator.share({ text: message });
      else await navigator.clipboard.writeText(message);
    } catch (error) {
      if (deliveryRevision !== revision) return;
      if (share) {
        if (error?.name !== "AbortError") {
          status.textContent = "Sharing is unavailable. Copy the message and link instead.";
        }
      } else {
        status.textContent = "Copy the selected message and link manually.";
        fallbackText.value = message;
        fallback.hidden = false;
        fallbackText.focus();
        fallbackText.select();
        fallbackText.setSelectionRange(0, message.length);
      }
      return;
    } finally {
      delivering = false;
    }

    trackProposal(share ? "link_shared" : "link_copied");
    if (deliveryRevision === revision) {
      status.textContent = share ? "Proposal shared." : "Message and link copied.";
    }
  }

  controls.addEventListener("input", onEdit);
  builder.addEventListener("toggle", () => {
    if (builder.open) trackProposal("builder_opened");
  });
  copyButton.addEventListener("click", () => void deliver(false));
  shareButton.addEventListener("click", () => void deliver(true));
  onEdit();
  builder.hidden = false;
}

const builder = document.querySelector("[data-proposal-builder]");
if (builder) bindBuilder(builder);

(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.init(root.document);
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const POLICY_SENTENCES = {
    original: "If someone cancels, refunds, credits, resale proceeds, or a replacement payment reduce that share first; any unrecovered part follows the original group agreement.",
    replace: "If someone cancels, we will try to replace the place first, apply any refund, credit, resale, or replacement payment, and then recalculate only what remains.",
    resplit: "If someone cancels, we will apply refunds, credits, resale, or replacement payments first, then the remaining travelers will re-split any unrecovered cost.",
  };
  const MAX_OTHER_PEOPLE = 100;
  const MAX_AMOUNT_CENTS = Number.MAX_SAFE_INTEGER;

  function parseCents(value) {
    const raw = String(value ?? "").trim();
    if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?|\.\d{1,2})$/.test(raw)) return NaN;
    const [whole, fraction = ""] = raw.replace(/,/g, "").split(".");
    const cents = Number(whole + fraction.padEnd(2, "0"));
    return Number.isSafeInteger(cents) ? cents : NaN;
  }

  function money(cents) {
    const fraction = cents % 100;
    return `${(cents - fraction) / 100}.${String(fraction).padStart(2, "0")}`;
  }

  function validOtherPeople(count) {
    return Number.isInteger(count) && count >= 1 && count <= MAX_OTHER_PEOPLE;
  }

  function allocateShares(totalCents, otherPeople, includeSelf) {
    const shareCount = otherPeople + (includeSelf ? 1 : 0);
    const extraShares = totalCents % shareCount;
    const baseShare = (totalCents - extraShares) / shareCount;
    // The listed travelers get the extra cents first, in row order; the organizer is last.
    const shareCents = Array.from({ length: shareCount }, (_, index) => baseShare + (index < extraShares ? 1 : 0));
    return { shareCount, extraShares, baseShare, shareCents, selfShareCents: includeSelf ? shareCents[otherPeople] : null };
  }

  function shareDisplay(currency, split) {
    return split.extraShares ? `${currency} ${money(split.baseShare)}–${money(split.baseShare + 1)} per person` : `${currency} ${money(split.baseShare)} each`;
  }

  function bookingLabel(type, name) {
    return String(name || "").trim() || type;
  }

  function statusFor(received, share) {
    if (received >= share) return "paid";
    if (received <= 0) return "open";
    return "partial";
  }

  function recommendation(state) {
    const allCovered = state.participants.length > 0 && state.participants.every((person) => person.remainingCents === 0);
    if (allCovered) return { key: "covered", label: "Fixed shares are covered", explanation: "Everyone else’s fixed share is covered. Keep the cancellation/refund rule with the booking record and handle variable trip costs separately after they happen." };
    if (state.bookingStatus === "already-booked") return { key: "already", label: "Set a fixed pay-before-departure date", explanation: "The booking is already made, so the useful next step is a clear deadline for the remaining fixed shares, plus a written cancellation/refund rule." };
    if (state.refundability === "Nonrefundable" || state.comfortableCarry === "No" || state.priorDelays === "Yes") return { key: "collect", label: "Collect before booking", explanation: "This booking has enough fixed risk that the clearest plan is to collect the agreed shares before one person commits the full amount." };
    return { key: "book", label: "Book first, then collect before departure", explanation: "Because the booking has more flexibility and you are comfortable carrying the temporary balance, it can be reasonable to secure it now and give everyone a clear fixed-share deadline before travel." };
  }

  function cancellationSentence(rule, customRule) {
    return rule === "custom" ? String(customRule || "").trim() : POLICY_SENTENCES[rule] || "";
  }

  function buildArtifacts(state, result) {
    const label = bookingLabel(state.bookingType, state.bookingName);
    const checkIndividualBalance = state.extraShares > 0 || state.participants.some((person) => person.receivedCents > 0);
    const total = `${state.currency} ${money(state.totalCents)} total`;
    const individualShare = `${state.currency} ${money(state.baseShare)}`;
    const splitTerms = `${total} for ${state.shareCount} people${checkIndividualBalance ? "" : ` (${individualShare} each)`}`;
    const base = `${label}: ${splitTerms}.`;
    const policySentence = cancellationSentence(state.cancellationRule, state.customRule);
    const balancePolicy = checkIndividualBalance ? " Check your remaining balance with the organizer before sending any payment." : "";
    const paymentRequest = checkIndividualBalance
      ? `Please check your remaining balance with me and send anything still due by ${state.deadlineDisplay}`
      : `Please send your fixed share of ${individualShare} by ${state.deadlineDisplay}`;
    let policy;
    let message;
    if (result.key === "covered") {
      policy = `${base} Everyone else’s fixed share is covered. ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `Thanks — everyone else’s fixed share for ${label} is covered. ${policySentence}`;
    } else if (state.bookingStatus === "already-booked") {
      policy = `${label} is booked at ${splitTerms}. Any remaining fixed balance is due by ${state.deadlineDisplay} before travel.${balancePolicy} ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `${label} is booked. ${paymentRequest} before we travel. ${policySentence}`;
    } else if (result.key === "collect") {
      policy = `${base} Any remaining fixed balance is due by ${state.deadlineDisplay} before booking.${balancePolicy} ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `I’m ready to book ${label} for ${total}. ${paymentRequest}. I’ll book once the shares are covered. ${policySentence}`;
    } else {
      policy = `${base} The booking can be secured first. Any remaining fixed balance is due by ${state.deadlineDisplay} before travel.${balancePolicy} ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `I’m going to secure ${label} for ${total}. ${paymentRequest} before the trip. ${policySentence}`;
    }
    return { policy, message };
  }

  function calculate(input) {
    const split = allocateShares(input.totalCents, input.otherPeople, input.includeSelf);
    const participants = input.participants.map((person, index) => {
      const shareCents = split.shareCents[index];
      return { ...person, shareCents, remainingCents: shareCents - person.receivedCents, status: statusFor(person.receivedCents, shareCents) };
    });
    const state = { ...input, ...split, participants };
    const result = recommendation(state);
    return { ...state, result, artifacts: buildArtifacts(state, result) };
  }

  function formatDate(value) {
    if (!value) return "";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return value;
    return new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function todayLocal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function init(document) {
    const form = document.getElementById("trip-booking-plan-form");
    if (!form) return;
    const $ = (id) => document.getElementById(id);
    const participantRows = $("participant-rows");
    const otherPeopleInput = $("other-people");
    const totalInput = $("booking-total");
    const currencyInput = $("booking-currency");
    const includeSelf = $("include-self");
    const refundDeadlineWrap = $("refund-deadline-wrap");
    const customRuleWrap = $("custom-rule-wrap");
    const shareSummary = $("equal-share-summary");
    const roundingNote = $("rounding-note");
    const errorSummary = $("tbp-error-summary");
    const emptyState = $("planner-empty-state");
    const initialPrompt = emptyState.textContent;
    const resultRegion = $("planner-result");
    const resetButton = $("planner-reset");
    const resultCopyButtons = resultRegion.querySelectorAll(".tbp-copyButton");
    const resultTitle = $("result-title");
    const paymentDeadline = $("payment-deadline");
    const refundDeadline = $("refund-deadline");
    let currentPlan = null;

    paymentDeadline.min = todayLocal();

    function selected(name) {
      return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
    }

    function renderParticipants() {
      const parsed = Number(otherPeopleInput.value);
      if (!validOtherPeople(parsed) || parsed === participantRows.children.length) return;
      const participantState = Array.from(participantRows.querySelectorAll(".tbp-participant")).map((row) => ({
        name: row.querySelector("[data-person-name]").value,
        received: row.querySelector("[data-person-received]").value,
      }));
      participantRows.replaceChildren();
      for (let i = 0; i < parsed; i += 1) {
        const row = document.createElement("div");
        row.className = "tbp-participant";
        row.innerHTML = `<div class="tbp-control"><label for="person-name-${i}">Person ${i + 1} name (optional)</label><input id="person-name-${i}" data-person-name type="text" placeholder="e.g. Maya" value="${escapeAttribute(participantState[i]?.name || "")}" /></div><div class="tbp-control"><label for="person-received-${i}">Amount received from this person</label><input id="person-received-${i}" data-person-received type="text" inputmode="decimal" placeholder="0" value="${escapeAttribute(participantState[i]?.received || "")}" aria-describedby="person-received-help-${i} person-received-error-${i}" /><p class="tbp-help" id="person-received-help-${i}">Leave at 0 if nothing has been received yet.</p><p class="tbp-fieldError" id="person-received-error-${i}"></p></div>`;
        participantRows.appendChild(row);
      }
    }

    function escapeAttribute(value) {
      return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function draftSplit() {
      const totalCents = parseCents(totalInput.value);
      const others = Number(otherPeopleInput.value);
      return totalCents > 0 && validOtherPeople(others) ? allocateShares(totalCents, others, includeSelf.checked) : null;
    }

    function updateLiveShare() {
      const split = draftSplit();
      const currency = currencyInput.value.trim().toUpperCase() || "currency";
      shareSummary.textContent = split ? `Fixed shares: ${shareDisplay(currency, split)}${split.selfShareCents === null ? "" : ` · Your share: ${currency} ${money(split.selfShareCents)}`}` : "Fixed shares: enter a valid total and group size to calculate";
      roundingNote.hidden = !split?.extraShares;
      for (let index = 0; index < participantRows.children.length; index += 1) {
        $(`person-received-help-${index}`).textContent = split
          ? `Fixed share: ${currency} ${money(split.shareCents[index])}. Leave at 0 if nothing has been received yet.`
          : "Leave at 0 if nothing has been received yet.";
      }
    }

    function toggleConditionalFields() {
      const refundable = selected("refundability");
      refundDeadlineWrap.hidden = !(refundable === "Refundable" || refundable === "Partly refundable");
      customRuleWrap.hidden = selected("cancellationRule") !== "custom";
    }

    function clearErrors() {
      errorSummary.hidden = true;
      form.querySelectorAll("[aria-invalid='true']").forEach((node) => node.removeAttribute("aria-invalid"));
      form.querySelectorAll(".tbp-fieldError").forEach((node) => { node.textContent = ""; });
    }

    function setError(node, errorId, message) {
      node.setAttribute("aria-invalid", "true");
      const error = $(errorId);
      if (error) error.textContent = message;
    }

    function participantValues() {
      return Array.from(participantRows.querySelectorAll(".tbp-participant")).map((row, index) => ({
        receivedInput: row.querySelector("[data-person-received]"),
        name: row.querySelector("[data-person-name]").value.trim() || `Person ${index + 1}`,
        receivedRaw: row.querySelector("[data-person-received]").value.trim(),
      }));
    }

    function validate() {
      clearErrors();
      const totalRaw = totalInput.value.trim();
      const totalCents = parseCents(totalRaw);
      const otherRaw = otherPeopleInput.value.trim();
      const otherPeople = Number(otherRaw);
      const split = draftSplit();
      const participants = participantValues();
      const errors = [];
      if (!totalRaw) { setError(totalInput, "booking-total-error", "Enter the fixed booking total."); errors.push(totalInput); }
      else if (!(totalCents > 0)) { setError(totalInput, "booking-total-error", `Enter an amount from 0.01 to ${money(MAX_AMOUNT_CENTS)}, with up to two decimal places (for example, 1,200.50).`); errors.push(totalInput); }
      if (!currencyInput.value.trim()) { setError(currencyInput, "currency-error", "Enter a currency label such as USD, EUR, GBP, or THB."); errors.push(currencyInput); }
      if (!otherRaw) { setError(otherPeopleInput, "other-people-error", "Add at least one other person."); errors.push(otherPeopleInput); }
      else if (!validOtherPeople(otherPeople)) { setError(otherPeopleInput, "other-people-error", `Use a whole number from 1 to ${MAX_OTHER_PEOPLE}.`); errors.push(otherPeopleInput); }
      if (!selected("refundability")) { setError($("refundability-group"), "refundability-error", "Choose whether the booking is refundable, partly refundable, or nonrefundable."); errors.push($("refundability-group")); }
      if (!selected("comfortableCarry")) { setError($("comfortable-group"), "comfortable-error", "Choose whether you are comfortable carrying the unpaid fixed amount."); errors.push($("comfortable-group")); }
      if (!selected("priorDelays")) { setError($("delays-group"), "delays-error", "Choose whether trip repayments in this group have been delayed or missed before."); errors.push($("delays-group")); }
      if (!paymentDeadline.value) { setError(paymentDeadline, "payment-deadline-error", "Add a fixed-share payment deadline."); errors.push(paymentDeadline); }
      else if (paymentDeadline.value < todayLocal()) { setError(paymentDeadline, "payment-deadline-error", "Choose today or a future payment deadline."); errors.push(paymentDeadline); }
      const cancellationRule = selected("cancellationRule");
      if (!cancellationRule) { setError($("cancellation-group"), "cancellation-error", "Choose what happens if someone cancels before you build the plan."); errors.push($("cancellation-group")); }
      if (cancellationRule === "custom" && !$("custom-rule").value.trim()) { setError($("custom-rule"), "custom-rule-error", "Write the custom group rule you agreed."); errors.push($("custom-rule")); }
      const currency = currencyInput.value.trim().toUpperCase();
      const payments = participants.map((person, index) => {
        const receivedCents = person.receivedRaw === "" ? 0 : parseCents(person.receivedRaw);
        const shareCents = split?.shareCents[index];
        if (Number.isNaN(receivedCents)) {
          setError(person.receivedInput, `person-received-error-${index}`, "Enter a valid payment amount with up to two decimal places (for example, 150.50)."); errors.push(person.receivedInput);
        } else if (shareCents !== undefined && receivedCents > shareCents) {
          setError(person.receivedInput, `person-received-error-${index}`, `This amount is higher than the fixed share of ${currency} ${money(shareCents)}. Check the payment or use the dedicated split/payback tool if the shares are unequal.`); errors.push(person.receivedInput);
        }
        return { name: person.name, receivedCents };
      });
      if (errors.length) {
        errorSummary.hidden = false;
        errorSummary.focus();
        return null;
      }
      return {
        bookingStatus: $("booking-status").value,
        bookingType: $("booking-type").value,
        bookingName: $("booking-name").value.trim(),
        totalCents,
        currency,
        refundability: selected("refundability"),
        refundDeadline: refundDeadlineWrap.hidden ? "" : refundDeadline.value,
        refundDeadlineDisplay: refundDeadlineWrap.hidden ? "" : formatDate(refundDeadline.value),
        otherPeople,
        includeSelf: includeSelf.checked,
        comfortableCarry: selected("comfortableCarry"),
        priorDelays: selected("priorDelays"),
        deadline: paymentDeadline.value,
        deadlineDisplay: formatDate(paymentDeadline.value),
        cancellationRule,
        customRule: $("custom-rule").value.trim(),
        participants: payments,
      };
    }

    function reasonsFor(plan) {
      const refundReason = plan.refundability === "Partly refundable"
        ? "Only part of this booking is refundable."
        : `This booking is ${plan.refundability.toLowerCase()}.`;
      const reasons = [refundReason];
      reasons.push(plan.comfortableCarry === "No" ? "You said you do not want to carry the unpaid fixed balance." : "You said you are comfortable carrying the temporary unpaid balance.");
      reasons.push(plan.priorDelays === "Yes" ? "Trip repayments in this group have been delayed or missed before." : "You did not report a previous trip-repayment problem in this group.");
      if (plan.bookingStatus === "already-booked") reasons.push("The booking has already been made.");
      if (plan.refundDeadlineDisplay) reasons.push(`The booking’s refund or free-cancellation deadline is ${plan.refundDeadlineDisplay}.`);
      return reasons;
    }

    function renderResult(plan) {
      currentPlan = plan;
      clearCopyFeedback(resultRegion);
      resultCopyButtons.forEach((button) => { button.disabled = false; });
      emptyState.hidden = true;
      resultRegion.hidden = false;
      resetButton.hidden = false;
      $("recommendation-label").textContent = plan.result.label;
      $("recommendation-explanation").textContent = plan.result.explanation;
      const reasons = $("recommendation-reasons");
      reasons.replaceChildren(...reasonsFor(plan).map((text) => { const li = document.createElement("li"); li.textContent = text; return li; }));
      const summary = $("result-summary");
      const items = [
        ["Booking", bookingLabel(plan.bookingType, plan.bookingName)], ["Fixed total", `${plan.currency} ${money(plan.totalCents)}`], ["People sharing", String(plan.shareCount)], ["Fixed shares", shareDisplay(plan.currency, plan)],
        ["Payment deadline", plan.deadlineDisplay], ["Refundability", plan.refundability],
      ];
      if (plan.selfShareCents !== null) items.push(["Your fixed share", `${plan.currency} ${money(plan.selfShareCents)}`]);
      if (plan.refundDeadlineDisplay) items.push(["Refund/free-cancellation deadline", plan.refundDeadlineDisplay]);
      summary.replaceChildren(...items.map(([term, value]) => { const div = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd"); dt.textContent = term; dd.textContent = value; div.append(dt, dd); return div; }));
      let paid = 0; let partial = 0; let open = 0; let noPayment = 0;
      const statusList = $("status-list");
      statusList.replaceChildren(...plan.participants.map((person) => {
        const { status, shareCents, remainingCents, receivedCents } = person;
        if (shareCents === 0) noPayment += 1; else if (status === "paid") paid += 1; else if (status === "partial") partial += 1; else open += 1;
        const row = document.createElement("div"); row.className = "tbp-statusRow";
        const name = document.createElement("strong"); name.textContent = person.name;
        const chip = document.createElement("span"); chip.className = `tbp-statusChip tbp-statusChip--${status}`; chip.textContent = shareCents === 0 ? "No payment due" : status === "paid" ? "Paid" : status === "partial" ? "Partly paid" : "Open";
        const line = document.createElement("span");
        const share = `${plan.currency} ${money(shareCents)} fixed share`;
        if (status === "paid") line.textContent = shareCents === 0 ? share : `${share} · received ${plan.currency} ${money(receivedCents)}`;
        else if (status === "partial") line.textContent = `${share} · received ${plan.currency} ${money(receivedCents)} · ${plan.currency} ${money(remainingCents)} remaining`;
        else line.textContent = `${share} · ${plan.currency} ${money(remainingCents)} remaining`;
        row.append(name, chip, line); return row;
      }));
      $("status-summary").textContent = open === 0 && partial === 0 ? "All fixed shares are covered." : `${paid} paid · ${partial} partly paid · ${open} open${noPayment ? ` · ${noPayment} with no payment due` : ""}`;
      $("policy-text").textContent = plan.artifacts.policy;
      const messageElement = $("group-message-text");
      messageElement.textContent = "";
      if (plan.cancellationRule === "custom" && plan.customRule.length > 100 && plan.artifacts.message.endsWith(plan.customRule)) {
        messageElement.append(document.createTextNode(`${plan.artifacts.message.slice(0, -plan.customRule.length).trim()} `));
        const customPolicy = document.createElement("span");
        customPolicy.className = "tbp-customPolicyInMessage";
        customPolicy.textContent = plan.customRule;
        messageElement.append(customPolicy);
      } else {
        messageElement.textContent = plan.artifacts.message;
      }
      $("group-payback-action").hidden = open === 0 && partial === 0;
      resultTitle.focus();
    }

    function clearCopyFeedback(scope) {
      scope.querySelectorAll(".tbp-copyStatus").forEach((node) => { node.textContent = ""; });
      scope.querySelectorAll(".tbp-copyButton").forEach((button) => {
        if (button.dataset.copyLabel) button.textContent = button.dataset.copyLabel;
      });
    }

    function invalidateResult() {
      if (!currentPlan) return;
      currentPlan = null;
      resultRegion.hidden = true;
      resultCopyButtons.forEach((button) => { button.disabled = true; });
      $("policy-text").textContent = "";
      $("group-message-text").textContent = "";
      clearCopyFeedback(resultRegion);
      emptyState.hidden = false;
      emptyState.textContent = "You changed the booking details. Build your booking plan again to get an updated result and copyable text.";
    }

    function resetPlanner() {
      invalidateResult();
      form.reset();
      otherPeopleInput.value = "3";
      currencyInput.value = "USD";
      participantRows.replaceChildren();
      renderParticipants();
      updateLiveShare();
      toggleConditionalFields();
      clearErrors();
      emptyState.textContent = initialPrompt;
      emptyState.hidden = false;
      resetButton.hidden = true;
      $("booking-status").focus();
    }

    function copyText(button) {
      const fromResult = resultRegion.contains(button);
      if (fromResult && !currentPlan) return;
      const planAtCopy = currentPlan;
      const stillCurrent = () => !fromResult || currentPlan === planAtCopy;
      const target = $(button.dataset.copyTarget);
      const status = button.parentElement.querySelector(".tbp-copyStatus");
      const original = button.dataset.copyLabel || button.textContent;
      button.dataset.copyLabel = original;
      const manualCopy = () => {
        if (stillCurrent()) status.textContent = "Couldn’t copy automatically. Select the text and copy it manually.";
      };
      if (!target || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") return manualCopy();
      navigator.clipboard.writeText(target.textContent.trim()).then(() => {
        if (!stillCurrent()) return;
        button.textContent = "Copied";
        status.textContent = "Copied";
        window.setTimeout(() => { if (stillCurrent()) button.textContent = original; }, 2200);
      }).catch(manualCopy);
    }

    function onEdit(event) {
      invalidateResult();
      clearErrors();
      if (event.target === otherPeopleInput) renderParticipants();
      if ([otherPeopleInput, includeSelf, totalInput, currencyInput].includes(event.target)) updateLiveShare();
      if (event.type === "change") toggleConditionalFields();
    }

    form.addEventListener("change", onEdit);
    form.addEventListener("input", onEdit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = validate();
      if (input) renderResult(calculate(input));
      else invalidateResult();
    });
    resetButton.addEventListener("click", resetPlanner);
    document.querySelectorAll(".tbp-copyButton").forEach((button) => button.addEventListener("click", () => copyText(button)));
    document.querySelectorAll("[data-planner-link]").forEach((link) => link.addEventListener("click", () => window.setTimeout(() => $("booking-status").focus(), 0)));
    renderParticipants();
    updateLiveShare();
    toggleConditionalFields();
  }

  return { POLICY_SENTENCES, parseCents, money, allocateShares, statusFor, recommendation, cancellationSentence, buildArtifacts, calculate, formatDate, init };
});

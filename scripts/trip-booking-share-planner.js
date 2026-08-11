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

  function parseAmount(value) {
    const normalized = String(value == null ? "" : value).trim().replace(/,/g, "");
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return NaN;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
  }

  function money(value) {
    return Number(value).toFixed(2);
  }

  function bookingLabel(type, name) {
    return String(name || "").trim() || type;
  }

  function statusFor(received, share) {
    if (received <= 0) return "open";
    if (received < share - 0.0000001) return "partial";
    return "paid";
  }

  function recommendation(state) {
    const allCovered = state.participants.length > 0 && state.participants.every((person) => person.received >= state.share - 0.0000001);
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
    const base = `${label}: ${state.currency} ${money(state.total)} total for ${state.shareCount} people (${state.currency} ${money(state.share)} each).`;
    const policySentence = cancellationSentence(state.cancellationRule, state.customRule);
    let policy;
    let message;
    if (result.key === "covered") {
      policy = `${base} Everyone else’s fixed share is covered. ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `Thanks — everyone else’s fixed share for ${label} is covered. ${policySentence}`;
    } else if (state.bookingStatus === "already-booked") {
      policy = `${label} is booked at ${state.currency} ${money(state.total)} total for ${state.shareCount} people (${state.currency} ${money(state.share)} each). The remaining fixed shares are due by ${state.deadlineDisplay} before travel. ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `${label} is booked. Your fixed share is ${state.currency} ${money(state.share)}, due by ${state.deadlineDisplay} before we travel. ${policySentence}`;
    } else if (result.key === "collect") {
      policy = `${base} We will collect the fixed shares by ${state.deadlineDisplay} before booking. ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `I’m ready to book ${label}. It’s ${state.currency} ${money(state.total)} total, so ${state.currency} ${money(state.share)} each. Could everyone send the fixed share by ${state.deadlineDisplay}? I’ll book once the shares are in. ${policySentence}`;
    } else {
      policy = `${base} The booking can be secured first, and the fixed shares are due by ${state.deadlineDisplay} before travel. ${policySentence} Variable trip costs such as meals and taxis will be handled separately after they happen.`;
      message = `I’m going to secure ${label} now. It’s ${state.currency} ${money(state.total)} total, so ${state.currency} ${money(state.share)} each. Please send your fixed share by ${state.deadlineDisplay} before the trip. ${policySentence}`;
    }
    return { policy, message };
  }

  function calculate(input) {
    const total = Number(input.total);
    const otherPeople = Number(input.otherPeople);
    const shareCount = otherPeople + (input.includeSelf ? 1 : 0);
    const share = total / shareCount;
    const participants = (input.participants || []).map((person, index) => ({
      name: String(person.name || "").trim() || `Person ${index + 1}`,
      received: Number(person.received),
    }));
    const state = { ...input, total, otherPeople, shareCount, share, participants };
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
    const resultRegion = $("planner-result");
    const resultTitle = $("result-title");
    const paymentDeadline = $("payment-deadline");
    const refundDeadline = $("refund-deadline");
    let participantState = [];

    paymentDeadline.min = todayLocal();

    function selected(name) {
      return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
    }

    function renderParticipants() {
      const parsed = Number(otherPeopleInput.value);
      const count = Number.isInteger(parsed) && parsed >= 1 ? parsed : 0;
      participantState = Array.from(participantRows.querySelectorAll(".tbp-participant")).map((row) => ({
        name: row.querySelector("[data-person-name]").value,
        received: row.querySelector("[data-person-received]").value,
      }));
      participantRows.replaceChildren();
      for (let i = 0; i < count; i += 1) {
        const row = document.createElement("div");
        row.className = "tbp-participant";
        row.innerHTML = `<div class="tbp-control"><label for="person-name-${i}">Person ${i + 1} name (optional)</label><input id="person-name-${i}" data-person-name type="text" placeholder="e.g. Maya" value="${escapeAttribute(participantState[i]?.name || "")}" /></div><div class="tbp-control"><label for="person-received-${i}">Amount received from this person</label><input id="person-received-${i}" data-person-received type="text" inputmode="decimal" placeholder="0" value="${escapeAttribute(participantState[i]?.received || "")}" aria-describedby="person-received-help-${i} person-received-error-${i}" /><p class="tbp-help" id="person-received-help-${i}">Leave at 0 if nothing has been received yet.</p><p class="tbp-fieldError" id="person-received-error-${i}"></p></div>`;
        participantRows.appendChild(row);
      }
      updateLiveShare();
    }

    function escapeAttribute(value) {
      return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function updateLiveShare() {
      const total = parseAmount(totalInput.value);
      const others = Number(otherPeopleInput.value);
      const shareCount = others + (includeSelf.checked ? 1 : 0);
      const currency = currencyInput.value.trim() || "currency";
      if (!(total > 0) || !Number.isInteger(others) || others < 1 || shareCount < 1) {
        shareSummary.textContent = "Equal fixed share: add a total to calculate";
        roundingNote.hidden = true;
        return;
      }
      const share = total / shareCount;
      shareSummary.textContent = `Equal fixed share: ${currency} ${money(share)} each`;
      roundingNote.hidden = Math.abs(Number(money(share)) * shareCount - total) < 0.000001;
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
        nameInput: row.querySelector("[data-person-name]"),
        receivedInput: row.querySelector("[data-person-received]"),
        name: row.querySelector("[data-person-name]").value.trim() || `Person ${index + 1}`,
        receivedRaw: row.querySelector("[data-person-received]").value.trim(),
      }));
    }

    function validate() {
      clearErrors();
      const totalRaw = totalInput.value.trim();
      const total = parseAmount(totalRaw);
      const otherRaw = otherPeopleInput.value.trim();
      const otherPeople = Number(otherRaw);
      const shareCount = otherPeople + (includeSelf.checked ? 1 : 0);
      const share = total / shareCount;
      const participants = participantValues();
      const errors = [];
      if (!totalRaw) { setError(totalInput, "booking-total-error", "Enter the fixed booking total."); errors.push(totalInput); }
      else if (!(total > 0)) { setError(totalInput, "booking-total-error", "Use an amount greater than 0."); errors.push(totalInput); }
      if (!currencyInput.value.trim()) { setError(currencyInput, "currency-error", "Enter a currency label such as USD, EUR, GBP, or THB."); errors.push(currencyInput); }
      if (!otherRaw) { setError(otherPeopleInput, "other-people-error", "Add at least one other person."); errors.push(otherPeopleInput); }
      else if (!Number.isInteger(otherPeople) || otherPeople < 1) { setError(otherPeopleInput, "other-people-error", "Use a whole number of 1 or more."); errors.push(otherPeopleInput); }
      if (!selected("refundability")) { setError($("refundability-group"), "refundability-error", "Choose whether the booking is refundable, partly refundable, or nonrefundable."); errors.push($("refundability-group")); }
      if (!selected("comfortableCarry")) { setError($("comfortable-group"), "comfortable-error", "Choose whether you are comfortable carrying the unpaid fixed amount."); errors.push($("comfortable-group")); }
      if (!selected("priorDelays")) { setError($("delays-group"), "delays-error", "Choose whether trip repayments in this group have been delayed or missed before."); errors.push($("delays-group")); }
      if (!paymentDeadline.value) { setError(paymentDeadline, "payment-deadline-error", "Add a fixed-share payment deadline."); errors.push(paymentDeadline); }
      else if (paymentDeadline.value < todayLocal()) { setError(paymentDeadline, "payment-deadline-error", "Choose today or a future payment deadline."); errors.push(paymentDeadline); }
      const cancellationRule = selected("cancellationRule");
      if (!cancellationRule) { setError($("cancellation-group"), "cancellation-error", "Choose what happens if someone cancels before you build the plan."); errors.push($("cancellation-group")); }
      if (cancellationRule === "custom" && !$("custom-rule").value.trim()) { setError($("custom-rule"), "custom-rule-error", "Write the custom group rule you agreed."); errors.push($("custom-rule")); }
      if (Number.isFinite(share) && share > 0) {
        participants.forEach((person, index) => {
          const received = person.receivedRaw === "" ? 0 : parseAmount(person.receivedRaw);
          if (!Number.isFinite(received) || received < 0) {
            setError(person.receivedInput, `person-received-error-${index}`, `Enter a valid amount for ${person.name}.`); errors.push(person.receivedInput);
          } else if (received > share + 0.0000001) {
            setError(person.receivedInput, `person-received-error-${index}`, `This amount is higher than ${person.name}’s calculated share. Check the payment or use the dedicated split/payback tool if the shares are unequal.`); errors.push(person.receivedInput);
          }
        });
      }
      if (errors.length) {
        errorSummary.hidden = false;
        errorSummary.focus();
        return null;
      }
      return {
        bookingStatus: $("booking-status").value,
        bookingType: $("booking-type").value,
        bookingName: $("booking-name").value.trim(),
        total,
        currency: currencyInput.value.trim().toUpperCase(),
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
        participants: participants.map((person) => ({ name: person.name, received: person.receivedRaw === "" ? 0 : parseAmount(person.receivedRaw) })),
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
      clearCopyFeedback(resultRegion);
      emptyState.hidden = true;
      resultRegion.hidden = false;
      $("recommendation-label").textContent = plan.result.label;
      $("recommendation-explanation").textContent = plan.result.explanation;
      const reasons = $("recommendation-reasons");
      reasons.replaceChildren(...reasonsFor(plan).map((text) => { const li = document.createElement("li"); li.textContent = text; return li; }));
      const summary = $("result-summary");
      const items = [
        ["Booking", bookingLabel(plan.bookingType, plan.bookingName)], ["Fixed total", `${plan.currency} ${money(plan.total)}`], ["People sharing", String(plan.shareCount)], ["Equal share", `${plan.currency} ${money(plan.share)}`],
        ["Payment deadline", plan.deadlineDisplay], ["Refundability", plan.refundability],
      ];
      if (plan.refundDeadlineDisplay) items.push(["Refund/free-cancellation deadline", plan.refundDeadlineDisplay]);
      summary.replaceChildren(...items.map(([term, value]) => { const div = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd"); dt.textContent = term; dd.textContent = value; div.append(dt, dd); return div; }));
      let paid = 0; let partial = 0; let open = 0;
      const statusList = $("status-list");
      statusList.replaceChildren(...plan.participants.map((person) => {
        const status = statusFor(person.received, plan.share);
        if (status === "paid") paid += 1; else if (status === "partial") partial += 1; else open += 1;
        const row = document.createElement("div"); row.className = "tbp-statusRow";
        const name = document.createElement("strong"); name.textContent = person.name;
        const chip = document.createElement("span"); chip.className = `tbp-statusChip tbp-statusChip--${status}`; chip.textContent = status === "paid" ? "Paid" : status === "partial" ? "Partly paid" : "Open";
        const line = document.createElement("span");
        if (status === "paid") line.textContent = `Received ${plan.currency} ${money(person.received)} · fixed share covered`;
        else if (status === "partial") line.textContent = `Received ${plan.currency} ${money(person.received)} · ${plan.currency} ${money(plan.share - person.received)} remaining`;
        else line.textContent = `${plan.currency} ${money(plan.share)} remaining`;
        row.append(name, chip, line); return row;
      }));
      $("status-summary").textContent = open === 0 && partial === 0 ? "All fixed shares are covered." : `${paid} paid · ${partial} partly paid · ${open} open`;
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

    function resetPlanner() {
      form.reset();
      otherPeopleInput.value = "3";
      currencyInput.value = "USD";
      participantState = [];
      renderParticipants();
      toggleConditionalFields();
      clearErrors();
      resultRegion.hidden = true;
      emptyState.hidden = false;
      clearCopyFeedback(resultRegion);
      $("booking-status").focus();
    }

    function copyText(button) {
      const target = $(button.dataset.copyTarget);
      const status = button.parentElement.querySelector(".tbp-copyStatus");
      const original = button.dataset.copyLabel || button.textContent;
      button.dataset.copyLabel = original;
      if (!target || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        status.textContent = "Couldn’t copy automatically. Select the text and copy it manually.";
        return;
      }
      navigator.clipboard.writeText(target.textContent.trim()).then(() => {
        button.textContent = "Copied"; status.textContent = "Copied";
        window.setTimeout(() => { button.textContent = original; }, 2200);
      }).catch(() => { status.textContent = "Couldn’t copy automatically. Select the text and copy it manually."; });
    }

    otherPeopleInput.addEventListener("input", renderParticipants);
    includeSelf.addEventListener("change", updateLiveShare);
    totalInput.addEventListener("input", updateLiveShare);
    currencyInput.addEventListener("input", updateLiveShare);
    form.addEventListener("change", (event) => { toggleConditionalFields(); if (event.target.name !== "otherPeople") clearErrors(); });
    form.addEventListener("input", (event) => { if (event.target !== otherPeopleInput) clearErrors(); });
    form.addEventListener("submit", (event) => { event.preventDefault(); const input = validate(); if (input) renderResult(calculate(input)); });
    $("planner-reset").addEventListener("click", resetPlanner);
    document.querySelectorAll(".tbp-copyButton").forEach((button) => button.addEventListener("click", () => copyText(button)));
    document.querySelectorAll("[data-planner-link]").forEach((link) => link.addEventListener("click", () => window.setTimeout(() => $("booking-status").focus(), 0)));
    renderParticipants();
    toggleConditionalFields();
  }

  return { POLICY_SENTENCES, parseAmount, money, statusFor, recommendation, cancellationSentence, buildArtifacts, calculate, formatDate, init };
});

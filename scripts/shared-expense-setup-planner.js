(function () {
  "use strict";

  const form = document.getElementById("shared-expense-setup-form");
  if (!form) return;

  const otherToggle = document.getElementById("ses-other-toggle");
  const otherWrap = document.getElementById("ses-other-expense-wrap");
  const otherInput = document.getElementById("ses-other-expense");
  const errorSummary = document.getElementById("ses-error-summary");
  const resetButton = document.getElementById("ses-reset");
  const result = document.getElementById("ses-result");
  const resultHeading = document.getElementById("ses-result-title");
  const copyButton = document.getElementById("ses-copy-button");
  const copyStatus = document.getElementById("ses-copy-status");
  const recommendation = document.getElementById("ses-recommendation");
  const copySummary = document.getElementById("ses-copy-summary");

  const resultFields = {
    shared: document.getElementById("ses-result-shared"),
    split: document.getElementById("ses-result-split"),
    record: document.getElementById("ses-result-record"),
    settlement: document.getElementById("ses-result-settlement"),
    unclear: document.getElementById("ses-result-unclear"),
  };

  const groups = [
    { name: "split-rule", fieldset: document.getElementById("ses-split-fieldset"), error: document.getElementById("ses-split-error") },
    { name: "record-model", fieldset: document.getElementById("ses-record-fieldset"), error: document.getElementById("ses-record-error") },
    { name: "settlement-rhythm", fieldset: document.getElementById("ses-settlement-fieldset"), error: document.getElementById("ses-settlement-error") },
    { name: "unclear-rule", fieldset: document.getElementById("ses-unclear-fieldset"), error: document.getElementById("ses-unclear-error") },
  ];

  const expenseFieldset = document.getElementById("ses-expenses-fieldset");
  const expenseError = document.getElementById("ses-expenses-error");
  let lastSummary = "";
  let copyTimer = null;

  const splitDescriptions = {
    equal: "We split agreed shared expenses equally.",
    income: "We use an agreed income-based share for our shared expenses.",
    category: "We use agreed rules for different shared-expense categories.",
    custom: "We agree on the split for each shared expense.",
    "not-agreed": "We have not agreed on the split yet. We will choose the contribution rule before treating new expenses as an open balance.",
  };

  const recordDescriptions = {
    "one-person": "One person keeps the working record and current balance.",
    "maintainer-view": "One person keeps the record; the other person only needs a current view of the shared balance and history.",
    "two-editors": "Exactly two people both need to update the same ongoing shared-money record.",
    group: "Several people need to add or edit shared expenses, so a collaborative group ledger is the better operating model.",
  };

  const settlementDescriptions = {
    each: "We settle after each shared expense.",
    weekly: "We review and settle the shared balance weekly.",
    monthly: "We review and settle the shared balance monthly or after the billing cycle.",
    threshold: "We settle when the open balance reaches a threshold we both care about.",
    undecided: "We have not chosen a settlement rhythm yet. We will start with a regular review and adjust it if needed.",
  };

  const unclearDescriptions = {
    discuss: "We discuss a new or unclear expense before adding it to the shared balance.",
    categories: "We use our agreed categories when the rule is clear; if an expense does not clearly fit, we discuss it before adding it as shared.",
    undecided: "We have not chosen an exception rule yet. Until we do, we discuss unclear expenses before they change the shared balance.",
  };

  function toggleOtherField() {
    const enabled = otherToggle.checked;
    otherWrap.hidden = !enabled;
    if (!enabled) otherInput.value = "";
  }

  function clearValidation() {
    errorSummary.hidden = true;
    errorSummary.textContent = "";
    expenseFieldset.removeAttribute("aria-invalid");
    expenseError.textContent = "";
    groups.forEach((group) => {
      group.fieldset.removeAttribute("aria-invalid");
      group.error.textContent = "";
    });
  }

  function selectedValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
  }

  function selectedCategories() {
    return Array.from(form.querySelectorAll('input[name="shared-expense"]:checked')).map((input) => {
      if (input.value !== "Other") return input.value;
      return otherInput.value.trim();
    });
  }

  function naturalList(values) {
    if (values.length === 1) return values[0];
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
  }

  function recommendationMarkup(split, record) {
    if (split === "not-agreed") {
      return '<h4 id="ses-recommendation-title">Choose the split rule first</h4><p>The record should reflect an agreement you both understand. Compare the main contribution methods before you start carrying an open balance.</p><a href="/tools/couple-expense-split-method-calculator/">Choose a split method</a>';
    }
    if (record === "group") {
      return '<h4 id="ses-recommendation-title">You probably need a collaborative group ledger</h4><p>When several people need to add and edit expenses in one shared workspace, a collaborative group-expense app is usually a better fit than a two-person running balance.</p><a href="/compare/shared-expense-app-vs-running-balance-app/">Compare shared ledger vs running balance</a>';
    }
    if (record === "maintainer-view") {
      return '<h4 id="ses-recommendation-title">One person can keep the record</h4><p>The other person does not necessarily need editing access. See the one-person tracking model before choosing a long-term tool.</p><a href="/blog/can-one-person-track-shared-money-without-everyone-installing-an-app/">See one-person sharing options</a>';
    }
    if (record === "two-editors") {
      return '<h4 id="ses-recommendation-title">You need a two-person shared record</h4><p>Your key decision is whether the two of you want a private relationship balance or a broader collaborative shared-expense workspace.</p><a href="/compare/shared-expense-app-vs-running-balance-app/">Compare the record models</a>';
    }
    return '<h4 id="ses-recommendation-title">Keep one clear working balance</h4><p>One person can maintain the shared-money history without exposing unrelated personal spending.</p><a href="/blog/what-is-a-running-balance-between-two-people/">See how a running balance works</a>';
  }

  function validate() {
    clearValidation();
    const categories = selectedCategories();
    const incompleteGroups = groups.filter((group) => !selectedValue(group.name));
    const missingExpenses = categories.length === 0;
    const missingOtherName = otherToggle.checked && !otherInput.value.trim();

    if (!missingExpenses && !missingOtherName && incompleteGroups.length === 0) {
      return { valid: true, categories };
    }

    if (missingExpenses || missingOtherName) {
      expenseFieldset.setAttribute("aria-invalid", "true");
      expenseError.textContent = missingOtherName
        ? "Name the other shared expense, or uncheck Other."
        : "Choose at least one type of shared expense to build your setup.";
    }

    incompleteGroups.forEach((group) => {
      group.fieldset.setAttribute("aria-invalid", "true");
      group.error.textContent = "Choose an option for this question.";
    });

    if (missingOtherName) {
      errorSummary.textContent = "Name the other shared expense, or uncheck Other.";
    } else if (missingExpenses && incompleteGroups.length > 0) {
      errorSummary.textContent = "Choose at least one shared expense and complete the remaining setup choices before building your plan.";
    } else if (missingExpenses) {
      errorSummary.textContent = "Choose at least one type of shared expense to build your setup.";
    } else {
      errorSummary.textContent = "Complete the remaining setup choices before building your plan.";
    }

    errorSummary.hidden = false;
    if (missingOtherName) {
      otherInput.focus();
    } else {
      const firstInvalid = missingExpenses ? expenseFieldset : incompleteGroups[0].fieldset;
      firstInvalid.tabIndex = -1;
      firstInvalid.focus();
    }
    return { valid: false };
  }

  function buildResult(categories) {
    const split = selectedValue("split-rule");
    const record = selectedValue("record-model");
    const settlement = selectedValue("settlement-rhythm");
    const unclear = selectedValue("unclear-rule");
    const categoryText = naturalList(categories);
    const splitText = splitDescriptions[split];
    const recordText = recordDescriptions[record];
    const settlementText = settlementDescriptions[settlement];
    const unclearText = unclearDescriptions[unclear];

    resultFields.shared.textContent = categoryText;
    resultFields.split.textContent = splitText;
    resultFields.record.textContent = recordText;
    resultFields.settlement.textContent = settlementText;
    resultFields.unclear.textContent = unclearText;

    lastSummary = [
      "Our shared-expense setup",
      "",
      `We count ${categoryText} as shared expenses.`,
      "",
      splitText,
      "",
      recordText,
      "",
      settlementText,
      "",
      unclearText,
      "",
      "Personal purchases stay outside this shared record unless we both agree to change the rule.",
    ].join("\n");
    copySummary.textContent = lastSummary;
    copyStatus.textContent = "";
    copyButton.textContent = "Copy this setup";
    recommendation.innerHTML = recommendationMarkup(split, record);
    result.hidden = false;
    resultHeading.focus();
  }

  function resetPlanner() {
    form.reset();
    otherWrap.hidden = true;
    otherInput.value = "";
    clearValidation();
    result.hidden = true;
    recommendation.innerHTML = "";
    copyStatus.textContent = "";
    copyButton.textContent = "Copy this setup";
    lastSummary = "";
    if (copyTimer) window.clearTimeout(copyTimer);
    expenseFieldset.tabIndex = -1;
    expenseFieldset.focus();
  }

  function copySetup() {
    if (!lastSummary || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      copyStatus.textContent = "Copy failed. Select the setup text and copy it manually.";
      return;
    }

    navigator.clipboard.writeText(lastSummary).then(() => {
      copyButton.textContent = "Copied";
      copyStatus.textContent = "Your shared-expense setup was copied.";
      if (copyTimer) window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        copyButton.textContent = "Copy this setup";
      }, 2400);
    }).catch(() => {
      copyStatus.textContent = "Copy failed. Select the setup text and copy it manually.";
    });
  }

  otherToggle.addEventListener("change", toggleOtherField);
  form.addEventListener("input", clearValidation);
  form.addEventListener("change", clearValidation);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const validation = validate();
    if (validation.valid) buildResult(validation.categories);
  });
  resetButton.addEventListener("click", resetPlanner);
  copyButton.addEventListener("click", copySetup);
}());

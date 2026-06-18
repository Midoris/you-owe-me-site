(function () {
  "use strict";

  const MAX_EXPENSES = 40;
  const MAX_TRANSFERS = 20;
  const EPSILON_CENTS = 1;

  const CATEGORIES = [
    { id: "rent", label: "Rent / mortgage" },
    { id: "utilities", label: "Utilities" },
    { id: "groceries", label: "Groceries" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "travel", label: "Travel" },
    { id: "household", label: "Household" },
    { id: "pets", label: "Pets" },
    { id: "other", label: "Other" }
  ];

  const state = {
    currency: "$",
    partner1: "You",
    partner2: "Alex",
    startingDirection: "none",
    startingAmount: "",
    method: "equal",
    customP1: "60",
    customP2: "40",
    incomeP1: "",
    incomeP2: "",
    summaryTone: "neutral",
    categoryRules: {},
    expenses: [],
    transfers: []
  };

  const els = {};

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createExpense(values) {
    const data = values || {};
    return {
      id: makeId("cb-expense"),
      date: data.date || "",
      description: data.description || "",
      category: data.category || "groceries",
      amount: data.amount || "",
      paidBy: data.paidBy || "p1",
      included: data.included || "both",
      overrideMode: data.overrideMode || "default",
      overrideP1: data.overrideP1 || "50",
      overrideP2: data.overrideP2 || "50"
    };
  }

  function createTransfer(values) {
    const data = values || {};
    return {
      id: makeId("cb-transfer"),
      date: data.date || "",
      amount: data.amount || "",
      from: data.from || "p2",
      to: data.to || "p1",
      note: data.note || ""
    };
  }

  function makeCategoryRule(values) {
    const data = values || {};
    return {
      mode: data.mode || "equal",
      p1: data.p1 || "50",
      p2: data.p2 || "50"
    };
  }

  function ensureCategoryRules() {
    CATEGORIES.forEach((category) => {
      if (!state.categoryRules[category.id]) state.categoryRules[category.id] = makeCategoryRule();
    });
  }

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 6);
    return trimmed || "$";
  }

  function cleanName(value, fallback) {
    const trimmed = String(value || "").trim();
    return trimmed || fallback;
  }

  function getName(key) {
    return key === "p1" ? cleanName(state.partner1, "You") : cleanName(state.partner2, "Alex");
  }

  function subjectName(key) {
    return getName(key);
  }

  function sentenceSubjectName(key) {
    const name = getName(key);
    return name.toLowerCase() === "you" ? "you" : name;
  }

  function objectName(key) {
    const name = getName(key);
    return name.toLowerCase() === "you" ? "you" : name;
  }

  function possessiveName(key) {
    const name = getName(key);
    if (name.toLowerCase() === "you") return "Your";
    return name.endsWith("s") ? `${name}'` : `${name}'s`;
  }

  function shareReference(key) {
    return getName(key).toLowerCase() === "you" ? "your share" : "their share";
  }

  function parseAmountToCents(value) {
    const normalized = String(value || "").trim().replace(/,/g, "");
    if (!normalized) return null;
    if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
    const parts = normalized.split(".");
    const units = Number(parts[0] || "0");
    const cents = Number(((parts[1] || "") + "00").slice(0, 2));
    const total = units * 100 + cents;
    return total > 0 ? total : null;
  }

  function parsePercent(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return null;
    const number = Number(normalized);
    if (!Number.isFinite(number) || number < 0 || number > 100) return null;
    return number;
  }

  function validPercentPair(p1, p2) {
    return p1 !== null && p2 !== null && Math.abs(p1 + p2 - 100) <= 0.01;
  }

  function formatMoney(cents) {
    const symbol = sanitizeCurrency(state.currency);
    const space = symbol.length > 1 ? " " : "";
    return `${symbol}${space}${(Math.abs(cents) / 100).toFixed(2)}`;
  }

  function formatPercent(value) {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCategoryLabel(id) {
    const category = CATEGORIES.find((item) => item.id === id);
    return category ? category.label : "Other";
  }

  function getStartingBalanceCents() {
    if (state.startingDirection === "none") return 0;
    const amount = parseAmountToCents(state.startingAmount);
    if (!amount) return 0;
    return state.startingDirection === "p1-covered" ? amount : -amount;
  }

  function getPercentSplit(p1Value, p2Value, label) {
    const p1 = parsePercent(p1Value);
    const p2 = parsePercent(p2Value);
    if (!validPercentPair(p1, p2)) {
      return {
        valid: false,
        message: "The two percentages should add up to 100%."
      };
    }
    return {
      valid: true,
      p1,
      p2,
      label: label || `${formatPercent(p1)} / ${formatPercent(p2)}`
    };
  }

  function getIncomeSplit() {
    const income1 = parseAmountToCents(state.incomeP1);
    const income2 = parseAmountToCents(state.incomeP2);
    if (!income1 || !income2) {
      return {
        valid: false,
        message: "Enter both income amounts to calculate an income-proportional split."
      };
    }

    const total = income1 + income2;
    const p1 = income1 / total * 100;
    const p2 = 100 - p1;
    return {
      valid: true,
      p1,
      p2,
      label: `${formatPercent(p1)} / ${formatPercent(p2)} income-proportional`
    };
  }

  function getDefaultSplitForExpense(expense) {
    if (expense.included === "p1") {
      return { valid: true, p1: 100, p2: 0, label: `${getName("p1")} covers all` };
    }
    if (expense.included === "p2") {
      return { valid: true, p1: 0, p2: 100, label: `${getName("p2")} covers all` };
    }

    if (expense.overrideMode === "equal") {
      return { valid: true, p1: 50, p2: 50, label: "50/50 override" };
    }
    if (expense.overrideMode === "custom") {
      return getPercentSplit(expense.overrideP1, expense.overrideP2, "custom override");
    }
    if (expense.overrideMode === "p1") {
      return { valid: true, p1: 100, p2: 0, label: `${getName("p1")} covers all` };
    }
    if (expense.overrideMode === "p2") {
      return { valid: true, p1: 0, p2: 100, label: `${getName("p2")} covers all` };
    }

    if (state.method === "custom") {
      return getPercentSplit(state.customP1, state.customP2, `${formatPercent(parsePercent(state.customP1) || 0)} / ${formatPercent(parsePercent(state.customP2) || 0)} custom`);
    }
    if (state.method === "income") {
      return getIncomeSplit();
    }
    if (state.method === "category") {
      const rule = state.categoryRules[expense.category] || makeCategoryRule();
      if (rule.mode === "custom") {
        const split = getPercentSplit(rule.p1, rule.p2);
        if (!split.valid) return split;
        return {
          valid: true,
          p1: split.p1,
          p2: split.p2,
          label: `${formatPercent(split.p1)} / ${formatPercent(split.p2)} ${getCategoryLabel(expense.category)}`
        };
      }
      return { valid: true, p1: 50, p2: 50, label: `50/50 ${getCategoryLabel(expense.category)}` };
    }
    return { valid: true, p1: 50, p2: 50, label: "50/50" };
  }

  function calculateExpenseShare(amountCents, split) {
    const p1Share = Math.round(amountCents * split.p1 / 100);
    return {
      p1Share,
      p2Share: amountCents - p1Share
    };
  }

  function transferEffectForP1(transfer) {
    const amount = parseAmountToCents(transfer.amount);
    if (!amount || transfer.from === transfer.to) return 0;
    if (transfer.from === "p2" && transfer.to === "p1") return -amount;
    if (transfer.from === "p1" && transfer.to === "p2") return amount;
    return 0;
  }

  function getExpenseValidation(expense) {
    const hasInput = Boolean(
      String(expense.amount || "").trim() ||
      String(expense.description || "").trim() ||
      String(expense.date || "").trim()
    );
    const amount = parseAmountToCents(expense.amount);
    if (!amount) return hasInput ? "Enter an amount greater than 0." : "";
    if (expense.paidBy !== "p1" && expense.paidBy !== "p2") return "Choose who paid this expense.";
    if (state.method !== "paid-only" && expense.overrideMode === "custom") {
      const override = getPercentSplit(expense.overrideP1, expense.overrideP2);
      if (!override.valid) return override.message;
    }
    if (state.method !== "paid-only") {
      const split = getDefaultSplitForExpense(expense);
      if (!split.valid) return split.message;
    }
    return "";
  }

  function getTransferValidation(transfer) {
    const hasInput = Boolean(
      String(transfer.amount || "").trim() ||
      String(transfer.date || "").trim() ||
      String(transfer.note || "").trim()
    );
    const amount = parseAmountToCents(transfer.amount);
    if (!amount) return hasInput ? "Enter an amount greater than 0." : "";
    if (transfer.from === transfer.to) return "A transfer needs two different partners.";
    return "";
  }

  function calculate() {
    const paid = { p1: 0, p2: 0 };
    const fair = { p1: 0, p2: 0 };
    const categorySummary = {};
    CATEGORIES.forEach((category) => {
      categorySummary[category.id] = {
        label: category.label,
        total: 0,
        paidP1: 0,
        paidP2: 0,
        splitLabels: new Set()
      };
    });

    let totalExpenses = 0;
    let validExpenses = 0;

    state.expenses.forEach((expense) => {
      const amount = parseAmountToCents(expense.amount);
      if (!amount || getExpenseValidation(expense)) return;
      const categoryId = categorySummary[expense.category] ? expense.category : "other";

      totalExpenses += amount;
      validExpenses += 1;
      paid[expense.paidBy] += amount;
      categorySummary[categoryId].total += amount;
      if (expense.paidBy === "p1") categorySummary[categoryId].paidP1 += amount;
      if (expense.paidBy === "p2") categorySummary[categoryId].paidP2 += amount;

      if (state.method === "paid-only") return;

      const split = getDefaultSplitForExpense(expense);
      if (!split.valid) return;
      const shares = calculateExpenseShare(amount, split);
      fair.p1 += shares.p1Share;
      fair.p2 += shares.p2Share;
      categorySummary[categoryId].splitLabels.add(split.label);
    });

    let transferTotal = 0;
    let validTransfers = 0;
    let transferEffect = 0;
    state.transfers.forEach((transfer) => {
      const amount = parseAmountToCents(transfer.amount);
      if (!amount || getTransferValidation(transfer)) return;
      transferTotal += amount;
      validTransfers += 1;
      transferEffect += transferEffectForP1(transfer);
    });

    const startingBalance = getStartingBalanceCents();
    const expenseNetP1 = paid.p1 - fair.p1;
    const balanceP1 = state.method === "paid-only" ? paid.p1 - paid.p2 : expenseNetP1 + startingBalance + transferEffect;
    const activeSplit = getActiveSplitLabel();

    return {
      totalExpenses,
      validExpenses,
      paidP1: paid.p1,
      paidP2: paid.p2,
      fairP1: fair.p1,
      fairP2: fair.p2,
      startingBalance,
      transferTotal,
      validTransfers,
      transferEffect,
      balanceP1,
      activeSplit,
      categorySummary
    };
  }

  function getActiveSplitLabel() {
    if (state.method === "custom") return "custom percentage";
    if (state.method === "income") return "income-proportional";
    if (state.method === "category") return "category-based";
    if (state.method === "paid-only") return "paid totals";
    return "50/50";
  }

  function getSuggestedSplitText() {
    if (state.method === "income") {
      const split = getIncomeSplit();
      if (!split.valid) return "";
      return `${getName("p1")} ${formatPercent(split.p1)}% / ${getName("p2")} ${formatPercent(split.p2)}%`;
    }
    if (state.method === "custom") {
      const split = getPercentSplit(state.customP1, state.customP2);
      if (!split.valid) return "";
      return `${getName("p1")} ${formatPercent(split.p1)}% / ${getName("p2")} ${formatPercent(split.p2)}%`;
    }
    return "";
  }

  function renderMethodPanels() {
    document.querySelectorAll("[data-method-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-method-panel") !== state.method;
    });

    const customSplit = getPercentSplit(state.customP1, state.customP2);
    els.customValidation.textContent = state.method === "custom" && !customSplit.valid ? customSplit.message : "";

    const incomeSplit = getIncomeSplit();
    els.incomeValidation.textContent = state.method === "income" && !incomeSplit.valid ? incomeSplit.message : "";
    els.incomeSuggestion.textContent = state.method === "income" && incomeSplit.valid
      ? `Based on these incomes, the calculator suggests a ${formatPercent(incomeSplit.p1)} / ${formatPercent(incomeSplit.p2)} split.`
      : "";
  }

  function renderStartingLabels() {
    const p1Label = document.querySelector('[data-starting-label="p1-covered"]');
    const p2Label = document.querySelector('[data-starting-label="p2-covered"]');
    if (p1Label) p1Label.textContent = `${getName("p1")} has already covered more`;
    if (p2Label) p2Label.textContent = `${getName("p2")} has already covered more`;
  }

  function renderStartingAmount() {
    els.startingAmountWrap.hidden = state.startingDirection === "none";
    if (state.startingDirection === "none") {
      els.startingValidation.textContent = "";
      return;
    }
    els.startingValidation.textContent = parseAmountToCents(state.startingAmount)
      ? ""
      : "Enter a starting balance amount greater than 0.";
  }

  function renderCategoryRules() {
    ensureCategoryRules();
    els.categoryRules.innerHTML = CATEGORIES.map((category) => {
      const rule = state.categoryRules[category.id];
      const customHidden = rule.mode === "custom" ? "" : " hidden";
      const split = getPercentSplit(rule.p1, rule.p2);
      const warning = rule.mode === "custom" && !split.valid ? split.message : "";
      return `
        <div class="cb-categoryRule" data-category-id="${escapeHtml(category.id)}">
          <div class="cb-categoryName">${escapeHtml(category.label)}</div>
          <div class="cb-rowField">
            <label for="cb-category-mode-${escapeHtml(category.id)}">Split rule</label>
            <select id="cb-category-mode-${escapeHtml(category.id)}" class="cb-select" data-category-field="mode">
              <option value="equal"${rule.mode === "equal" ? " selected" : ""}>50/50</option>
              <option value="custom"${rule.mode === "custom" ? " selected" : ""}>Custom percentage</option>
            </select>
          </div>
          <div class="cb-rowField"${customHidden}>
            <label for="cb-category-p1-${escapeHtml(category.id)}">${escapeHtml(getName("p1"))} %</label>
            <input id="cb-category-p1-${escapeHtml(category.id)}" class="cb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-category-field="p1" value="${escapeHtml(rule.p1)}" />
          </div>
          <div class="cb-rowField"${customHidden}>
            <label for="cb-category-p2-${escapeHtml(category.id)}">${escapeHtml(getName("p2"))} %</label>
            <input id="cb-category-p2-${escapeHtml(category.id)}" class="cb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-category-field="p2" value="${escapeHtml(rule.p2)}" />
            <p class="cb-validation" aria-live="polite">${escapeHtml(warning)}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderExpenses() {
    if (state.expenses.length === 0) {
      els.expenseList.innerHTML = '<p class="cb-emptyState">Add at least one shared expense to see the balance.</p>';
      return;
    }
    els.expenseList.innerHTML = state.expenses.map((expense, index) => expenseTemplate(expense, index)).join("");
  }

  function expenseTemplate(expense, index) {
    const id = escapeHtml(expense.id);
    const overrideOpen = expense.overrideMode !== "default" ? " open" : "";
    const overrideCustomHidden = expense.overrideMode === "custom" ? "" : " hidden";
    const validation = getExpenseValidation(expense);
    const categoryOptions = CATEGORIES.map((category) => (
      `<option value="${escapeHtml(category.id)}"${expense.category === category.id ? " selected" : ""}>${escapeHtml(category.label)}</option>`
    )).join("");

    return `
      <article class="cb-rowCard" data-expense-id="${id}">
        <div class="cb-rowTop">
          <div class="cb-rowTitle">
            <h4>Expense ${index + 1}</h4>
            <span class="cb-typePill">${escapeHtml(getCategoryLabel(expense.category))}</span>
          </div>
          <button type="button" class="cb-removeButton" data-action="remove-expense">Remove</button>
        </div>
        <div class="cb-expenseFields">
          <div class="cb-rowField">
            <label for="cb-expense-date-${id}">Date <span class="sr-only">(optional)</span></label>
            <input id="cb-expense-date-${id}" class="cb-input" type="date" data-field="date" value="${escapeHtml(expense.date)}" />
          </div>
          <div class="cb-rowField">
            <label for="cb-expense-description-${id}">Description</label>
            <input id="cb-expense-description-${id}" class="cb-input" type="text" maxlength="80" data-field="description" value="${escapeHtml(expense.description)}" placeholder="Groceries, rent, utilities, dinner..." />
          </div>
          <div class="cb-rowField">
            <label for="cb-expense-amount-${id}">Amount</label>
            <input id="cb-expense-amount-${id}" class="cb-input" type="number" min="0" step="0.01" inputmode="decimal" data-field="amount" value="${escapeHtml(expense.amount)}" aria-describedby="cb-expense-validation-${id}" />
          </div>
          <div class="cb-rowField">
            <label for="cb-expense-paid-${id}">Paid by</label>
            <select id="cb-expense-paid-${id}" class="cb-select" data-field="paidBy">
              <option value="p1"${expense.paidBy === "p1" ? " selected" : ""}>${escapeHtml(getName("p1"))}</option>
              <option value="p2"${expense.paidBy === "p2" ? " selected" : ""}>${escapeHtml(getName("p2"))}</option>
            </select>
          </div>
          <div class="cb-rowField">
            <label for="cb-expense-category-${id}">Category</label>
            <select id="cb-expense-category-${id}" class="cb-select" data-field="category">${categoryOptions}</select>
          </div>
        </div>
        <div class="cb-expenseMetaFields">
          <div class="cb-rowField">
            <label for="cb-expense-included-${id}">Included</label>
            <select id="cb-expense-included-${id}" class="cb-select" data-field="included">
              <option value="both"${expense.included === "both" ? " selected" : ""}>Both partners</option>
              <option value="p1"${expense.included === "p1" ? " selected" : ""}>Only ${escapeHtml(getName("p1"))}</option>
              <option value="p2"${expense.included === "p2" ? " selected" : ""}>Only ${escapeHtml(getName("p2"))}</option>
            </select>
          </div>
        </div>
        <details class="cb-rowDetails"${overrideOpen}>
          <summary>Use a different split for this expense</summary>
          <div class="cb-overrideFields">
            <div class="cb-rowField">
              <label for="cb-expense-override-${id}">Split override</label>
              <select id="cb-expense-override-${id}" class="cb-select" data-field="overrideMode">
                <option value="default"${expense.overrideMode === "default" ? " selected" : ""}>Use selected split method</option>
                <option value="equal"${expense.overrideMode === "equal" ? " selected" : ""}>50/50</option>
                <option value="custom"${expense.overrideMode === "custom" ? " selected" : ""}>Custom percentage</option>
                <option value="p1"${expense.overrideMode === "p1" ? " selected" : ""}>${escapeHtml(getName("p1"))} covers all</option>
                <option value="p2"${expense.overrideMode === "p2" ? " selected" : ""}>${escapeHtml(getName("p2"))} covers all</option>
              </select>
            </div>
            <div class="cb-rowField"${overrideCustomHidden}>
              <label for="cb-expense-override-p1-${id}">${escapeHtml(getName("p1"))} %</label>
              <input id="cb-expense-override-p1-${id}" class="cb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-field="overrideP1" value="${escapeHtml(expense.overrideP1)}" />
            </div>
            <div class="cb-rowField"${overrideCustomHidden}>
              <label for="cb-expense-override-p2-${id}">${escapeHtml(getName("p2"))} %</label>
              <input id="cb-expense-override-p2-${id}" class="cb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-field="overrideP2" value="${escapeHtml(expense.overrideP2)}" />
            </div>
          </div>
        </details>
        <p class="cb-rowValidation" id="cb-expense-validation-${id}" aria-live="polite">${escapeHtml(validation)}</p>
      </article>
    `;
  }

  function renderTransfers() {
    if (state.transfers.length === 0) {
      els.transferList.innerHTML = '<p class="cb-emptyState">Transfers are optional. Add one if a partner already sent money to even things out.</p>';
      return;
    }
    els.transferList.innerHTML = state.transfers.map((transfer, index) => transferTemplate(transfer, index)).join("");
  }

  function transferTemplate(transfer, index) {
    const id = escapeHtml(transfer.id);
    const validation = getTransferValidation(transfer);
    return `
      <article class="cb-rowCard" data-transfer-id="${id}">
        <div class="cb-rowTop">
          <div class="cb-rowTitle">
            <h4>Transfer ${index + 1}</h4>
            <span class="cb-typePill">Optional</span>
          </div>
          <button type="button" class="cb-removeButton" data-action="remove-transfer">Remove</button>
        </div>
        <div class="cb-transferFields">
          <div class="cb-rowField">
            <label for="cb-transfer-date-${id}">Date <span class="sr-only">(optional)</span></label>
            <input id="cb-transfer-date-${id}" class="cb-input" type="date" data-transfer-field="date" value="${escapeHtml(transfer.date)}" />
          </div>
          <div class="cb-rowField">
            <label for="cb-transfer-amount-${id}">Amount</label>
            <input id="cb-transfer-amount-${id}" class="cb-input" type="number" min="0" step="0.01" inputmode="decimal" data-transfer-field="amount" value="${escapeHtml(transfer.amount)}" aria-describedby="cb-transfer-validation-${id}" />
          </div>
          <div class="cb-rowField">
            <label for="cb-transfer-from-${id}">Sent by</label>
            <select id="cb-transfer-from-${id}" class="cb-select" data-transfer-field="from">
              <option value="p1"${transfer.from === "p1" ? " selected" : ""}>${escapeHtml(getName("p1"))}</option>
              <option value="p2"${transfer.from === "p2" ? " selected" : ""}>${escapeHtml(getName("p2"))}</option>
            </select>
          </div>
          <div class="cb-rowField">
            <label for="cb-transfer-to-${id}">Sent to</label>
            <select id="cb-transfer-to-${id}" class="cb-select" data-transfer-field="to">
              <option value="p1"${transfer.to === "p1" ? " selected" : ""}>${escapeHtml(getName("p1"))}</option>
              <option value="p2"${transfer.to === "p2" ? " selected" : ""}>${escapeHtml(getName("p2"))}</option>
            </select>
          </div>
          <div class="cb-rowField">
            <label for="cb-transfer-note-${id}">Note <span class="sr-only">(optional)</span></label>
            <input id="cb-transfer-note-${id}" class="cb-input" type="text" maxlength="80" data-transfer-field="note" value="${escapeHtml(transfer.note)}" placeholder="After groceries and utilities" />
          </div>
        </div>
        <p class="cb-rowValidation" id="cb-transfer-validation-${id}" aria-live="polite">${escapeHtml(validation)}</p>
      </article>
    `;
  }

  function renderResults() {
    const result = calculate();
    renderResultCard(result);
    renderBreakdown(result);
    renderCopyPreview(result);
  }

  function renderRowValidations() {
    state.expenses.forEach((expense) => {
      const row = els.expenseList.querySelector(`[data-expense-id="${expense.id}"]`);
      const validation = row ? row.querySelector(".cb-rowValidation") : null;
      if (validation) validation.textContent = getExpenseValidation(expense);
    });

    state.transfers.forEach((transfer) => {
      const row = els.transferList.querySelector(`[data-transfer-id="${transfer.id}"]`);
      const validation = row ? row.querySelector(".cb-rowValidation") : null;
      if (validation) validation.textContent = getTransferValidation(transfer);
    });
  }

  function renderResultCard(result) {
    const title = els.resultTitle;
    const subtext = els.resultSubtext;
    const amount = Math.abs(result.balanceP1);

    if (result.validExpenses === 0) {
      title.textContent = "Add a shared expense to see the balance";
      subtext.textContent = "Add at least one shared expense, then choose the split that both partners agree feels fair.";
      return;
    }

    if (state.method === "paid-only") {
      if (Math.abs(result.balanceP1) < EPSILON_CENTS) {
        title.textContent = "Both partners paid the same amount in the expenses entered";
      } else {
        const paidMore = result.balanceP1 > 0 ? "p1" : "p2";
        title.textContent = `${subjectName(paidMore)} paid ${formatMoney(amount)} more in the expenses entered`;
      }
      subtext.textContent = "This does not decide what is fair. It only shows who covered more before any split agreement.";
      return;
    }

    if (Math.abs(result.balanceP1) < EPSILON_CENTS) {
      title.textContent = "Your shared expenses are balanced";
      subtext.textContent = "Based on the split method you selected, neither partner needs to settle up right now.";
      return;
    }

    const coveredPartner = result.balanceP1 > 0 ? "p1" : "p2";
    const sender = result.balanceP1 > 0 ? "p2" : "p1";
    title.textContent = `${subjectName(coveredPartner)} covered ${formatMoney(amount)} more than ${shareReference(coveredPartner)}`;
    subtext.textContent = `Based on the split method you selected, ${sentenceSubjectName(sender)} could send ${objectName(coveredPartner)} ${formatMoney(amount)} to even things out, or you can carry it forward as part of your shared balance.`;
  }

  function renderBreakdown(result) {
    const rows = [
      ["Total shared expenses", formatMoney(result.totalExpenses)],
      [`Paid by ${getName("p1")}`, formatMoney(result.paidP1)],
      [`Paid by ${getName("p2")}`, formatMoney(result.paidP2)],
      ["Repayments/transfers included", result.validTransfers ? formatMoney(result.transferTotal) : formatMoney(0)],
      ["Current shared balance", Math.abs(result.balanceP1) < EPSILON_CENTS ? "Balanced" : formatMoney(result.balanceP1)],
      ["Suggested settle-up", getSettleUpText(result)]
    ];

    if (state.method !== "paid-only") {
      rows.splice(3, 0, [`${getName("p1")} fair share`, formatMoney(result.fairP1)]);
      rows.splice(4, 0, [`${getName("p2")} fair share`, formatMoney(result.fairP2)]);
    }

    const suggestedSplit = getSuggestedSplitText();
    if (suggestedSplit) rows.push(["Suggested split", suggestedSplit]);

    els.breakdown.innerHTML = rows.map(([label, value]) => summaryCard(label, value)).join("");

    if (state.method === "category") {
      els.breakdown.insertAdjacentHTML("beforeend", categorySummaryTemplate(result));
    }
  }

  function summaryCard(label, value, small) {
    return `
      <article class="cb-summaryCard">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        ${small ? `<small>${escapeHtml(small)}</small>` : ""}
      </article>
    `;
  }

  function getSettleUpText(result) {
    if (result.validExpenses === 0) return "Add expenses first";
    if (state.method === "paid-only") return "No fair-share rule selected";
    if (Math.abs(result.balanceP1) < EPSILON_CENTS) return "No settle-up needed";
    const sender = result.balanceP1 > 0 ? "p2" : "p1";
    const receiver = result.balanceP1 > 0 ? "p1" : "p2";
    return `${subjectName(sender)} would send ${objectName(receiver)} ${formatMoney(result.balanceP1)}`;
  }

  function categorySummaryTemplate(result) {
    const rows = Object.values(result.categorySummary)
      .filter((category) => category.total > 0)
      .map((category) => {
        const splitUsed = category.splitLabels.size ? Array.from(category.splitLabels).join(", ") : "No fair-share rule";
        return `
          <div class="cb-categorySummaryRow">
            <span>${escapeHtml(category.label)}</span>
            <span>${escapeHtml(formatMoney(category.total))}</span>
            <span>${escapeHtml(splitUsed)}</span>
            <span>${escapeHtml(formatMoney(category.paidP1))}</span>
            <span>${escapeHtml(formatMoney(category.paidP2))}</span>
          </div>
        `;
      }).join("");

    if (!rows) return "";
    return `
      <article class="cb-summaryCard cb-summaryCard--wide">
        <span>Category summary</span>
        <div class="cb-categorySummaryTable" role="table" aria-label="Category summary">
          <div class="cb-categorySummaryHeader" role="row">
            <span role="columnheader">Category</span>
            <span role="columnheader">Total</span>
            <span role="columnheader">Split used</span>
            <span role="columnheader">${escapeHtml(getName("p1"))} paid</span>
            <span role="columnheader">${escapeHtml(getName("p2"))} paid</span>
          </div>
          ${rows}
        </div>
      </article>
    `;
  }

  function buildSummaryText(result) {
    if (result.validExpenses === 0) return "";

    const splitMethod = getActiveSplitLabel();
    const amount = Math.abs(result.balanceP1);
    let opening = "";

    if (state.method === "paid-only") {
      if (amount < EPSILON_CENTS) {
        opening = "I added up what we each paid. We paid the same amount in the expenses entered. This does not decide what is fair - it just shows the current paid totals.";
      } else {
        const paidMore = result.balanceP1 > 0 ? "p1" : "p2";
        opening = `I added up what we each paid. ${subjectName(paidMore)} paid ${formatMoney(amount)} more in the expenses entered. This does not decide what is fair - it just shows the current paid totals.`;
      }
    } else if (amount < EPSILON_CENTS) {
      opening = `I added up our shared expenses. Based on the ${splitMethod} split, everything looks balanced right now.`;
    } else {
      const coveredPartner = result.balanceP1 > 0 ? "p1" : "p2";
      const sender = result.balanceP1 > 0 ? "p2" : "p1";
      if (state.summaryTone === "warm") {
        opening = `I put our shared costs into a quick summary so we do not have to keep it in our heads. Based on the ${splitMethod} split, ${sentenceSubjectName(coveredPartner)} covered ${formatMoney(amount)} more than ${shareReference(coveredPartner)}. No pressure - I just wanted us to have a clear number and decide whether to settle it now or carry it forward.`;
      } else if (state.summaryTone === "simple") {
        opening = `Shared expense balance: ${sentenceSubjectName(sender)} would send ${objectName(coveredPartner)} ${formatMoney(amount)} to even things out, based on the ${splitMethod} split.`;
      } else {
        opening = `I added up our shared expenses. Based on the ${splitMethod} split, ${sentenceSubjectName(coveredPartner)} covered ${formatMoney(amount)} more than ${shareReference(coveredPartner)}. We can settle that now or carry it forward as part of our shared balance.`;
      }
    }

    const lines = [opening, "", "Details:"];
    lines.push(`Total shared expenses: ${formatMoney(result.totalExpenses)}`);
    lines.push(`Split method: ${splitMethod}`);
    lines.push(`${getName("p1")} paid: ${formatMoney(result.paidP1)}`);
    lines.push(`${getName("p2")} paid: ${formatMoney(result.paidP2)}`);
    if (state.method !== "paid-only") {
      lines.push(`${getName("p1")} fair share: ${formatMoney(result.fairP1)}`);
      lines.push(`${getName("p2")} fair share: ${formatMoney(result.fairP2)}`);
    }
    if (result.validTransfers > 0) lines.push(`Transfers already included: ${formatMoney(result.transferTotal)}`);
    lines.push(`Suggested settle-up: ${getSettleUpText(result)}`);
    return lines.join("\n");
  }

  function renderCopyPreview(result) {
    const text = buildSummaryText(result) || "Add at least one shared expense to see a copyable summary.";
    els.summaryPreview.textContent = text;
  }

  function renderAll() {
    renderStartingLabels();
    renderStartingAmount();
    renderMethodPanels();
    renderRowValidations();
    renderResults();
  }

  function renderEverything() {
    renderCategoryRules();
    renderExpenses();
    renderTransfers();
    renderAll();
  }

  function syncSetupInputs() {
    els.currency.value = state.currency;
    els.partner1.value = state.partner1;
    els.partner2.value = state.partner2;
    els.startingAmount.value = state.startingAmount;
    els.customP1.value = state.customP1;
    els.customP2.value = state.customP2;
    els.incomeP1.value = state.incomeP1;
    els.incomeP2.value = state.incomeP2;

    document.querySelectorAll('input[name="cb-starting-direction"]').forEach((input) => {
      input.checked = input.value === state.startingDirection;
    });
    document.querySelectorAll('input[name="cb-method"]').forEach((input) => {
      input.checked = input.value === state.method;
    });
    document.querySelectorAll('input[name="cb-summary-tone"]').forEach((input) => {
      input.checked = input.value === state.summaryTone;
    });
  }

  function setStarterState() {
    state.currency = "$";
    state.partner1 = "You";
    state.partner2 = "Alex";
    state.startingDirection = "none";
    state.startingAmount = "";
    state.method = "equal";
    state.customP1 = "60";
    state.customP2 = "40";
    state.incomeP1 = "";
    state.incomeP2 = "";
    state.summaryTone = "neutral";
    state.categoryRules = {};
    ensureCategoryRules();
    state.expenses = [createExpense()];
    state.transfers = [];
  }

  function loadExample() {
    state.currency = "$";
    state.partner1 = "Mia";
    state.partner2 = "Alex";
    state.startingDirection = "none";
    state.startingAmount = "";
    state.method = "equal";
    state.summaryTone = "neutral";
    state.expenses = [
      createExpense({ description: "Groceries", amount: "86", paidBy: "p1", category: "groceries" }),
      createExpense({ description: "Internet", amount: "60", paidBy: "p2", category: "utilities" }),
      createExpense({ description: "Dinner", amount: "48", paidBy: "p1", category: "other" }),
      createExpense({ description: "Streaming subscription", amount: "18", paidBy: "p1", category: "subscriptions" })
    ];
    state.transfers = [
      createTransfer({ amount: "30", from: "p2", to: "p1", note: "After grocery and utility costs" })
    ];
    syncSetupInputs();
    renderEverything();
  }

  function loadIncomeExample() {
    state.currency = "$";
    state.partner1 = "You";
    state.partner2 = "Alex";
    state.startingDirection = "none";
    state.startingAmount = "";
    state.method = "income";
    state.incomeP1 = "4000";
    state.incomeP2 = "2000";
    state.summaryTone = "neutral";
    state.expenses = [
      createExpense({ description: "Rent", amount: "1200", paidBy: "p1", category: "rent" }),
      createExpense({ description: "Groceries", amount: "180", paidBy: "p2", category: "groceries" }),
      createExpense({ description: "Utilities", amount: "90", paidBy: "p1", category: "utilities" })
    ];
    state.transfers = [];
    syncSetupInputs();
    renderEverything();
  }

  function addExpense() {
    if (state.expenses.length >= MAX_EXPENSES) return;
    state.expenses.push(createExpense());
    renderExpenses();
    renderAll();
  }

  function addTransfer() {
    if (state.transfers.length >= MAX_TRANSFERS) return;
    state.transfers.push(createTransfer());
    renderTransfers();
    renderAll();
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter((expense) => expense.id !== id);
    renderExpenses();
    renderAll();
  }

  function removeTransfer(id) {
    state.transfers = state.transfers.filter((transfer) => transfer.id !== id);
    renderTransfers();
    renderAll();
  }

  function clearExpenses() {
    state.expenses = [];
    renderExpenses();
    renderAll();
  }

  function clearTransfers() {
    state.transfers = [];
    renderTransfers();
    renderAll();
  }

  function clearAll() {
    setStarterState();
    syncSetupInputs();
    renderEverything();
  }

  async function copySummary() {
    const text = buildSummaryText(calculate());
    if (!text) {
      setCopyStatus("Add an expense before copying.");
      return;
    }

    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard API unavailable.");
      await navigator.clipboard.writeText(text);
      setCopyStatus("Summary copied.");
    } catch (error) {
      const copied = copyTextFallback(text);
      setCopyStatus(copied ? "Summary copied." : "Copy blocked. Select the summary text below.");
    }
  }

  function copyTextFallback(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(textarea);
    if (!copied) selectSummaryPreviewText();
    return copied;
  }

  function selectSummaryPreviewText() {
    const selection = window.getSelection && window.getSelection();
    if (!selection || !els.summaryPreview) return;
    const range = document.createRange();
    range.selectNodeContents(els.summaryPreview);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function setCopyStatus(message) {
    els.copyStatus.textContent = message;
    window.clearTimeout(setCopyStatus.timer);
    setCopyStatus.timer = window.setTimeout(() => {
      if (els.copyStatus.textContent === message) els.copyStatus.textContent = "";
    }, 2800);
  }

  function scrollCalculatorIntoView() {
    const calculator = document.querySelector("#calculator");
    if (!calculator) return;
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    calculator.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  function handleSetupInput(event) {
    const target = event.target;
    if (target === els.currency) state.currency = sanitizeCurrency(target.value);
    if (target === els.partner1) state.partner1 = target.value;
    if (target === els.partner2) state.partner2 = target.value;
    if (target === els.startingAmount) state.startingAmount = target.value;
    if (target === els.customP1) state.customP1 = target.value;
    if (target === els.customP2) state.customP2 = target.value;
    if (target === els.incomeP1) state.incomeP1 = target.value;
    if (target === els.incomeP2) state.incomeP2 = target.value;

    if (target === els.partner1 || target === els.partner2) {
      renderCategoryRules();
      renderExpenses();
      renderTransfers();
    }
    renderAll();
  }

  function handleStartingDirection(event) {
    state.startingDirection = event.target.value;
    renderAll();
  }

  function handleMethodChange(event) {
    state.method = event.target.value;
    renderExpenses();
    renderAll();
  }

  function handleToneChange(event) {
    state.summaryTone = event.target.value;
    renderCopyPreview(calculate());
  }

  function handleExpenseInput(event) {
    const row = event.target.closest("[data-expense-id]");
    if (!row) return;
    const expense = state.expenses.find((item) => item.id === row.getAttribute("data-expense-id"));
    if (!expense) return;
    const field = event.target.getAttribute("data-field");
    if (!field) return;
    expense[field] = event.target.value;
    if (field === "category" || field === "overrideMode" || field === "included") {
      renderExpenses();
    }
    renderAll();
  }

  function handleTransferInput(event) {
    const row = event.target.closest("[data-transfer-id]");
    if (!row) return;
    const transfer = state.transfers.find((item) => item.id === row.getAttribute("data-transfer-id"));
    if (!transfer) return;
    const field = event.target.getAttribute("data-transfer-field");
    if (!field) return;
    transfer[field] = event.target.value;
    renderAll();
  }

  function handleCategoryRuleInput(event) {
    const row = event.target.closest("[data-category-id]");
    if (!row) return;
    const categoryId = row.getAttribute("data-category-id");
    const field = event.target.getAttribute("data-category-field");
    if (!field || !state.categoryRules[categoryId]) return;
    state.categoryRules[categoryId][field] = event.target.value;
    renderCategoryRules();
    renderExpenses();
    renderAll();
  }

  function bindEvents() {
    [
      els.currency,
      els.partner1,
      els.partner2,
      els.startingAmount,
      els.customP1,
      els.customP2,
      els.incomeP1,
      els.incomeP2
    ].forEach((input) => input.addEventListener("input", handleSetupInput));

    document.querySelectorAll('input[name="cb-starting-direction"]').forEach((input) => {
      input.addEventListener("change", handleStartingDirection);
    });
    document.querySelectorAll('input[name="cb-method"]').forEach((input) => {
      input.addEventListener("change", handleMethodChange);
    });
    document.querySelectorAll('input[name="cb-summary-tone"]').forEach((input) => {
      input.addEventListener("change", handleToneChange);
    });

    els.expenseList.addEventListener("input", handleExpenseInput);
    els.expenseList.addEventListener("change", handleExpenseInput);
    els.transferList.addEventListener("input", handleTransferInput);
    els.transferList.addEventListener("change", handleTransferInput);
    els.categoryRules.addEventListener("input", handleCategoryRuleInput);
    els.categoryRules.addEventListener("change", handleCategoryRuleInput);

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.getAttribute("data-action");
      const expenseRow = button.closest("[data-expense-id]");
      const transferRow = button.closest("[data-transfer-id]");
      const shouldScrollToCalculator = button.hasAttribute("data-scroll-to-calculator");

      if (action === "add-expense") addExpense();
      if (action === "add-transfer") addTransfer();
      if (action === "remove-expense" && expenseRow) removeExpense(expenseRow.getAttribute("data-expense-id"));
      if (action === "remove-transfer" && transferRow) removeTransfer(transferRow.getAttribute("data-transfer-id"));
      if (action === "clear-expenses") clearExpenses();
      if (action === "clear-transfers") clearTransfers();
      if (action === "clear-all") clearAll();
      if (action === "load-example") loadExample();
      if (action === "load-income-example") loadIncomeExample();
      if (action === "copy-summary") copySummary();
      if (shouldScrollToCalculator) scrollCalculatorIntoView();
    });
  }

  function init() {
    const root = document.querySelector(".cb-calculator");
    if (!root) return;

    els.currency = document.querySelector("#cb-currency");
    els.partner1 = document.querySelector("#cb-partner-1");
    els.partner2 = document.querySelector("#cb-partner-2");
    els.startingAmount = document.querySelector("#cb-starting-amount");
    els.startingAmountWrap = document.querySelector("[data-starting-amount-wrap]");
    els.startingValidation = document.querySelector("#cb-starting-validation");
    els.customP1 = document.querySelector("#cb-custom-p1");
    els.customP2 = document.querySelector("#cb-custom-p2");
    els.customValidation = document.querySelector("[data-custom-validation]");
    els.incomeP1 = document.querySelector("#cb-income-p1");
    els.incomeP2 = document.querySelector("#cb-income-p2");
    els.incomeValidation = document.querySelector("[data-income-validation]");
    els.incomeSuggestion = document.querySelector("[data-income-suggestion]");
    els.categoryRules = document.querySelector("[data-category-rules]");
    els.expenseList = document.querySelector("[data-expense-list]");
    els.transferList = document.querySelector("[data-transfer-list]");
    els.resultTitle = document.querySelector("[data-result-title]");
    els.resultSubtext = document.querySelector("[data-result-subtext]");
    els.breakdown = document.querySelector("[data-breakdown]");
    els.copyStatus = document.querySelector("[data-copy-status]");
    els.summaryPreview = document.querySelector("[data-summary-preview]");

    setStarterState();
    syncSetupInputs();
    bindEvents();
    renderEverything();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

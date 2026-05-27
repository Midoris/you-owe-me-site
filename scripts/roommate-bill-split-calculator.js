(function () {
  "use strict";

  const EPSILON = 0.005;
  const MAX_ROOMMATES = 8;
  const MAX_EXPENSES = 40;
  const MAX_ADJUSTMENTS = 24;

  const CATEGORIES = [
    "Rent",
    "Electricity",
    "Water",
    "Internet",
    "Groceries",
    "Household supplies",
    "Subscription",
    "Cleaning",
    "Repair",
    "Other"
  ];

  const state = {
    currency: "$",
    currencyMode: "$",
    customCurrency: "",
    roommates: [],
    expenses: [],
    repayments: [],
    previousBalances: [],
    nextRoommateNumber: 1,
    messageTone: "friendly",
    roommateMessage: ""
  };

  const els = {};

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createRoommate(name) {
    return {
      id: makeId("roommate"),
      name: name || `Roommate ${state.nextRoommateNumber++}`
    };
  }

  function createExpense(options) {
    const includedIds = options && options.includedIds
      ? options.includedIds.slice()
      : state.roommates.map((roommate) => roommate.id);

    return {
      id: makeId("expense"),
      description: (options && options.description) || "",
      category: (options && options.category) || "Other",
      amount: (options && options.amount) || "",
      paidBy: (options && options.paidBy) || (state.roommates[0] ? state.roommates[0].id : ""),
      includedIds,
      splitType: (options && options.splitType) || "equal",
      customShares: Object.assign({}, (options && options.customShares) || {}),
      note: (options && options.note) || ""
    };
  }

  function createRepayment(options) {
    const first = state.roommates[0] ? state.roommates[0].id : "";
    const second = state.roommates[1] ? state.roommates[1].id : first;

    return {
      id: makeId("repayment"),
      fromId: (options && options.fromId) || first,
      toId: (options && options.toId) || second,
      amount: (options && options.amount) || "",
      note: (options && options.note) || ""
    };
  }

  function createPreviousBalance(options) {
    const first = state.roommates[0] ? state.roommates[0].id : "";
    const second = state.roommates[1] ? state.roommates[1].id : first;

    return {
      id: makeId("previous"),
      debtorId: (options && options.debtorId) || first,
      creditorId: (options && options.creditorId) || second,
      amount: (options && options.amount) || "",
      note: (options && options.note) || ""
    };
  }

  function parseAmount(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const normalized = String(value || "").trim().replace(/,/g, "");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function roundMoney(value) {
    if (Math.abs(value) < EPSILON) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 8);
    return trimmed || "$";
  }

  function formatMoney(value, compact) {
    const symbol = sanitizeCurrency(state.currency);
    const number = roundMoney(value).toLocaleString("en-US", {
      minimumFractionDigits: compact && Number.isInteger(roundMoney(value)) ? 0 : 2,
      maximumFractionDigits: 2
    });
    const space = symbol.length > 1 ? " " : "";
    return `${symbol}${space}${number}`;
  }

  function getRoommateName(roommate, index) {
    const name = roommate && roommate.name ? roommate.name.trim() : "";
    return name || `Roommate ${index + 1}`;
  }

  function getRoommateIndex(id) {
    return state.roommates.findIndex((roommate) => roommate.id === id);
  }

  function getRoommateNameById(id) {
    const index = getRoommateIndex(id);
    if (index === -1) return "Someone";
    return getRoommateName(state.roommates[index], index);
  }

  function clearNode(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text));
  }

  function makeInput(id, value, type) {
    const input = document.createElement("input");
    input.id = id;
    input.className = "roommate-input";
    input.type = type || "text";
    input.value = value || "";
    input.autocomplete = "off";
    return input;
  }

  function makeSelect(id) {
    const select = document.createElement("select");
    select.id = id;
    select.className = "roommate-select";
    return select;
  }

  function makeField(labelText, control, hintText) {
    const wrap = document.createElement("div");
    wrap.className = "roommate-field";

    const label = document.createElement("label");
    label.htmlFor = control.id;
    label.textContent = labelText;
    wrap.appendChild(label);
    wrap.appendChild(control);

    if (hintText) {
      const hint = document.createElement("p");
      hint.className = "roommate-field-hint";
      hint.textContent = hintText;
      wrap.appendChild(hint);
    }

    return wrap;
  }

  function populateRoommateSelect(select, selectedId) {
    state.roommates.forEach((roommate, index) => {
      const option = document.createElement("option");
      option.value = roommate.id;
      option.textContent = getRoommateName(roommate, index);
      option.selected = roommate.id === selectedId;
      select.appendChild(option);
    });
  }

  function populateCategorySelect(select, selectedCategory) {
    CATEGORIES.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      option.selected = category === selectedCategory;
      select.appendChild(option);
    });
  }

  function normalizeState() {
    const validIds = new Set(state.roommates.map((roommate) => roommate.id));
    const first = state.roommates[0] ? state.roommates[0].id : "";
    const second = state.roommates[1] ? state.roommates[1].id : first;

    state.expenses.forEach((expense) => {
      if (!validIds.has(expense.paidBy)) expense.paidBy = first;
      expense.includedIds = expense.includedIds.filter((id) => validIds.has(id));
      Object.keys(expense.customShares).forEach((id) => {
        if (!validIds.has(id)) delete expense.customShares[id];
      });
    });

    state.repayments.forEach((repayment) => {
      if (!validIds.has(repayment.fromId)) repayment.fromId = first;
      if (!validIds.has(repayment.toId)) repayment.toId = second;
      if (repayment.fromId === repayment.toId && state.roommates.length > 1) repayment.toId = second;
    });

    state.previousBalances.forEach((balance) => {
      if (!validIds.has(balance.debtorId)) balance.debtorId = first;
      if (!validIds.has(balance.creditorId)) balance.creditorId = second;
      if (balance.debtorId === balance.creditorId && state.roommates.length > 1) balance.creditorId = second;
    });
  }

  function render() {
    normalizeState();
    renderRoommates();
    renderExpenses();
    renderRepayments();
    renderPreviousBalances();
    updateResults();
  }

  function renderRoommates() {
    clearNode(els.roommateList);
    const namesHaveBlank = state.roommates.some((roommate) => !roommate.name.trim());
    els.roommateMessage.textContent = namesHaveBlank ? "Add a name or nickname for each roommate." : "";

    state.roommates.forEach((roommate, index) => {
      const row = document.createElement("div");
      row.className = "roommate-person-row";

      const input = makeInput(`roommate-name-${roommate.id}`, roommate.name, "text");
      input.maxLength = 40;
      input.setAttribute("aria-describedby", "roommate-message");
      input.setAttribute("aria-invalid", roommate.name.trim() ? "false" : "true");
      input.addEventListener("input", () => {
        roommate.name = input.value;
        input.setAttribute("aria-invalid", roommate.name.trim() ? "false" : "true");
        els.roommateMessage.textContent = state.roommates.some((person) => !person.name.trim())
          ? "Add a name or nickname for each roommate."
          : "";
        renderExpenses();
        renderRepayments();
        renderPreviousBalances();
        updateResults();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "roommate-remove-button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${getRoommateName(roommate, index)}`);
      remove.addEventListener("click", () => removeRoommate(roommate.id));

      row.append(makeField(`Roommate ${index + 1}`, input), remove);
      els.roommateList.appendChild(row);
    });
  }

  function renderExpenses() {
    clearNode(els.expenseList);

    state.expenses.forEach((expense, expenseIndex) => {
      const card = document.createElement("article");
      card.className = "roommate-entry-card";

      const header = document.createElement("div");
      header.className = "roommate-entry-header";
      const title = document.createElement("h4");
      title.textContent = `Bill ${expenseIndex + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "roommate-remove-button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${expense.description || `bill ${expenseIndex + 1}`}`);
      remove.addEventListener("click", () => removeExpense(expense.id));
      header.append(title, remove);

      const fields = document.createElement("div");
      fields.className = "roommate-expense-fields";

      const description = makeInput(`expense-description-${expense.id}`, expense.description, "text");
      description.placeholder = "Rent, internet, groceries...";
      description.maxLength = 70;
      description.addEventListener("input", () => {
        expense.description = description.value;
        updateResults();
      });

      const category = makeSelect(`expense-category-${expense.id}`);
      populateCategorySelect(category, expense.category);
      category.addEventListener("change", () => {
        expense.category = category.value;
        updateResults();
      });

      const amount = makeInput(`expense-amount-${expense.id}`, expense.amount, "number");
      amount.min = "0";
      amount.step = "0.01";
      amount.inputMode = "decimal";
      amount.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
      amount.addEventListener("input", () => {
        expense.amount = amount.value;
        renderExpenseValidation(expense, card);
        updateResults();
      });

      const paidBy = makeSelect(`expense-paid-by-${expense.id}`);
      populateRoommateSelect(paidBy, expense.paidBy);
      paidBy.addEventListener("change", () => {
        expense.paidBy = paidBy.value;
        updateResults();
      });

      fields.append(
        makeField("Bill name", description),
        makeField("Category", category),
        makeField("Amount", amount),
        makeField("Paid by", paidBy)
      );

      const included = renderIncludedRoommates(expense, card);
      const splitType = renderSplitType(expense);
      const customShares = renderCustomShares(expense, card);

      const note = makeInput(`expense-note-${expense.id}`, expense.note, "text");
      note.placeholder = "Optional note";
      note.maxLength = 100;
      note.addEventListener("input", () => {
        expense.note = note.value;
      });

      const validation = document.createElement("p");
      validation.className = "roommate-validation";
      validation.id = `expense-validation-${expense.id}`;
      validation.setAttribute("aria-live", "polite");

      card.append(header, fields, included, splitType, customShares, makeField("Note", note), validation);
      els.expenseList.appendChild(card);
      renderExpenseValidation(expense, card);
    });
  }

  function renderIncludedRoommates(expense, card) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "roommate-fieldset";
    const legend = document.createElement("legend");
    legend.textContent = "Included roommates";
    fieldset.appendChild(legend);

    const grid = document.createElement("div");
    grid.className = "roommate-pill-grid";

    state.roommates.forEach((roommate, index) => {
      const checkboxId = `expense-included-${expense.id}-${roommate.id}`;
      const label = document.createElement("label");
      label.className = "roommate-pill";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = expense.includedIds.includes(roommate.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!expense.includedIds.includes(roommate.id)) expense.includedIds.push(roommate.id);
        } else {
          expense.includedIds = expense.includedIds.filter((id) => id !== roommate.id);
          delete expense.customShares[roommate.id];
        }
        renderExpenses();
        updateResults();
        if (card) renderExpenseValidation(expense, card);
      });

      const text = document.createElement("span");
      text.textContent = getRoommateName(roommate, index);
      label.append(checkbox, text);
      grid.appendChild(label);
    });

    fieldset.appendChild(grid);
    return fieldset;
  }

  function renderSplitType(expense) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "roommate-fieldset roommate-split-fieldset";
    const legend = document.createElement("legend");
    legend.textContent = "Split type";
    fieldset.appendChild(legend);

    const grid = document.createElement("div");
    grid.className = "roommate-segmented";

    ["equal", "custom"].forEach((splitType) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `split-type-${expense.id}`;
      input.value = splitType;
      input.checked = expense.splitType === splitType;
      input.addEventListener("change", () => {
        expense.splitType = splitType;
        if (splitType === "custom") seedCustomShares(expense);
        renderExpenses();
        updateResults();
      });

      const text = document.createElement("span");
      text.textContent = splitType === "equal" ? "Equal" : "Custom amounts";
      label.append(input, text);
      grid.appendChild(label);
    });

    fieldset.appendChild(grid);
    return fieldset;
  }

  function seedCustomShares(expense) {
    const amount = parseAmount(expense.amount);
    const included = expense.includedIds.slice();
    if (amount <= 0 || included.length === 0) return;

    const hasAnyShare = included.some((id) => String(expense.customShares[id] || "").trim());
    if (hasAnyShare) return;

    let remaining = roundMoney(amount);
    included.forEach((id, index) => {
      const share = index === included.length - 1 ? remaining : roundMoney(amount / included.length);
      expense.customShares[id] = share.toFixed(2);
      remaining = roundMoney(remaining - share);
    });
  }

  function renderCustomShares(expense, card) {
    const wrap = document.createElement("div");
    wrap.className = "roommate-custom-shares";
    if (expense.splitType !== "custom") return wrap;

    const heading = document.createElement("p");
    heading.className = "roommate-mini-heading";
    heading.textContent = "Custom share for each included roommate";
    wrap.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "roommate-custom-grid";

    expense.includedIds.forEach((id) => {
      const input = makeInput(`custom-share-${expense.id}-${id}`, expense.customShares[id] || "", "number");
      input.min = "0";
      input.step = "0.01";
      input.inputMode = "decimal";
      input.placeholder = "0.00";
      input.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
      input.addEventListener("input", () => {
        expense.customShares[id] = input.value;
        renderExpenseValidation(expense, card);
        updateResults();
      });
      grid.appendChild(makeField(getRoommateNameById(id), input));
    });

    wrap.appendChild(grid);
    return wrap;
  }

  function renderRepayments() {
    clearNode(els.repaymentList);

    if (state.repayments.length === 0) {
      appendEmpty(els.repaymentList, "No repayments added yet.");
      return;
    }

    state.repayments.forEach((repayment, index) => {
      const card = document.createElement("article");
      card.className = "roommate-entry-card roommate-adjustment-card";

      const header = document.createElement("div");
      header.className = "roommate-entry-header";
      const title = document.createElement("h4");
      title.textContent = `Repayment ${index + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "roommate-remove-button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove repayment ${index + 1}`);
      remove.addEventListener("click", () => removeRepayment(repayment.id));
      header.append(title, remove);

      const fields = document.createElement("div");
      fields.className = "roommate-adjustment-fields";

      const from = makeSelect(`repayment-from-${repayment.id}`);
      populateRoommateSelect(from, repayment.fromId);
      from.addEventListener("change", () => {
        repayment.fromId = from.value;
        renderRepayments();
        updateResults();
      });

      const to = makeSelect(`repayment-to-${repayment.id}`);
      populateRoommateSelect(to, repayment.toId);
      to.addEventListener("change", () => {
        repayment.toId = to.value;
        renderRepayments();
        updateResults();
      });

      const amount = makeInput(`repayment-amount-${repayment.id}`, repayment.amount, "number");
      amount.min = "0";
      amount.step = "0.01";
      amount.inputMode = "decimal";
      amount.setAttribute("aria-describedby", `repayment-validation-${repayment.id}`);
      amount.addEventListener("input", () => {
        repayment.amount = amount.value;
        renderAdjustmentValidation(repayment, card, "repayment");
        updateResults();
      });

      fields.append(makeField("Paid by", from), makeField("Paid to", to), makeField("Amount", amount));

      const note = makeInput(`repayment-note-${repayment.id}`, repayment.note, "text");
      note.placeholder = "Optional note";
      note.maxLength = 100;
      note.addEventListener("input", () => {
        repayment.note = note.value;
      });

      const validation = document.createElement("p");
      validation.className = "roommate-validation";
      validation.id = `repayment-validation-${repayment.id}`;
      validation.setAttribute("aria-live", "polite");

      card.append(header, fields, makeField("Note", note), validation);
      els.repaymentList.appendChild(card);
      renderAdjustmentValidation(repayment, card, "repayment");
    });
  }

  function renderPreviousBalances() {
    clearNode(els.previousBalanceList);

    if (state.previousBalances.length === 0) {
      appendEmpty(els.previousBalanceList, "No previous balance added yet.");
      return;
    }

    state.previousBalances.forEach((balance, index) => {
      const card = document.createElement("article");
      card.className = "roommate-entry-card roommate-adjustment-card";

      const header = document.createElement("div");
      header.className = "roommate-entry-header";
      const title = document.createElement("h4");
      title.textContent = `Previous balance ${index + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "roommate-remove-button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove previous balance ${index + 1}`);
      remove.addEventListener("click", () => removePreviousBalance(balance.id));
      header.append(title, remove);

      const fields = document.createElement("div");
      fields.className = "roommate-adjustment-fields";

      const debtor = makeSelect(`previous-debtor-${balance.id}`);
      populateRoommateSelect(debtor, balance.debtorId);
      debtor.addEventListener("change", () => {
        balance.debtorId = debtor.value;
        renderPreviousBalances();
        updateResults();
      });

      const creditor = makeSelect(`previous-creditor-${balance.id}`);
      populateRoommateSelect(creditor, balance.creditorId);
      creditor.addEventListener("change", () => {
        balance.creditorId = creditor.value;
        renderPreviousBalances();
        updateResults();
      });

      const amount = makeInput(`previous-amount-${balance.id}`, balance.amount, "number");
      amount.min = "0";
      amount.step = "0.01";
      amount.inputMode = "decimal";
      amount.setAttribute("aria-describedby", `previous-validation-${balance.id}`);
      amount.addEventListener("input", () => {
        balance.amount = amount.value;
        renderAdjustmentValidation(balance, card, "previous");
        updateResults();
      });

      fields.append(makeField("Roommate who owed", debtor), makeField("Roommate who was owed", creditor), makeField("Amount", amount));

      const note = makeInput(`previous-note-${balance.id}`, balance.note, "text");
      note.placeholder = "Optional note";
      note.maxLength = 100;
      note.addEventListener("input", () => {
        balance.note = note.value;
      });

      const validation = document.createElement("p");
      validation.className = "roommate-validation";
      validation.id = `previous-validation-${balance.id}`;
      validation.setAttribute("aria-live", "polite");

      card.append(header, fields, makeField("Note", note), validation);
      els.previousBalanceList.appendChild(card);
      renderAdjustmentValidation(balance, card, "previous");
    });
  }

  function validateExpense(expense) {
    const amountText = String(expense.amount || "").trim();
    const amount = parseAmount(expense.amount);
    const included = expense.includedIds.filter((id) => getRoommateIndex(id) !== -1);

    if (amountText && amount <= 0) return "Enter an amount greater than zero.";
    if (amount <= 0) return "";
    if (getRoommateIndex(expense.paidBy) === -1) return "Choose who paid for this bill.";
    if (included.length === 0) return "Select at least one roommate included in this bill.";

    if (expense.splitType === "custom") {
      const shares = included.map((id) => parseAmount(expense.customShares[id]));
      if (shares.some((share) => share < 0)) return "Custom shares cannot be negative.";
      const sum = shares.reduce((total, share) => total + share, 0);
      if (Math.abs(roundMoney(sum - amount)) > 0.01) {
        return `Custom shares currently add up to ${formatMoney(sum)}. They need to add up to ${formatMoney(amount)}.`;
      }
    }

    return "";
  }

  function renderExpenseValidation(expense, card) {
    const validation = card && card.querySelector(`#expense-validation-${expense.id}`);
    if (!validation) return;
    const message = validateExpense(expense);
    validation.textContent = message;
  }

  function validateAdjustment(row, type) {
    const amountText = String(row.amount || "").trim();
    const amount = parseAmount(row.amount);
    if (amountText && amount <= 0) return "Enter an amount greater than zero.";
    if (amount <= 0) return "";

    if (type === "repayment") {
      if (row.fromId === row.toId) return "Choose two different roommates for a repayment.";
      if (getRoommateIndex(row.fromId) === -1 || getRoommateIndex(row.toId) === -1) return "Choose valid roommates.";
    } else {
      if (row.debtorId === row.creditorId) return "Choose two different roommates for a previous balance.";
      if (getRoommateIndex(row.debtorId) === -1 || getRoommateIndex(row.creditorId) === -1) return "Choose valid roommates.";
    }

    return "";
  }

  function renderAdjustmentValidation(row, card, type) {
    const prefix = type === "repayment" ? "repayment" : "previous";
    const validation = card && card.querySelector(`#${prefix}-validation-${row.id}`);
    if (!validation) return;
    validation.textContent = validateAdjustment(row, type);
  }

  function calculateExpenseShares(expense) {
    const amount = parseAmount(expense.amount);
    const included = expense.includedIds.filter((id) => getRoommateIndex(id) !== -1);
    if (amount <= 0 || getRoommateIndex(expense.paidBy) === -1 || included.length === 0) return null;
    if (validateExpense(expense)) return null;

    if (expense.splitType === "custom") {
      return included.map((id) => ({
        id,
        amount: parseAmount(expense.customShares[id])
      }));
    }

    return included.map((id) => ({
      id,
      amount: amount / included.length
    }));
  }

  function calculate() {
    const balances = new Map();
    const paid = new Map();
    const fairShare = new Map();
    const repaymentSent = new Map();
    const repaymentReceived = new Map();
    const previousOwed = new Map();
    const previousOwedTo = new Map();

    state.roommates.forEach((roommate) => {
      balances.set(roommate.id, 0);
      paid.set(roommate.id, 0);
      fairShare.set(roommate.id, 0);
      repaymentSent.set(roommate.id, 0);
      repaymentReceived.set(roommate.id, 0);
      previousOwed.set(roommate.id, 0);
      previousOwedTo.set(roommate.id, 0);
    });

    let totalBills = 0;
    let expenseCount = 0;
    let repaymentCount = 0;
    let repaymentTotal = 0;
    let previousBalanceCount = 0;
    let previousBalanceTotal = 0;
    const categories = new Set();

    state.expenses.forEach((expense) => {
      const shares = calculateExpenseShares(expense);
      if (!shares) return;

      const amount = parseAmount(expense.amount);
      totalBills += amount;
      expenseCount += 1;
      categories.add(expense.category || "Other");

      paid.set(expense.paidBy, paid.get(expense.paidBy) + amount);
      balances.set(expense.paidBy, balances.get(expense.paidBy) + amount);

      shares.forEach((share) => {
        fairShare.set(share.id, fairShare.get(share.id) + share.amount);
        balances.set(share.id, balances.get(share.id) - share.amount);
      });
    });

    applyRepayments(balances, repaymentSent, repaymentReceived, (countedAmount) => {
      repaymentCount += 1;
      repaymentTotal += countedAmount;
    });

    applyPreviousBalances(balances, previousOwed, previousOwedTo, (countedAmount) => {
      previousBalanceCount += 1;
      previousBalanceTotal += countedAmount;
    });

    const net = state.roommates.map((roommate, index) => ({
      id: roommate.id,
      name: getRoommateName(roommate, index),
      paid: roundMoney(paid.get(roommate.id) || 0),
      fairShare: roundMoney(fairShare.get(roommate.id) || 0),
      repaymentSent: roundMoney(repaymentSent.get(roommate.id) || 0),
      repaymentReceived: roundMoney(repaymentReceived.get(roommate.id) || 0),
      previousOwed: roundMoney(previousOwed.get(roommate.id) || 0),
      previousOwedTo: roundMoney(previousOwedTo.get(roommate.id) || 0),
      net: roundMoney(balances.get(roommate.id) || 0)
    }));

    const result = {
      totalBills: roundMoney(totalBills),
      expenseCount,
      roommateCount: state.roommates.length,
      repaymentCount,
      repaymentTotal: roundMoney(repaymentTotal),
      previousBalanceCount,
      previousBalanceTotal: roundMoney(previousBalanceTotal),
      categories: Array.from(categories),
      net
    };
    result.settlements = simplifySettlements(net);
    return result;
  }

  function applyRepayments(balances, repaymentSent, repaymentReceived, onCounted) {
    state.repayments.forEach((repayment) => {
      const amount = parseAmount(repayment.amount);
      if (amount <= 0 || validateAdjustment(repayment, "repayment")) return;
      balances.set(repayment.fromId, balances.get(repayment.fromId) + amount);
      balances.set(repayment.toId, balances.get(repayment.toId) - amount);
      repaymentSent.set(repayment.fromId, repaymentSent.get(repayment.fromId) + amount);
      repaymentReceived.set(repayment.toId, repaymentReceived.get(repayment.toId) + amount);
      onCounted(amount);
    });
  }

  function applyPreviousBalances(balances, previousOwed, previousOwedTo, onCounted) {
    state.previousBalances.forEach((balance) => {
      const amount = parseAmount(balance.amount);
      if (amount <= 0 || validateAdjustment(balance, "previous")) return;
      balances.set(balance.debtorId, balances.get(balance.debtorId) - amount);
      balances.set(balance.creditorId, balances.get(balance.creditorId) + amount);
      previousOwed.set(balance.debtorId, previousOwed.get(balance.debtorId) + amount);
      previousOwedTo.set(balance.creditorId, previousOwedTo.get(balance.creditorId) + amount);
      onCounted(amount);
    });
  }

  function simplifySettlements(netRows) {
    const creditors = netRows
      .filter((row) => row.net > EPSILON)
      .map((row) => ({ name: row.name, amount: row.net }))
      .sort((a, b) => b.amount - a.amount);

    const debtors = netRows
      .filter((row) => row.net < -EPSILON)
      .map((row) => ({ name: row.name, amount: Math.abs(row.net) }))
      .sort((a, b) => a.amount - b.amount);

    const settlements = [];
    let creditorIndex = 0;

    debtors.forEach((debtor) => {
      while (debtor.amount > EPSILON && creditorIndex < creditors.length) {
        const creditor = creditors[creditorIndex];
        const amount = roundMoney(Math.min(debtor.amount, creditor.amount));
        if (amount < 0.01) break;

        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount
        });

        debtor.amount = roundMoney(debtor.amount - amount);
        creditor.amount = roundMoney(creditor.amount - amount);
        if (creditor.amount <= EPSILON) creditorIndex += 1;
      }
    });

    return settlements.filter((settlement) => settlement.amount >= 0.01);
  }

  function updateResults() {
    const result = calculate();
    renderSettlements(result);
    renderBalanceSummary(result);
    renderMonthlySummary(result);
    renderGeneratedMessage(result);
  }

  function renderSettlements(result) {
    clearNode(els.settlementList);
    if (result.expenseCount === 0 && result.previousBalanceCount === 0) {
      appendEmpty(els.settlementList, "Add shared bills, repayments, or a previous balance to see who owes whom.");
      return;
    }
    if (result.settlements.length === 0) {
      appendEmpty(els.settlementList, "Everyone is settled up.");
      return;
    }

    result.settlements.forEach((settlement) => {
      const row = document.createElement("div");
      row.className = "roommate-settlement-line";
      row.textContent = `${settlement.from} owes ${settlement.to} ${formatMoney(settlement.amount)}`;
      els.settlementList.appendChild(row);
    });
  }

  function renderBalanceSummary(result) {
    clearNode(els.balanceSummary);

    result.net.forEach((row) => {
      const card = document.createElement("article");
      card.className = "roommate-balance-card";

      const header = document.createElement("div");
      header.className = "roommate-balance-card-header";
      const name = document.createElement("h4");
      name.textContent = row.name;
      const status = document.createElement("span");
      status.className = "roommate-status-chip";

      if (row.net > EPSILON) {
        status.textContent = `Gets back ${formatMoney(row.net)}`;
        status.classList.add("is-positive");
      } else if (row.net < -EPSILON) {
        status.textContent = `Owes ${formatMoney(Math.abs(row.net))}`;
        status.classList.add("is-negative");
      } else {
        status.textContent = "Settled";
      }

      header.append(name, status);

      const list = document.createElement("dl");
      list.className = "roommate-balance-details";
      appendDefinition(list, "Total paid", formatMoney(row.paid));
      appendDefinition(list, "Fair share", formatMoney(row.fairShare));
      appendDefinition(list, "Repayments sent", formatMoney(row.repaymentSent));
      appendDefinition(list, "Repayments received", formatMoney(row.repaymentReceived));
      appendDefinition(list, "Previous balance", describePreviousBalance(row));
      appendDefinition(list, "Net result", status.textContent);

      card.append(header, list);
      els.balanceSummary.appendChild(card);
    });
  }

  function describePreviousBalance(row) {
    const parts = [];
    if (row.previousOwed > EPSILON) parts.push(`owed ${formatMoney(row.previousOwed)}`);
    if (row.previousOwedTo > EPSILON) parts.push(`was owed ${formatMoney(row.previousOwedTo)}`);
    return parts.length ? parts.join(", ") : formatMoney(0);
  }

  function appendDefinition(list, term, description) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = description;
    row.append(dt, dd);
    list.appendChild(row);
  }

  function renderMonthlySummary(result) {
    clearNode(els.monthlySummary);
    appendResultItem(els.monthlySummary, "Total shared bills", formatMoney(result.totalBills));
    appendResultItem(els.monthlySummary, "Roommates", String(result.roommateCount));
    appendResultItem(els.monthlySummary, "Expenses counted", String(result.expenseCount));
    appendResultItem(els.monthlySummary, "Repayments counted", `${result.repaymentCount} (${formatMoney(result.repaymentTotal)})`);
    appendResultItem(els.monthlySummary, "Previous balances counted", `${result.previousBalanceCount} (${formatMoney(result.previousBalanceTotal)})`);
  }

  function renderGeneratedMessage(result) {
    state.roommateMessage = buildRoommateMessage(result, state.messageTone);
    els.generatedMessage.textContent = state.roommateMessage;
  }

  function buildRoommateMessage(result, tone) {
    const settlementText = formatSettlementPhrase(result.settlements);
    const countedText = formatCountedPhrase(result);

    if (result.expenseCount === 0 && result.previousBalanceCount === 0) {
      return "Hey everyone - I am adding the shared household bills here so we can settle up from one clear record.";
    }

    if (result.settlements.length === 0) {
      if (tone === "short") return "Monthly bills are calculated, and everyone is settled up.";
      if (tone === "direct") return "I calculated the shared bills and repayments for this month. Everyone is settled up.";
      return "Hey everyone - I added the shared bills and repayments for this month, and it looks like we are settled up. Thanks for keeping the household costs clear.";
    }

    if (tone === "short") {
      return `Monthly bills are calculated. ${settlementText}.`;
    }

    if (tone === "direct") {
      return `I calculated ${countedText}. After everything already paid is counted, ${settlementText}.`;
    }

    return `Hey everyone - I added ${countedText}. ${formatAfterPhrase(result)}, ${settlementText}. Just keeping the household costs clear.`;
  }

  function formatAfterPhrase(result) {
    if (result.repaymentCount > 0 && result.previousBalanceCount > 0) return "After repayments and previous balances are counted";
    if (result.repaymentCount > 0) return "After the repayments already made";
    if (result.previousBalanceCount > 0) return "After the previous balance is counted";
    return "After everything is counted";
  }

  function formatCountedPhrase(result) {
    if (!result.categories.length) return "the shared bills for this month";
    const categories = result.categories
      .map((category) => category.toLowerCase())
      .slice(0, 4);
    const joined = joinHumanList(categories);
    const base = `${joined} for this month`;
    const extras = [];
    if (result.repaymentCount > 0) extras.push("repayments");
    if (result.previousBalanceCount > 0) extras.push("the previous balance");
    return extras.length ? `${base}, including ${joinHumanList(extras)}` : base;
  }

  function formatSettlementPhrase(settlements) {
    if (!settlements.length) return "everyone is settled up";
    const phrases = settlements.map((settlement) => `${settlement.from} owes ${settlement.to} ${formatMoney(settlement.amount, true)}`);
    return joinHumanList(phrases);
  }

  function joinHumanList(items) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  function appendResultItem(container, label, value) {
    const row = document.createElement("div");
    row.className = "roommate-result-row";
    const left = document.createElement("span");
    left.textContent = label;
    const right = document.createElement("strong");
    right.textContent = value;
    row.append(left, right);
    container.appendChild(row);
  }

  function appendEmpty(container, message) {
    const empty = document.createElement("p");
    empty.className = "roommate-empty-state";
    empty.textContent = message;
    container.appendChild(empty);
  }

  function addRoommate() {
    if (state.roommates.length >= MAX_ROOMMATES) {
      els.roommateMessage.textContent = "You can add up to 8 roommates.";
      return;
    }
    const roommate = createRoommate();
    state.roommates.push(roommate);
    state.expenses.forEach((expense) => {
      if (!expense.includedIds.includes(roommate.id)) expense.includedIds.push(roommate.id);
    });
    render();
  }

  function removeRoommate(id) {
    if (state.roommates.length <= 2) {
      els.roommateMessage.textContent = "Add at least two roommates to split household costs.";
      return;
    }
    state.roommates = state.roommates.filter((roommate) => roommate.id !== id);
    render();
  }

  function addExpense() {
    if (state.expenses.length >= MAX_EXPENSES) return;
    state.expenses.push(createExpense({
      description: "",
      category: "Other",
      amount: "",
      paidBy: state.roommates[0] ? state.roommates[0].id : ""
    }));
    render();
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter((expense) => expense.id !== id);
    if (state.expenses.length === 0) addExpense();
    render();
  }

  function addRepayment() {
    if (state.repayments.length >= MAX_ADJUSTMENTS) return;
    state.repayments.push(createRepayment());
    render();
  }

  function removeRepayment(id) {
    state.repayments = state.repayments.filter((repayment) => repayment.id !== id);
    render();
  }

  function addPreviousBalance() {
    if (state.previousBalances.length >= MAX_ADJUSTMENTS) return;
    state.previousBalances.push(createPreviousBalance());
    render();
  }

  function removePreviousBalance(id) {
    state.previousBalances = state.previousBalances.filter((balance) => balance.id !== id);
    render();
  }

  function loadExample() {
    state.currency = "$";
    state.currencyMode = "$";
    state.customCurrency = "";
    state.nextRoommateNumber = 1;
    state.roommates = [createRoommate("Alex"), createRoommate("Maya"), createRoommate("Sam")];
    state.nextRoommateNumber = 4;

    const alex = state.roommates[0].id;
    const maya = state.roommates[1].id;
    const sam = state.roommates[2].id;
    const all = [alex, maya, sam];

    state.expenses = [
      createExpense({ description: "Rent", category: "Rent", amount: "1800", paidBy: maya, includedIds: all }),
      createExpense({ description: "Internet", category: "Internet", amount: "60", paidBy: alex, includedIds: all }),
      createExpense({ description: "Groceries", category: "Groceries", amount: "120", paidBy: sam, includedIds: all }),
      createExpense({ description: "Cleaning supplies", category: "Cleaning", amount: "30", paidBy: maya, includedIds: all })
    ];
    state.repayments = [
      createRepayment({ fromId: alex, toId: maya, amount: "200", note: "Alex already sent Maya $200" })
    ];
    state.previousBalances = [];
    syncCurrencyControls();
    render();
  }

  function startBlank() {
    state.currency = "$";
    state.currencyMode = "$";
    state.customCurrency = "";
    state.nextRoommateNumber = 1;
    state.roommates = [createRoommate("Roommate 1"), createRoommate("Roommate 2")];
    state.nextRoommateNumber = 3;
    state.expenses = [
      createExpense({
        description: "",
        category: "Other",
        amount: "",
        paidBy: state.roommates[0].id,
        includedIds: state.roommates.map((roommate) => roommate.id)
      })
    ];
    state.repayments = [];
    state.previousBalances = [];
    syncCurrencyControls();
    render();
  }

  async function copyText(text, statusElement) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(statusElement, "Copied");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyStatus(statusElement, copied ? "Copied" : "Copy failed");
    }
  }

  function setCopyStatus(statusElement, text) {
    if (!statusElement) return;
    statusElement.textContent = text;
    window.clearTimeout(statusElement.copyTimer);
    statusElement.copyTimer = window.setTimeout(() => {
      if (statusElement.textContent === text) statusElement.textContent = "";
    }, 2400);
  }

  function syncCurrencyControls() {
    if (!els.currencyPreset) return;
    els.currencyPreset.value = state.currencyMode;
    els.currencyCustom.value = state.customCurrency;
    els.currencyCustom.hidden = state.currencyMode !== "custom";
  }

  function handleCurrencyChange() {
    const mode = els.currencyPreset.value;
    state.currencyMode = mode;
    if (mode === "custom") {
      els.currencyCustom.hidden = false;
      state.currency = sanitizeCurrency(els.currencyCustom.value || "$");
    } else {
      els.currencyCustom.hidden = true;
      state.currency = sanitizeCurrency(mode);
    }
    updateResults();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const action = target.getAttribute("data-action");

      if (action === "add-roommate") addRoommate();
      if (action === "add-expense") addExpense();
      if (action === "add-repayment") addRepayment();
      if (action === "add-previous-balance") addPreviousBalance();
      if (action === "load-example") loadExample();
      if (action === "start-blank") startBlank();
      if (action === "copy-generated-message") copyText(state.roommateMessage, els.generatedCopyStatus);
      if (action === "copy-static-message") {
        const card = target.closest(".roommate-message-card");
        const message = card && card.querySelector("[data-message-text]");
        const status = card && card.querySelector("[data-static-copy-status]");
        copyText(message ? message.textContent.trim() : "", status);
      }
    });

    els.currencyPreset.addEventListener("change", handleCurrencyChange);
    els.currencyCustom.addEventListener("input", () => {
      state.customCurrency = els.currencyCustom.value;
      handleCurrencyChange();
    });
    els.messageTone.addEventListener("change", () => {
      state.messageTone = els.messageTone.value;
      updateResults();
    });
  }

  function init() {
    const root = document.querySelector(".roommate-calculator");
    if (!root) return;

    els.roommateList = document.querySelector("[data-roommate-list]");
    els.roommateMessage = document.querySelector("#roommate-message");
    els.expenseList = document.querySelector("[data-expense-list]");
    els.repaymentList = document.querySelector("[data-repayment-list]");
    els.previousBalanceList = document.querySelector("[data-previous-balance-list]");
    els.settlementList = document.querySelector("[data-settlement-list]");
    els.balanceSummary = document.querySelector("[data-balance-summary]");
    els.monthlySummary = document.querySelector("[data-monthly-summary]");
    els.generatedMessage = document.querySelector("[data-generated-message]");
    els.generatedCopyStatus = document.querySelector("[data-generated-copy-status]");
    els.currencyPreset = document.querySelector("#roommate-currency");
    els.currencyCustom = document.querySelector("#roommate-currency-custom");
    els.messageTone = document.querySelector("#roommate-message-tone");

    bindEvents();
    loadExample();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  "use strict";

  const MAX_ROOMMATES = 8;
  const MAX_EXPENSES = 40;
  const MAX_ADJUSTMENTS = 24;
  const MODEL = window.RoommateBillSplitModel;

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
    billingPeriod: "",
    roommates: [],
    expenses: [],
    repayments: [],
    previousBalances: [],
    nextRoommateNumber: 1,
    messageTone: "friendly",
    roommateMessage: "",
    detailedSummary: ""
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

    const billingDays = String((options && options.billingDays) || "30");
    const usageDetails = Object.assign({}, (options && options.usageDetails) || {});
    includedIds.forEach((id) => {
      if (!usageDetails[id]) usageDetails[id] = { daysPresent: billingDays, weight: "1" };
    });

    return {
      id: makeId("expense"),
      description: (options && options.description) || "",
      category: (options && options.category) || "Other",
      amount: (options && options.amount) || "",
      paidBy: (options && options.paidBy) || (state.roommates[0] ? state.roommates[0].id : ""),
      includedIds,
      mode: (options && options.mode) || ((options && options.splitType) === "custom" ? "custom" : "simple"),
      advancedOpen: Boolean(options && options.advancedOpen),
      splitType: (options && options.splitType) || "equal",
      customShares: Object.assign({}, (options && options.customShares) || {}),
      fixedInputType: (options && options.fixedInputType) || "amount",
      fixedAmount: (options && options.fixedAmount) || "",
      fixedPercent: (options && options.fixedPercent) || "",
      fixedSplitType: (options && options.fixedSplitType) || "equal",
      fixedCustomShares: Object.assign({}, (options && options.fixedCustomShares) || {}),
      billingDays,
      usageDetails,
      guest: Object.assign({
        enabled: false,
        name: "Guest",
        daysPresent: billingDays,
        weight: "1",
        responsibility: "direct",
        hostId: includedIds[0] || ""
      }, (options && options.guest) || {}),
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

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 8);
    return trimmed || "$";
  }

  function formatMoney(cents, compact) {
    return MODEL.formatMoney(cents, sanitizeCurrency(state.currency), compact);
  }

  function centsToInputValue(cents) {
    const value = BigInt(cents);
    return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
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
    if (!state.roommates.some((roommate) => roommate.id === selectedId)) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a roommate";
      placeholder.selected = true;
      placeholder.disabled = true;
      select.appendChild(placeholder);
    }
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

    state.expenses.forEach((expense) => {
      if (!expense.mode) expense.mode = expense.splitType === "custom" ? "custom" : "simple";
      if (!expense.usageDetails) expense.usageDetails = {};
      if (!expense.fixedCustomShares) expense.fixedCustomShares = {};
      if (!expense.guest) expense.guest = { enabled: false };
      if (!validIds.has(expense.paidBy)) expense.paidBy = "";
      expense.includedIds = expense.includedIds.filter((id) => validIds.has(id));
      Object.keys(expense.customShares).forEach((id) => {
        if (!validIds.has(id)) delete expense.customShares[id];
      });
      Object.keys(expense.fixedCustomShares).forEach((id) => {
        if (!validIds.has(id)) delete expense.fixedCustomShares[id];
      });
      Object.keys(expense.usageDetails).forEach((id) => {
        if (!validIds.has(id)) delete expense.usageDetails[id];
      });
      expense.includedIds.forEach((id) => {
        if (!expense.usageDetails[id]) {
          expense.usageDetails[id] = { daysPresent: expense.billingDays || "30", weight: "1" };
        }
      });
      if (!validIds.has(expense.guest.hostId) || !expense.includedIds.includes(expense.guest.hostId)) {
        expense.guest.hostId = expense.includedIds[0] || first;
      }
    });

    state.repayments = state.repayments.filter((repayment) => validIds.has(repayment.fromId) && validIds.has(repayment.toId));
    state.previousBalances = state.previousBalances.filter((balance) => validIds.has(balance.debtorId) && validIds.has(balance.creditorId));
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
        syncExpenseDependentConstraints(expense, card);
        renderExpenseValidation(expense, card);
        updateResults();
      });

      const paidBy = makeSelect(`expense-paid-by-${expense.id}`);
      populateRoommateSelect(paidBy, expense.paidBy);
      paidBy.addEventListener("change", () => {
        expense.paidBy = paidBy.value;
        renderExpenseValidation(expense, card);
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
      const fixedUsage = renderFixedUsage(expense, card);

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

      card.append(header, fields, included, splitType, customShares, fixedUsage, makeField("Note", note), validation);
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
          if (!expense.usageDetails[roommate.id]) {
            expense.usageDetails[roommate.id] = { daysPresent: expense.billingDays || "30", weight: "1" };
          }
        } else {
          expense.includedIds = expense.includedIds.filter((id) => id !== roommate.id);
          delete expense.customShares[roommate.id];
          delete expense.fixedCustomShares[roommate.id];
          delete expense.usageDetails[roommate.id];
          if (expense.guest.responsibility === "host" && expense.guest.hostId === roommate.id) {
            expense.guest.hostId = expense.includedIds[0] || "";
          }
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
    const wrap = document.createElement("div");
    wrap.className = "roommate-advanced-split";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "roommate-advanced-toggle";
    toggle.textContent = "Advanced split options";
    toggle.setAttribute("aria-expanded", String(Boolean(expense.advancedOpen)));
    toggle.setAttribute("aria-controls", `advanced-split-${expense.id}`);
    toggle.addEventListener("click", () => {
      expense.advancedOpen = !expense.advancedOpen;
      renderExpenses();
      const nextToggle = document.querySelector(`[aria-controls="advanced-split-${expense.id}"]`);
      if (nextToggle) nextToggle.focus();
    });
    wrap.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = `advanced-split-${expense.id}`;
    panel.className = "roommate-advanced-panel";
    panel.hidden = !expense.advancedOpen;

    const intro = document.createElement("p");
    intro.className = "roommate-field-hint";
    intro.textContent = "Keep Simple split for an ordinary equal bill. Use the other methods only when the household has agreed on different assumptions.";
    panel.appendChild(intro);

    const fieldset = document.createElement("fieldset");
    fieldset.className = "roommate-fieldset roommate-split-fieldset";
    const legend = document.createElement("legend");
    legend.textContent = "Calculation method";
    fieldset.appendChild(legend);

    const grid = document.createElement("div");
    grid.className = "roommate-segmented";

    [
      ["simple", "Simple split"],
      ["fixedUsage", "Fixed + usage"],
      ["custom", "Custom allocation"]
    ].forEach(([mode, labelText]) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `split-mode-${expense.id}`;
      input.value = mode;
      input.checked = expense.mode === mode;
      input.addEventListener("change", () => {
        expense.mode = mode;
        expense.splitType = mode === "custom" ? "custom" : "equal";
        if (mode === "custom") seedCustomShares(expense);
        if (mode === "fixedUsage") seedUsageDetails(expense);
        renderExpenses();
        updateResults();
        const nextInput = document.querySelector(`input[name="split-mode-${expense.id}"][value="${mode}"]`);
        if (nextInput) nextInput.focus();
      });

      const text = document.createElement("span");
      text.textContent = labelText;
      label.append(input, text);
      grid.appendChild(label);
    });

    fieldset.appendChild(grid);
    panel.appendChild(fieldset);
    wrap.appendChild(panel);
    return wrap;
  }

  function seedUsageDetails(expense) {
    const days = String(expense.billingDays || "30");
    expense.includedIds.forEach((id) => {
      if (!expense.usageDetails[id]) expense.usageDetails[id] = { daysPresent: days, weight: "1" };
    });
    if (!expense.guest.daysPresent) expense.guest.daysPresent = days;
    if (!expense.guest.weight) expense.guest.weight = "1";
  }

  function seedCustomShares(expense) {
    const amountCents = MODEL.parseMoney(expense.amount);
    const included = expense.includedIds.slice();
    if (!Number.isFinite(amountCents) || amountCents <= 0 || included.length === 0) return;

    const hasAnyShare = included.some((id) => String(expense.customShares[id] || "").trim());
    if (hasAnyShare) return;

    MODEL.allocateEqual(amountCents, included).forEach((row) => {
      expense.customShares[row.id] = centsToInputValue(row.cents);
    });
  }

  function syncExpenseDependentConstraints(expense, card) {
    if (!card) return;
    const fixedValue = card.querySelector(`#fixed-value-${expense.id}`);
    if (fixedValue && expense.fixedInputType !== "percent") {
      fixedValue.max = String(expense.amount || "");
    }
    const daysMax = String(expense.billingDays || "");
    card.querySelectorAll(`input[id^="usage-days-${expense.id}-"], #guest-days-${expense.id}`).forEach((input) => {
      input.max = daysMax;
    });
  }

  function renderCustomShares(expense, card) {
    const wrap = document.createElement("div");
    wrap.className = "roommate-custom-shares";
    if (expense.mode !== "custom") return wrap;

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

  function renderFixedUsage(expense, card) {
    const wrap = document.createElement("div");
    wrap.className = "roommate-fixed-usage";
    if (expense.mode !== "fixedUsage") return wrap;

    const explanation = document.createElement("p");
    explanation.className = "roommate-advanced-explanation";
    explanation.textContent = "Separate the unavoidable fixed part from the usage-based part. The usage portion is allocated using days present × agreed usage weight.";
    wrap.appendChild(explanation);

    const fixedGrid = document.createElement("div");
    fixedGrid.className = "roommate-advanced-grid";

    const fixedType = makeSelect(`fixed-input-type-${expense.id}`);
    [
      ["amount", "Fixed amount"],
      ["percent", "Fixed percentage"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = expense.fixedInputType === value;
      fixedType.appendChild(option);
    });
    fixedType.addEventListener("change", () => {
      expense.fixedInputType = fixedType.value;
      renderExpenses();
      updateResults();
      const nextSelect = document.querySelector(`#fixed-input-type-${expense.id}`);
      if (nextSelect) nextSelect.focus();
    });

    const fixedValue = makeInput(
      `fixed-value-${expense.id}`,
      expense.fixedInputType === "percent" ? expense.fixedPercent : expense.fixedAmount,
      "number"
    );
    fixedValue.min = "0";
    fixedValue.max = expense.fixedInputType === "percent" ? "100" : String(expense.amount || "");
    fixedValue.step = expense.fixedInputType === "percent" ? "0.0001" : "0.01";
    fixedValue.inputMode = "decimal";
    fixedValue.placeholder = expense.fixedInputType === "percent" ? "0–100" : "0.00";
    fixedValue.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
    fixedValue.addEventListener("input", () => {
      if (expense.fixedInputType === "percent") expense.fixedPercent = fixedValue.value;
      else expense.fixedAmount = fixedValue.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });

    const billingDays = makeInput(`billing-days-${expense.id}`, expense.billingDays, "number");
    billingDays.min = "1";
    billingDays.step = "1";
    billingDays.inputMode = "numeric";
    billingDays.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
    billingDays.addEventListener("input", () => {
      expense.billingDays = billingDays.value;
      syncExpenseDependentConstraints(expense, card);
      renderExpenseValidation(expense, card);
      updateResults();
    });

    fixedGrid.append(
      makeField("Fixed input", fixedType),
      makeField(expense.fixedInputType === "percent" ? "Fixed percentage" : "Fixed amount", fixedValue, "Zero and the full bill are both valid."),
      makeField("Days in billing period", billingDays)
    );
    wrap.appendChild(fixedGrid);

    const fixedRule = document.createElement("fieldset");
    fixedRule.className = "roommate-fieldset";
    const fixedLegend = document.createElement("legend");
    fixedLegend.textContent = "Fixed portion allocation";
    const fixedRuleGrid = document.createElement("div");
    fixedRuleGrid.className = "roommate-segmented";
    [["equal", "Equal"], ["custom", "Custom amounts"]].forEach(([value, textValue]) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `fixed-rule-${expense.id}`;
      input.value = value;
      input.checked = expense.fixedSplitType === value;
      input.addEventListener("change", () => {
        expense.fixedSplitType = value;
        if (value === "custom") seedFixedCustomShares(expense);
        renderExpenses();
        updateResults();
        const nextInput = document.querySelector(`input[name="fixed-rule-${expense.id}"][value="${value}"]`);
        if (nextInput) nextInput.focus();
      });
      const text = document.createElement("span");
      text.textContent = textValue;
      label.append(input, text);
      fixedRuleGrid.appendChild(label);
    });
    fixedRule.append(fixedLegend, fixedRuleGrid);
    wrap.appendChild(fixedRule);

    if (expense.fixedSplitType === "custom") {
      const customGrid = document.createElement("div");
      customGrid.className = "roommate-custom-grid roommate-fixed-custom-grid";
      expense.includedIds.forEach((id) => {
        const input = makeInput(`fixed-custom-${expense.id}-${id}`, expense.fixedCustomShares[id] || "", "number");
        input.min = "0";
        input.step = "0.01";
        input.inputMode = "decimal";
        input.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
        input.addEventListener("input", () => {
          expense.fixedCustomShares[id] = input.value;
          renderExpenseValidation(expense, card);
          updateResults();
        });
        customGrid.appendChild(makeField(`${getRoommateNameById(id)} fixed share`, input));
      });
      wrap.appendChild(customGrid);
    }

    const usageHeading = document.createElement("p");
    usageHeading.className = "roommate-mini-heading roommate-usage-heading";
    usageHeading.textContent = "Usage assumptions";
    wrap.appendChild(usageHeading);

    const usageGrid = document.createElement("div");
    usageGrid.className = "roommate-usage-grid";
    expense.includedIds.forEach((id) => {
      const detail = expense.usageDetails[id] || { daysPresent: expense.billingDays || "30", weight: "1" };
      expense.usageDetails[id] = detail;
      usageGrid.appendChild(renderUsagePerson(expense, id, getRoommateNameById(id), detail, card));
    });
    wrap.appendChild(usageGrid);

    const guestToggle = document.createElement("label");
    guestToggle.className = "roommate-check-row";
    const guestCheckbox = document.createElement("input");
    guestCheckbox.type = "checkbox";
    guestCheckbox.checked = Boolean(expense.guest.enabled);
    guestCheckbox.addEventListener("change", () => {
      expense.guest.enabled = guestCheckbox.checked;
      seedUsageDetails(expense);
      renderExpenses();
      updateResults();
      if (expense.guest.enabled) {
        const guestName = document.querySelector(`#guest-name-${expense.id}`);
        if (guestName) guestName.focus();
      }
    });
    const guestText = document.createElement("span");
    guestText.textContent = "Include a temporary occupant or long-staying guest for this bill";
    guestToggle.append(guestCheckbox, guestText);
    wrap.appendChild(guestToggle);

    if (expense.guest.enabled) wrap.appendChild(renderGuestFields(expense, card));

    const boundary = document.createElement("p");
    boundary.className = "roommate-field-hint roommate-assumption-note";
    boundary.textContent = "Days present and usage weights are agreed proxies, not meter readings. Fixed household costs may still apply during an absence.";
    wrap.appendChild(boundary);
    return wrap;
  }

  function deriveFixedCentsForUi(expense) {
    const total = MODEL.parseMoney(expense.amount);
    if (!Number.isFinite(total)) return NaN;
    return MODEL.deriveFixedCents(expense, total);
  }

  function seedFixedCustomShares(expense) {
    const fixedCents = deriveFixedCentsForUi(expense);
    if (!Number.isFinite(fixedCents) || !expense.includedIds.length) return;
    const hasValues = expense.includedIds.some((id) => String(expense.fixedCustomShares[id] || "").trim());
    if (hasValues) return;
    const rows = MODEL.allocateEqual(fixedCents, expense.includedIds);
    rows.forEach((row) => {
      expense.fixedCustomShares[row.id] = centsToInputValue(row.cents);
    });
  }

  function renderUsagePerson(expense, id, name, detail, card) {
    const group = document.createElement("fieldset");
    group.className = "roommate-usage-person";
    const legend = document.createElement("legend");
    legend.textContent = name;

    const days = makeInput(`usage-days-${expense.id}-${id}`, detail.daysPresent, "number");
    days.min = "0";
    days.max = expense.billingDays || "";
    days.step = "1";
    days.inputMode = "numeric";
    days.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
    days.addEventListener("input", () => {
      detail.daysPresent = days.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });

    const weight = makeInput(`usage-weight-${expense.id}-${id}`, detail.weight, "number");
    weight.min = "0";
    weight.step = "0.0001";
    weight.inputMode = "decimal";
    weight.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
    weight.addEventListener("input", () => {
      detail.weight = weight.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });

    const fields = document.createElement("div");
    fields.className = "roommate-usage-fields";
    fields.append(makeField("Days present", days), makeField("Usage weight", weight, "Default 1"));
    group.append(legend, fields);
    return group;
  }

  function renderGuestFields(expense, card) {
    const guest = expense.guest;
    const wrap = document.createElement("div");
    wrap.className = "roommate-guest-panel";
    const heading = document.createElement("p");
    heading.className = "roommate-mini-heading";
    heading.textContent = "Temporary occupant";

    const name = makeInput(`guest-name-${expense.id}`, guest.name, "text");
    name.maxLength = 40;
    name.addEventListener("input", () => {
      guest.name = name.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });
    const days = makeInput(`guest-days-${expense.id}`, guest.daysPresent, "number");
    days.min = "0";
    days.max = expense.billingDays || "";
    days.step = "1";
    days.addEventListener("input", () => {
      guest.daysPresent = days.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });
    const weight = makeInput(`guest-weight-${expense.id}`, guest.weight, "number");
    weight.min = "0";
    weight.step = "0.0001";
    weight.addEventListener("input", () => {
      guest.weight = weight.value;
      renderExpenseValidation(expense, card);
      updateResults();
    });
    [name, days, weight].forEach((input) => input.setAttribute("aria-describedby", `expense-validation-${expense.id}`));

    const responsibility = makeSelect(`guest-responsibility-${expense.id}`);
    [["direct", "Occupant pays directly"], ["host", "A host is responsible"]].forEach(([value, textValue]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = textValue;
      option.selected = guest.responsibility === value;
      responsibility.appendChild(option);
    });
    responsibility.addEventListener("change", () => {
      guest.responsibility = responsibility.value;
      renderExpenses();
      updateResults();
      const nextSelect = document.querySelector(`#guest-responsibility-${expense.id}`);
      if (nextSelect) nextSelect.focus();
    });

    const grid = document.createElement("div");
    grid.className = "roommate-advanced-grid";
    grid.append(
      makeField("Name or label", name),
      makeField("Days present", days),
      makeField("Usage weight", weight),
      makeField("Who is responsible", responsibility)
    );

    if (guest.responsibility === "host") {
      const host = makeSelect(`guest-host-${expense.id}`);
      expense.includedIds.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = getRoommateNameById(id);
        option.selected = guest.hostId === id;
        host.appendChild(option);
      });
      host.addEventListener("change", () => {
        guest.hostId = host.value;
        renderExpenseValidation(expense, card);
        updateResults();
      });
      grid.appendChild(makeField("Assigned host", host, "The guest share stays visible and is added to this roommate once."));
    }
    wrap.append(heading, grid);
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
    return getExpenseErrors(expense)
      .map((error) => error.message.replace(/\$/g, sanitizeCurrency(state.currency)))
      .join(" ");
  }

  function getExpenseErrors(expense) {
    return MODEL.validateExpense(expense, state.roommates);
  }

  function renderExpenseValidation(expense, card) {
    const validation = card && card.querySelector(`#expense-validation-${expense.id}`);
    if (!validation) return;
    const errors = getExpenseErrors(expense);
    const message = errors.map((error) => error.message.replace(/\$/g, sanitizeCurrency(state.currency))).join(" ");
    validation.textContent = message;
    const controls = card.querySelectorAll("input, select");
    controls.forEach((control) => control.setAttribute("aria-invalid", "false"));
    errors.forEach((error) => {
      let selectors = [];
      if (error.field === "amount") selectors = [`#expense-amount-${expense.id}`];
      if (error.field === "paidBy") selectors = [`#expense-paid-by-${expense.id}`];
      if (error.field === "included") selectors = [`input[id^="expense-included-${expense.id}-"]`];
      if (error.field === "customShares") selectors = [`input[id^="custom-share-${expense.id}-"]`];
      if (error.field === "fixedAmount" || error.field === "fixedPercent") selectors = [`#fixed-value-${expense.id}`];
      if (error.field === "billingDays") selectors = [`#billing-days-${expense.id}`];
      if (error.field === "fixedCustomShares") selectors = [`input[id^="fixed-custom-${expense.id}-"]`];
      if (error.field === "usage") selectors = [`input[id^="usage-days-${expense.id}-"]`, `input[id^="usage-weight-${expense.id}-"]`];
      if (error.field.startsWith("days-")) selectors = [`#usage-days-${expense.id}-${error.field.slice(5)}`];
      if (error.field.startsWith("weight-")) selectors = [`#usage-weight-${expense.id}-${error.field.slice(7)}`];
      if (error.field === "guestName") selectors = [`#guest-name-${expense.id}`];
      if (error.field === "guestDays") selectors = [`#guest-days-${expense.id}`];
      if (error.field === "guestWeight") selectors = [`#guest-weight-${expense.id}`];
      if (error.field === "guestHost") selectors = [`#guest-host-${expense.id}`];
      selectors.forEach((selector) => {
        card.querySelectorAll(selector).forEach((control) => {
          control.setAttribute("aria-invalid", "true");
          control.setAttribute("aria-describedby", `expense-validation-${expense.id}`);
        });
      });
    });
  }

  function validateAdjustment(row, type) {
    return MODEL.validateAdjustment(row, type, state.roommates);
  }

  function renderAdjustmentValidation(row, card, type) {
    const prefix = type === "repayment" ? "repayment" : "previous";
    const validation = card && card.querySelector(`#${prefix}-validation-${row.id}`);
    if (!validation) return;
    const errors = validateAdjustment(row, type);
    validation.textContent = errors.map((error) => error.message).join(" ");
    const amount = card.querySelector(`#${prefix}-amount-${row.id}`);
    const from = card.querySelector(type === "repayment" ? `#repayment-from-${row.id}` : `#previous-debtor-${row.id}`);
    const to = card.querySelector(type === "repayment" ? `#repayment-to-${row.id}` : `#previous-creditor-${row.id}`);
    [amount, from, to].forEach((control) => {
      if (control) control.setAttribute("aria-invalid", "false");
    });
    errors.forEach((error) => {
      const controls = error.field === "amount" ? [amount] : [from, to];
      controls.forEach((control) => {
        if (!control) return;
        control.setAttribute("aria-invalid", "true");
        control.setAttribute("aria-describedby", `${prefix}-validation-${row.id}`);
      });
    });
  }

  function calculate() {
    const raw = MODEL.calculate(state);
    const result = {
      raw,
      totalBills: raw.totalBillsCents,
      expenseCount: raw.expenseCount,
      roommateCount: raw.roommateCount,
      repaymentCount: raw.repaymentCount,
      repaymentTotal: raw.repaymentTotalCents,
      previousBalanceCount: raw.previousBalanceCount,
      previousBalanceTotal: raw.previousBalanceTotalCents,
      categories: raw.categories,
      bills: raw.bills,
      errors: raw.errors,
      adjustmentErrors: raw.adjustmentErrors,
      net: raw.participants.map((row) => ({
        id: row.id,
        name: row.name,
        kind: row.kind,
        paid: row.paidCents,
        fairShare: row.responsibilityCents,
        repaymentSent: row.repaymentSentCents,
        repaymentReceived: row.repaymentReceivedCents,
        previousOwed: row.previousOwedCents,
        previousOwedTo: row.previousOwedToCents,
        net: row.netCents
      })),
      settlements: raw.settlements.map((settlement) => ({
        from: settlement.from,
        to: settlement.to,
        amount: settlement.cents
      }))
    };
    return result;
  }

  function updateResults() {
    const result = calculate();
    renderSettlements(result);
    renderBillBreakdown(result);
    renderBalanceSummary(result);
    renderMonthlySummary(result);
    renderAssumptions(result);
    renderGeneratedMessage(result);
    renderDetailedSummary(result);
  }

  function renderBillBreakdown(result) {
    if (!els.billBreakdown) return;
    clearNode(els.billBreakdown);
    if (!result.bills.length) {
      appendEmpty(els.billBreakdown, "Add a valid bill to review its method and responsibility breakdown.");
      return;
    }

    result.bills.forEach((bill) => {
      const card = document.createElement("article");
      card.className = "roommate-bill-result-card";
      const heading = document.createElement("div");
      heading.className = "roommate-bill-result-header";
      const title = document.createElement("h5");
      title.textContent = bill.name;
      const total = document.createElement("strong");
      total.textContent = formatMoney(bill.amountCents);
      heading.append(title, total);

      const method = document.createElement("p");
      method.className = "roommate-bill-method";
      method.textContent = bill.methodLabel;
      card.append(heading, method);

      if (bill.mode === "fixedUsage") {
        const details = document.createElement("dl");
        details.className = "roommate-balance-details roommate-method-details";
        appendDefinition(details, "Fixed portion", `${formatMoney(bill.fixedCents)} (${bill.fixedRule.toLowerCase()})`);
        appendDefinition(details, "Usage portion", formatMoney(bill.usageCents));
        if (bill.billingDays != null) appendDefinition(details, "Billing period", `${bill.billingDays} days`);
        bill.participants.forEach((participant) => {
          const participantName = participant.kind === "guest"
            ? bill.guest.name
            : getRoommateNameById(participant.id);
          appendDefinition(
            details,
            `${participantName} usage`,
            `${participant.days} days × ${participant.weightScaled / MODEL.WEIGHT_SCALE} = ${participant.units / MODEL.WEIGHT_SCALE} units`
          );
        });
        if (bill.guest) {
          const assigned = bill.guest.responsibility === "host"
            ? `assigned to ${getRoommateNameById(bill.guest.hostId)}`
            : "pays directly";
          appendDefinition(details, `${bill.guest.name} usage share`, `${formatMoney(bill.guest.cents)}; ${assigned}`);
        }
        card.appendChild(details);
      }

      const shares = document.createElement("dl");
      shares.className = "roommate-balance-details roommate-responsibility-details";
      bill.responsibilityRows.forEach((share) => {
        const participant = result.raw.participants.find((row) => row.id === share.id);
        appendDefinition(shares, `${participant ? participant.name : "Someone"} responsibility`, formatMoney(share.cents));
      });
      card.appendChild(shares);
      els.billBreakdown.appendChild(card);
    });
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

      if (row.net > 0) {
        status.textContent = `Gets back ${formatMoney(row.net)}`;
        status.classList.add("is-positive");
      } else if (row.net < 0) {
        status.textContent = `Owes ${formatMoney(Math.abs(row.net))}`;
        status.classList.add("is-negative");
      } else {
        status.textContent = "Settled";
      }

      header.append(name, status);

      const list = document.createElement("dl");
      list.className = "roommate-balance-details";
      appendDefinition(list, "Total paid", formatMoney(row.paid));
      appendDefinition(list, "Total responsibility", formatMoney(row.fairShare));
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
    if (row.previousOwed > 0) parts.push(`owed ${formatMoney(row.previousOwed)}`);
    if (row.previousOwedTo > 0) parts.push(`was owed ${formatMoney(row.previousOwedTo)}`);
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

  function renderAssumptions(result) {
    if (!els.assumptions) return;
    clearNode(els.assumptions);
    const paragraphs = [];
    const hasSimple = result.bills.some((bill) => bill.mode === "simple");
    const hasCustom = result.bills.some((bill) => bill.mode === "custom");
    const hasFixed = result.bills.some((bill) => bill.mode === "fixedUsage");
    const hasUsage = result.bills.some((bill) => bill.mode === "fixedUsage" && bill.usageCents > 0);
    if (hasSimple) paragraphs.push("Simple split divides each valid bill equally among the roommates included in that bill.");
    if (hasCustom) paragraphs.push("Custom allocation uses the exact amounts the household entered.");
    if (hasFixed && !hasUsage) paragraphs.push("The selected fixed portion uses the household’s agreed fixed-allocation rule; inactive usage inputs do not affect the result.");
    if (hasUsage) {
      paragraphs.push("To handle an absence transparently, separate the unavoidable fixed part from the usage-based part. Apply the household’s agreed rule to the fixed portion, then allocate only the usage portion using days present and any agreed usage weights.");
      paragraphs.push("Days present and usage weights are agreed estimates. They do not prove exact consumption or determine legal responsibility for a bill.");
    }
    paragraphs.push(hasFixed
      ? "No method is universally fair. Fixed costs may remain payable during an absence, and formal lease, deposit, or rental disputes need an appropriate external source."
      : "This is an agreed household estimate. It does not determine lease, contract, deposit, or legal responsibility.");
    paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      els.assumptions.appendChild(paragraph);
    });
  }

  function renderGeneratedMessage(result) {
    state.roommateMessage = buildRoommateMessage(result, state.messageTone);
    els.generatedMessage.textContent = state.roommateMessage;
  }

  function renderDetailedSummary(result) {
    state.detailedSummary = MODEL.buildCopySummary(result.raw);
    if (els.detailedSummary) els.detailedSummary.textContent = state.detailedSummary;
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
      expense.usageDetails[roommate.id] = {
        daysPresent: expense.billingDays || "30",
        weight: "1"
      };
    });
    render();
    const input = document.querySelector(`#roommate-name-${roommate.id}`);
    if (input) input.focus();
  }

  function removeRoommate(id) {
    if (state.roommates.length <= 2) {
      els.roommateMessage.textContent = "Add at least two roommates to split household costs.";
      return;
    }
    state.roommates = state.roommates.filter((roommate) => roommate.id !== id);
    state.expenses.forEach((expense) => {
      if (expense.paidBy === id) expense.paidBy = "";
    });
    state.repayments = state.repayments.filter((repayment) => repayment.fromId !== id && repayment.toId !== id);
    state.previousBalances = state.previousBalances.filter((balance) => balance.debtorId !== id && balance.creditorId !== id);
    render();
    const addButton = document.querySelector('[data-action="add-roommate"]');
    if (addButton) addButton.focus();
  }

  function addExpense() {
    if (state.expenses.length >= MAX_EXPENSES) return;
    const expense = createExpense({
      description: "",
      category: "Other",
      amount: "",
      paidBy: state.roommates[0] ? state.roommates[0].id : ""
    });
    state.expenses.push(expense);
    render();
    const input = document.querySelector(`#expense-description-${expense.id}`);
    if (input) input.focus();
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter((expense) => expense.id !== id);
    if (state.expenses.length === 0) {
      state.expenses.push(createExpense({
        description: "",
        category: "Other",
        amount: "",
        paidBy: state.roommates[0] ? state.roommates[0].id : ""
      }));
    }
    render();
    const addButton = document.querySelector('[data-action="add-expense"]');
    if (addButton) addButton.focus();
  }

  function addRepayment() {
    if (state.repayments.length >= MAX_ADJUSTMENTS) return;
    const repayment = createRepayment();
    state.repayments.push(repayment);
    render();
    const input = document.querySelector(`#repayment-amount-${repayment.id}`);
    if (input) input.focus();
  }

  function removeRepayment(id) {
    state.repayments = state.repayments.filter((repayment) => repayment.id !== id);
    render();
    const addButton = document.querySelector('[data-action="add-repayment"]');
    if (addButton) addButton.focus();
  }

  function addPreviousBalance() {
    if (state.previousBalances.length >= MAX_ADJUSTMENTS) return;
    const balance = createPreviousBalance();
    state.previousBalances.push(balance);
    render();
    const input = document.querySelector(`#previous-amount-${balance.id}`);
    if (input) input.focus();
  }

  function removePreviousBalance(id) {
    state.previousBalances = state.previousBalances.filter((balance) => balance.id !== id);
    render();
    const addButton = document.querySelector('[data-action="add-previous-balance"]');
    if (addButton) addButton.focus();
  }

  function loadExample() {
    state.currency = "$";
    state.currencyMode = "$";
    state.customCurrency = "";
    state.billingPeriod = "Example month";
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
    syncBillingPeriod();
    render();
  }

  function startBlank() {
    state.currency = "$";
    state.currencyMode = "$";
    state.customCurrency = "";
    state.billingPeriod = "";
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
    syncBillingPeriod();
    render();
  }

  function loadPreset(name) {
    state.currency = "$";
    state.currencyMode = "$";
    state.customCurrency = "";
    state.billingPeriod = "Example month";
    state.nextRoommateNumber = 1;
    state.roommates = [createRoommate("Alex"), createRoommate("Maya"), createRoommate("Sam")];
    state.nextRoommateNumber = 4;
    const alex = state.roommates[0].id;
    const maya = state.roommates[1].id;
    const sam = state.roommates[2].id;
    const all = [alex, maya, sam];
    const fullUsage = {
      [alex]: { daysPresent: "30", weight: "1" },
      [maya]: { daysPresent: "30", weight: "1" },
      [sam]: { daysPresent: "30", weight: "1" }
    };

    if (name === "away") {
      state.expenses = [createExpense({
        description: "Electricity",
        category: "Electricity",
        amount: "120",
        paidBy: alex,
        includedIds: all,
        mode: "fixedUsage",
        advancedOpen: true,
        fixedAmount: "30",
        billingDays: "30",
        usageDetails: Object.assign({}, fullUsage, {
          [sam]: { daysPresent: "10", weight: "1" }
        })
      })];
    } else if (name === "fixed-usage") {
      state.expenses = [
        createExpense({ description: "Broadband", category: "Internet", amount: "60", paidBy: maya, includedIds: all }),
        createExpense({
          description: "Electricity",
          category: "Electricity",
          amount: "150",
          paidBy: alex,
          includedIds: all,
          mode: "fixedUsage",
          advancedOpen: true,
          fixedInputType: "percent",
          fixedPercent: "20",
          billingDays: "30",
          usageDetails: fullUsage
        })
      ];
    } else if (name === "guest") {
      state.expenses = [createExpense({
        description: "Water and electricity",
        category: "Electricity",
        amount: "160",
        paidBy: alex,
        includedIds: all,
        mode: "fixedUsage",
        advancedOpen: true,
        fixedAmount: "40",
        billingDays: "30",
        usageDetails: fullUsage,
        guest: {
          enabled: true,
          name: "Lee",
          daysPresent: "20",
          weight: "1",
          responsibility: "host",
          hostId: maya
        }
      })];
    } else if (name === "weighted") {
      state.expenses = [createExpense({
        description: "Electricity",
        category: "Electricity",
        amount: "150",
        paidBy: maya,
        includedIds: all,
        mode: "fixedUsage",
        advancedOpen: true,
        fixedAmount: "30",
        billingDays: "30",
        usageDetails: Object.assign({}, fullUsage, {
          [alex]: { daysPresent: "30", weight: "1.5" }
        })
      })];
    } else {
      state.expenses = [createExpense({
        description: "Internet",
        category: "Internet",
        amount: "60",
        paidBy: alex,
        includedIds: all
      })];
    }
    state.repayments = [];
    state.previousBalances = [];
    syncCurrencyControls();
    syncBillingPeriod();
    render();
    const calculator = document.querySelector("#calculator");
    if (calculator) calculator.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function syncBillingPeriod() {
    if (els.billingPeriod) els.billingPeriod.value = state.billingPeriod;
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
      if (action === "copy-detailed-summary") copyText(state.detailedSummary, els.detailedCopyStatus);
      if (action === "load-preset") loadPreset(target.getAttribute("data-preset") || "ordinary");
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
    els.billingPeriod.addEventListener("input", () => {
      state.billingPeriod = els.billingPeriod.value;
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
    els.billBreakdown = document.querySelector("[data-bill-breakdown]");
    els.assumptions = document.querySelector("[data-assumptions]");
    els.generatedMessage = document.querySelector("[data-generated-message]");
    els.generatedCopyStatus = document.querySelector("[data-generated-copy-status]");
    els.detailedSummary = document.querySelector("[data-detailed-summary]");
    els.detailedCopyStatus = document.querySelector("[data-detailed-copy-status]");
    els.currencyPreset = document.querySelector("#roommate-currency");
    els.currencyCustom = document.querySelector("#roommate-currency-custom");
    els.billingPeriod = document.querySelector("#roommate-billing-period");
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

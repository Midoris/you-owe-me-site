(function () {
  "use strict";

  const EPSILON = 0.005;
  const MAX_PEOPLE = 12;
  const MAX_EXPENSES = 30;
  const CANONICAL_CALCULATOR_URL = "https://you-owe-me.com/tools/split-expense-calculator/";
  const SPLIT_CALCULATOR_EVENT = "youoweme:split-calculator-event";

  const state = {
    currency: "$",
    people: [],
    expenses: [],
    nextPersonNumber: 1,
    nextExpenseNumber: 1,
    message: ""
  };

  const els = {};
  let hasExplicitInteraction = false;
  let resultReadyEmitted = false;

  function makeId(prefix) {
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function createPerson(name) {
    return {
      id: makeId("p"),
      name: name || `Person ${state.nextPersonNumber++}`
    };
  }

  function createExpense(description, amount, paidBy, includedPeople) {
    return {
      id: makeId("e"),
      description: description || "",
      amount: amount || "",
      paidBy,
      includedPeople: includedPeople ? includedPeople.slice() : state.people.map((person) => person.id)
    };
  }

  function getPersonName(person, index) {
    const name = (person && person.name ? person.name : "").trim();
    return name || `Person ${index + 1}`;
  }

  function getPersonNameById(id) {
    const index = state.people.findIndex((person) => person.id === id);
    if (index === -1) return "Someone";
    return getPersonName(state.people[index], index);
  }

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 6);
    return trimmed || "$";
  }

  function parseAmount(value) {
    if (typeof value === "number") return value;
    const normalized = String(value || "").trim().replace(/,/g, "");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function roundMoney(value) {
    if (Math.abs(value) < EPSILON) return 0;
    return Math.round(value * 100) / 100;
  }

  function formatNumber(value) {
    const rounded = roundMoney(value);
    if (Number.isInteger(rounded)) return String(rounded);
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatMoney(value) {
    const symbol = sanitizeCurrency(state.currency);
    const space = symbol.length > 1 ? " " : "";
    return `${symbol}${space}${formatNumber(value)}`;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text));
  }

  function makeField(labelText, input) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = labelText;
    wrap.append(label, input);
    return wrap;
  }

  function makeInput(id, value, type) {
    const input = document.createElement("input");
    input.id = id;
    input.className = "calculator-input";
    input.type = type || "text";
    input.value = value;
    input.autocomplete = "off";
    return input;
  }

  function render() {
    normalizeState();
    renderPeople();
    renderExpenses();
    renderResults(calculate());
  }

  function normalizeState() {
    const validIds = new Set(state.people.map((person) => person.id));
    state.expenses.forEach((expense) => {
      if (!validIds.has(expense.paidBy)) {
        expense.paidBy = state.people[0] ? state.people[0].id : "";
      }
      expense.includedPeople = expense.includedPeople.filter((id) => validIds.has(id));
    });
  }

  function renderPeople() {
    clearNode(els.peopleList);
    els.peopleMessage.textContent = state.message || "";

    state.people.forEach((person, index) => {
      const row = document.createElement("div");
      row.className = "person-row";

      const input = makeInput(`person-${person.id}`, person.name, "text");
      input.maxLength = 40;
      input.addEventListener("input", () => {
        person.name = input.value;
        state.message = "";
        normalizeState();
        renderExpenses();
        renderResults(calculate());
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-action";
      remove.setAttribute("aria-label", `Remove ${getPersonName(person, index)}`);
      remove.textContent = "Remove";
      remove.addEventListener("click", () => removePerson(person.id));

      row.append(makeField(`Person ${index + 1}`, input), remove);
      els.peopleList.appendChild(row);
    });
  }

  function renderExpenses() {
    clearNode(els.expensesList);

    state.expenses.forEach((expense, expenseIndex) => {
      const card = document.createElement("article");
      card.className = "expense-card";

      const header = document.createElement("div");
      header.className = "expense-card-header";
      const title = document.createElement("h4");
      title.className = "expense-card-title";
      title.textContent = `Expense ${expenseIndex + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-action";
      remove.setAttribute("aria-label", `Remove expense ${expense.description || expenseIndex + 1}`);
      remove.textContent = "Remove";
      remove.addEventListener("click", () => removeExpense(expense.id));
      header.append(title, remove);

      const fields = document.createElement("div");
      fields.className = "expense-fields";

      const description = makeInput(`description-${expense.id}`, expense.description, "text");
      description.placeholder = "Dinner, groceries, rent, taxi...";
      description.maxLength = 70;
      description.addEventListener("input", () => {
        expense.description = description.value;
        renderResults(calculate());
      });

      const amount = makeInput(`amount-${expense.id}`, expense.amount, "number");
      amount.min = "0";
      amount.step = "0.01";
      amount.inputMode = "decimal";
      amount.addEventListener("input", () => {
        expense.amount = amount.value;
        renderResults(calculate());
        renderExpenseValidation(expense, card);
      });

      const select = document.createElement("select");
      select.id = `paid-${expense.id}`;
      select.className = "calculator-select";
      state.people.forEach((person, index) => {
        const option = document.createElement("option");
        option.value = person.id;
        option.textContent = getPersonName(person, index);
        option.selected = person.id === expense.paidBy;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        expense.paidBy = select.value;
        renderResults(calculate());
      });

      fields.append(
        makeField("Description", description),
        makeField("Amount", amount),
        makeField("Paid by", select)
      );

      const included = document.createElement("fieldset");
      included.className = "included-people";
      const legend = document.createElement("legend");
      legend.textContent = "Split between / included people";
      included.appendChild(legend);

      const checkboxGrid = document.createElement("div");
      checkboxGrid.className = "checkbox-grid";
      state.people.forEach((person, index) => {
        const checkboxId = `included-${expense.id}-${person.id}`;
        const label = document.createElement("label");
        label.className = "checkbox-pill";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = checkboxId;
        checkbox.checked = expense.includedPeople.includes(person.id);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            if (!expense.includedPeople.includes(person.id)) expense.includedPeople.push(person.id);
          } else {
            expense.includedPeople = expense.includedPeople.filter((id) => id !== person.id);
          }
          renderResults(calculate());
          renderExpenseValidation(expense, card);
        });
        const text = document.createElement("span");
        text.textContent = getPersonName(person, index);
        label.append(checkbox, text);
        checkboxGrid.appendChild(label);
      });
      included.appendChild(checkboxGrid);

      const splitType = document.createElement("div");
      splitType.className = "split-type";
      const splitLabel = document.createElement("span");
      splitLabel.className = "split-type-label";
      splitLabel.textContent = "Split type";
      const splitValue = document.createElement("span");
      splitValue.className = "split-type-value";
      splitValue.textContent = "Equal";
      splitType.append(splitLabel, splitValue);

      const validation = document.createElement("p");
      validation.className = "expense-validation";
      validation.id = `expense-validation-${expense.id}`;
      validation.setAttribute("aria-live", "polite");

      card.append(header, fields, included, splitType, validation);
      els.expensesList.appendChild(card);
      renderExpenseValidation(expense, card);
    });
  }

  function renderExpenseValidation(expense, card) {
    const validation = card.querySelector(".expense-validation");
    if (!validation) return;
    const amount = parseAmount(expense.amount);
    let message = "";
    if (String(expense.amount || "").trim() && amount <= 0) {
      message = "Enter an amount greater than zero.";
    } else if (amount > 0 && !state.people.some((person) => person.id === expense.paidBy)) {
      message = "Choose who paid for this expense.";
    } else if (amount > 0 && expense.includedPeople.length === 0) {
      message = "Select at least one person to share this expense.";
    }
    validation.textContent = message;
  }

  function calculate() {
    const people = state.people;
    const paid = new Map();
    const share = new Map();
    people.forEach((person) => {
      paid.set(person.id, 0);
      share.set(person.id, 0);
    });

    let total = 0;
    let validCount = 0;

    state.expenses.forEach((expense) => {
      const amount = parseAmount(expense.amount);
      const paidByIsValid = paid.has(expense.paidBy);
      const included = expense.includedPeople.filter((id) => share.has(id));
      if (amount <= 0 || !paidByIsValid || included.length === 0) return;
      total += amount;
      validCount += 1;
      paid.set(expense.paidBy, paid.get(expense.paidBy) + amount);
      const sharePerPerson = amount / included.length;
      included.forEach((id) => {
        share.set(id, share.get(id) + sharePerPerson);
      });
    });

    const net = people.map((person, index) => {
      const personPaid = roundMoney(paid.get(person.id) || 0);
      const personShare = roundMoney(share.get(person.id) || 0);
      return {
        id: person.id,
        name: getPersonName(person, index),
        paid: personPaid,
        share: personShare,
        net: roundMoney(personPaid - personShare)
      };
    });

    return {
      total: roundMoney(total),
      validCount,
      peopleCount: people.length,
      net,
      transfers: settle(net)
    };
  }

  function settle(netRows) {
    const creditors = netRows
      .filter((row) => row.net > EPSILON)
      .map((row) => ({ id: row.id, name: row.name, amount: row.net }))
      .sort((a, b) => b.amount - a.amount);
    const debtors = netRows
      .filter((row) => row.net < -EPSILON)
      .map((row) => ({ id: row.id, name: row.name, amount: -row.net }))
      .sort((a, b) => b.amount - a.amount);

    const transfers = [];
    let creditorIndex = 0;

    debtors.forEach((debtor) => {
      while (debtor.amount > EPSILON && creditorIndex < creditors.length) {
        const creditor = creditors[creditorIndex];
        const payment = roundMoney(Math.min(debtor.amount, creditor.amount));
        if (payment <= EPSILON) break;
        transfers.push({
          from: debtor.name,
          to: creditor.name,
          amount: payment
        });
        debtor.amount = roundMoney(debtor.amount - payment);
        creditor.amount = roundMoney(creditor.amount - payment);
        if (creditor.amount <= EPSILON) creditorIndex += 1;
      }
    });

    return transfers;
  }

  function renderResults(result) {
    renderSummary(result);
    renderMoneyRows(els.paid, result.net.map((row) => [`${row.name} paid`, row.paid]));
    renderMoneyRows(els.share, result.net.map((row) => [`${row.name}'s share`, row.share]));
    renderNetRows(result);
    renderSettlement(result);
    renderResultActions(result);
  }

  function hasValidResult(result) {
    return result.validCount > 0 && result.peopleCount > 0;
  }

  function renderResultActions(result) {
    if (result.transfers.length > 0) {
      els.resultAppTitle.textContent = "Keep track until everyone has paid";
      els.resultAppMessage.textContent = "Record repayments and new shared costs in You Owe Me, so you always know what’s still owed.";
    } else {
      els.resultAppTitle.textContent = "Keep future shared costs in one place";
      els.resultAppMessage.textContent = "Use You Owe Me to record the next shared expense and any repayments, with a clear balance for each person.";
    }
    const shouldShow = hasExplicitInteraction && hasValidResult(result);
    els.resultActions.hidden = !shouldShow;
    if (shouldShow) emitResultReadyOnce();
  }

  function renderSummary(result) {
    clearNode(els.summary);
    appendResultItem(els.summary, "Total expenses", formatMoney(result.total));
    appendResultItem(els.summary, "People", String(result.peopleCount));
    appendResultItem(els.summary, "Expenses included", String(result.validCount));
  }

  function renderMoneyRows(container, rows) {
    clearNode(container);
    rows.forEach(([label, value]) => appendResultItem(container, label, formatMoney(value)));
  }

  function renderNetRows(result) {
    clearNode(els.net);
    result.net.forEach((row) => {
      let label = `${row.name} is settled`;
      let value = "";
      if (row.net > EPSILON) {
        label = `${row.name} should receive`;
        value = formatMoney(row.net);
      } else if (row.net < -EPSILON) {
        label = `${row.name} owes`;
        value = formatMoney(Math.abs(row.net));
      }
      appendResultItem(els.net, label, value);
    });
  }

  function renderSettlement(result) {
    clearNode(els.settlement);
    if (result.validCount === 0) {
      appendEmpty(els.settlement, "Add an expense to see who owes whom.");
      return;
    }
    if (result.transfers.length === 0) {
      appendEmpty(els.settlement, "Everyone is settled.");
      return;
    }
    result.transfers.forEach((transfer) => {
      const item = document.createElement("div");
      item.className = "settlement-item";
      item.textContent = `${transfer.from} owes ${transfer.to} ${formatMoney(transfer.amount)}`;
      els.settlement.appendChild(item);
    });
  }

  function appendResultItem(container, label, value) {
    const item = document.createElement("div");
    item.className = "result-item";
    const left = document.createElement("span");
    left.textContent = label;
    const right = document.createElement("strong");
    right.textContent = value;
    item.append(left, right);
    container.appendChild(item);
  }

  function appendEmpty(container, text) {
    const item = document.createElement("p");
    item.className = "empty-result";
    item.textContent = text;
    container.appendChild(item);
  }

  function addPerson() {
    if (state.people.length >= MAX_PEOPLE) {
      state.message = "You can add up to 12 people.";
      render();
      return;
    }
    const person = createPerson();
    state.people.push(person);
    state.expenses.forEach((expense) => {
      expense.includedPeople.push(person.id);
    });
    state.message = "";
    render();
  }

  function removePerson(id) {
    if (state.people.length <= 2) {
      state.message = "Add at least two people to split an expense.";
      renderPeople();
      return;
    }
    state.people = state.people.filter((person) => person.id !== id);
    state.expenses.forEach((expense) => {
      expense.includedPeople = expense.includedPeople.filter((personId) => personId !== id);
      if (expense.paidBy === id) {
        expense.paidBy = state.people[0] ? state.people[0].id : "";
      }
    });
    state.message = "";
    render();
  }

  function addExpense() {
    if (state.expenses.length >= MAX_EXPENSES) {
      state.message = "You can add up to 30 expenses.";
      renderPeople();
      return;
    }
    state.expenses.push(createExpense("", "", state.people[0] ? state.people[0].id : ""));
    render();
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter((expense) => expense.id !== id);
    if (state.expenses.length === 0) {
      state.expenses.push(createExpense("", "", state.people[0] ? state.people[0].id : ""));
    }
    render();
  }

  function setInitialState() {
    state.currency = "$";
    state.nextPersonNumber = 1;
    state.nextExpenseNumber = 1;
    state.people = [createPerson("Person 1"), createPerson("Person 2"), createPerson("Person 3")];
    state.nextPersonNumber = 4;
    state.expenses = [
      createExpense("Dinner", "90", state.people[0].id, state.people.map((person) => person.id))
    ];
    state.message = "";
  }

  function useExample() {
    hasExplicitInteraction = true;
    state.currency = "$";
    state.nextPersonNumber = 1;
    state.people = [createPerson("Alex"), createPerson("Mia"), createPerson("Sam")];
    const alex = state.people[0].id;
    const mia = state.people[1].id;
    const sam = state.people[2].id;
    state.expenses = [
      createExpense("Groceries", "90", alex, [alex, mia, sam]),
      createExpense("Dinner", "60", mia, [alex, mia, sam]),
      createExpense("Taxi", "30", sam, [alex, sam])
    ];
    state.message = "";
    els.currency.value = state.currency;
    render();
  }

  function clearAll() {
    hasExplicitInteraction = false;
    setInitialState();
    state.expenses[0].description = "";
    state.expenses[0].amount = "";
    els.currency.value = state.currency;
    render();
  }

  function buildSummaryText(result) {
    if (result.validCount === 0) return "";
    const lines = [];
    lines.push("Shared expense summary", "");
    lines.push(`Total shared expenses: ${formatMoney(result.total)}`, "");
    lines.push("Paid:");
    result.net.forEach((row) => lines.push(`${row.name} paid ${formatMoney(row.paid)}`));
    lines.push("", "Fair share:");
    result.net.forEach((row) => lines.push(`${row.name}'s share: ${formatMoney(row.share)}`));
    lines.push("", "Settlement:");
    if (result.transfers.length === 0) {
      lines.push("Everyone is settled.");
    } else {
      result.transfers.forEach((transfer) => {
        lines.push(`${transfer.from} owes ${transfer.to} ${formatMoney(transfer.amount)}`);
      });
    }
    lines.push("", `Calculate your own split: ${CANONICAL_CALCULATOR_URL}`);
    return lines.join("\n");
  }

  function dispatchCalculatorEvent(eventName) {
    window.dispatchEvent(new CustomEvent(SPLIT_CALCULATOR_EVENT, {
      detail: { eventName }
    }));
  }

  function emitResultReadyOnce() {
    if (resultReadyEmitted) return;
    resultReadyEmitted = true;
    dispatchCalculatorEvent("split_result_ready");
  }

  async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return copyTextWithDocumentFallback(text);
    }
  }

  function copyTextWithDocumentFallback(text) {
    let textarea;
    try {
      textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      return document.execCommand("copy");
    } catch (error) {
      return false;
    } finally {
      if (textarea && textarea.parentNode) textarea.parentNode.removeChild(textarea);
    }
  }

  function getCurrentSummary() {
    const result = calculate();
    return hasValidResult(result) ? buildSummaryText(result) : "";
  }

  async function copySummary() {
    const text = getCurrentSummary();
    if (!text) {
      setActionStatus("Add an expense before copying a summary.");
      return;
    }

    els.copySummary.disabled = true;
    try {
      const copied = await copyTextToClipboard(text);
      if (!copied) {
        setActionStatus("Couldn’t copy the result.");
        return;
      }
      setActionStatus("Copied summary and calculator link.");
      dispatchCalculatorEvent("split_summary_copied");
    } finally {
      els.copySummary.disabled = false;
    }
  }

  async function shareSummary() {
    if (!els.shareSummary || typeof navigator.share !== "function") return;

    const text = getCurrentSummary();
    if (!text) {
      setActionStatus("Add an expense before sharing a summary.");
      return;
    }

    els.shareSummary.disabled = true;
    setActionStatus("");
    try {
      await navigator.share({
        title: "Shared expense summary",
        text,
        url: CANONICAL_CALCULATOR_URL
      });
      setActionStatus("Shared result.");
      dispatchCalculatorEvent("split_summary_shared");
    } catch (error) {
      if (error && error.name === "AbortError") return;

      const copied = await copyTextToClipboard(text);
      if (copied) {
        setActionStatus("Sharing wasn’t available, so the result was copied.");
        dispatchCalculatorEvent("split_share_fallback_copied");
      } else {
        setActionStatus("Couldn’t share or copy the result.");
      }
    } finally {
      els.shareSummary.disabled = false;
    }
  }

  function setActionStatus(text) {
    els.copyStatus.textContent = text;
    window.clearTimeout(setActionStatus.timer);
    if (!text) return;
    setActionStatus.timer = window.setTimeout(() => {
      if (els.copyStatus.textContent === text) els.copyStatus.textContent = "";
    }, 2600);
  }

  function bindEvents() {
    els.currency.addEventListener("input", () => {
      state.currency = sanitizeCurrency(els.currency.value);
      renderResults(calculate());
    });

    document.addEventListener("click", (event) => {
      const action = event.target && event.target.getAttribute("data-action");
      if (!action) return;
      if (action === "add-person") addPerson();
      if (action === "add-expense") addExpense();
      if (action === "use-example") useExample();
      if (action === "clear-all") clearAll();
      if (action === "copy-summary") copySummary();
      if (action === "share-summary") shareSummary();
    });
  }

  function configureShareAction() {
    if (!els.shareSummary) return;
    els.shareSummary.hidden = typeof navigator.share !== "function";
  }

  function getRequiredElement(selector) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Split expense calculator is missing ${selector}.`);
    return element;
  }

  function bindExplicitInteractionGate(root) {
    const markInteraction = function () {
      hasExplicitInteraction = true;
    };

    root.addEventListener("input", markInteraction, true);
    root.addEventListener("change", markInteraction, true);
    root.addEventListener("click", function (event) {
      const control = event.target && event.target.closest("button, input, select, textarea");
      if (control && root.contains(control)) markInteraction();
    }, true);
  }

  function init() {
    const root = document.querySelector(".split-calculator");
    if (!root) return;
    els.currency = getRequiredElement("#currency-symbol");
    els.peopleList = getRequiredElement("[data-people-list]");
    els.peopleMessage = getRequiredElement("#people-message");
    els.expensesList = getRequiredElement("[data-expenses-list]");
    els.summary = getRequiredElement("[data-summary]");
    els.paid = getRequiredElement("[data-paid]");
    els.share = getRequiredElement("[data-share]");
    els.net = getRequiredElement("[data-net]");
    els.settlement = getRequiredElement("[data-settlement]");
    els.copyStatus = getRequiredElement("[data-copy-status]");
    els.resultActions = getRequiredElement("[data-result-actions]");
    els.resultAppTitle = getRequiredElement("[data-result-app-title]");
    els.resultAppMessage = getRequiredElement("[data-result-app-message]");
    els.copySummary = getRequiredElement('[data-action="copy-summary"]');
    els.shareSummary = document.querySelector('[data-action="share-summary"]');

    setInitialState();
    els.currency.value = state.currency;
    configureShareAction();
    bindExplicitInteractionGate(root);
    bindEvents();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

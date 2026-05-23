(function () {
  "use strict";

  const MAX_TRANSACTIONS = 40;

  const state = {
    currency: "$",
    person1: "You",
    person2: "Alex",
    startingDirection: "none",
    startingAmount: "",
    transactions: []
  };

  const els = {};

  function makeId() {
    return `rb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 6);
    return trimmed || "$";
  }

  function cleanName(value, fallback) {
    const trimmed = String(value || "").trim();
    return trimmed || fallback;
  }

  function getName(personKey) {
    return personKey === "p1" ? cleanName(state.person1, "You") : cleanName(state.person2, "Alex");
  }

  function isYou(personKey) {
    return getName(personKey).toLowerCase() === "you";
  }

  function subjectName(personKey) {
    return isYou(personKey) ? "You" : getName(personKey);
  }

  function objectName(personKey) {
    return isYou(personKey) ? "you" : getName(personKey);
  }

  function possessiveName(personKey) {
    if (isYou(personKey)) return "Your";
    const name = getName(personKey);
    return name.endsWith("s") ? `${name}'` : `${name}'s`;
  }

  function lowerPossessiveName(personKey) {
    if (isYou(personKey)) return "your";
    const name = getName(personKey);
    return name.endsWith("s") ? `${name}'` : `${name}'s`;
  }

  function owesVerb(personKey) {
    return isYou(personKey) ? "owe" : "owes";
  }

  function otherPerson(personKey) {
    return personKey === "p1" ? "p2" : "p1";
  }

  function parseAmountToCents(value) {
    const normalized = String(value || "").trim().replace(/,/g, "");
    if (!normalized) return null;
    if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
    const parts = normalized.split(".");
    const dollars = Number(parts[0] || "0");
    const cents = Number(((parts[1] || "") + "00").slice(0, 2));
    const total = dollars * 100 + cents;
    return total > 0 ? total : null;
  }

  function parsePercent(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return null;
    const number = Number(normalized);
    if (!Number.isFinite(number) || number < 0 || number > 100) return null;
    return number;
  }

  function formatMoney(cents) {
    const symbol = sanitizeCurrency(state.currency);
    const space = symbol.length > 1 ? " " : "";
    const amount = (Math.abs(cents) / 100).toFixed(2);
    return `${symbol}${space}${amount}`;
  }

  function signedMoney(cents) {
    if (cents === 0) return formatMoney(0);
    return `${cents > 0 ? "+" : "-"}${formatMoney(Math.abs(cents))}`;
  }

  function formatBalance(balanceCents) {
    if (balanceCents > 0) {
      return `${subjectName("p2")} ${owesVerb("p2")} ${objectName("p1")} ${formatMoney(balanceCents)}`;
    }
    if (balanceCents < 0) {
      return `${subjectName("p1")} ${owesVerb("p1")} ${objectName("p2")} ${formatMoney(balanceCents)}`;
    }
    return "All settled";
  }

  function formatDate(value) {
    if (!value) return "No date";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function notePhrase(note) {
    const clean = String(note || "").trim();
    return clean ? ` for ${clean}` : "";
  }

  function createTransaction(type) {
    return {
      id: makeId(),
      type: type || "shared",
      date: "",
      person: type === "repayment" ? "p2" : "p1",
      amount: "",
      split: "equal",
      p1Share: "50",
      p2Share: "50",
      note: "",
      touchedAmount: false
    };
  }

  function setStarterRows() {
    state.transactions = [createTransaction("shared"), createTransaction("repayment")];
  }

  function getStartingBalanceCents() {
    if (state.startingDirection === "none") return 0;
    const amount = parseAmountToCents(state.startingAmount);
    if (!amount) return 0;
    return state.startingDirection === "p2-owes-p1" ? amount : -amount;
  }

  function getShareData(transaction) {
    const amountCents = parseAmountToCents(transaction.amount);
    if (!amountCents) {
      return { valid: false, message: "Enter an amount greater than 0 to include this row." };
    }

    if (transaction.split === "custom") {
      const p1Percent = parsePercent(transaction.p1Share);
      const p2Percent = parsePercent(transaction.p2Share);
      if (p1Percent === null || p2Percent === null || Math.abs(p1Percent + p2Percent - 100) > 0.01) {
        return { valid: false, message: "Shares should add up to 100%." };
      }
      const p1ShareCents = Math.round(amountCents * p1Percent / 100);
      return {
        valid: true,
        amountCents,
        p1ShareCents,
        p2ShareCents: amountCents - p1ShareCents
      };
    }

    const p1ShareCents = Math.round(amountCents / 2);
    return {
      valid: true,
      amountCents,
      p1ShareCents,
      p2ShareCents: amountCents - p1ShareCents
    };
  }

  function transactionHasUserInput(transaction) {
    return Boolean(
      String(transaction.amount || "").trim() ||
      String(transaction.date || "").trim() ||
      String(transaction.note || "").trim() ||
      transaction.touchedAmount
    );
  }

  function getTransactionEffect(transaction) {
    const amountCents = parseAmountToCents(transaction.amount);
    if (!amountCents) {
      return {
        valid: false,
        validation: transactionHasUserInput(transaction) ? "Enter an amount greater than 0 to include this row." : ""
      };
    }

    const note = String(transaction.note || "").trim();
    const paidBy = transaction.person === "p2" ? "p2" : "p1";
    const other = otherPerson(paidBy);

    if (transaction.type === "shared") {
      const share = getShareData(transaction);
      if (!share.valid) {
        return { valid: false, validation: share.message };
      }
      const changeCents = paidBy === "p1" ? share.p2ShareCents : -share.p1ShareCents;
      const shareCents = paidBy === "p1" ? share.p2ShareCents : share.p1ShareCents;
      const owedBy = paidBy === "p1" ? "p2" : "p1";
      return {
        valid: true,
        type: "shared",
        amountCents,
        changeCents,
        date: transaction.date,
        what: `${subjectName(paidBy)} paid ${formatMoney(amountCents)}${notePhrase(note) || " for a shared expense"}`,
        changeText: `${subjectName(owedBy)} ${owesVerb(owedBy)} ${objectName(paidBy)} ${signedMoney(changeCents)}`,
        changeClass: changeCents > 0 ? "rb-changePositive" : "rb-changeNegative",
        copyLine: `${subjectName(paidBy)} paid ${formatMoney(amountCents)}${notePhrase(note) || " for a shared expense"}. ${possessiveName(owedBy)} share was ${formatMoney(shareCents)}.`
      };
    }

    if (transaction.type === "direct") {
      const changeCents = paidBy === "p1" ? amountCents : -amountCents;
      return {
        valid: true,
        type: "direct",
        amountCents,
        changeCents,
        date: transaction.date,
        what: `${subjectName(paidBy)} paid ${formatMoney(amountCents)} directly for ${objectName(other)}${note ? ` (${note})` : ""}`,
        changeText: `${subjectName(other)} ${owesVerb(other)} ${objectName(paidBy)} ${signedMoney(changeCents)}`,
        changeClass: changeCents > 0 ? "rb-changePositive" : "rb-changeNegative",
        copyLine: `${subjectName(paidBy)} paid ${formatMoney(amountCents)} directly for ${objectName(other)}${note ? ` (${note})` : ""}.`
      };
    }

    const changeCents = paidBy === "p2" ? -amountCents : amountCents;
    return {
      valid: true,
      type: "repayment",
      amountCents,
      changeCents,
      date: transaction.date,
      what: `${subjectName(paidBy)} repaid ${formatMoney(amountCents)}${note ? ` (${note})` : ""}`,
      changeText: `${possessiveName(paidBy)} balance ${signedMoney(changeCents)}`,
      changeClass: changeCents > 0 ? "rb-changePositive" : "rb-changeNegative",
      copyLine: `${subjectName(paidBy)} repaid ${formatMoney(amountCents)}${note ? ` (${note})` : ""}.`
    };
  }

  function calculate() {
    let balanceCents = getStartingBalanceCents();
    let totalSharedCents = 0;
    let totalRepaymentCents = 0;
    let validTransactions = 0;
    const rows = [];

    if (balanceCents !== 0) {
      rows.push({
        date: "Start",
        what: "Starting balance",
        changeText: formatBalance(balanceCents),
        changeClass: "rb-changeNeutral",
        balanceAfter: formatBalance(balanceCents),
        copyLine: `Starting balance: ${formatBalance(balanceCents)}.`
      });
    }

    state.transactions.forEach((transaction) => {
      const effect = getTransactionEffect(transaction);
      if (!effect.valid) return;

      validTransactions += 1;
      if (effect.type === "shared") totalSharedCents += effect.amountCents;
      if (effect.type === "repayment") totalRepaymentCents += effect.amountCents;
      balanceCents += effect.changeCents;

      rows.push({
        date: formatDate(effect.date),
        what: effect.what,
        changeText: effect.changeText,
        changeClass: effect.changeClass,
        balanceAfter: formatBalance(balanceCents),
        copyLine: effect.copyLine
      });
    });

    return {
      balanceCents,
      totalSharedCents,
      totalRepaymentCents,
      validTransactions,
      rows
    };
  }

  function renderStartingLabels() {
    const labelNone = document.querySelector('[data-starting-label="none"]');
    const labelP2 = document.querySelector('[data-starting-label="p2-owes-p1"]');
    const labelP1 = document.querySelector('[data-starting-label="p1-owes-p2"]');
    if (labelNone) labelNone.textContent = "No starting balance";
    if (labelP2) labelP2.textContent = `${subjectName("p2")} already ${owesVerb("p2")} ${objectName("p1")}`;
    if (labelP1) labelP1.textContent = `${subjectName("p1")} already ${owesVerb("p1")} ${objectName("p2")}`;
  }

  function renderStartingAmount() {
    els.startingAmountWrap.hidden = state.startingDirection === "none";
    if (state.startingDirection === "none") {
      els.startingValidation.textContent = "";
      return;
    }
    const amount = parseAmountToCents(state.startingAmount);
    els.startingValidation.textContent = amount ? "" : "Enter a starting balance amount greater than 0.";
  }

  function renderTransactions() {
    els.transactionList.innerHTML = state.transactions.map((transaction, index) => transactionTemplate(transaction, index)).join("");
    state.transactions.forEach((transaction) => renderTransactionValidation(transaction));
  }

  function transactionTemplate(transaction, index) {
    const id = escapeHtml(transaction.id);
    const typeLabel = getTypeLabel(transaction.type);
    const personLabel = transaction.type === "repayment" ? "Repaid by" : "Paid by";
    const notePlaceholder = transaction.type === "repayment" ? "Paid back part" : "Groceries, Uber, subscription...";
    const sharedFields = transaction.type === "shared" ? splitFieldsTemplate(transaction) : "";

    return `
      <article class="rb-transactionCard" data-transaction-id="${id}">
        <div class="rb-transactionTop">
          <div class="rb-transactionTitle">
            <h4>Transaction ${index + 1}</h4>
            <span class="rb-typePill">${escapeHtml(typeLabel)}</span>
          </div>
          <button type="button" class="rb-removeButton" data-action="remove-row">Remove row</button>
        </div>
        <div class="rb-transactionFields">
          <div class="rb-transactionField">
            <label for="rb-type-${id}">Type</label>
            <select id="rb-type-${id}" class="rb-select" data-field="type">
              <option value="shared"${transaction.type === "shared" ? " selected" : ""}>Shared expense</option>
              <option value="repayment"${transaction.type === "repayment" ? " selected" : ""}>Repayment</option>
              <option value="direct"${transaction.type === "direct" ? " selected" : ""}>Direct expense for the other person</option>
            </select>
          </div>
          <div class="rb-transactionField">
            <label for="rb-date-${id}">Date <span class="sr-only">(optional)</span></label>
            <input id="rb-date-${id}" class="rb-input" type="date" data-field="date" value="${escapeHtml(transaction.date)}" />
          </div>
          <div class="rb-transactionField">
            <label for="rb-person-${id}">${escapeHtml(personLabel)}</label>
            <select id="rb-person-${id}" class="rb-select" data-field="person">
              <option value="p1"${transaction.person === "p1" ? " selected" : ""}>${escapeHtml(getName("p1"))}</option>
              <option value="p2"${transaction.person === "p2" ? " selected" : ""}>${escapeHtml(getName("p2"))}</option>
            </select>
          </div>
          <div class="rb-transactionField">
            <label for="rb-amount-${id}">Amount</label>
            <input id="rb-amount-${id}" class="rb-input" type="number" min="0" step="0.01" inputmode="decimal" data-field="amount" value="${escapeHtml(transaction.amount)}" aria-describedby="rb-validation-${id}" />
          </div>
          <div class="rb-transactionField">
            <label for="rb-note-${id}">Note <span class="sr-only">(optional)</span></label>
            <input id="rb-note-${id}" class="rb-input" type="text" maxlength="70" data-field="note" value="${escapeHtml(transaction.note)}" placeholder="${escapeHtml(notePlaceholder)}" />
          </div>
        </div>
        ${sharedFields}
        <p class="rb-rowValidation" id="rb-validation-${id}" aria-live="polite"></p>
      </article>
    `;
  }

  function splitFieldsTemplate(transaction) {
    const id = escapeHtml(transaction.id);
    return `
      <div class="rb-splitFields">
        <div class="rb-transactionField">
          <label for="rb-split-${id}">Split</label>
          <select id="rb-split-${id}" class="rb-select" data-field="split">
            <option value="equal"${transaction.split === "equal" ? " selected" : ""}>Split equally</option>
            <option value="custom"${transaction.split === "custom" ? " selected" : ""}>Custom shares</option>
          </select>
        </div>
        <div class="rb-shareGrid"${transaction.split === "custom" ? "" : " hidden"}>
          <div class="rb-transactionField">
            <label for="rb-p1-share-${id}">${escapeHtml(getName("p1"))} share %</label>
            <input id="rb-p1-share-${id}" class="rb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-field="p1Share" value="${escapeHtml(transaction.p1Share)}" />
          </div>
          <div class="rb-transactionField">
            <label for="rb-p2-share-${id}">${escapeHtml(getName("p2"))} share %</label>
            <input id="rb-p2-share-${id}" class="rb-input" type="number" min="0" max="100" step="0.01" inputmode="decimal" data-field="p2Share" value="${escapeHtml(transaction.p2Share)}" />
          </div>
        </div>
        <p class="rb-shareWarning" data-share-warning aria-live="polite"></p>
      </div>
    `;
  }

  function getTypeLabel(type) {
    if (type === "repayment") return "Repayment";
    if (type === "direct") return "Direct expense";
    return "Shared expense";
  }

  function renderTransactionValidation(transaction) {
    const row = Array.from(els.transactionList.querySelectorAll("[data-transaction-id]"))
      .find((item) => item.getAttribute("data-transaction-id") === transaction.id);
    if (!row) return;
    const validation = row.querySelector(".rb-rowValidation");
    const warning = row.querySelector("[data-share-warning]");
    const amountInput = row.querySelector('[data-field="amount"]');
    const p1ShareInput = row.querySelector('[data-field="p1Share"]');
    const p2ShareInput = row.querySelector('[data-field="p2Share"]');
    const effect = getTransactionEffect(transaction);

    if (validation) validation.textContent = effect.validation && effect.validation !== "Shares should add up to 100%." ? effect.validation : "";
    if (amountInput) amountInput.setAttribute("aria-invalid", effect.validation && effect.validation !== "Shares should add up to 100%." ? "true" : "false");

    const shareMessage = transaction.type === "shared" && transaction.split === "custom" && !getShareData(transaction).valid
      ? "Shares should add up to 100%."
      : "";
    if (warning) warning.textContent = shareMessage;
    if (p1ShareInput) p1ShareInput.setAttribute("aria-invalid", shareMessage ? "true" : "false");
    if (p2ShareInput) p2ShareInput.setAttribute("aria-invalid", shareMessage ? "true" : "false");
  }

  function renderResults() {
    const result = calculate();
    els.resultText.textContent = formatBalance(result.balanceCents);
    els.resultSupport.textContent = result.balanceCents === 0
      ? "The expenses and repayments currently balance out."
      : "This is the current balance after the expenses and repayments listed below.";

    renderSummaryCards(result);
    renderTimeline(result);
  }

  function renderSummaryCards(result) {
    const currentValue = result.balanceCents === 0 ? "All settled" : formatMoney(result.balanceCents);
    els.summaryCards.innerHTML = "";
    [
      ["Total shared expenses", formatMoney(result.totalSharedCents)],
      ["Total repayments", formatMoney(result.totalRepaymentCents)],
      ["Current balance", currentValue],
      ["Transactions", String(result.validTransactions)]
    ].forEach(([label, value]) => {
      const card = document.createElement("div");
      card.className = "rb-summaryCard";
      const labelEl = document.createElement("span");
      labelEl.textContent = label;
      const valueEl = document.createElement("strong");
      valueEl.textContent = value;
      card.append(labelEl, valueEl);
      els.summaryCards.appendChild(card);
    });
  }

  function renderTimeline(result) {
    els.timelineRows.innerHTML = "";
    if (result.rows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "rb-emptyTimeline";
      empty.textContent = "Add a transaction or load an example to see the balance after each row.";
      els.timelineRows.appendChild(empty);
      return;
    }

    result.rows.forEach((row) => {
      const item = document.createElement("div");
      item.className = "rb-timelineRow";
      item.setAttribute("role", "row");
      item.append(
        timelineCell("Date", row.date),
        timelineCell("What happened", row.what, true),
        timelineCell("Balance change", row.changeText, false, row.changeClass),
        timelineCell("Balance after", row.balanceAfter, true)
      );
      els.timelineRows.appendChild(item);
    });
  }

  function timelineCell(label, text, strong, className) {
    const cell = document.createElement("span");
    cell.className = `rb-timelineCell${className ? ` ${className}` : ""}`;
    cell.setAttribute("role", "cell");
    cell.setAttribute("data-label", label);
    if (strong) {
      const value = document.createElement("strong");
      value.textContent = text;
      cell.appendChild(value);
    } else {
      cell.textContent = text;
    }
    return cell;
  }

  function renderAll() {
    renderStartingLabels();
    renderStartingAmount();
    state.transactions.forEach((transaction) => renderTransactionValidation(transaction));
    renderResults();
  }

  function syncSetupInputs() {
    els.currency.value = state.currency;
    els.person1.value = state.person1;
    els.person2.value = state.person2;
    els.startingAmount.value = state.startingAmount;
    document.querySelectorAll('input[name="rb-starting-direction"]').forEach((input) => {
      input.checked = input.value === state.startingDirection;
    });
  }

  function addTransaction(type) {
    if (state.transactions.length >= MAX_TRANSACTIONS) return;
    state.transactions.push(createTransaction(type));
    renderTransactions();
    renderAll();
  }

  function removeTransaction(id) {
    state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
    if (state.transactions.length === 0) setStarterRows();
    renderTransactions();
    renderAll();
  }

  function clearAll() {
    state.currency = "$";
    state.person1 = "You";
    state.person2 = "Alex";
    state.startingDirection = "none";
    state.startingAmount = "";
    setStarterRows();
    syncSetupInputs();
    renderTransactions();
    renderAll();
  }

  function loadScenario(scenario) {
    state.currency = "$";
    state.startingDirection = "none";
    state.startingAmount = "";

    if (scenario === "couple") {
      state.person1 = "Maya";
      state.person2 = "Emma";
      state.transactions = [
        makeScenarioRow("shared", "p1", "64", "Groceries"),
        makeScenarioRow("shared", "p2", "22", "Taxi"),
        makeScenarioRow("shared", "p1", "14", "Subscription"),
        makeScenarioRow("repayment", "p2", "20", "Paid back part")
      ];
    } else if (scenario === "roommate") {
      state.person1 = "You";
      state.person2 = "Sam";
      state.transactions = [
        makeScenarioRow("shared", "p1", "90", "Utilities"),
        makeScenarioRow("shared", "p2", "35", "Household supplies"),
        makeScenarioRow("shared", "p1", "20", "Internet extra"),
        makeScenarioRow("repayment", "p2", "40", "Paid back part")
      ];
    } else {
      state.person1 = "You";
      state.person2 = "Alex";
      state.transactions = [
        makeScenarioRow("shared", "p1", "42", "Groceries"),
        makeScenarioRow("shared", "p2", "18", "Uber"),
        makeScenarioRow("shared", "p1", "12", "Family subscription"),
        makeScenarioRow("repayment", "p2", "10", "Paid back part")
      ];
    }

    syncSetupInputs();
    renderTransactions();
    renderAll();
  }

  function makeScenarioRow(type, person, amount, note) {
    const transaction = createTransaction(type);
    transaction.person = person;
    transaction.amount = amount;
    transaction.note = note;
    return transaction;
  }

  function buildSummaryText(result) {
    if (result.rows.length === 0) return "";

    const currentBalance = formatBalance(result.balanceCents);
    if (result.balanceCents === 0) {
      return [
        "Current balance: all settled.",
        "",
        "Based on the expenses and repayments entered, neither person currently owes the other."
      ].join("\n");
    }

    const lines = [`Current balance: ${currentBalance}.`, "", "Based on:"];
    result.rows.forEach((row) => {
      lines.push(`- ${row.copyLine}`);
    });
    lines.push("", `Remaining balance: ${currentBalance}.`);
    return lines.join("\n");
  }

  async function copySummary() {
    const result = calculate();
    const text = buildSummaryText(result);
    if (!text) {
      setCopyStatus("Add a transaction before copying a summary.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Summary copied.");
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
      setCopyStatus(copied ? "Summary copied." : "Copy failed.");
    }
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
    if (target === els.person1) state.person1 = target.value;
    if (target === els.person2) state.person2 = target.value;
    if (target === els.startingAmount) state.startingAmount = target.value;
    renderTransactions();
    renderAll();
  }

  function handleStartingDirection(event) {
    state.startingDirection = event.target.value;
    renderAll();
  }

  function handleTransactionInput(event) {
    const row = event.target.closest("[data-transaction-id]");
    if (!row) return;
    const transaction = state.transactions.find((item) => item.id === row.getAttribute("data-transaction-id"));
    if (!transaction) return;
    const field = event.target.getAttribute("data-field");
    if (!field) return;

    transaction[field] = event.target.value;
    if (field === "amount") transaction.touchedAmount = true;

    if (field === "type" || field === "split") {
      if (field === "type" && transaction.type === "repayment" && transaction.person === "p1") {
        transaction.person = "p2";
      }
      renderTransactions();
    }
    renderAll();
  }

  function bindEvents() {
    els.currency.addEventListener("input", handleSetupInput);
    els.person1.addEventListener("input", handleSetupInput);
    els.person2.addEventListener("input", handleSetupInput);
    els.startingAmount.addEventListener("input", handleSetupInput);
    document.querySelectorAll('input[name="rb-starting-direction"]').forEach((input) => {
      input.addEventListener("change", handleStartingDirection);
    });

    els.transactionList.addEventListener("input", handleTransactionInput);
    els.transactionList.addEventListener("change", handleTransactionInput);

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.getAttribute("data-action");
      const row = button.closest("[data-transaction-id]");
      const shouldScrollToCalculator = button.hasAttribute("data-scroll-to-calculator");

      if (action === "add-shared") addTransaction("shared");
      if (action === "add-repayment") addTransaction("repayment");
      if (action === "add-direct") addTransaction("direct");
      if (action === "remove-row" && row) removeTransaction(row.getAttribute("data-transaction-id"));
      if (action === "clear-all") clearAll();
      if (action === "load-example") loadScenario("default");
      if (action === "load-couple") loadScenario("couple");
      if (action === "load-roommate") loadScenario("roommate");
      if (action === "copy-summary") copySummary();
      if (shouldScrollToCalculator) scrollCalculatorIntoView();
    });
  }

  function init() {
    const root = document.querySelector(".rb-calculator");
    if (!root) return;

    els.currency = document.querySelector("#rb-currency");
    els.person1 = document.querySelector("#rb-person-1");
    els.person2 = document.querySelector("#rb-person-2");
    els.startingAmount = document.querySelector("#rb-starting-amount");
    els.startingAmountWrap = document.querySelector("[data-starting-amount-wrap]");
    els.startingValidation = document.querySelector("#rb-starting-validation");
    els.transactionList = document.querySelector("[data-transaction-list]");
    els.resultText = document.querySelector("[data-result-text]");
    els.resultSupport = document.querySelector("[data-result-support]");
    els.summaryCards = document.querySelector("[data-summary-cards]");
    els.timelineRows = document.querySelector("[data-timeline-rows]");
    els.copyStatus = document.querySelector("[data-copy-status]");

    setStarterRows();
    syncSetupInputs();
    renderTransactions();
    bindEvents();
    renderAll();

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

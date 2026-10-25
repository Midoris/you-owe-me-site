(function () {
  "use strict";

  const EPSILON = 0.005;
  const MAX_PEOPLE = 12;
  const MAX_EXPENSES = 30;
  const locale = document.documentElement?.lang || "en";
  const isArabic = locale === "ar";
  const isFrench = locale === "fr";
  const localizedNumberInput = isArabic ? window.UomiArabicNumberInput : isFrench ? window.UomiFrenchNumberInput : null;
  const localizedStrings = window.UomiSplitExpenseLocales?.[locale];
  const CANONICAL_CALCULATOR_URL = localizedStrings
    ? document.querySelector('link[rel="canonical"]').getAttribute("href")
    : "https://you-owe-me.com/tools/split-expense-calculator/";

  function translate(message, values = {}) {
    const template = localizedStrings?.[message] || message;
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }
  // Markup isolates rendered tokens; only user-facing plain-text summaries and
  // aria labels need Unicode isolates. Never write them to state/native drafts.
  const ltrKeys = new Set(["amount", "url", "number", "count"]);
  function translatePlain(message, values = {}) {
    if (!isArabic && !isFrench) return translate(message, values);
    const isolated = Object.fromEntries(Object.entries(values).map(([key, value]) =>
      [key, `${ltrKeys.has(key) ? "\u2066" : "\u2068"}${value}\u2069`]));
    return translate(message, isolated);
  }
  function setTranslatedContent(parent, message, values = {}) {
    if (!isArabic) { parent.textContent = translate(message, values); return; }
    clearNode(parent);
    const template = localizedStrings?.[message] || message;
    const tokens = template.split(/(\{\w+\}|You Owe Me|iPhone|Live Link|Balance Sync)/g);
    for (const token of tokens) {
      const match = token.match(/^\{(\w+)\}$/);
      if (match || ["You Owe Me", "iPhone", "Live Link", "Balance Sync"].includes(token)) {
        const isolate = document.createElement("bdi");
        isolate.setAttribute("dir", !match || ltrKeys.has(match[1]) ? "ltr" : "auto");
        isolate.textContent = match ? values[match[1]] ?? "" : token;
        parent.appendChild(isolate);
      } else appendText(parent, token);
    }
  }
  function transferState(source = state) {
    if (!isArabic && !isFrench) return source;
    return { ...source, expenses: source.expenses.map(expense => ({ ...expense,
      amount: localizedNumberInput?.normalizeAmount(expense.amount) ?? "NaN",
    })) };
  }
  // The return snapshot can be reopened in another page language. Restore
  // money from the accepted native draft, never reinterpret another locale's
  // decimal separators. Keep same-language raw fields when they still match.
  function restoreReturnState(snapshot) {
    const previous = snapshot?.state;
    const attempt = snapshot?.transferAttempt;
    if (!previous || typeof previous.currency !== "string" ||
        !Array.isArray(previous.people) || !Array.isArray(previous.expenses) ||
        !Number.isInteger(previous.nextPersonNumber) || previous.nextPersonNumber < 1 ||
        !Number.isInteger(previous.nextExpenseNumber) || previous.nextExpenseNumber < 1 ||
        !previous.people.every(person => typeof person.id === "string" && typeof person.name === "string") ||
        !previous.expenses.every(expense => typeof expense.id === "string" && typeof expense.description === "string" &&
          (typeof expense.amount === "string" || typeof expense.amount === "number") &&
          typeof expense.paidBy === "string" && Array.isArray(expense.includedPeople)) ||
        typeof attempt?.fingerprint !== "string") return null;
    let candidate = previous;
    const rawDraft = window.UomiToolTransfer.prepare(transferState(previous));
    if (!rawDraft || (snapshot.locale && snapshot.locale !== locale) || JSON.stringify(rawDraft) !== attempt.fingerprint) {
      const accepted = JSON.parse(attempt.fingerprint);
      const people = new Map(accepted.participants.map(person => [person.id, person]));
      const costs = new Map(accepted.costs.map(cost => [cost.id, cost]));
      candidate = { ...previous,
        people: previous.people.map(person => ({ ...person, name: person.name.trim() || people.get(person.id).name })),
        expenses: previous.expenses.map(expense => {
          const cost = costs.get(expense.id);
          if (!Number.isSafeInteger(cost.amount) || cost.amount < 1 || cost.amount > 100000000) throw new Error("Invalid return amount");
          return { ...expense, amount: (cost.amount / 100).toFixed(2), description: expense.description.trim() || cost.label };
        }),
      };
    }
    const restoredDraft = window.UomiToolTransfer.prepare(transferState(candidate));
    if (!restoredDraft || JSON.stringify(restoredDraft) !== attempt.fingerprint) return null;
    return {
      state: { currency: candidate.currency, people: candidate.people, expenses: candidate.expenses,
        nextPersonNumber: candidate.nextPersonNumber, nextExpenseNumber: candidate.nextExpenseNumber, message: "" },
      transferAttempt: /^[a-f0-9]{64}$/.test(attempt.reference)
        ? { fingerprint: attempt.fingerprint, reference: attempt.reference } : null,
    };
  }
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
  let meaningfulEdit = false;
  let transferExposureEmitted = false;
  let transferAttempt = null;
  let transferBusy = false;

  function makeId(prefix) {
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function createPerson(name) {
    return {
      id: makeId("p"),
      name: name || translate("Person {number}", { number: state.nextPersonNumber++ })
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
    return name || translate("Person {number}", { number: index + 1 });
  }

  function getPersonNameById(id) {
    const index = state.people.findIndex((person) => person.id === id);
    if (index === -1) return translate("Someone");
    return getPersonName(state.people[index], index);
  }

  function sanitizeCurrency(value) {
    const trimmed = String(value || "").trim().slice(0, 6);
    return trimmed || "$";
  }

  function parseAmount(value) {
    if (typeof value === "number" && !isFrench) return value;
    const normalized = isArabic || isFrench
      ? localizedNumberInput?.normalizeAmount(value) ?? ""
      : String(value || "").trim().replace(/,/g, "");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function roundMoney(value) {
    if (Math.abs(value) < EPSILON) return 0;
    return Math.round(value * 100) / 100;
  }

  function formatNumber(value) {
    const rounded = roundMoney(value);
    if (localizedStrings) return new Intl.NumberFormat(isArabic ? "ar-u-nu-latn" : locale, { maximumFractionDigits: 2 }).format(rounded);
    if (Number.isInteger(rounded)) return String(rounded);
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatMoney(value) {
    const symbol = sanitizeCurrency(state.currency);
    if (isFrench) return `${formatNumber(value)}\u00a0${symbol}`;
    if (locale === "de" || isArabic) return `${formatNumber(value)} ${symbol}`;
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
    if (isArabic) input.setAttribute("dir", "auto");
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
    els.peopleSummary.textContent = translate("People ({count}): edit names or remove people", { count: state.people.length });
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
      remove.setAttribute("aria-label", translatePlain("Remove {name}", { name: getPersonName(person, index) }));
      remove.textContent = translate("Remove");
      remove.addEventListener("click", () => removePerson(person.id));

      row.append(makeField(translate("Person {number}", { number: index + 1 }), input), remove);
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
      title.textContent = translate("Expense {number}", { number: expenseIndex + 1 });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-action";
      remove.setAttribute("aria-label", translatePlain("Remove expense {expense}", { expense: expense.description || expenseIndex + 1 }));
      remove.textContent = translate("Remove");
      remove.addEventListener("click", () => removeExpense(expense.id));
      header.append(title, remove);

      const fields = document.createElement("div");
      fields.className = "expense-fields";

      const description = makeInput(`description-${expense.id}`, expense.description, "text");
      description.placeholder = translate("Dinner, groceries, rent, taxi...");
      description.maxLength = 70;
      description.addEventListener("input", () => {
        expense.description = description.value;
        renderResults(calculate());
      });

      const amount = makeInput(`amount-${expense.id}`, expense.amount, isArabic || isFrench ? "text" : "number");
      amount.min = "0";
      amount.step = "0.01";
      amount.inputMode = "decimal";
      amount.setAttribute("aria-describedby", `${isFrench ? "fr-number-help " : ""}expense-validation-${expense.id}`);
      if (isArabic) amount.setAttribute("dir", "ltr");
      amount.addEventListener("input", () => {
        expense.amount = amount.value;
        renderResults(calculate());
        renderExpenseValidation(expense, card);
      });

      const select = document.createElement("select");
      select.id = `paid-${expense.id}`;
      select.className = "calculator-select";
      if (isArabic) select.setAttribute("dir", "auto");
      state.people.forEach((person, index) => {
        const option = document.createElement("option");
        option.value = person.id;
        if (isArabic) option.setAttribute("dir", "auto");
        option.textContent = getPersonName(person, index);
        option.selected = person.id === expense.paidBy;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        expense.paidBy = select.value;
        renderResults(calculate());
      });

      fields.append(
        makeField(translate("Amount"), amount),
        makeField(translate("Paid by"), select)
      );

      const included = document.createElement("fieldset");
      included.className = "included-people";
      const legend = document.createElement("legend");
      legend.textContent = translate("Split between / included people");
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
        if (isArabic) {
          const name = document.createElement("bdi"); name.setAttribute("dir", "auto");
          name.textContent = getPersonName(person, index); text.appendChild(name);
        } else text.textContent = getPersonName(person, index);
        label.append(checkbox, text);
        checkboxGrid.appendChild(label);
      });
      included.appendChild(checkboxGrid);

      const splitType = document.createElement("div");
      splitType.className = "split-type";
      const splitLabel = document.createElement("span");
      splitLabel.className = "split-type-label";
      splitLabel.textContent = translate("Split type");
      const splitValue = document.createElement("span");
      splitValue.className = "split-type-value";
      splitValue.textContent = translate("Equal");
      splitType.append(splitLabel, splitValue);

      const validation = document.createElement("p");
      validation.className = "expense-validation";
      validation.id = `expense-validation-${expense.id}`;
      validation.setAttribute("aria-live", "polite");

      card.append(header, fields, included, makeField(translate("Description (optional)"), description), splitType, validation);
      els.expensesList.appendChild(card);
      renderExpenseValidation(expense, card);
    });
  }

  function renderExpenseValidation(expense, card) {
    const validation = card.querySelector(".expense-validation");
    if (!validation) return;
    const amount = parseAmount(expense.amount);
    let message = "";
    const hasInput = String(isFrench ? expense.amount ?? "" : expense.amount || "").trim();
    if ((isArabic || isFrench) && hasInput && localizedNumberInput?.normalizeAmount(expense.amount) == null) {
      message = localizedStrings["Invalid amount format"];
    } else if (hasInput && amount <= 0) {
      message = translate("Enter an amount greater than zero.");
    } else if (amount > 0 && !state.people.some((person) => person.id === expense.paidBy)) {
      message = translate("Choose who paid for this expense.");
    } else if (amount > 0 && expense.includedPeople.length === 0) {
      message = translate("Select at least one person to share this expense.");
    }
    validation.textContent = message;
    if (isArabic || isFrench) card.querySelector(`[id="amount-${expense.id}"]`).setAttribute("aria-invalid", message ? "true" : "false");
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
    renderMoneyRows(els.paid, result.net.map((row) => [{ message: "{name} paid", values: { name: row.name } }, row.paid]));
    renderMoneyRows(els.share, result.net.map((row) => [{ message: "{name}'s share", values: { name: row.name } }, row.share]));
    renderNetRows(result);
    renderSettlement(result);
    renderResultActions(result);
  }

  function hasValidResult(result) {
    return result.validCount > 0 && result.peopleCount > 0;
  }

  function renderResultActions(result) {
    els.exampleMarker.hidden = meaningfulEdit || !hasValidResult(result);
    if (result.transfers.length > 0) {
      els.resultAppTitle.textContent = translate(localizedStrings ? "Keep track until everyone has paid" : "Keep track as repayments come in");
      setTranslatedContent(els.resultAppMessage, localizedStrings ? "Keep this balance in You Owe Me on iPhone. Record each full or partial repayment and see what each person still owes." : "Create a record in You Owe Me for the amounts you need to track. Record each payment and keep the remaining balances clear.");
    } else {
      els.resultAppTitle.textContent = translate("Keep future shared costs in one place");
      setTranslatedContent(els.resultAppMessage, "This split is settled. If you share costs again, You Owe Me on iPhone keeps new expenses and repayments in one balance for each person.");
    }
    const shouldShow = hasExplicitInteraction && hasValidResult(result);
    els.resultActions.hidden = !shouldShow;
    if (shouldShow) emitResultReadyOnce();
    renderTransferOffer(shouldShow);
  }

  function isDesktopIphoneHandoffEligible() {
    const userAgent = navigator.userAgent || "";
    const platform = navigator.platform || "";
    return !/iPhone|iPad|iPod|Android|Mobile/i.test(userAgent)
      && !(platform === "MacIntel" && Number(navigator.maxTouchPoints || 0) > 1)
      && /Windows NT|Macintosh|X11|CrOS|Linux x86_64/i.test(userAgent)
      && window.matchMedia("(min-width: 768px)").matches
      && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function renderTransferOffer(shouldShow) {
    const area = document.querySelector("[data-tool-transfer]");
    if (!area) return;
    const supported = window.UomiToolTransfer && window.UomiToolTransfer.prepare(transferState());
    const allowed = window.UomiToolTransfer && window.UomiToolTransfer.config.enabled;
    const iphone = /iPhone/.test(navigator.userAgent);
    area.hidden = !(allowed && iphone && meaningfulEdit && supported);
    const appCard = document.querySelector(".split-result-app-card");
    // The transfer supports fewer splits than the app. Keep an ordinary app
    // destination for iOS results that cannot be transferred, without two
    // competing app actions when the App Clip offer is available.
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent || "")
      || (navigator.platform === "MacIntel" && Number(navigator.maxTouchPoints || 0) > 1);
    if (appCard) appCard.hidden = !(shouldShow && area.hidden && (ios || isDesktopIphoneHandoffEligible()));
    if (!area.hidden && !transferExposureEmitted) {
      transferExposureEmitted = true;
      dispatchCalculatorEvent("split_transfer_offer_viewed");
    }
  }

  function refreshResultContinuationForViewport() {
    renderTransferOffer(!els.resultActions.hidden);
  }

  ["(min-width: 768px)", "(hover: hover) and (pointer: fine)"].forEach((query) => {
    const mediaQuery = window.matchMedia(query);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", refreshResultContinuationForViewport);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(refreshResultContinuationForViewport);
    }
  });

  async function continueSplit() {
    if (transferBusy || !meaningfulEdit || !window.UomiToolTransfer.config.enabled) return;
    const draft = window.UomiToolTransfer.prepare(transferState());
    if (!draft) return;
    const status = document.querySelector("[data-transfer-status]");
    const button = document.querySelector('[data-action="track-split"]');
    const fingerprint = JSON.stringify(draft);
    if (!transferAttempt || transferAttempt.fingerprint !== fingerprint) {
      const bytes = crypto.getRandomValues(new Uint8Array(26));
      transferAttempt = {fingerprint, reference: Date.now().toString(16).padStart(12, "0") + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")};
    }
    transferBusy = true; button.disabled = true; status.textContent = translate("Preparing your split…");
    dispatchCalculatorEvent("split_transfer_chosen");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch(window.UomiToolTransfer.config.endpoint, {method: "POST", headers: {"Content-Type": "application/json"}, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal, body: JSON.stringify({action: "create", reference: transferAttempt.reference, draft})});
      } finally { clearTimeout(timeout); }
      if (!response.ok) {
        if ([400, 410].includes(response.status)) transferAttempt = null;
        throw new Error("unavailable");
      }
      // A response for an earlier edit must not navigate away with a stale split.
      if (!meaningfulEdit || !transferAttempt || transferAttempt.fingerprint !== fingerprint ||
          JSON.stringify(window.UomiToolTransfer.prepare(transferState())) !== fingerprint) throw new Error("changed");
      // Preserve input only following explicit consent. Cleared when restored on Back.
      sessionStorage.setItem("uomi-exp003-return", JSON.stringify({locale: locale || "en", state, transferAttempt}));
      location.assign(window.UomiToolTransfer.config.continuation + "?ref=" + transferAttempt.reference + (localizedStrings ? "#" + locale : ""));
    } catch (_) {
      status.textContent = translate("Couldn’t prepare the transfer. Your split is still here. Try again, or copy your result.");
    } finally { transferBusy = false; button.disabled = false; }
  }

  function renderSummary(result) {
    clearNode(els.summary);
    appendResultItem(els.summary, translate("Total expenses"), formatMoney(result.total));
    appendResultItem(els.summary, translate("People"), String(result.peopleCount));
    appendResultItem(els.summary, translate("Expenses included"), String(result.validCount));
  }

  function renderMoneyRows(container, rows) {
    clearNode(container);
    rows.forEach(([label, value]) => appendResultItem(container, label, formatMoney(value)));
  }

  function renderNetRows(result) {
    clearNode(els.net);
    result.net.forEach((row) => {
      let label = { message: "{name} is settled", values: { name: row.name } };
      let value = "";
      if (row.net > EPSILON) {
        label = { message: "{name} should receive", values: { name: row.name } };
        value = formatMoney(row.net);
      } else if (row.net < -EPSILON) {
        label = { message: "{name} owes", values: { name: row.name } };
        value = formatMoney(Math.abs(row.net));
      }
      appendResultItem(els.net, label, value);
    });
  }

  function renderSettlement(result) {
    clearNode(els.settlement);
    if (result.validCount === 0) {
      appendEmpty(els.settlement, translate("Add an expense to see who owes whom."));
      return;
    }
    if (result.transfers.length === 0) {
      appendEmpty(els.settlement, translate("Everyone is settled."));
      return;
    }
    result.transfers.forEach((transfer) => {
      const item = document.createElement("div");
      item.className = "settlement-item";
      setTranslatedContent(item, "{from} owes {to} {amount}", { from: transfer.from, to: transfer.to, amount: formatMoney(transfer.amount) });
      els.settlement.appendChild(item);
    });
  }

  function appendResultItem(container, label, value) {
    const item = document.createElement("div");
    item.className = "result-item";
    const left = document.createElement("span");
    if (typeof label === "object") setTranslatedContent(left, label.message, label.values);
    else left.textContent = label;
    const right = document.createElement("strong");
    if (isArabic && value) {
      const amount = document.createElement("bdi"); amount.setAttribute("dir", "ltr");
      amount.textContent = value; right.appendChild(amount);
    } else right.textContent = value;
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
      state.message = translate("You can add up to 12 people.");
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
      state.message = translate("Add at least two people to split an expense.");
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
      state.message = translate("You can add up to 30 expenses.");
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
    state.people = [createPerson(translate("Person 1")), createPerson(translate("Person 2")), createPerson(translate("Person 3"))];
    state.nextPersonNumber = 4;
    state.expenses = [
      createExpense(translate("Dinner"), "90", state.people[0].id, state.people.map((person) => person.id))
    ];
    state.message = "";
  }

  function useExample() {
    meaningfulEdit = false; transferAttempt = null;
    hasExplicitInteraction = true;
    state.currency = "$";
    state.nextPersonNumber = 1;
    state.people = [createPerson("Alex"), createPerson("Mia"), createPerson("Sam")];
    const alex = state.people[0].id;
    const mia = state.people[1].id;
    const sam = state.people[2].id;
    state.expenses = [
      createExpense(translate("Groceries"), "90", alex, [alex, mia, sam]),
      createExpense(translate("Dinner"), "60", mia, [alex, mia, sam]),
      createExpense(translate("Taxi"), "30", sam, [alex, sam])
    ];
    state.message = "";
    els.currency.value = state.currency;
    render();
  }

  function clearAll() {
    meaningfulEdit = false; transferAttempt = null;
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
    lines.push(translatePlain("Shared expense summary"), "");
    lines.push(translatePlain("Total shared expenses: {amount}", { amount: formatMoney(result.total) }), "");
    lines.push(translatePlain("Paid:"));
    result.net.forEach((row) => lines.push(translatePlain("{name} paid {amount}", { name: row.name, amount: formatMoney(row.paid) })));
    lines.push("", translatePlain("Fair share:"));
    result.net.forEach((row) => lines.push(translatePlain("{name}'s share: {amount}", { name: row.name, amount: formatMoney(row.share) })));
    lines.push("", translatePlain("Settlement:"));
    if (result.transfers.length === 0) {
      lines.push(translatePlain("Everyone is settled."));
    } else {
      result.transfers.forEach((transfer) => {
        lines.push(translatePlain("{from} owes {to} {amount}", { from: transfer.from, to: transfer.to, amount: formatMoney(transfer.amount) }));
      });
    }
    lines.push("", translatePlain("Calculate your own split: {url}", { url: CANONICAL_CALCULATOR_URL }));
    // Keep each copied paragraph’s language direction in either paste context;
    // these isolates are presentation only and never enter raw/native state.
    return (isArabic || isFrench ? lines.map(line => line ? `${isArabic ? "\u2067" : "\u2066"}${line}\u2069` : line) : lines).join("\n");
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
      setActionStatus(translate("Add an expense before copying a summary."));
      return;
    }

    els.copySummary.disabled = true;
    try {
      const copied = await copyTextToClipboard(text);
      if (!copied) {
        setActionStatus(translate("Couldn’t copy the result."));
        return;
      }
      setActionStatus(translate("Copied summary and calculator link."));
      dispatchCalculatorEvent("split_summary_copied");
    } finally {
      els.copySummary.disabled = false;
    }
  }

  async function shareSummary() {
    if (!els.shareSummary || typeof navigator.share !== "function") return;

    const text = getCurrentSummary();
    if (!text) {
      setActionStatus(translate("Add an expense before sharing a summary."));
      return;
    }

    els.shareSummary.disabled = true;
    setActionStatus("");
    try {
      await navigator.share({
        title: translate("Shared expense summary"),
        text,
        url: CANONICAL_CALCULATOR_URL
      });
      setActionStatus(translate("Shared result."));
      dispatchCalculatorEvent("split_summary_shared");
    } catch (error) {
      if (error && error.name === "AbortError") return;

      const copied = await copyTextToClipboard(text);
      if (copied) {
        setActionStatus(translate("Sharing wasn’t available, so the result was copied."));
        dispatchCalculatorEvent("split_share_fallback_copied");
      } else {
        setActionStatus(translate("Couldn’t share or copy the result."));
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
      if (action === "track-split") continueSplit();
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

    root.addEventListener("input", () => { meaningfulEdit = true; markInteraction(); }, true);
    root.addEventListener("change", () => { meaningfulEdit = true; markInteraction(); }, true);
    root.addEventListener("click", function (event) {
      const control = event.target && event.target.closest("button, input, select, textarea");
      if (control && root.contains(control)) markInteraction();
    }, true);
  }

  function init() {
    const root = document.querySelector(".split-calculator");
    if (!root) return;
    els.currency = getRequiredElement("#currency-symbol");
    els.peopleSummary = getRequiredElement("[data-people-summary]");
    els.exampleMarker = getRequiredElement("[data-example-marker]");
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
    try {
      const saved = sessionStorage.getItem("uomi-exp003-return");
      sessionStorage.removeItem("uomi-exp003-return");
      if (saved && saved.length < 16384) {
        const restored = restoreReturnState(JSON.parse(saved));
        if (restored) {
          Object.assign(state, restored.state); meaningfulEdit = true; hasExplicitInteraction = true;
          transferAttempt = restored.transferAttempt;
        }
      }
    } catch (_) { /* Unavailable session storage does not affect local calculation. */ }
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

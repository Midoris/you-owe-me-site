(function () {
  "use strict";

  var MAX_PARTICIPANTS = 20;
  var MIN_PARTICIPANTS = 2;
  var MAX_SAFE_MINOR = Number.MAX_SAFE_INTEGER - 1000000;
  var root;
  var form;
  var els = {};
  var state = {
    adjustmentNumber: 1,
    participantNumber: 1,
    customValues: {},
    paybacks: {},
    payerId: "",
    lastResult: null,
  };

  var adjustmentTypes = [
    { value: "refund", label: "Refund or provider credit", direction: "recovered" },
    { value: "resale", label: "Resale proceeds", direction: "recovered" },
    { value: "replacement", label: "Replacement contribution", direction: "recovered" },
    { value: "other-recovered", label: "Other money recovered", direction: "recovered" },
    { value: "provider-charge", label: "Additional provider charge", direction: "added" },
    { value: "other-added", label: "Other added cost", direction: "added" },
  ];

  var allocationLabels = {
    "canceled-first": "Apply recovered money to canceled places first",
    "all-original": "Share the final cost across all original participants",
    continuing: "Recalculate across continuing participants",
    custom: "Enter a custom agreement",
  };

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeId(prefix, number) {
    return prefix + "-" + number;
  }

  function cleanText(value, limit) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit || 100);
  }

  function sanitizeCurrency(value) {
    return cleanText(value, 4) || "$";
  }

  function currencyValue() {
    return sanitizeCurrency(els.currency ? els.currency.value : "$");
  }

  function formatMoney(minor, currency) {
    var value = Number(minor || 0);
    var sign = value < 0 ? "−" : "";
    var absolute = Math.abs(value);
    var whole = Math.floor(absolute / 100).toLocaleString("en-US");
    var decimals = String(absolute % 100).padStart(2, "0");
    var symbol = currency || currencyValue();
    var spacer = /^[A-Za-z]{2,4}$/.test(symbol) ? " " : "";
    return sign + symbol + spacer + whole + "." + decimals;
  }

  function parseMinor(raw) {
    var text = String(raw || "").trim().replace(/,/g, "");
    if (!text) return { empty: true, valid: false, value: 0 };
    if (!/^\d+(?:\.\d{0,2})?$/.test(text)) return { empty: false, valid: false, value: 0 };
    var parts = text.split(".");
    var major = Number(parts[0]);
    var fraction = Number((parts[1] || "").padEnd(2, "0"));
    var value = major * 100 + fraction;
    if (!Number.isSafeInteger(value) || value > MAX_SAFE_MINOR) return { empty: false, valid: false, value: 0 };
    return { empty: false, valid: true, value: value };
  }

  function hasNegativeValue(raw) {
    return /^\s*-/.test(String(raw || ""));
  }

  function safeAdd(values) {
    var total = 0;
    for (var i = 0; i < values.length; i += 1) {
      total += Number(values[i] || 0);
      if (!Number.isSafeInteger(total) || Math.abs(total) > MAX_SAFE_MINOR) return null;
    }
    return total;
  }

  function selectedValue(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function labelForControl(labelText, control) {
    var label = element("label", "", labelText);
    label.htmlFor = control.id;
    return label;
  }

  function makeErrorSlot(id) {
    var error = element("p", "planner-inline-error");
    error.id = id;
    error.setAttribute("aria-live", "polite");
    return error;
  }

  function makeInput(id, type, value, placeholder) {
    var input = element("input");
    input.id = id;
    input.type = type;
    input.value = value || "";
    input.autocomplete = "off";
    if (placeholder) input.placeholder = placeholder;
    if (type === "text") input.inputMode = "decimal";
    return input;
  }

  function adjustmentTypeMeta(value) {
    for (var i = 0; i < adjustmentTypes.length; i += 1) {
      if (adjustmentTypes[i].value === value) return adjustmentTypes[i];
    }
    return adjustmentTypes[0];
  }

  function createSelect(id, options, selected) {
    var select = element("select");
    select.id = id;
    options.forEach(function (optionData) {
      var option = element("option", "", optionData.label);
      option.value = optionData.value;
      if (optionData.value === selected) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  function createAdjustment(values) {
    values = values || {};
    var number = state.adjustmentNumber;
    state.adjustmentNumber += 1;
    var id = values.id || makeId("adjustment", number);
    var row = element("div", "planner-dynamic-row");
    row.setAttribute("data-adjustment-row", "");
    row.dataset.adjustmentId = id;

    var typeWrap = element("div");
    var typeId = id + "-type";
    var type = createSelect(typeId, adjustmentTypes, values.type || "refund");
    type.setAttribute("data-adjustment-type", "");
    type.setAttribute("aria-describedby", id + "-error");
    typeWrap.append(labelForControl("Change type", type), type);

    var amountWrap = element("div");
    var amountId = id + "-amount";
    var amount = makeInput(amountId, "text", values.amount || "", "0.00");
    amount.setAttribute("data-adjustment-amount", "");
    amount.setAttribute("aria-describedby", id + "-amount-help " + id + "-error");
    var amountHelp = element("p", "planner-helper", "Enter a positive amount. The change type decides whether it is added or subtracted.");
    amountHelp.id = id + "-amount-help";
    amountWrap.append(labelForControl("Amount", amount), amount, amountHelp);

    var noteWrap = element("div");
    var noteId = id + "-note";
    var note = makeInput(noteId, "text", values.note || "", "Partial refund, replacement payment, cancellation fee…");
    note.setAttribute("data-adjustment-note", "");
    note.maxLength = 100;
    noteWrap.append(labelForControl("Short note (optional)", note), note);

    var remove = element("button", "cancellation-secondary-button planner-row-remove", "Remove");
    remove.type = "button";
    remove.setAttribute("data-planner-action", "remove-adjustment");
    remove.setAttribute("aria-label", "Remove cost change " + number);

    row.append(typeWrap, amountWrap, noteWrap, remove, makeErrorSlot(id + "-error"));
    return row;
  }

  function participantRowCount() {
    return els.participants ? els.participants.querySelectorAll("[data-participant-row]").length : 0;
  }

  function createParticipant(values) {
    values = values || {};
    var number = state.participantNumber;
    state.participantNumber += 1;
    var id = values.id || makeId("participant", number);
    var row = element("div", "planner-dynamic-row planner-dynamic-row--participant");
    row.setAttribute("data-participant-row", "");
    row.dataset.participantId = id;
    row.dataset.participantNumber = String(number);

    var nameWrap = element("div");
    var nameId = id + "-name";
    var name = makeInput(nameId, "text", values.name || "", "Alex");
    name.setAttribute("data-participant-name", "");
    name.maxLength = 60;
    nameWrap.append(labelForControl("Name or label", name), name);

    var statusWrap = element("div");
    var statusId = id + "-status";
    var status = createSelect(statusId, [{ value: "continuing", label: "Continuing" }, { value: "canceled", label: "Canceled" }], values.status || "continuing");
    status.setAttribute("data-participant-status", "");
    statusWrap.append(labelForControl("Status", status), status);

    var shareWrap = element("div");
    var shareId = id + "-share";
    var share = makeInput(shareId, "text", values.share || "", "200.00");
    share.setAttribute("data-participant-share", "");
    share.setAttribute("aria-describedby", id + "-share-help " + id + "-error");
    var shareHelp = element("p", "planner-helper", "Enter the share understood before the cancellation or refund.");
    shareHelp.id = id + "-share-help";
    shareWrap.append(labelForControl("Original agreed share", share), share, shareHelp);

    var remove = element("button", "cancellation-secondary-button planner-row-remove", "Remove");
    remove.type = "button";
    remove.setAttribute("data-planner-action", "remove-participant");
    remove.setAttribute("aria-label", "Remove Person " + number);

    row.append(nameWrap, statusWrap, shareWrap, remove, makeErrorSlot(id + "-error"));
    return row;
  }

  function appendAdjustment(values) {
    els.adjustments.appendChild(createAdjustment(values));
    updateLiveSummaries();
  }

  function appendParticipant(values) {
    els.participants.appendChild(createParticipant(values));
    updateRemoveLabels();
    updateLiveSummaries();
  }

  function resetParticipantRows(values) {
    els.participants.replaceChildren();
    state.participantNumber = 1;
    (values || [{}, {}, {}, {}]).forEach(function (participant) {
      appendParticipant(participant);
    });
  }

  function updateRemoveLabels() {
    Array.prototype.slice.call(els.participants.querySelectorAll("[data-participant-row]")).forEach(function (row, index) {
      var nameInput = row.querySelector("[data-participant-name]");
      var button = row.querySelector('[data-planner-action="remove-participant"]');
      if (button) button.setAttribute("aria-label", "Remove " + (cleanText(nameInput.value, 60) || "Person " + (index + 1)));
    });
  }

  function readAdjustments(strict, errors) {
    var adjustments = [];
    Array.prototype.slice.call(els.adjustments.querySelectorAll("[data-adjustment-row]")).forEach(function (row, index) {
      var id = row.dataset.adjustmentId;
      var type = row.querySelector("[data-adjustment-type]").value;
      var amountInput = row.querySelector("[data-adjustment-amount]");
      var parsed = parseMinor(amountInput.value);
      var amount = parsed.valid ? parsed.value : 0;
      if (strict && (!parsed.valid || amount <= 0)) {
        addError(errors, amountInput, id + "-error", "Enter cost changes as positive amounts.");
      }
      adjustments.push({
        id: id,
        index: index,
        type: type,
        amount: amount,
        valid: parsed.valid && amount > 0,
        note: cleanText(row.querySelector("[data-adjustment-note]").value, 100),
        direction: adjustmentTypeMeta(type).direction,
      });
    });
    return adjustments;
  }

  function readCost(strict, errors) {
    var originalParsed = parseMinor(els.originalCost.value);
    var original = originalParsed.valid ? originalParsed.value : 0;
    if (strict && (!originalParsed.valid || original <= 0)) {
      addError(errors, els.originalCost, "planner-original-cost-error", "Enter an original shared cost greater than 0.");
    }
    var adjustments = readAdjustments(strict, errors);
    var addedValues = adjustments.filter(function (item) { return item.direction === "added" && item.valid; }).map(function (item) { return item.amount; });
    var recoveredValues = adjustments.filter(function (item) { return item.direction === "recovered" && item.valid; }).map(function (item) { return item.amount; });
    var added = safeAdd(addedValues);
    var recovered = safeAdd(recoveredValues);
    if (added === null || recovered === null || original + (added || 0) > MAX_SAFE_MINOR) {
      if (strict) addError(errors, els.originalCost, "planner-original-cost-error", "We could not calculate this result. Check the amounts and try again.");
      added = 0;
      recovered = 0;
    }
    var rawFinal = Math.max(0, original) + added - recovered;
    var final = Math.max(0, rawFinal);
    return {
      original: original,
      originalValid: originalParsed.valid && original > 0,
      adjustments: adjustments,
      added: added,
      recovered: recovered,
      rawFinal: rawFinal,
      final: final,
      overRecovery: Math.max(0, -rawFinal),
    };
  }

  function readParticipants(strict, errors) {
    var rows = Array.prototype.slice.call(els.participants.querySelectorAll("[data-participant-row]"));
    if (strict && rows.length < MIN_PARTICIPANTS) {
      addError(errors, els.participants, "participants-error", "Add at least two original participants.");
    }
    var participants = rows.map(function (row, index) {
      var id = row.dataset.participantId;
      var input = row.querySelector("[data-participant-share]");
      var parsed = parseMinor(input.value);
      var share = parsed.valid ? parsed.value : 0;
      var name = cleanText(row.querySelector("[data-participant-name]").value, 60) || "Person " + (index + 1);
      if (strict && (!parsed.valid || hasNegativeValue(input.value))) {
        addError(errors, input, id + "-error", hasNegativeValue(input.value) ? "Original shares cannot be negative." : "Enter an original share for every participant.");
      }
      return {
        id: id,
        index: index,
        name: name,
        status: row.querySelector("[data-participant-status]").value === "canceled" ? "canceled" : "continuing",
        share: share,
        shareValid: parsed.valid && !hasNegativeValue(input.value),
      };
    });
    var total = safeAdd(participants.map(function (participant) { return participant.share; }));
    return { participants: participants, total: total === null ? 0 : total, validTotal: total !== null };
  }

  function sharesMatchCost(cost, people) {
    return cost.originalValid && people.participants.length >= MIN_PARTICIPANTS && people.participants.every(function (person) { return person.shareValid; }) && Math.abs(people.total - cost.original) <= 1;
  }

  function updateLiveSummaries() {
    if (!els.currency) return;
    els.currency.value = sanitizeCurrency(els.currency.value);
    var cost = readCost(false, []);
    var people = readParticipants(false, []);
    var currency = currencyValue();
    els.costOriginal.textContent = cost.originalValid ? formatMoney(cost.original, currency) : "—";
    els.costAdded.textContent = cost.originalValid ? formatMoney(cost.added, currency) : "—";
    els.costRecovered.textContent = cost.originalValid ? formatMoney(cost.recovered, currency) : "—";
    els.costFinal.textContent = cost.originalValid ? formatMoney(cost.final, currency) : "—";
    if (!cost.originalValid) {
      els.costContext.textContent = "";
    } else if (cost.overRecovery > 0) {
      els.costContext.textContent = "Recovered money exceeds the group cost by " + formatMoney(cost.overRecovery, currency) + ". Do not create negative shares automatically. Use a custom agreement or keep the allocation unresolved until the group decides who receives the excess.";
    } else if (cost.final === 0) {
      els.costContext.textContent = "The full group cost has been recovered. Confirm whether any money already paid must now be returned before closing the record.";
    } else {
      els.costContext.textContent = "";
    }
    els.shareTotal.textContent = people.participants.length ? formatMoney(people.total, currency) : "—";
    if (!cost.originalValid || !people.participants.length || !people.participants.every(function (person) { return person.shareValid; })) {
      els.shareContext.textContent = "";
    } else if (Math.abs(people.total - cost.original) <= 1) {
      els.shareContext.textContent = "The original shares match the original shared cost.";
    } else {
      els.shareContext.textContent = "The original shares total " + formatMoney(people.total, currency) + ", which does not match the original shared cost of " + formatMoney(cost.original, currency) + ". Fix the difference before using an automatic allocation approach, or choose Custom agreement or Not agreed yet.";
    }
    updateAllocationAvailability(cost, people);
    updateRemoveLabels();
  }

  function updateAllocationAvailability(cost, people) {
    var canceledCount = people.participants.filter(function (person) { return person.status === "canceled"; }).length;
    var continuingCount = people.participants.filter(function (person) { return person.status === "continuing"; }).length;
    var matching = sharesMatchCost(cost, people);
    var allowAutomatic = cost.originalValid && matching && cost.overRecovery === 0;
    var allowed = {
      "canceled-first": allowAutomatic && canceledCount > 0,
      "all-original": allowAutomatic,
      continuing: allowAutomatic && continuingCount > 0,
      custom: true,
      unresolved: true,
    };
    Object.keys(allowed).forEach(function (value) {
      var input = form.querySelector('input[name="allocation"][value="' + value + '"]');
      if (input) {
        input.disabled = !allowed[value];
        if (input.disabled && input.checked) input.checked = false;
      }
    });
    if (cost.overRecovery > 0) {
      els.allocationContext.textContent = "Automatic allocation approaches are unavailable because recovered money exceeds the group cost.";
    } else if (cost.originalValid && !matching && people.participants.length) {
      els.allocationContext.textContent = "Automatic approaches need original shares that match the original shared cost within one minor currency unit.";
    } else if (cost.originalValid && matching && canceledCount === 0) {
      els.allocationContext.textContent = "Mark at least one participant as canceled to use “Apply recovered money to canceled places first.”";
    } else if (cost.originalValid && matching && continuingCount === 0) {
      els.allocationContext.textContent = "Mark at least one participant as continuing to use “Recalculate across continuing participants.”";
    } else {
      els.allocationContext.textContent = "";
    }
    if (selectedValue("allocation") !== "custom") {
      els.customShares.hidden = true;
    }
  }

  function readCustomValues() {
    Array.prototype.slice.call(els.customShares.querySelectorAll("[data-custom-share]")).forEach(function (input) {
      state.customValues[input.dataset.customFor] = input.value;
    });
  }

  function renderCustomShares(prefill) {
    readCustomValues();
    var people = readParticipants(false, []).participants;
    els.customShares.replaceChildren();
    if (!people.length) {
      els.customShares.hidden = true;
      return;
    }
    people.forEach(function (person) {
      var row = element("div", "planner-custom-row");
      var name = element("span", "", person.name);
      var wrap = element("div");
      var id = "custom-share-" + person.id;
      var input = makeInput(id, "text", prefill && Object.prototype.hasOwnProperty.call(prefill, person.id) ? String(prefill[person.id] / 100) : (state.customValues[person.id] || ""), "0.00");
      input.setAttribute("data-custom-share", "");
      input.dataset.customFor = person.id;
      input.setAttribute("aria-describedby", "custom-error-" + person.id);
      wrap.append(labelForControl("Adjusted share for " + person.name, input), input, makeErrorSlot("custom-error-" + person.id));
      row.append(name, wrap);
      els.customShares.appendChild(row);
    });
    els.customShares.hidden = false;
  }

  function readPaybacks() {
    Array.prototype.slice.call(els.paymentDetails.querySelectorAll("[data-payback-input]")).forEach(function (input) {
      state.paybacks[input.dataset.paybackFor] = input.value;
    });
  }

  function renderPaymentDetails() {
    var status = selectedValue("payment-status") || "none";
    readPaybacks();
    if (status !== "one-payer") {
      els.paymentDetails.hidden = true;
      els.paymentDetails.replaceChildren();
      return;
    }
    var people = readParticipants(false, []).participants;
    els.paymentDetails.replaceChildren();
    if (!people.length) {
      els.paymentDetails.hidden = true;
      return;
    }
    if (!people.some(function (person) { return person.id === state.payerId; })) state.payerId = people[0].id;
    var payerWrap = element("div", "planner-field");
    var payer = element("select");
    payer.id = "planner-payer";
    payer.setAttribute("data-payment-payer", "");
    people.forEach(function (person) {
      var option = element("option", "", person.name);
      option.value = person.id;
      option.selected = person.id === state.payerId;
      payer.appendChild(option);
    });
    payer.setAttribute("aria-describedby", "payment-payer-error");
    payerWrap.append(labelForControl("Person who paid first", payer), payer, makeErrorSlot("payment-payer-error"));
    els.paymentDetails.appendChild(payerWrap);
    people.filter(function (person) { return person.id !== state.payerId; }).forEach(function (person) {
      var row = element("div", "planner-payment-row");
      var labelWrap = element("div");
      var label = element("label", "", "Amount " + person.name + " already paid back");
      var input = makeInput("payback-" + person.id, "text", state.paybacks[person.id] || "", "0.00");
      input.setAttribute("data-payback-input", "");
      input.dataset.paybackFor = person.id;
      input.setAttribute("aria-describedby", "payback-help-" + person.id + " payback-error-" + person.id);
      label.htmlFor = input.id;
      var help = element("p", "planner-helper", "Include money this person already sent toward their adjusted share.");
      help.id = "payback-help-" + person.id;
      labelWrap.append(label, input, help, makeErrorSlot("payback-error-" + person.id));
      row.append(labelWrap);
      els.paymentDetails.appendChild(row);
    });
    els.paymentDetails.hidden = false;
  }

  function clearInlineErrors() {
    Array.prototype.slice.call(form.querySelectorAll("[aria-invalid='true']")).forEach(function (control) {
      control.removeAttribute("aria-invalid");
    });
    Array.prototype.slice.call(form.querySelectorAll(".planner-inline-error")).forEach(function (slot) {
      slot.textContent = "";
    });
    els.errorSummary.hidden = true;
    els.errorList.replaceChildren();
  }

  function addError(errors, control, slotId, text) {
    if (!control || !text) return;
    var exists = errors.some(function (error) { return error.control === control; });
    if (exists) return;
    errors.push({ control: control, slotId: slotId, text: text });
  }

  function displayErrors(errors) {
    if (!errors.length) return;
    errors.forEach(function (error) {
      error.control.setAttribute("aria-invalid", "true");
      if (!error.control.id) error.control.id = "planner-field-" + Math.random().toString(36).slice(2);
      var slot = document.getElementById(error.slotId);
      if (slot) slot.textContent = error.text;
      var item = element("li");
      var link = element("a", "", error.text);
      link.href = "#" + error.control.id;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        error.control.focus();
      });
      item.appendChild(link);
      els.errorList.appendChild(item);
    });
    els.errorSummary.hidden = false;
    els.errorSummary.focus();
  }

  function allocationAllowed(allocation, cost, people) {
    var matching = sharesMatchCost(cost, people);
    var canceled = people.participants.some(function (person) { return person.status === "canceled"; });
    var continuing = people.participants.some(function (person) { return person.status === "continuing"; });
    if (allocation === "canceled-first") return matching && cost.overRecovery === 0 && canceled;
    if (allocation === "all-original") return matching && cost.overRecovery === 0;
    if (allocation === "continuing") return matching && cost.overRecovery === 0 && continuing;
    return allocation === "custom" || allocation === "unresolved";
  }

  function allocateProportionally(total, weights) {
    var cleanWeights = weights.map(function (weight) { return Math.max(0, Math.floor(weight || 0)); });
    var totalWeight = cleanWeights.reduce(function (sum, weight) { return sum + weight; }, 0);
    if (totalWeight <= 0 || total < 0 || !Number.isSafeInteger(total)) return cleanWeights.map(function () { return 0; });
    var totalBig = BigInt(total);
    var denominator = BigInt(totalWeight);
    var rows = cleanWeights.map(function (weight, index) {
      var numerator = totalBig * BigInt(weight);
      return { index: index, amount: Number(numerator / denominator), remainder: numerator % denominator };
    });
    var used = rows.reduce(function (sum, row) { return sum + row.amount; }, 0);
    rows.sort(function (a, b) {
      if (a.remainder > b.remainder) return -1;
      if (a.remainder < b.remainder) return 1;
      return a.index - b.index;
    });
    for (var i = 0; i < total - used; i += 1) rows[i].amount += 1;
    rows.sort(function (a, b) { return a.index - b.index; });
    return rows.map(function (row) { return row.amount; });
  }

  function reconcileShareTotal(shares, target, people) {
    var sum = safeAdd(shares);
    if (sum === null || sum === target) return shares;
    var difference = target - sum;
    var order = people.map(function (person, index) { return { index: index, weight: person.share }; })
      .sort(function (a, b) { return b.weight - a.weight || a.index - b.index; });
    for (var i = 0; i < Math.abs(difference); i += 1) {
      var row = order[i % order.length];
      if (difference > 0) shares[row.index] += 1;
      else if (shares[row.index] > 0) shares[row.index] -= 1;
    }
    return shares;
  }

  function calculateCanceledFirst(cost, people) {
    var participants = people.participants;
    var shares = participants.map(function (person) { return person.share; });
    var addedShares = allocateProportionally(cost.added, shares);
    shares = shares.map(function (share, index) { return share + addedShares[index]; });
    var canceledIndexes = participants.map(function (person, index) { return person.status === "canceled" ? index : -1; }).filter(function (index) { return index >= 0; });
    var continuingIndexes = participants.map(function (person, index) { return person.status === "continuing" ? index : -1; }).filter(function (index) { return index >= 0; });
    var canceledPool = canceledIndexes.reduce(function (sum, index) { return sum + shares[index]; }, 0);
    var recoveredAtCanceled = Math.min(cost.recovered, canceledPool);
    var canceledWeights = canceledIndexes.map(function (index) { return participants[index].share; });
    var canceledRecovery = allocateProportionally(recoveredAtCanceled, canceledWeights);
    canceledIndexes.forEach(function (index, localIndex) {
      shares[index] = Math.max(0, shares[index] - canceledRecovery[localIndex]);
    });
    var remainingRecovery = cost.recovered - recoveredAtCanceled;
    if (remainingRecovery > 0 && continuingIndexes.length) {
      var continuingWeights = continuingIndexes.map(function (index) { return shares[index]; });
      var continuingRecovery = allocateProportionally(remainingRecovery, continuingWeights);
      continuingIndexes.forEach(function (index, localIndex) {
        shares[index] = Math.max(0, shares[index] - continuingRecovery[localIndex]);
      });
    }
    return reconcileShareTotal(shares, cost.final, participants);
  }

  function calculateAutomaticShares(allocation, cost, people) {
    var participants = people.participants;
    if (allocation === "all-original") return allocateProportionally(cost.final, participants.map(function (person) { return person.share; }));
    if (allocation === "continuing") {
      var weights = participants.map(function (person) { return person.status === "continuing" ? person.share : 0; });
      return allocateProportionally(cost.final, weights);
    }
    return calculateCanceledFirst(cost, people);
  }

  function readCustomShares(people, strict, errors, cost) {
    var shares = [];
    var total = 0;
    people.participants.forEach(function (person) {
      var input = els.customShares.querySelector('[data-custom-for="' + person.id + '"]');
      var parsed = input ? parseMinor(input.value) : { valid: false, value: 0 };
      if (strict && (!parsed.valid || hasNegativeValue(input.value))) {
        addError(errors, input, "custom-error-" + person.id, "Enter an adjusted share for every participant.");
      }
      shares.push(parsed.valid ? parsed.value : 0);
      total += parsed.valid ? parsed.value : 0;
    });
    if (strict && total !== cost.final) {
      var control = els.customShares.querySelector("[data-custom-share]") || els.customShares;
      addError(errors, control, "custom-error-" + people.participants[0].id, "Adjusted shares must total " + formatMoney(cost.final) + ". They currently total " + formatMoney(total) + ".");
    }
    return { shares: shares, total: total };
  }

  function readPayment(people, strict, errors) {
    var status = selectedValue("payment-status") || "none";
    readPaybacks();
    var payerId = "";
    var paybacks = {};
    if (status === "one-payer") {
      var payer = els.paymentDetails.querySelector("[data-payment-payer]");
      payerId = payer ? payer.value : "";
      if (strict && !people.participants.some(function (person) { return person.id === payerId; })) {
        addError(errors, payer || els.paymentDetails, "payment-payer-error", "Choose the person who paid first.");
      }
      people.participants.forEach(function (person) {
        if (person.id === payerId) return;
        var input = els.paymentDetails.querySelector('[data-payback-for="' + person.id + '"]');
        var parsed = input ? parseMinor(input.value) : { empty: true, valid: true, value: 0 };
        if (parsed.empty) parsed = { valid: true, value: 0 };
        if (strict && (!parsed.valid || hasNegativeValue(input.value))) {
          addError(errors, input, "payback-error-" + person.id, "Amounts already paid back cannot be negative.");
        }
        paybacks[person.id] = parsed.valid ? parsed.value : 0;
      });
    }
    return { status: status, payerId: payerId, paybacks: paybacks };
  }

  function validateAndCalculate() {
    clearInlineErrors();
    var errors = [];
    var cost = readCost(true, errors);
    var people = readParticipants(true, errors);
    var allocation = selectedValue("allocation");
    var allocationControl = form.querySelector('input[name="allocation"]');
    if (!allocation) {
      addError(errors, allocationControl, "allocation-error", "Choose an allocation approach or select Not agreed yet.");
    } else if (!allocationAllowed(allocation, cost, people)) {
      var message = "We could not calculate this result. Check the amounts and try again.";
      if (allocation === "canceled-first" && !people.participants.some(function (person) { return person.status === "canceled"; })) message = "Mark at least one participant as canceled to use “Apply recovered money to canceled places first.”";
      else if (allocation === "continuing" && !people.participants.some(function (person) { return person.status === "continuing"; })) message = "Mark at least one participant as continuing to use “Recalculate across continuing participants.”";
      else if (cost.overRecovery > 0) message = "Automatic allocation approaches are unavailable because recovered money exceeds the group cost.";
      else if (!sharesMatchCost(cost, people)) message = "Fix the original-share difference before using an automatic allocation approach, or choose Custom agreement or Not agreed yet.";
      addError(errors, form.querySelector('input[name="allocation"][value="' + allocation + '"]') || allocationControl, "allocation-error", message);
    }
    var custom = null;
    if (allocation === "custom") custom = readCustomShares(people, true, errors, cost);
    var payment = readPayment(people, true, errors);
    if (errors.length) {
      displayErrors(errors);
      return null;
    }
    var shares = [];
    if (allocation === "custom") shares = custom.shares;
    else if (allocation !== "unresolved") shares = calculateAutomaticShares(allocation, cost, people);
    return {
      cost: cost,
      people: people.participants,
      allocation: allocation,
      allocationLabel: allocationLabels[allocation] || "",
      shares: shares,
      payment: payment,
    };
  }

  function resultLine(label, value) {
    var row = element("div", "planner-result-line");
    row.append(element("span", "", label), element("strong", "", value));
    return row;
  }

  function participantStatusText(status) {
    return status === "canceled" ? "Canceled" : "Continuing";
  }

  function resultStateFor(person, adjusted, result) {
    if (result.payment.status !== "one-payer") return { label: "", className: "" };
    if (person.id === result.payment.payerId) return { label: "Paid first", className: "" };
    var paid = result.payment.paybacks[person.id] || 0;
    if (paid === adjusted) return { label: "Settled", className: "" };
    if (paid < adjusted) return { label: "Still open: " + formatMoney(adjusted - paid), className: "result-open" };
    return { label: "Amount to return: " + formatMoney(paid - adjusted), className: "result-return" };
  }

  function createResultTable(result) {
    var tableWrap = element("div", "planner-result-table-wrap");
    var table = element("table", "planner-result-table");
    var header = element("thead");
    var headerRow = element("tr");
    ["Person", "Status", "Original share", "Adjusted share"].concat(result.payment.status === "one-payer" ? ["Paid back", "Result"] : []).forEach(function (label) {
      var th = element("th", "", label);
      th.scope = "col";
      headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    var body = element("tbody");
    result.people.forEach(function (person, index) {
      var row = element("tr");
      row.append(element("td", "", person.name), element("td", "", participantStatusText(person.status)), element("td", "", formatMoney(person.share)), element("td", "", formatMoney(result.shares[index])));
      if (result.payment.status === "one-payer") {
        var paid = person.id === result.payment.payerId ? "—" : formatMoney(result.payment.paybacks[person.id] || 0);
        var stateText = resultStateFor(person, result.shares[index], result);
        row.append(element("td", "", paid));
        row.append(element("td", stateText.className, stateText.label));
      }
      body.appendChild(row);
    });
    table.append(header, body);
    tableWrap.appendChild(table);
    return tableWrap;
  }

  function recoverySummary(cost) {
    var labels = cost.adjustments.filter(function (adjustment) { return adjustment.valid && adjustment.direction === "recovered"; }).map(function (adjustment) {
      return adjustment.note || adjustmentTypeMeta(adjustment.type).label.toLowerCase();
    });
    return labels.length ? labels.join(", ") : "no later recovery";
  }

  function buildSummaryText(result) {
    var cost = result.cost;
    var intro = "The original shared cost was " + formatMoney(cost.original) + ". Later added costs were " + formatMoney(cost.added) + ", and " + formatMoney(cost.recovered) + " was recovered through " + recoverySummary(cost) + ", leaving a final unrecovered group cost of " + formatMoney(cost.final) + ".";
    if (result.allocation === "unresolved") {
      return intro + "\n\nWe have not yet agreed how that cost should be divided, so no person-level balance is being treated as final. Please check the cost facts first before we discuss the allocation.";
    }
    var lines = [intro, "", "We used “" + result.allocationLabel + "” as the agreed allocation approach.", ""];
    result.people.forEach(function (person, index) {
      var adjusted = result.shares[index];
      if (result.payment.status !== "one-payer") {
        lines.push(person.name + ": adjusted share " + formatMoney(adjusted) + ".");
        return;
      }
      if (person.id === result.payment.payerId) {
        lines.push(person.name + " paid first. Their adjusted share is " + formatMoney(adjusted) + ".");
        return;
      }
      var paid = result.payment.paybacks[person.id] || 0;
      if (paid === adjusted) lines.push(person.name + ": adjusted share " + formatMoney(adjusted) + ", already paid " + formatMoney(paid) + ", settled.");
      else if (paid < adjusted) lines.push(person.name + ": adjusted share " + formatMoney(adjusted) + ", already paid " + formatMoney(paid) + ", " + formatMoney(adjusted - paid) + " still open.");
      else lines.push(person.name + ": adjusted share " + formatMoney(adjusted) + ", already paid " + formatMoney(paid) + ", " + formatMoney(paid - adjusted) + " to return.");
    });
    lines.push("", "Please check that this matches your understanding before anyone sends or requests more money.");
    return lines.join("\n");
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return copyWithTextarea(text); });
    }
    return copyWithTextarea(text);
  }

  function copyWithTextarea(text) {
    return new Promise(function (resolve, reject) {
      var textarea = element("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        var copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error("Copy failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function setCopyStatus(message) {
    els.copyStatus.textContent = message;
    window.clearTimeout(setCopyStatus.timer);
    setCopyStatus.timer = window.setTimeout(function () {
      if (els.copyStatus.textContent === message) els.copyStatus.textContent = "";
    }, 3000);
  }

  function renderSummary(result, target) {
    var wrap = element("div", "planner-summary-wrap");
    var heading = element("div", "planner-copy-heading");
    var title = element("h4", "", result.allocation === "unresolved" ? "Factual summary" : "Agreed summary");
    var button = element("button", "cancellation-copy-button", result.allocation === "unresolved" ? "Copy factual summary" : "Copy agreed summary");
    button.type = "button";
    button.setAttribute("data-planner-action", "copy-summary");
    var summaryId = "planner-generated-summary";
    button.setAttribute("aria-controls", summaryId);
    heading.append(title, button);
    var text = element("textarea", "planner-summary-text");
    text.id = summaryId;
    text.readOnly = true;
    text.value = buildSummaryText(result);
    text.setAttribute("aria-label", result.allocation === "unresolved" ? "Copyable factual summary" : "Copyable agreed summary");
    wrap.append(heading, text);
    target.appendChild(wrap);
  }

  function renderResult(result) {
    var target = els.resultContent;
    target.replaceChildren();
    var costs = element("div", "planner-result-costs");
    costs.append(
      resultLine("Original shared cost", formatMoney(result.cost.original)),
      resultLine("Later added costs", formatMoney(result.cost.added)),
      resultLine("Money recovered", formatMoney(result.cost.recovered)),
      resultLine("Final unrecovered group cost", formatMoney(result.cost.final))
    );
    target.appendChild(costs);
    if (result.allocation === "unresolved") {
      var unresolved = element("section", "planner-result-unresolved");
      unresolved.append(element("h4", "", "The cost is clear, but the allocation is not agreed"), element("p", "", "The final unrecovered group cost is " + formatMoney(result.cost.final) + ". No person-level share is being treated as final yet. Share the factual summary first and keep the allocation unresolved until the group agrees."));
      target.appendChild(unresolved);
      renderSummary(result, target);
      return;
    }
    target.appendChild(resultLine("Allocation approach", result.allocationLabel));
    target.appendChild(resultLine("Adjusted shares total", formatMoney(safeAdd(result.shares) || 0)));
    var manual = element("button", "cancellation-secondary-button planner-manual-button", "Adjust these amounts manually");
    manual.type = "button";
    manual.setAttribute("data-planner-action", "adjust-manually");
    target.appendChild(manual);
    target.appendChild(createResultTable(result));
    if (result.payment.status === "one-payer") {
      var payer = result.people.filter(function (person) { return person.id === result.payment.payerId; })[0];
      var totalPaid = 0;
      var totalOpen = 0;
      var totalReturn = 0;
      result.people.forEach(function (person, index) {
        if (person.id === result.payment.payerId) return;
        var paid = result.payment.paybacks[person.id] || 0;
        totalPaid += paid;
        if (paid < result.shares[index]) totalOpen += result.shares[index] - paid;
        if (paid > result.shares[index]) totalReturn += paid - result.shares[index];
      });
      var totals = element("div", "planner-result-totals");
      totals.append(resultLine("Paid first by", payer ? payer.name : "—"), resultLine("Total already paid back", formatMoney(totalPaid)), resultLine("Total still open", formatMoney(totalOpen)), resultLine("Total to return", formatMoney(totalReturn)));
      target.appendChild(totals);
      target.appendChild(element("p", "planner-result-note", "A returned amount and an open payback are different directions of money. Keep both visible instead of hiding one inside the other."));
    }
    if (result.payment.status === "several") {
      var several = element("section", "planner-result-several");
      several.append(element("h4", "", "Several people paid"), element("p", "", "The adjusted shares are ready, but several people contributed to the original cost. Enter these adjusted shares and the real payments in the Split Expense Calculator to see who should pay whom."));
      var link = element("a", "", "Open the Split Expense Calculator");
      link.href = "/tools/split-expense-calculator/";
      several.appendChild(link);
      target.appendChild(several);
    }
    renderSummary(result, target);
  }

  function clearResult() {
    state.lastResult = null;
    els.resultContent.hidden = true;
    els.resultContent.replaceChildren();
    els.resultEmpty.hidden = false;
    els.resultStatus.textContent = "";
    els.calculateButton.textContent = "Calculate adjusted shares";
  }

  function calculate(options) {
    options = options || {};
    var result = validateAndCalculate();
    if (!result) return;
    state.lastResult = result;
    renderResult(result);
    els.resultEmpty.hidden = true;
    els.resultContent.hidden = false;
    els.resultStatus.textContent = "Result updated.";
    els.calculateButton.textContent = "Update result";
    if (options.focus !== false) {
      window.setTimeout(function () { els.resultTitle.focus(); }, 0);
    }
  }

  function switchToCustom() {
    if (!state.lastResult || state.lastResult.allocation === "unresolved") return;
    var prefill = {};
    state.lastResult.people.forEach(function (person, index) { prefill[person.id] = state.lastResult.shares[index]; });
    var custom = form.querySelector('input[name="allocation"][value="custom"]');
    custom.checked = true;
    renderCustomShares(prefill);
    updateLiveSummaries();
    var firstInput = els.customShares.querySelector("[data-custom-share]");
    if (firstInput) firstInput.focus();
  }

  function resetPlanner() {
    state.adjustmentNumber = 1;
    state.participantNumber = 1;
    state.customValues = {};
    state.paybacks = {};
    state.payerId = "";
    els.currency.value = "$";
    els.originalCost.value = "";
    els.adjustments.replaceChildren();
    resetParticipantRows([{}, {}, {}, {}]);
    Array.prototype.slice.call(form.querySelectorAll('input[name="allocation"]')).forEach(function (input) { input.checked = false; });
    var none = form.querySelector('input[name="payment-status"][value="none"]');
    if (none) none.checked = true;
    els.customShares.replaceChildren();
    els.customShares.hidden = true;
    renderPaymentDetails();
    clearInlineErrors();
    clearResult();
    updateLiveSummaries();
    els.resultStatus.textContent = "Planner cleared.";
  }

  function loadCabinExample() {
    state.adjustmentNumber = 1;
    state.participantNumber = 1;
    state.customValues = {};
    state.paybacks = {};
    els.currency.value = "$";
    els.originalCost.value = "800";
    els.adjustments.replaceChildren();
    appendAdjustment({ type: "refund", amount: "80", note: "Partial cancellation refund" });
    els.participants.replaceChildren();
    resetParticipantRows([
      { name: "Alex", status: "continuing", share: "200" },
      { name: "Ben", status: "continuing", share: "200" },
      { name: "Maya", status: "canceled", share: "200" },
      { name: "Leo", status: "continuing", share: "200" },
    ]);
    var canceledFirst = form.querySelector('input[name="allocation"][value="canceled-first"]');
    canceledFirst.checked = true;
    var onePayer = form.querySelector('input[name="payment-status"][value="one-payer"]');
    onePayer.checked = true;
    var people = readParticipants(false, []).participants;
    state.payerId = people[0].id;
    renderPaymentDetails();
    clearInlineErrors();
    updateLiveSummaries();
    calculate({ focus: false });
  }

  function openClearDialog() {
    if (els.clearDialog && typeof els.clearDialog.showModal === "function") {
      els.clearDialog.showModal();
      return;
    }
    if (window.confirm("Clear all planner entries?")) resetPlanner();
  }

  function bindEvents() {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      calculate();
    });

    form.addEventListener("input", function (event) {
      var target = event.target;
      if (target === els.currency || target === els.originalCost || target.matches("[data-adjustment-amount], [data-participant-share], [data-participant-name], [data-custom-share]")) {
        updateLiveSummaries();
      }
    });

    form.addEventListener("change", function (event) {
      var target = event.target;
      if (target.matches("[data-adjustment-type], [data-participant-status], [data-participant-share], [data-participant-name]")) {
        updateLiveSummaries();
      }
      if (target.name === "allocation") {
        if (target.value === "custom" && target.checked) renderCustomShares();
        else els.customShares.hidden = true;
      }
      if (target.name === "payment-status") renderPaymentDetails();
      if (target.matches("[data-payment-payer]")) {
        readPaybacks();
        state.payerId = target.value;
        renderPaymentDetails();
      }
    });

    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-planner-action]");
      if (!button) return;
      var action = button.getAttribute("data-planner-action");
      if (action === "load-example") loadCabinExample();
      if (action === "request-clear") openClearDialog();
      if (action === "add-adjustment") appendAdjustment();
      if (action === "remove-adjustment") {
        var adjustment = button.closest("[data-adjustment-row]");
        if (adjustment) adjustment.remove();
        updateLiveSummaries();
      }
      if (action === "add-participant") {
        if (participantRowCount() >= MAX_PARTICIPANTS) {
          clearInlineErrors();
          displayErrors([{ control: els.participants, slotId: "participants-error", text: "The planner supports up to 20 participants." }]);
        } else appendParticipant();
      }
      if (action === "remove-participant") {
        if (participantRowCount() <= MIN_PARTICIPANTS) {
          clearInlineErrors();
          displayErrors([{ control: els.participants, slotId: "participants-error", text: "Add at least two original participants." }]);
        } else {
          var participant = button.closest("[data-participant-row]");
          if (participant) participant.remove();
          renderPaymentDetails();
          updateLiveSummaries();
        }
      }
      if (action === "copy-summary") {
        var textarea = els.resultContent.querySelector(".planner-summary-text");
        if (!textarea) return;
        copyText(textarea.value).then(function () { setCopyStatus("Summary copied."); }).catch(function () { setCopyStatus("The summary could not be copied automatically. Select the text and copy it manually."); });
      }
      if (action === "adjust-manually") switchToCustom();
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-copy-script]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var card = button.closest("[data-script-card]");
        var text = card ? card.querySelector("[data-script-text]") : null;
        if (!text) return;
        copyText(text.textContent.trim()).then(function () { setCopyStatus("Script copied."); }).catch(function () { setCopyStatus("The script could not be copied automatically. Select the text and copy it manually."); });
      });
    });

    if (els.clearDialog) {
      els.clearDialog.addEventListener("close", function () {
        if (els.clearDialog.returnValue === "clear") resetPlanner();
      });
    }
  }

  function init() {
    root = document.querySelector("[data-cancellation-planner]");
    if (!root) return;
    form = document.getElementById("cancellation-planner-form");
    els = {
      currency: document.getElementById("planner-currency"),
      originalCost: document.getElementById("planner-original-cost"),
      adjustments: root.querySelector("[data-adjustments-list]"),
      participants: root.querySelector("[data-participants-list]"),
      customShares: root.querySelector("[data-custom-shares]"),
      paymentDetails: root.querySelector("[data-payment-details]"),
      costOriginal: root.querySelector("[data-cost-original]"),
      costAdded: root.querySelector("[data-cost-added]"),
      costRecovered: root.querySelector("[data-cost-recovered]"),
      costFinal: root.querySelector("[data-cost-final]"),
      costContext: root.querySelector("[data-cost-context]"),
      shareTotal: root.querySelector("[data-original-share-total]"),
      shareContext: root.querySelector("[data-share-context]"),
      allocationContext: root.querySelector("[data-allocation-context]"),
      errorSummary: document.getElementById("planner-error-summary"),
      errorList: root.querySelector("[data-planner-error-list]"),
      resultTitle: document.getElementById("planner-result-title"),
      resultEmpty: root.querySelector("[data-result-empty]"),
      resultContent: root.querySelector("[data-result-content]"),
      resultStatus: root.querySelector("[data-result-status]"),
      calculateButton: root.querySelector("[data-calculate-button]"),
      copyStatus: document.querySelector("[data-copy-status]"),
      clearDialog: document.getElementById("planner-clear-dialog"),
    };
    if (!form || !els.currency || !els.originalCost || !els.participants || !els.adjustments) throw new Error("Planner elements missing");
    resetParticipantRows([{}, {}, {}, {}]);
    renderPaymentDetails();
    bindEvents();
    updateLiveSummaries();
    document.getElementById("planner-init-fallback").hidden = true;
  }

  ready(function () {
    try {
      init();
    } catch (error) {
      var fallback = document.getElementById("planner-init-fallback");
      if (fallback) fallback.hidden = false;
    }
  });
}());

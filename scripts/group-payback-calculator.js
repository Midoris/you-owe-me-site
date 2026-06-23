(function (root, factory) {
  "use strict";

  var api = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.GroupPaybackCalculator = api;

  if (root.document) {
    api.init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  var centsPerUnit = 100;
  var els = {};
  var people = [];
  var personCounter = 0;
  var lastOutputs = {};
  var lastRowsById = {};
  var lastCalculation = null;
  var currentReminderPersonId = "";

  function ready(callback) {
    if (!root.document) return;
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function byId(id) {
    return root.document.getElementById(id);
  }

  function cleanText(value, maxLength) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function parseAmount(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;

    var cleaned = String(value).replace(/[\s,]/g, "");
    if (!cleaned) return null;
    if (/[-+]/.test(cleaned)) return NaN;
    if (!/^(?:\d+|\d*\.\d+)$/.test(cleaned)) return NaN;

    var parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return NaN;

    return Math.round(parsed * centsPerUnit);
  }

  function centsToInput(cents) {
    return (Number(cents || 0) / centsPerUnit).toFixed(2);
  }

  function formatMoney(cents, currencySymbol) {
    var symbol = cleanText(currencySymbol, 8) || "$";
    var amount = Number(cents || 0) / centsPerUnit;

    return symbol + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function plural(count, singular, pluralWord) {
    return count === 1 ? singular : (pluralWord || singular + "s");
  }

  function listNames(names) {
    var cleanNames = (names || []).filter(Boolean);

    if (cleanNames.length === 0) return "";
    if (cleanNames.length === 1) return cleanNames[0];
    if (cleanNames.length === 2) return cleanNames[0] + " and " + cleanNames[1];

    return cleanNames.slice(0, -1).join(", ") + ", and " + cleanNames[cleanNames.length - 1];
  }

  function createPerson(name, isPayer, customShareCents, paidBackCents, note) {
    personCounter += 1;

    return {
      id: "gpc-person-" + personCounter,
      name: name || "",
      isPayer: Boolean(isPayer),
      customShareCents: customShareCents || 0,
      paidBackCents: paidBackCents || 0,
      note: note || "",
    };
  }

  function getCheckedValue(name, fallback) {
    var checked = root.document.querySelector("input[name='" + name + "']:checked");
    return checked ? checked.value : fallback;
  }

  function isPayerIncluded() {
    return getCheckedValue("payerIncluded", "yes") === "yes";
  }

  function getSplitMode() {
    return getCheckedValue("splitMode", "equal");
  }

  function getCurrency() {
    return cleanText(els.currency && els.currency.value, 8) || "$";
  }

  function getReason() {
    return cleanText(els.reason && els.reason.value, 90) || "the shared cost";
  }

  function findPayerIndex(list) {
    var index = (list || []).findIndex(function (person) {
      return person.isPayer;
    });

    return index >= 0 ? index : 0;
  }

  function getPayerName(list) {
    if (!list || list.length === 0) return cleanText(els.payerName && els.payerName.value, 50) || "You";

    var payer = list[findPayerIndex(list)];
    return cleanText(payer && payer.name, 50) || cleanText(els.payerName && els.payerName.value, 50) || "You";
  }

  function syncPeopleFromDom() {
    var rows = Array.prototype.slice.call(root.document.querySelectorAll("[data-person-row]"));
    var nextPeople = rows.map(function (row, index) {
      var id = row.getAttribute("data-person-id");
      var existing = people.find(function (person) { return person.id === id; }) || {};
      var nameInput = row.querySelector("[data-person-name]");
      var payerInput = row.querySelector("[data-person-payer]");
      var shareInput = row.querySelector("[data-person-share]");
      var paidBackInput = row.querySelector("[data-person-paid-back]");
      var noteInput = row.querySelector("[data-person-note]");
      var shareParsed = parseAmount(shareInput && shareInput.value);
      var paidBackParsed = parseAmount(paidBackInput && paidBackInput.value);

      return {
        id: id || existing.id || "gpc-person-" + index,
        name: cleanText(nameInput && nameInput.value, 50),
        isPayer: Boolean(payerInput && payerInput.checked),
        customShareCents: shareParsed === null || Number.isNaN(shareParsed) ? (existing.customShareCents || 0) : shareParsed,
        paidBackCents: paidBackParsed === null || Number.isNaN(paidBackParsed) ? (existing.paidBackCents || 0) : paidBackParsed,
        shareInvalid: Number.isNaN(shareParsed),
        paidBackInvalid: Number.isNaN(paidBackParsed),
        note: cleanText(noteInput && noteInput.value, 90),
      };
    });

    if (nextPeople.length && !nextPeople.some(function (person) { return person.isPayer; })) {
      nextPeople[0].isPayer = true;
    }

    people = nextPeople;
    syncPayerNameFromPeople();
  }

  function syncPayerNameFromPeople() {
    if (!els.payerName || !people.length) return;

    var payer = people[findPayerIndex(people)];
    els.payerName.value = cleanText(payer && payer.name, 50) || "You";
  }

  function syncPayerRowFromName() {
    if (!els.payerName || !people.length) return;

    var name = cleanText(els.payerName.value, 50);
    var payerIndex = findPayerIndex(people);
    var payerRow = root.document.querySelector("[data-person-id='" + people[payerIndex].id + "']");
    var nameInput = payerRow && payerRow.querySelector("[data-person-name]");

    people[payerIndex].name = name;
    if (nameInput && nameInput.value !== name) {
      nameInput.value = name;
    }
  }

  function renderPeopleRows() {
    if (!els.peopleList) return;

    var splitMode = getSplitMode();
    var payerIncluded = isPayerIncluded();

    els.peopleList.innerHTML = people.map(function (person, index) {
      var enteredName = cleanText(person.name, 50);
      var displayName = enteredName || (index === 0 ? "You" : "Person " + (index + 1));
      var shareDisabled = splitMode === "equal" || (!payerIncluded && person.isPayer);
      var paidDisabled = person.isPayer;
      var shareValue = centsToInput(person.customShareCents);
      var paidBackValue = centsToInput(person.isPayer ? 0 : person.paidBackCents);
      var shareHelp = splitMode === "equal" ? "Calculated automatically." : "Editable custom share.";
      var paidHelp = person.isPayer
        ? (payerIncluded ? "Covered by paying first." : "Paid on behalf of the group.")
        : "";

      return [
        "<div class=\"gpc-person-row\" data-person-row data-person-id=\"" + escapeAttr(person.id) + "\">",
          "<label class=\"gpc-payer-radio\" for=\"gpc-payer-" + escapeAttr(person.id) + "\">",
            "<input id=\"gpc-payer-" + escapeAttr(person.id) + "\" type=\"radio\" name=\"gpc-paid-first-person\" data-person-payer value=\"" + escapeAttr(person.id) + "\"" + (person.isPayer ? " checked" : "") + " />",
            "<span><strong>Paid first</strong><small>Mark the person who covered the cost.</small></span>",
          "</label>",
          "<div class=\"gpc-field\">",
            "<label for=\"gpc-name-" + escapeAttr(person.id) + "\">Name</label>",
            "<input id=\"gpc-name-" + escapeAttr(person.id) + "\" type=\"text\" maxlength=\"50\" value=\"" + escapeAttr(enteredName) + "\" autocomplete=\"off\" data-person-name />",
          "</div>",
          "<div class=\"gpc-field\">",
            "<label for=\"gpc-share-" + escapeAttr(person.id) + "\">Share amount</label>",
            "<input id=\"gpc-share-" + escapeAttr(person.id) + "\" type=\"number\" min=\"0\" step=\"0.01\" inputmode=\"decimal\" value=\"" + escapeAttr(shareValue) + "\" autocomplete=\"off\" data-person-share" + (shareDisabled ? " disabled" : "") + " />",
            "<p class=\"gpc-field-hint\" data-share-hint>" + escapeHtml(shareHelp) + "</p>",
          "</div>",
          "<div class=\"gpc-field\">",
            "<label for=\"gpc-paid-" + escapeAttr(person.id) + "\">Amount already paid back</label>",
            "<input id=\"gpc-paid-" + escapeAttr(person.id) + "\" type=\"number\" min=\"0\" step=\"0.01\" inputmode=\"decimal\" value=\"" + escapeAttr(paidBackValue) + "\" autocomplete=\"off\" data-person-paid-back" + (paidDisabled ? " disabled" : "") + " />",
            "<p class=\"gpc-field-hint\" data-paid-hint>" + escapeHtml(paidHelp) + "</p>",
          "</div>",
          "<div class=\"gpc-field\">",
            "<label for=\"gpc-note-" + escapeAttr(person.id) + "\">Optional note</label>",
            "<input id=\"gpc-note-" + escapeAttr(person.id) + "\" type=\"text\" maxlength=\"90\" value=\"" + escapeAttr(person.note || "") + "\" autocomplete=\"off\" data-person-note />",
            "<p class=\"gpc-field-hint\" data-row-hint></p>",
          "</div>",
          "<button type=\"button\" class=\"gpc-icon-button\" data-action=\"remove-person\" aria-label=\"Remove " + escapeAttr(displayName) + "\">Remove</button>",
        "</div>",
      ].join("");
    }).join("");
  }

  function loadExample(options) {
    if (els.currency) els.currency.value = "$";
    if (els.reason) els.reason.value = "Cabin booking deposit";
    if (els.total) els.total.value = "360";
    if (els.payerName) els.payerName.value = "You";
    if (els.checkInDate) els.checkInDate.value = "";

    setRadioValue("payerIncluded", "yes");
    setRadioValue("splitMode", "equal");

    people = [
      createPerson("You", true, 6000, 0),
      createPerson("Alex", false, 6000, 6000),
      createPerson("Maya", false, 6000, 6000),
      createPerson("Leo", false, 6000, 3000),
      createPerson("Sam", false, 6000, 0),
      createPerson("Nina", false, 6000, 0),
    ];

    renderPeopleRows();
    update();

    if (options && options.scroll && els.tool) {
      els.tool.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function startBlank() {
    if (els.currency) els.currency.value = "$";
    if (els.reason) els.reason.value = "";
    if (els.total) els.total.value = "";
    if (els.payerName) els.payerName.value = "You";
    if (els.checkInDate) els.checkInDate.value = "";

    setRadioValue("payerIncluded", "yes");
    setRadioValue("splitMode", "equal");

    people = [
      createPerson("You", true, 0, 0),
      createPerson("", false, 0, 0),
    ];

    renderPeopleRows();
    update();
  }

  function setRadioValue(name, value) {
    var input = root.document.querySelector("input[name='" + name + "'][value='" + value + "']");
    if (input) input.checked = true;
  }

  function addPerson() {
    syncPeopleFromDom();
    people.push(createPerson("", false, 0, 0));
    renderPeopleRows();
    update();
  }

  function removePerson(button) {
    var row = button.closest("[data-person-row]");
    if (!row) return;

    syncPeopleFromDom();
    people = people.filter(function (person) {
      return person.id !== row.getAttribute("data-person-id");
    });

    if (people.length && !people.some(function (person) { return person.isPayer; })) {
      people[0].isPayer = true;
    }

    renderPeopleRows();
    update();
  }

  function calculateSharesForPeople(list, totalCents, splitMode, payerIncluded, currency, warnings) {
    var payerIndex = findPayerIndex(list);
    var eligibleIndexes = list.map(function (_, index) { return index; }).filter(function (index) {
      return payerIncluded || index !== payerIndex;
    });
    var shares = list.map(function () { return 0; });

    if (eligibleIndexes.length === 0) {
      warnings.push("Add at least one person besides the payer to track paybacks.");
      return shares;
    }

    if (splitMode === "equal") {
      if (!totalCents || totalCents <= 0) return shares;

      var base = Math.floor(totalCents / eligibleIndexes.length);
      var remainder = totalCents - (base * eligibleIndexes.length);

      eligibleIndexes.forEach(function (personIndex, offset) {
        shares[personIndex] = base + (offset < remainder ? 1 : 0);
      });

      if (remainder > 0) {
        warnings.push("Small cent differences may appear so the shares add up to the exact total.");
      }

      return shares;
    }

    eligibleIndexes.forEach(function (personIndex) {
      shares[personIndex] = list[personIndex].customShareCents || 0;
    });

    if (totalCents && totalCents > 0) {
      var customTotal = shares.reduce(function (sum, cents) { return sum + cents; }, 0);
      var difference = totalCents - customTotal;

      if (difference > 0) {
        warnings.push("Custom shares are " + formatMoney(difference, currency) + " short of the total.");
      } else if (difference < 0) {
        warnings.push("Custom shares are " + formatMoney(Math.abs(difference), currency) + " over the total.");
      }
    }

    return shares;
  }

  function calculateShares(totalCents, splitMode, payerIncluded, warnings) {
    return calculateSharesForPeople(people, totalCents, splitMode, payerIncluded, getCurrency(), warnings);
  }

  function statusForRow(person, shareCents, paidBackCents, isPayer, payerIncluded, currency) {
    if (isPayer) {
      return {
        label: payerIncluded ? "Paid first" : "Paid first",
        detail: payerIncluded ? "Own share covered" : "Paid on behalf of the group",
        key: payerIncluded ? "covered" : "paid-first",
        stillOpenCents: 0,
        overpaidCents: 0,
      };
    }

    if (shareCents === 0) {
      return {
        label: "No share",
        detail: "No amount included",
        key: "none",
        stillOpenCents: 0,
        overpaidCents: Math.max(0, paidBackCents),
      };
    }

    if (paidBackCents > shareCents) {
      return {
        label: "Overpaid",
        detail: formatMoney(paidBackCents - shareCents, currency) + " over share",
        key: "overpaid",
        stillOpenCents: 0,
        overpaidCents: paidBackCents - shareCents,
      };
    }

    if (paidBackCents === shareCents) {
      return {
        label: "Paid",
        detail: "Share covered",
        key: "paid",
        stillOpenCents: 0,
        overpaidCents: 0,
      };
    }

    if (paidBackCents > 0) {
      return {
        label: "Partly paid",
        detail: "Partial payback recorded",
        key: "partial",
        stillOpenCents: shareCents - paidBackCents,
        overpaidCents: 0,
      };
    }

    return {
      label: "Still open",
      detail: "No payback recorded",
      key: "open",
      stillOpenCents: shareCents,
      overpaidCents: 0,
    };
  }

  function normalizeStatePeople(statePeople) {
    var list = (statePeople || []).map(function (person, index) {
      return {
        id: person.id || "gpc-state-person-" + index,
        name: cleanText(person.name, 50),
        isPayer: Boolean(person.isPayer),
        customShareCents: Math.max(0, Number(person.customShareCents || 0)),
        paidBackCents: Math.max(0, Number(person.paidBackCents || 0)),
        shareInvalid: Boolean(person.shareInvalid),
        paidBackInvalid: Boolean(person.paidBackInvalid),
        note: cleanText(person.note, 90),
      };
    });

    if (list.length && !list.some(function (person) { return person.isPayer; })) {
      list[0].isPayer = true;
    }

    return list;
  }

  function calculateFromState(state) {
    var statePeople = normalizeStatePeople(state && state.people);
    var currency = cleanText(state && state.currency, 8) || "$";
    var reason = cleanText(state && state.reason, 90) || "the shared cost";
    var splitMode = state && state.splitMode === "custom" ? "custom" : "equal";
    var payerIncluded = !(state && state.payerIncluded === false);
    var totalCents = Math.max(0, Number(state && state.totalCents) || 0);
    var warnings = [];
    var hardMessages = [];
    var payerIndex = findPayerIndex(statePeople);
    var hasInvalidTotal = (state && state.totalInvalid) || totalCents <= 0;
    var shareCentsList;
    var rows;

    if (hasInvalidTotal) {
      hardMessages.push("Enter a total amount greater than 0.");
    }

    if (!statePeople.length) {
      hardMessages.push("Add at least one person besides the payer to track paybacks.");
    } else if (statePeople.filter(function (person, index) { return index !== payerIndex; }).length === 0) {
      hardMessages.push("Add at least one person besides the payer to track paybacks.");
    }

    statePeople.forEach(function (person) {
      if (person.shareInvalid && splitMode === "custom") {
        warnings.push((cleanText(person.name, 50) || "A person") + " has an invalid custom share.");
      }

      if (person.paidBackInvalid) {
        warnings.push((cleanText(person.name, 50) || "A person") + " has an invalid paid-back amount.");
      }
    });

    shareCentsList = calculateSharesForPeople(statePeople, totalCents, splitMode, payerIncluded, currency, warnings);

    rows = statePeople.map(function (person, index) {
      var isPayer = index === payerIndex;
      var shareCents = shareCentsList[index] || 0;
      var paidBackCents = isPayer ? 0 : Math.max(0, person.paidBackCents || 0);
      var status = statusForRow(person, shareCents, paidBackCents, isPayer, payerIncluded, currency);
      var displayName = cleanText(person.name, 50) || (isPayer ? "You" : "Person " + (index + 1));

      if (!hasInvalidTotal && status.overpaidCents > 0) {
        warnings.push(displayName + " has paid " + formatMoney(status.overpaidCents, currency) + " more than their share.");
      }

      return {
        id: person.id,
        name: displayName,
        isPayer: isPayer,
        shareCents: shareCents,
        paidBackCents: paidBackCents,
        stillOpenCents: status.stillOpenCents,
        overpaidCents: status.overpaidCents,
        status: status.label,
        statusDetail: status.detail,
        statusKey: status.key,
        note: person.note,
      };
    });

    var payerRow = rows[payerIndex] || null;
    var nonPayerRows = rows.filter(function (row) { return !row.isPayer; });
    var expectedBackCents = nonPayerRows.reduce(function (sum, row) { return sum + row.shareCents; }, 0);
    var paidBackCents = nonPayerRows.reduce(function (sum, row) { return sum + row.paidBackCents; }, 0);
    var stillOpenCents = nonPayerRows.reduce(function (sum, row) { return sum + row.stillOpenCents; }, 0);
    var paidRows = nonPayerRows.filter(function (row) { return row.statusKey === "paid"; });
    var partialRows = nonPayerRows.filter(function (row) { return row.statusKey === "partial"; });
    var openRows = nonPayerRows.filter(function (row) { return row.statusKey === "open"; });
    var peopleWithOpen = nonPayerRows.filter(function (row) { return row.stillOpenCents > 0; });
    var overpaidRows = nonPayerRows.filter(function (row) { return row.statusKey === "overpaid"; });

    return {
      currency: currency,
      reason: reason,
      totalCents: totalCents,
      splitMode: splitMode,
      payerIncluded: payerIncluded,
      payerName: cleanText(state && state.payerName, 50) || getPayerName(statePeople),
      payerOwnShareCents: payerRow && payerIncluded ? payerRow.shareCents : 0,
      expectedBackCents: expectedBackCents,
      paidBackCents: paidBackCents,
      stillOpenCents: stillOpenCents,
      rows: rows,
      paidRows: paidRows,
      partialRows: partialRows,
      openRows: openRows,
      peopleWithOpen: peopleWithOpen,
      overpaidRows: overpaidRows,
      warnings: warnings,
      hardMessages: hardMessages,
    };
  }

  function calculate() {
    syncPeopleFromDom();

    var totalParsed = parseAmount(els.total && els.total.value);
    var totalInvalid = totalParsed === null || Number.isNaN(totalParsed) || totalParsed <= 0;

    return calculateFromState({
      currency: getCurrency(),
      reason: getReason(),
      splitMode: getSplitMode(),
      payerIncluded: isPayerIncluded(),
      totalCents: totalInvalid ? 0 : totalParsed,
      totalInvalid: totalInvalid,
      payerName: getPayerName(people),
      people: people,
    });
  }

  function updateCalculatedInputs(calc) {
    calc.rows.forEach(function (row) {
      var personRow = root.document.querySelector("[data-person-id='" + row.id + "']");
      if (!personRow) return;

      var shareInput = personRow.querySelector("[data-person-share]");
      var paidInput = personRow.querySelector("[data-person-paid-back]");
      var shareHint = personRow.querySelector("[data-share-hint]");
      var paidHint = personRow.querySelector("[data-paid-hint]");
      var rowHint = personRow.querySelector("[data-row-hint]");
      var splitMode = calc.splitMode;

      if (shareInput) {
        var shareDisabled = splitMode === "equal" || (!calc.payerIncluded && row.isPayer);
        shareInput.disabled = shareDisabled;
        if (shareDisabled) shareInput.value = centsToInput(row.shareCents);
      }

      if (paidInput) {
        paidInput.disabled = row.isPayer;
        if (row.isPayer) paidInput.value = "0.00";
      }

      if (shareHint) {
        if (splitMode === "equal") {
          shareHint.textContent = "Calculated automatically.";
        } else if (!calc.payerIncluded && row.isPayer) {
          shareHint.textContent = "Not included in the split.";
        } else {
          shareHint.textContent = "Editable custom share.";
        }
      }

      if (paidHint) {
        paidHint.textContent = row.isPayer
          ? (calc.payerIncluded ? "Covered by paying first." : "Paid on behalf of the group.")
          : "";
      }

      if (rowHint) {
        rowHint.textContent = row.overpaidCents > 0
          ? "Overpaid by " + formatMoney(row.overpaidCents, calc.currency) + "."
          : "";
      }
    });
  }

  function actionForRow(row) {
    if (row.isPayer) return "";
    if (row.statusKey === "paid") return "Copy receipt note";
    if (row.statusKey === "partial") return "Copy partial update";
    if (row.statusKey === "open") return "Copy reminder";
    if (row.statusKey === "overpaid") return "Copy overpaid note";
    return "";
  }

  function renderStatusTable(calc) {
    if (!els.statusTable) return;

    els.statusTable.innerHTML = calc.rows.map(function (row) {
      var actionLabel = actionForRow(row);
      var actionMarkup = actionLabel
        ? "<button type=\"button\" class=\"gpc-copy-button\" data-row-copy=\"" + escapeAttr(row.id) + "\">" + escapeHtml(actionLabel) + "</button>"
        : "<span>No action needed</span>";
      var personLabel = row.name + (row.isPayer ? " (paid first)" : "");

      return [
        "<tr>",
          "<td data-label=\"Person\"><strong>" + escapeHtml(personLabel) + "</strong></td>",
          "<td data-label=\"Share\">" + escapeHtml(formatMoney(row.shareCents, calc.currency)) + "</td>",
          "<td data-label=\"Paid back\">" + escapeHtml(row.isPayer ? row.statusDetail : formatMoney(row.paidBackCents, calc.currency)) + "</td>",
          "<td data-label=\"Still open\">" + escapeHtml(formatMoney(row.stillOpenCents, calc.currency)) + "</td>",
          "<td data-label=\"Status\"><span class=\"gpc-status-chip gpc-status-chip--" + escapeAttr(row.statusKey) + "\">" + escapeHtml(row.status) + "</span></td>",
          "<td data-label=\"Next action\">" + actionMarkup + "</td>",
        "</tr>",
      ].join("");
    }).join("");
  }

  function buildResultHeadline(calc) {
    if (calc.hardMessages.length) return calc.hardMessages[0];
    if (calc.peopleWithOpen.length === 0) return "Everyone is settled";

    return formatMoney(calc.stillOpenCents, calc.currency) + " still open from " + calc.peopleWithOpen.length + " " + plural(calc.peopleWithOpen.length, "person", "people") + ".";
  }

  function buildResultSupport(calc) {
    if (calc.hardMessages.length) return "Add a clear total and at least one person besides the payer.";
    if (calc.peopleWithOpen.length === 0) return "All non-payer shares are paid or closed.";

    var parts = [];
    if (calc.partialRows.length) {
      parts.push(listNames(calc.partialRows.map(function (row) { return row.name; })) + " " + (calc.partialRows.length === 1 ? "partly paid" : "partly paid"));
    }
    if (calc.openRows.length) {
      parts.push(listNames(calc.openRows.map(function (row) { return row.name; })) + " " + (calc.openRows.length === 1 ? "is still open" : "are still open"));
    }
    if (calc.overpaidRows.length) {
      parts.push(listNames(calc.overpaidRows.map(function (row) { return row.name; })) + " " + (calc.overpaidRows.length === 1 ? "overpaid" : "overpaid"));
    }

    return parts.length ? parts.join(". ") + "." : "";
  }

  function updateSummary(calc) {
    setText("[data-result-headline]", buildResultHeadline(calc));
    setText("[data-result-support]", buildResultSupport(calc));
    setText("[data-result-status]", calc.peopleWithOpen.length ? "Open paybacks" : "Settled");
    setText("[data-summary-total]", formatMoney(calc.totalCents, calc.currency));
    setText("[data-summary-payer-share]", formatMoney(calc.payerOwnShareCents, calc.currency));
    setText("[data-summary-expected]", formatMoney(calc.expectedBackCents, calc.currency));
    setText("[data-summary-paid-back]", formatMoney(calc.paidBackCents, calc.currency));
    setText("[data-summary-open]", formatMoney(calc.stillOpenCents, calc.currency));
    setText("[data-summary-paid-count]", calc.paidRows.length + " " + plural(calc.paidRows.length, "person", "people"));
    setText("[data-summary-partial-count]", calc.partialRows.length + " " + plural(calc.partialRows.length, "person", "people"));
    setText("[data-summary-open-count]", calc.openRows.length + " " + plural(calc.openRows.length, "person", "people"));

    if (els.totalError) {
      els.totalError.textContent = calc.hardMessages.some(function (message) { return message.indexOf("total") >= 0; }) ? "Enter a total amount greater than 0." : "";
    }

    if (els.peopleError) {
      var peopleMessage = calc.hardMessages.find(function (message) { return message.indexOf("person") >= 0; });
      els.peopleError.textContent = peopleMessage || "";
    }

    if (els.warning) {
      var warningMessages = calc.warnings.slice();
      if (calc.hardMessages.length) {
        warningMessages = calc.hardMessages.concat(warningMessages);
      }
      els.warning.textContent = warningMessages.join(" ");
    }
  }

  function setText(selector, value) {
    var node = root.document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function groupRowsByOpenAmount(rows) {
    var groups = {};

    rows.forEach(function (row) {
      var key = String(row.stillOpenCents);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    return Object.keys(groups).map(function (key) {
      return {
        cents: Number(key),
        rows: groups[key],
      };
    }).sort(function (a, b) {
      return b.cents - a.cents;
    });
  }

  function describeOpenRows(rows, currency) {
    if (!rows.length) return "";

    return groupRowsByOpenAmount(rows).map(function (group) {
      var names = group.rows.map(function (row) { return row.name; });
      var amount = formatMoney(group.cents, currency);

      if (names.length === 1) return names[0] + " has " + amount + " still open";
      return listNames(names) + " each have " + amount + " still open";
    }).join(". ");
  }

  function sharePhrase(calc) {
    var nonPayerRows = calc.rows.filter(function (row) { return !row.isPayer && row.shareCents > 0; });
    var firstShare = nonPayerRows.length ? nonPayerRows[0].shareCents : 0;
    var allSame = nonPayerRows.length > 0 && nonPayerRows.every(function (row) {
      return row.shareCents === firstShare;
    });

    if (calc.splitMode === "equal") {
      if (allSame) return "each share was " + formatMoney(firstShare, calc.currency);
      return "shares were split equally, with small cent differences to keep the total exact";
    }

    return "shares were entered individually";
  }

  function buildGroupUpdate(calc) {
    if (calc.hardMessages.length) return "Add the group cost and people first, then this group update will be ready to copy.";

    var paidNames = listNames(calc.paidRows.map(function (row) { return row.name; }));
    var openRows = calc.peopleWithOpen;
    var openSentences = [];
    var sentences = [
      "Group payback update for " + calc.reason + ": the total was " + formatMoney(calc.totalCents, calc.currency) + " and " + sharePhrase(calc) + ".",
    ];

    if (paidNames) {
      sentences.push(paidNames + (calc.paidRows.length === 1 ? " is paid." : " are paid."));
    }

    if (openRows.length) {
      if (calc.partialRows.length) {
        openSentences.push(describeOpenRows(calc.partialRows, calc.currency));
      }
      if (calc.openRows.length) {
        openSentences.push(describeOpenRows(calc.openRows, calc.currency));
      }
      sentences.push(openSentences.filter(Boolean).join(". ") + ".");
      sentences.push("Total still open: " + formatMoney(calc.stillOpenCents, calc.currency) + ".");
    } else {
      sentences.push("Everyone is settled.");
    }

    if (calc.overpaidRows.length) {
      sentences.push("There is an overpaid row to check before sending a final update.");
    }

    return sentences.join(" ");
  }

  function buildIndividualReminder(row, calc) {
    if (!row) return "Everyone is settled right now, so there is no individual reminder to send.";

    if (row.paidBackCents > 0) {
      return "Hey " + row.name + ", thanks for sending " + formatMoney(row.paidBackCents, calc.currency) + " for " + calc.reason + ". I marked that down, so " + formatMoney(row.stillOpenCents, calc.currency) + " is still open from your " + formatMoney(row.shareCents, calc.currency) + " share. Just sending the update so we both have the same number.";
    }

    return "Hey " + row.name + ", quick reminder for " + calc.reason + ": your share is " + formatMoney(row.shareCents, calc.currency) + ". Whenever you get a chance, you can send it over. I'm just keeping the list clear so I don't lose track.";
  }

  function buildPartialAcknowledgment(calc) {
    var row = calc.partialRows[0] || null;
    if (!row) return "When someone sends part of their share, this will create a short acknowledgment with the amount paid back and what remains open.";

    return "Thanks for sending " + formatMoney(row.paidBackCents, calc.currency) + ". I marked it for " + calc.reason + ", so " + formatMoney(row.stillOpenCents, calc.currency) + " is still open from your " + formatMoney(row.shareCents, calc.currency) + " share.";
  }

  function buildClosingMessage(calc) {
    return "Thanks everyone - " + calc.reason + " is settled. I marked all shares as paid.";
  }

  function buildRecordNote(calc) {
    if (calc.hardMessages.length) return "Group Payback: add a total and people first.";

    var lines = [
      "Group Payback: " + calc.reason + ".",
      "Total: " + formatMoney(calc.totalCents, calc.currency) + ".",
      "Paid first by " + calc.payerName + ".",
      "Share: " + sharePhrase(calc) + ".",
      "Paid back so far: " + formatMoney(calc.paidBackCents, calc.currency) + ".",
      "Still open: " + formatMoney(calc.stillOpenCents, calc.currency) + ".",
    ];

    if (calc.peopleWithOpen.length) {
      calc.peopleWithOpen.forEach(function (row) {
        lines.push(row.name + " still owes " + formatMoney(row.stillOpenCents, calc.currency) + ".");
      });
    } else {
      lines.push("All shares are settled.");
    }

    if (els.checkInDate && els.checkInDate.value) {
      lines.push("Check-in date: " + els.checkInDate.value + ".");
    }

    return lines.join("\n");
  }

  function buildRowCopy(row, calc) {
    if (!row) return "";

    if (row.statusKey === "paid") {
      return "Thanks " + row.name + " - I marked your " + formatMoney(row.paidBackCents, calc.currency) + " payback for " + calc.reason + ". Your share is paid.";
    }

    if (row.statusKey === "partial") {
      return buildIndividualReminder(row, calc);
    }

    if (row.statusKey === "open") {
      return buildIndividualReminder(row, calc);
    }

    if (row.statusKey === "overpaid") {
      return row.name + " has paid " + formatMoney(row.overpaidCents, calc.currency) + " more than their " + formatMoney(row.shareCents, calc.currency) + " share for " + calc.reason + ". Let's check the record so the list stays clear.";
    }

    return "";
  }

  function updateReminderSelect(calc) {
    if (!els.reminderSelect) return;

    var rows = calc.peopleWithOpen;
    var previous = currentReminderPersonId || els.reminderSelect.value;

    els.reminderSelect.innerHTML = rows.length
      ? rows.map(function (row) {
        return "<option value=\"" + escapeAttr(row.id) + "\">" + escapeHtml(row.name) + "</option>";
      }).join("")
      : "<option value=\"\">Everyone settled</option>";

    if (rows.some(function (row) { return row.id === previous; })) {
      els.reminderSelect.value = previous;
    } else if (rows.length) {
      els.reminderSelect.value = rows[0].id;
    }

    currentReminderPersonId = els.reminderSelect.value;
  }

  function updateOutputs(calc) {
    updateReminderSelect(calc);

    var selectedRow = calc.peopleWithOpen.find(function (row) {
      return row.id === currentReminderPersonId;
    }) || calc.peopleWithOpen[0] || null;
    var settled = calc.peopleWithOpen.length === 0 && calc.hardMessages.length === 0;

    lastOutputs = {
      groupUpdate: buildGroupUpdate(calc),
      individualReminder: buildIndividualReminder(selectedRow, calc),
      partialAcknowledgment: buildPartialAcknowledgment(calc),
      closingMessage: buildClosingMessage(calc),
      recordNote: buildRecordNote(calc),
    };

    Object.keys(lastOutputs).forEach(function (key) {
      var target = root.document.querySelector("[data-output='" + key + "']");
      if (target) target.textContent = lastOutputs[key];
    });

    var closingLabel = root.document.querySelector("[data-closing-label]");
    if (closingLabel) closingLabel.textContent = settled ? "ready" : "for later";
  }

  function update() {
    var calc = calculate();
    lastCalculation = calc;
    lastRowsById = {};
    calc.rows.forEach(function (row) {
      lastRowsById[row.id] = row;
    });

    updateCalculatedInputs(calc);
    updateSummary(calc);
    renderStatusTable(calc);
    updateOutputs(calc);
  }

  function copyText(text) {
    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
      return root.navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = root.document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      root.document.body.appendChild(textarea);
      textarea.select();

      try {
        root.document.execCommand("copy");
        root.document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        root.document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function showCopied(button, message) {
    if (els.copyStatus) {
      els.copyStatus.textContent = message || "Copied.";
      root.clearTimeout(els.copyStatusTimer);
      els.copyStatusTimer = root.setTimeout(function () {
        els.copyStatus.textContent = "";
      }, 1800);
    }

    if (!button) return;

    var previous = button.textContent;
    button.textContent = "Copied";
    root.setTimeout(function () {
      button.textContent = previous;
    }, 1400);
  }

  function copyOutput(key, button) {
    var text = lastOutputs[key] || "";
    if (!text) return;

    copyText(text).then(function () {
      showCopied(button, "Copied.");
    }).catch(function () {
      if (els.copyStatus) els.copyStatus.textContent = "Copy blocked. Select the text and copy it manually.";
    });
  }

  function copyRow(rowId, button) {
    if (!lastCalculation || !lastRowsById[rowId]) return;

    var text = buildRowCopy(lastRowsById[rowId], lastCalculation);
    if (!text) return;

    copyText(text).then(function () {
      showCopied(button, "Copied.");
    }).catch(function () {
      if (els.copyStatus) els.copyStatus.textContent = "Copy blocked. Select the text and copy it manually.";
    });
  }

  function handlePersonInput(event) {
    var row = event.target.closest("[data-person-row]");
    if (!row) return;

    syncPeopleFromDom();

    if (event.target.matches("[data-person-name]")) {
      var id = row.getAttribute("data-person-id");
      var person = people.find(function (item) { return item.id === id; });
      if (person && person.isPayer && els.payerName) {
        els.payerName.value = cleanText(event.target.value, 50);
      }
    }

    update();
  }

  function bindEvents() {
    root.document.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        var action = actionButton.getAttribute("data-action");

        if (action === "load-example") {
          loadExample({ scroll: actionButton.hasAttribute("data-scroll-to-calculator") });
          return;
        }

        if (action === "start-blank") {
          startBlank();
          return;
        }

        if (action === "add-person") {
          addPerson();
          return;
        }

        if (action === "remove-person") {
          removePerson(actionButton);
          return;
        }
      }

      var copyButton = event.target.closest("[data-copy-output]");
      if (copyButton) {
        copyOutput(copyButton.getAttribute("data-copy-output"), copyButton);
        return;
      }

      var rowCopyButton = event.target.closest("[data-row-copy]");
      if (rowCopyButton) {
        copyRow(rowCopyButton.getAttribute("data-row-copy"), rowCopyButton);
      }
    });

    if (els.form) {
      els.form.addEventListener("input", function (event) {
        if (event.target === els.payerName) {
          syncPeopleFromDom();
          syncPayerRowFromName();
          update();
          return;
        }

        if (event.target.closest("[data-person-row]")) {
          handlePersonInput(event);
          return;
        }

        update();
      });

      els.form.addEventListener("change", function (event) {
        if (event.target.matches("[data-person-payer]")) {
          syncPeopleFromDom();
          people.forEach(function (person) {
            person.isPayer = person.id === event.target.value;
          });
          syncPayerNameFromPeople();
          renderPeopleRows();
          update();
          return;
        }

        if (event.target.name === "payerIncluded" || event.target.name === "splitMode") {
          syncPeopleFromDom();
          renderPeopleRows();
          update();
          return;
        }

        update();
      });

      els.form.addEventListener("submit", function (event) {
        event.preventDefault();
        update();
      });
    }

    if (els.reminderSelect) {
      els.reminderSelect.addEventListener("change", function () {
        currentReminderPersonId = els.reminderSelect.value;
        if (lastCalculation) updateOutputs(lastCalculation);
      });
    }
  }

  function init() {
    ready(function () {
      els = {
        tool: byId("group-payback-calculator"),
        form: byId("gpc-form"),
        currency: byId("gpc-currency"),
        reason: byId("gpc-reason"),
        total: byId("gpc-total"),
        payerName: byId("gpc-payer-name"),
        checkInDate: byId("gpc-check-in-date"),
        totalError: byId("gpc-total-error"),
        peopleError: byId("gpc-people-error"),
        peopleList: root.document.querySelector("[data-people-list]"),
        statusTable: root.document.querySelector("[data-status-table]"),
        warning: root.document.querySelector("[data-warning]"),
        reminderSelect: root.document.querySelector("[data-reminder-select]"),
        copyStatus: root.document.querySelector("[data-copy-status]"),
      };

      loadExample();
      bindEvents();
    });
  }

  return {
    init: init,
    parseAmount: parseAmount,
    formatMoney: formatMoney,
    calculate: calculate,
    calculateFromState: calculateFromState,
    buildGroupUpdate: buildGroupUpdate,
    buildIndividualReminder: buildIndividualReminder,
    buildPartialAcknowledgment: buildPartialAcknowledgment,
    buildClosingMessage: buildClosingMessage,
    buildRecordNote: buildRecordNote,
  };
});

(function (root, factory) {
  "use strict";

  var api = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.PartialRepaymentCalculator = api;

  if (root.document) {
    api.init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  var centsPerUnit = 100;
  var els = {};
  var lastOutput = {
    message: "",
    summary: "",
    record: "",
  };
  var hasRenderedResult = false;

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

  function parseMoney(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;

    var cleaned = String(value).replace(/[\s,]/g, "");
    if (!cleaned) return null;
    if (/[-+]/.test(cleaned)) return NaN;
    if (!/^(?:\d+|\d*\.\d+)$/.test(cleaned)) return NaN;

    var parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return NaN;

    return Math.round(parsed * centsPerUnit);
  }

  function optionalMoneyToCents(value) {
    var parsed = parseMoney(value);
    return parsed === null ? 0 : parsed;
  }

  function formatMoney(cents, currencySymbol) {
    var symbol = cleanText(currencySymbol, 8) || "$";
    var amount = Number(cents || 0) / centsPerUnit;

    return symbol + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDate(value) {
    if (!value) return "Undated";

    var parts = String(value).split("-");
    if (parts.length !== 3) return "Undated";

    var year = Number(parts[0]);
    var month = Number(parts[1]) - 1;
    var day = Number(parts[2]);
    var date = new Date(year, month, day);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return "Undated";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function capitalizeFirst(value) {
    var text = String(value || "");
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function statusFromAmounts(repayableCents, totalRepaidCents, remainingCents) {
    if (repayableCents === 0 && totalRepaidCents === 0) return "Nothing to repay";
    if (remainingCents > 0) return "Partially repaid";
    if (remainingCents === 0) return "Fully repaid";
    return "Overpaid";
  }

  function buildHistoryRows(state, result) {
    var currentBalance = result.repayableCents - result.startingRepaidCents;

    return (state.repayments || []).map(function (repayment) {
      currentBalance -= repayment.amountCents;

      return {
        date: repayment.date || "",
        dateText: formatDate(repayment.date),
        amountCents: repayment.amountCents,
        note: repayment.note || "",
        balanceAfterCents: currentBalance,
        balanceAfterText: balanceAfterText(currentBalance, state.currency),
      };
    });
  }

  function calculatePartialRepayment(state) {
    var originalAmountCents = state.originalAmountCents || 0;
    var startingRepaidCents = state.startingRepaidCents || 0;
    var adjustmentAddedCents = state.adjustmentAddedCents || 0;
    var adjustmentWaivedCents = state.adjustmentWaivedCents || 0;
    var totalRowRepaymentsCents = (state.repayments || []).reduce(function (sum, repayment) {
      return sum + (repayment.amountCents || 0);
    }, 0);
    var adjustedOriginalCents = originalAmountCents + adjustmentAddedCents;
    var repayableCents = Math.max(0, adjustedOriginalCents - adjustmentWaivedCents);
    var totalRepaidCents = startingRepaidCents + totalRowRepaymentsCents;
    var remainingCents = repayableCents - totalRepaidCents;
    var amountStillOpenCents = Math.max(0, remainingCents);
    var overpaymentCents = Math.max(0, totalRepaidCents - repayableCents);
    var progressPercent = 0;
    var result;

    if (repayableCents > 0) {
      progressPercent = Math.min(100, Math.max(0, Math.round((totalRepaidCents / repayableCents) * 100)));
    } else if (totalRepaidCents > 0) {
      progressPercent = 100;
    }

    result = {
      adjustedOriginalCents: adjustedOriginalCents,
      repayableCents: repayableCents,
      startingRepaidCents: startingRepaidCents,
      totalRowRepaymentsCents: totalRowRepaymentsCents,
      totalRepaidCents: totalRepaidCents,
      remainingCents: remainingCents,
      amountStillOpenCents: amountStillOpenCents,
      overpaymentCents: overpaymentCents,
      status: statusFromAmounts(repayableCents, totalRepaidCents, remainingCents),
      progressPercent: progressPercent,
      historyRows: [],
    };

    result.historyRows = buildHistoryRows(state, result);
    return result;
  }

  function balanceAfterText(cents, currency) {
    if (cents > 0) return formatMoney(cents, currency) + " still open";
    if (cents === 0) return "All settled";
    return "Overpaid by " + formatMoney(Math.abs(cents), currency);
  }

  function peopleAndPurpose(state) {
    return {
      repaying: cleanText(state.repayingPerson, 60) || "Alex",
      receiving: cleanText(state.receivingPerson, 60) || "Maya",
      purpose: cleanText(state.purpose, 120) || "the amount",
    };
  }

  function resultSummaryText(state, result) {
    var names = peopleAndPurpose(state);
    var totalRepaid = formatMoney(result.totalRepaidCents, state.currency);
    var original = formatMoney(state.originalAmountCents, state.currency);
    var repayable = formatMoney(result.repayableCents, state.currency);
    var stillOpen = formatMoney(result.amountStillOpenCents, state.currency);
    var overpaid = formatMoney(result.overpaymentCents, state.currency);
    var target = result.repayableCents === state.originalAmountCents ? original : repayable;

    if (result.status === "Nothing to repay") {
      return "Nothing remains to repay for " + names.purpose + ".";
    }

    if (result.totalRepaidCents === 0) {
      return "No repayments have been added yet. The full " + target + " is still open.";
    }

    if (result.status === "Partially repaid") {
      return names.repaying + " has repaid " + totalRepaid + " toward " + target + " for " + names.purpose + ". " + stillOpen + " is still open.";
    }

    if (result.status === "Fully repaid") {
      return names.repaying + " has repaid the full " + target + " for " + names.purpose + ". The balance is now settled.";
    }

    return names.repaying + " has repaid " + totalRepaid + " toward " + target + " for " + names.purpose + ". That is " + overpaid + " more than the amount owed.";
  }

  function buildShortMessage(state, result) {
    var names = peopleAndPurpose(state);
    var totalRepaid = formatMoney(result.totalRepaidCents, state.currency);
    var original = formatMoney(state.originalAmountCents, state.currency);
    var repayable = formatMoney(result.repayableCents, state.currency);
    var stillOpen = formatMoney(result.amountStillOpenCents, state.currency);
    var overpaid = formatMoney(result.overpaymentCents, state.currency);
    var target = result.repayableCents === state.originalAmountCents ? original : repayable;
    var receivedPerspective = state.perspective !== "made";

    if (result.status === "Nothing to repay") {
      return receivedPerspective
        ? "Thanks, " + names.repaying + " - nothing remains to repay for " + names.purpose + "."
        : "Hi " + names.receiving + " - nothing remains to repay for " + names.purpose + ".";
    }

    if (result.status === "Fully repaid") {
      return receivedPerspective
        ? "Thanks, " + names.repaying + " - the " + target + " for " + names.purpose + " is now fully repaid. We're all settled."
        : "Hi " + names.receiving + " - I have repaid the full " + target + " for " + names.purpose + ". We're all settled.";
    }

    if (result.status === "Overpaid") {
      return receivedPerspective
        ? "Thanks, " + names.repaying + " - I have " + totalRepaid + " repaid toward the " + target + " for " + names.purpose + ". That looks like a " + overpaid + " overpayment, so we should check the record."
        : "Hi " + names.receiving + " - I have repaid " + totalRepaid + " toward the " + target + " for " + names.purpose + ". That looks like a " + overpaid + " overpayment, so we should check the record.";
    }

    if (result.totalRepaidCents === 0) {
      return receivedPerspective
        ? "Hi " + names.repaying + " - I have the original amount as " + target + " for " + names.purpose + ". No partial repayments are listed yet, so " + stillOpen + " is still open."
        : "Hi " + names.receiving + " - I have the original amount as " + target + " for " + names.purpose + ". No partial repayments are listed yet, so " + stillOpen + " is still open.";
    }

    return receivedPerspective
      ? "Thanks, " + names.repaying + " - I have " + totalRepaid + " repaid toward the " + target + " for " + names.purpose + ". That leaves " + stillOpen + " still open."
      : "Hi " + names.receiving + " - I have repaid " + totalRepaid + " toward the " + target + " for " + names.purpose + ". That leaves " + stillOpen + " still open, and I'll keep the record updated as I repay the rest.";
  }

  function buildHistorySummary(state, result) {
    var names = peopleAndPurpose(state);
    var lines = [
      "Partial repayment summary:",
      "Original amount: " + formatMoney(state.originalAmountCents, state.currency),
      "For: " + names.purpose,
      "Already repaid before listed payments: " + formatMoney(result.startingRepaidCents, state.currency),
    ];

    if (state.adjustmentAddedCents > 0) {
      lines.push("Amount added to this same balance: " + formatMoney(state.adjustmentAddedCents, state.currency));
    }

    if (state.adjustmentWaivedCents > 0) {
      lines.push("Amount waived or forgiven: " + formatMoney(state.adjustmentWaivedCents, state.currency));
    }

    lines.push("Repayments:");

    if (result.historyRows.length === 0) {
      lines.push("* No listed partial repayments");
    } else {
      result.historyRows.forEach(function (row) {
        var note = row.note ? " - " + row.note : "";
        lines.push("* " + row.dateText + ": " + formatMoney(row.amountCents, state.currency) + note);
      });
    }

    lines.push("Total repaid: " + formatMoney(result.totalRepaidCents, state.currency));
    lines.push("Remaining balance: " + formatMoney(result.amountStillOpenCents, state.currency));

    if (result.overpaymentCents > 0) {
      lines.push("Overpayment: " + formatMoney(result.overpaymentCents, state.currency));
    }

    lines.push("Status: " + result.status);

    return lines.join("\n");
  }

  function buildRecordNote(state, result) {
    var names = peopleAndPurpose(state);
    var target = result.repayableCents === state.originalAmountCents
      ? formatMoney(state.originalAmountCents, state.currency)
      : formatMoney(result.repayableCents, state.currency);
    var totalRepaid = formatMoney(result.totalRepaidCents, state.currency);
    var stillOpen = formatMoney(result.amountStillOpenCents, state.currency);
    var listed = result.historyRows.length
      ? result.historyRows.map(function (row) { return formatMoney(row.amountCents, state.currency); }).join(", ")
      : "none listed";

    if (result.status === "Nothing to repay") {
      return "Record note: Nothing remains to repay for " + names.purpose + ". Keep future changes connected to the same balance if anything changes.";
    }

    if (result.status === "Overpaid") {
      return "Record note: " + names.repaying + " has repaid " + totalRepaid + " toward " + target + " for " + names.purpose + ". This shows an overpayment of " + formatMoney(result.overpaymentCents, state.currency) + ". Check the record before sending another update.";
    }

    if (result.status === "Fully repaid") {
      return "Record note: " + names.repaying + " has repaid the full " + target + " for " + names.purpose + ". The balance is settled. Partial repayments listed: " + listed + ".";
    }

    return "Record note: " + names.repaying + " has repaid " + totalRepaid + " toward " + target + " for " + names.purpose + ". " + stillOpen + " remains open. Partial repayments listed: " + listed + ". Keep future repayments connected to this same balance so the remaining amount stays clear.";
  }

  function setError(key, message) {
    var error = els.errors && els.errors[key];
    if (error) error.textContent = message || "";
  }

  function setRowError(row, message) {
    var error = row.el ? row.el.querySelector("[data-row-error]") : null;
    if (error) error.textContent = message || "";
  }

  function clearErrors() {
    Object.keys(els.errors || {}).forEach(function (key) {
      setError(key, "");
    });

    if (els.rows) {
      Array.prototype.forEach.call(els.rows.querySelectorAll("[data-row-error]"), function (error) {
        error.textContent = "";
      });
    }

    if (els.formStatus) els.formStatus.textContent = "";
  }

  function readRepaymentRows() {
    if (!els.rows) return [];

    return Array.prototype.map.call(els.rows.querySelectorAll("[data-repayment-row]"), function (row) {
      var dateInput = row.querySelector("[name='repaymentDate']");
      var amountInput = row.querySelector("[name='repaymentAmount']");
      var noteInput = row.querySelector("[name='repaymentNote']");
      var date = dateInput ? dateInput.value : "";
      var amountRaw = amountInput ? amountInput.value : "";
      var note = cleanText(noteInput ? noteInput.value : "", 120);
      var amountCents = parseMoney(amountRaw);

      return {
        el: row,
        date: date,
        amountRaw: amountRaw,
        amountCents: amountCents,
        note: note,
        active: Boolean(date || amountRaw || note),
      };
    });
  }

  function getPerspective() {
    var checked = root.document.querySelector("input[name='perspective']:checked");
    return checked ? checked.value : "received";
  }

  function getValues() {
    return {
      currency: cleanText(els.currency ? els.currency.value : "", 8) || "$",
      originalRaw: els.original ? els.original.value : "",
      originalAmountCents: parseMoney(els.original ? els.original.value : ""),
      purpose: cleanText(els.purpose ? els.purpose.value : "", 120),
      repayingPerson: cleanText(els.repayingPerson ? els.repayingPerson.value : "", 60),
      receivingPerson: cleanText(els.receivingPerson ? els.receivingPerson.value : "", 60),
      perspective: getPerspective(),
      startingRaw: els.startingRepaid ? els.startingRepaid.value : "",
      startingRepaidCents: optionalMoneyToCents(els.startingRepaid ? els.startingRepaid.value : ""),
      adjustmentAddedRaw: els.adjustmentAdded ? els.adjustmentAdded.value : "",
      adjustmentAddedCents: optionalMoneyToCents(els.adjustmentAdded ? els.adjustmentAdded.value : ""),
      adjustmentWaivedRaw: els.adjustmentWaived ? els.adjustmentWaived.value : "",
      adjustmentWaivedCents: optionalMoneyToCents(els.adjustmentWaived ? els.adjustmentWaived.value : ""),
      rows: readRepaymentRows(),
    };
  }

  function validate(values) {
    var isValid = true;
    clearErrors();

    if (values.originalRaw === "" || values.originalAmountCents === null) {
      setError("original", "Enter the original amount owed.");
      isValid = false;
    } else if (!Number.isFinite(values.originalAmountCents)) {
      setError("original", "Enter a valid amount using numbers and a decimal point.");
      isValid = false;
    } else if (values.originalAmountCents <= 0) {
      setError("original", "Enter an original amount greater than zero.");
      isValid = false;
    }

    if (!Number.isFinite(values.startingRepaidCents)) {
      setError("starting", "Leave this blank or enter 0 or more.");
      isValid = false;
    }

    if (!Number.isFinite(values.adjustmentAddedCents)) {
      setError("adjustmentAdded", "Leave this blank or enter 0 or more.");
      isValid = false;
    }

    if (!Number.isFinite(values.adjustmentWaivedCents)) {
      setError("adjustmentWaived", "Leave this blank or enter 0 or more.");
      isValid = false;
    }

    values.rows.forEach(function (row) {
      if (!row.active) return;

      if (row.amountRaw === "" || row.amountCents === null) {
        setRowError(row, "Enter an amount for this partial repayment.");
        isValid = false;
      } else if (!Number.isFinite(row.amountCents) || row.amountCents <= 0) {
        setRowError(row, "Enter an amount greater than zero.");
        isValid = false;
      }
    });

    if (!isValid && els.formStatus) {
      els.formStatus.textContent = "Fix the highlighted fields to update the result.";
    }

    return isValid;
  }

  function toCalculationState(values) {
    return {
      currency: values.currency,
      originalAmountCents: values.originalAmountCents,
      startingRepaidCents: values.startingRepaidCents,
      adjustmentAddedCents: values.adjustmentAddedCents,
      adjustmentWaivedCents: values.adjustmentWaivedCents,
      purpose: values.purpose,
      repayingPerson: values.repayingPerson,
      receivingPerson: values.receivingPerson,
      perspective: values.perspective,
      repayments: values.rows.filter(function (row) {
        return row.active;
      }).map(function (row) {
        return {
          date: row.date,
          amountCents: row.amountCents,
          note: row.note,
        };
      }),
    };
  }

  function setText(selector, text) {
    var element = root.document.querySelector(selector);
    if (element) element.textContent = text;
  }

  function setCopyButtonsDisabled(disabled) {
    Array.prototype.forEach.call(root.document.querySelectorAll("[data-copy-output]"), function (button) {
      button.disabled = disabled;
    });
  }

  function renderEmptyState() {
    hasRenderedResult = false;
    lastOutput = {
      message: "",
      summary: "",
      record: "",
    };

    setText("[data-result-summary]", "Enter an original amount and at least one repayment, or load an example, to see the remaining balance.");
    setText("[data-result-status]", "Ready");
    setText("[data-summary='remaining']", "$0.00");
    setText("[data-summary='totalRepaid']", "$0.00");
    setText("[data-summary='original']", "$0.00");
    setText("[data-summary='status']", "Ready");
    setText("[data-summary='overpayment']", "$0.00");
    setText("[data-output='message']", "Add a valid calculation to create a copyable update message.");
    setText("[data-output='summary']", "Add repayments to create a summary.");
    setText("[data-output='record']", "Add a valid calculation to create a record note.");

    if (els.resultNote) els.resultNote.textContent = "";
    if (els.overpaymentCard) els.overpaymentCard.hidden = true;
    if (els.historyBody) {
      els.historyBody.innerHTML = "<tr><td colspan=\"4\">Add a partial repayment above to see the balance after each payment.</td></tr>";
    }
    updateProgress(0, "0% repaid");
    setCopyButtonsDisabled(true);
  }

  function updateProgress(progress, label) {
    var normalized = Math.min(100, Math.max(0, progress || 0));

    if (els.progressLabel) els.progressLabel.textContent = label;
    if (els.progressBar) {
      els.progressBar.setAttribute("aria-valuenow", String(normalized));
    }
    if (els.progressFill) {
      els.progressFill.style.width = normalized + "%";
    }
  }

  function progressLabel(result) {
    if (result.status === "Fully repaid") return "Fully repaid";
    if (result.status === "Nothing to repay") return "No repayable balance";
    if (result.status === "Overpaid") return "Overpaid after 100% repaid";
    return result.progressPercent + "% repaid";
  }

  function renderHistoryRows(state, result) {
    if (!els.historyBody) return;

    if (result.historyRows.length === 0) {
      els.historyBody.innerHTML = "<tr><td colspan=\"4\">Add a partial repayment above to see the balance after each payment.</td></tr>";
      return;
    }

    els.historyBody.innerHTML = "";

    result.historyRows.forEach(function (row) {
      var tr = root.document.createElement("tr");
      var cells = [
        { label: "Date", text: row.dateText },
        { label: "Repayment", text: formatMoney(row.amountCents, state.currency) },
        { label: "Note", text: row.note || "No note" },
        { label: "Balance after", text: row.balanceAfterText },
      ];

      cells.forEach(function (cell) {
        var td = root.document.createElement("td");
        td.setAttribute("data-label", cell.label);
        td.textContent = cell.text;
        tr.appendChild(td);
      });

      els.historyBody.appendChild(tr);
    });
  }

  function renderResult(state, result) {
    var summary = resultSummaryText(state, result);
    var shortMessage = buildShortMessage(state, result);
    var historySummary = buildHistorySummary(state, result);
    var recordNote = buildRecordNote(state, result);

    hasRenderedResult = true;
    lastOutput.message = shortMessage;
    lastOutput.summary = historySummary;
    lastOutput.record = recordNote;

    setText("[data-result-summary]", summary);
    setText("[data-result-status]", result.status);
    setText("[data-summary='remaining']", formatMoney(result.amountStillOpenCents, state.currency));
    setText("[data-summary='totalRepaid']", formatMoney(result.totalRepaidCents, state.currency));
    setText("[data-summary='original']", formatMoney(state.originalAmountCents, state.currency));
    setText("[data-summary='status']", result.status);
    setText("[data-summary='overpayment']", formatMoney(result.overpaymentCents, state.currency));
    setText("[data-output='message']", shortMessage);
    setText("[data-output='summary']", historySummary);
    setText("[data-output='record']", recordNote);

    if (els.overpaymentCard) {
      els.overpaymentCard.hidden = result.overpaymentCents === 0;
    }

    if (els.resultNote) {
      if (state.adjustmentWaivedCents >= result.adjustedOriginalCents) {
        els.resultNote.textContent = "The waived amount is greater than or equal to the amount owed, so nothing remains to repay.";
      } else if (result.overpaymentCents > 0) {
        els.resultNote.textContent = "The repayments are greater than the amount owed. This is not an error, but both people should check the record.";
      } else {
        els.resultNote.textContent = "";
      }
    }

    renderHistoryRows(state, result);
    updateProgress(result.progressPercent, progressLabel(result));
    setCopyButtonsDisabled(false);
  }

  function generate(options) {
    var values = getValues();
    var state;
    var result;

    if (!validate(values)) {
      renderEmptyState();
      if (options && options.scroll && els.form) {
        els.form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return false;
    }

    state = toCalculationState(values);
    result = calculatePartialRepayment(state);
    renderResult(state, result);

    if (options && options.scroll && els.results) {
      els.results.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return true;
  }

  function updateRowControls() {
    var rows = els.rows ? els.rows.querySelectorAll("[data-repayment-row]") : [];

    Array.prototype.forEach.call(rows, function (row, index) {
      var number = index + 1;
      var remove = row.querySelector("[data-remove-row]");
      var date = row.querySelector("[name='repaymentDate']");
      var amount = row.querySelector("[name='repaymentAmount']");
      var note = row.querySelector("[name='repaymentNote']");
      var dateHelp = row.querySelector(".prc-field-hint");
      var error = row.querySelector("[data-row-error]");

      updateInput(row, date, "date", number);
      updateInput(row, amount, "amount", number);
      updateInput(row, note, "note", number);

      if (dateHelp) {
        dateHelp.id = "prc-row-" + number + "-date-help";
        if (date) date.setAttribute("aria-describedby", dateHelp.id);
      }

      if (error) {
        error.id = "prc-row-" + number + "-amount-error";
        if (amount) amount.setAttribute("aria-describedby", error.id);
      }

      if (remove) {
        remove.disabled = rows.length === 1;
        remove.setAttribute("aria-label", "Remove partial repayment row " + number);
      }
    });
  }

  function updateInput(row, input, type, number) {
    var label;
    var id;

    if (!input) return;

    label = row.querySelector("label[for='" + input.id + "']");
    id = "prc-row-" + number + "-" + type;
    input.id = id;
    if (label) label.setAttribute("for", id);
  }

  function createRepaymentRow(data) {
    var row = root.document.createElement("div");
    row.className = "prc-repayment-row";
    row.setAttribute("data-repayment-row", "");
    row.innerHTML = [
      "<div class=\"prc-field\">",
      "<label>Date</label>",
      "<input name=\"repaymentDate\" type=\"date\" />",
      "<p class=\"prc-field-hint\">Optional.</p>",
      "</div>",
      "<div class=\"prc-field\">",
      "<label>Amount repaid</label>",
      "<input name=\"repaymentAmount\" type=\"text\" inputmode=\"decimal\" placeholder=\"200\" />",
      "<p class=\"prc-validation\" data-row-error aria-live=\"polite\"></p>",
      "</div>",
      "<div class=\"prc-field\">",
      "<label>Note</label>",
      "<input name=\"repaymentNote\" type=\"text\" maxlength=\"120\" placeholder=\"sent after payday\" autocomplete=\"off\" />",
      "</div>",
      "<button type=\"button\" class=\"prc-icon-button\" data-remove-row aria-label=\"Remove partial repayment row\">Remove</button>",
    ].join("");

    if (data) {
      row.querySelector("[name='repaymentDate']").value = data.date || "";
      row.querySelector("[name='repaymentAmount']").value = data.amount || "";
      row.querySelector("[name='repaymentNote']").value = data.note || "";
    }

    return row;
  }

  function setRepaymentRows(rows) {
    if (!els.rows) return;

    els.rows.innerHTML = "";
    (rows && rows.length ? rows : [{}]).forEach(function (rowData) {
      els.rows.appendChild(createRepaymentRow(rowData));
    });
    updateRowControls();
  }

  function addRow(data) {
    if (!els.rows) return;

    els.rows.appendChild(createRepaymentRow(data || {}));
    updateRowControls();
  }

  function loadExample(exampleKey) {
    var examples = {
      "temporary-support": {
        original: "720",
        purpose: "rent and groceries",
        repayingPerson: "Alex",
        receivingPerson: "Maya",
        starting: "0",
        rows: [
          { date: "2026-06-01", amount: "200", note: "first repayment" },
          { date: "2026-06-08", amount: "150", note: "bank transfer" },
          { date: "2026-06-12", amount: "100", note: "after payday" },
        ],
      },
      "friend-repayment": {
        original: "200",
        purpose: "concert tickets",
        repayingPerson: "Sam",
        receivingPerson: "Jordan",
        starting: "0",
        rows: [
          { date: "2026-06-12", amount: "120", note: "first partial repayment" },
        ],
      },
      "client-payment": {
        original: "600",
        purpose: "design work",
        repayingPerson: "client",
        receivingPerson: "you",
        starting: "150",
        rows: [
          { date: "2026-06-12", amount: "300", note: "second payment" },
        ],
      },
    };
    var example = examples[exampleKey] || examples["temporary-support"];

    if (els.currency) els.currency.value = "$";
    if (els.original) els.original.value = example.original;
    if (els.purpose) els.purpose.value = example.purpose;
    if (els.repayingPerson) els.repayingPerson.value = example.repayingPerson;
    if (els.receivingPerson) els.receivingPerson.value = example.receivingPerson;
    if (els.startingRepaid) els.startingRepaid.value = example.starting;
    if (els.adjustmentAdded) els.adjustmentAdded.value = "0";
    if (els.adjustmentWaived) els.adjustmentWaived.value = "0";

    setRepaymentRows(example.rows);
    generate({ scroll: true });
  }

  function clearFields() {
    if (els.currency) els.currency.value = "$";
    if (els.original) els.original.value = "";
    if (els.purpose) els.purpose.value = "";
    if (els.repayingPerson) els.repayingPerson.value = "Alex";
    if (els.receivingPerson) els.receivingPerson.value = "Maya";
    if (els.startingRepaid) els.startingRepaid.value = "0";
    if (els.adjustmentAdded) els.adjustmentAdded.value = "0";
    if (els.adjustmentWaived) els.adjustmentWaived.value = "0";

    setRepaymentRows([{}]);
    clearErrors();
    renderEmptyState();
  }

  function fallbackCopyText(text) {
    return new Promise(function (resolve, reject) {
      var textarea = root.document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      root.document.body.appendChild(textarea);
      textarea.select();

      try {
        if (root.document.execCommand("copy")) {
          root.document.body.removeChild(textarea);
          resolve();
          return;
        }
        root.document.body.removeChild(textarea);
        reject(new Error("Copy command failed"));
      } catch (error) {
        root.document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copyText(text) {
    return fallbackCopyText(text).catch(function () {
      if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        return root.navigator.clipboard.writeText(text);
      }

      return Promise.reject(new Error("Copy is not available"));
    });
  }

  function showCopied(button) {
    var original = button.getAttribute("data-original-text") || button.textContent;
    button.setAttribute("data-original-text", original);
    button.textContent = "Copied";

    if (els.copyStatus) {
      els.copyStatus.textContent = "Copied";
      root.clearTimeout(els.copyStatusTimer);
      els.copyStatusTimer = root.setTimeout(function () {
        els.copyStatus.textContent = "";
      }, 1800);
    }

    root.clearTimeout(button.copyTimer);
    button.copyTimer = root.setTimeout(function () {
      button.textContent = original;
    }, 1800);
  }

  function copyOutput(target, button) {
    var text = lastOutput[target] || "";
    if (!text || button.disabled) return;

    copyText(text).then(function () {
      showCopied(button);
    }).catch(function () {
      if (els.copyStatus) {
        els.copyStatus.textContent = "Copy did not work. Select the text and copy it manually.";
      }
    });
  }

  function bindEvents() {
    if (!els.form) return;

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      generate({ scroll: true });
    });

    els.form.addEventListener("input", function () {
      if (hasRenderedResult) generate();
    });

    els.form.addEventListener("change", function () {
      if (hasRenderedResult) generate();
    });

    root.document.addEventListener("click", function (event) {
      var exampleButton = event.target.closest("[data-example]");
      var actionButton = event.target.closest("[data-action]");
      var removeButton = event.target.closest("[data-remove-row]");
      var copyButton = event.target.closest("[data-copy-output]");

      if (exampleButton) {
        loadExample(exampleButton.getAttribute("data-example"));
        return;
      }

      if (actionButton) {
        if (actionButton.getAttribute("data-action") === "add-row") addRow();
        if (actionButton.getAttribute("data-action") === "clear-fields") clearFields();
        return;
      }

      if (removeButton) {
        var row = removeButton.closest("[data-repayment-row]");
        if (row && els.rows.querySelectorAll("[data-repayment-row]").length > 1) {
          row.remove();
          updateRowControls();
          if (hasRenderedResult) generate();
        }
        return;
      }

      if (copyButton) {
        copyOutput(copyButton.getAttribute("data-copy-output"), copyButton);
      }
    });
  }

  function init() {
    ready(function () {
      els = {
        form: byId("partial-repayment-form"),
        currency: byId("prc-currency"),
        original: byId("prc-original"),
        purpose: byId("prc-purpose"),
        repayingPerson: byId("prc-repaying-person"),
        receivingPerson: byId("prc-receiving-person"),
        startingRepaid: byId("prc-starting-repaid"),
        adjustmentAdded: byId("prc-adjustment-added"),
        adjustmentWaived: byId("prc-adjustment-waived"),
        rows: root.document.querySelector("[data-repayment-rows]"),
        formStatus: root.document.querySelector("[data-form-status]"),
        results: byId("partial-repayment-results"),
        resultNote: root.document.querySelector("[data-result-note]"),
        overpaymentCard: root.document.querySelector("[data-overpayment-card]"),
        progressLabel: root.document.querySelector("[data-progress-label]"),
        progressBar: root.document.querySelector("[data-progress-bar]"),
        progressFill: root.document.querySelector("[data-progress-fill]"),
        historyBody: root.document.querySelector("[data-history-body]"),
        copyStatus: root.document.querySelector("[data-copy-status]"),
        errors: {
          original: byId("prc-original-error"),
          starting: byId("prc-starting-repaid-error"),
          adjustmentAdded: byId("prc-adjustment-added-error"),
          adjustmentWaived: byId("prc-adjustment-waived-error"),
        },
      };

      updateRowControls();
      renderEmptyState();
      bindEvents();
    });
  }

  return {
    parseMoney: parseMoney,
    formatMoney: formatMoney,
    calculatePartialRepayment: calculatePartialRepayment,
    buildHistoryRows: buildHistoryRows,
    buildShortMessage: buildShortMessage,
    buildHistorySummary: buildHistorySummary,
    buildRecordNote: buildRecordNote,
    init: init,
  };
});

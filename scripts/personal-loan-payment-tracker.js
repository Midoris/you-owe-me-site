(function (root, factory) {
  "use strict";

  var api = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.PersonalLoanPaymentTracker = api;
  if (root.document) api.init();
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  var STORAGE_KEY = "uomi_personal_loan_payment_tracker_v1";
  var STORAGE_VERSION = 1;
  var frequencyLabels = {
    weekly: "weekly",
    biweekly: "every two weeks",
    monthly: "monthly",
  };
  var els = {};
  var trackerState = null;
  var resultState = null;
  var editingActivityId = null;
  var storageAvailable = null;

  function cleanText(value, maxLength) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength || 160);
  }

  function parseMoney(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;
    var text = String(value).replace(/[\s,]/g, "");
    if (!text || /[-+]/.test(text) || !/^(?:\d+|\d*\.\d+)$/.test(text)) return NaN;
    var pieces = text.split(".");
    if (pieces[1] && pieces[1].length > 2) return NaN;
    var whole = Number(pieces[0] || "0");
    var fraction = (pieces[1] || "").padEnd(2, "0");
    var minor = Number(fraction || "0");
    if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(minor)) return NaN;
    return whole * 100 + minor;
  }

  function formatMoney(cents, currency) {
    var value = Math.abs(Number(cents || 0)) / 100;
    var symbol = cleanText(currency, 8) || "$";
    return symbol + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function parseDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var date = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return null;
    return { year: year, month: month, day: day };
  }

  function isoDate(parts) {
    return String(parts.year).padStart(4, "0") + "-" + String(parts.month).padStart(2, "0") + "-" + String(parts.day).padStart(2, "0");
  }

  function localToday() {
    var now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function addDays(dateString, days) {
    var parsed = parseDate(dateString);
    if (!parsed) return "";
    var date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
    return isoDate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
  }

  function addMonthsFromAnchor(firstDate, months) {
    var parsed = parseDate(firstDate);
    if (!parsed) return "";
    var targetMonthIndex = parsed.month - 1 + months;
    var year = parsed.year + Math.floor(targetMonthIndex / 12);
    var month = ((targetMonthIndex % 12) + 12) % 12 + 1;
    return isoDate({ year: year, month: month, day: Math.min(parsed.day, daysInMonth(year, month)) });
  }

  function addFrequencyFromAnchor(firstDate, frequency, index) {
    if (frequency === "weekly") return addDays(firstDate, index * 7);
    if (frequency === "biweekly") return addDays(firstDate, index * 14);
    return addMonthsFromAnchor(firstDate, index);
  }

  function nextDueAfter(afterDate, frequency, firstDueDate) {
    var index = 0;
    var candidate = firstDueDate;
    while (candidate <= afterDate && index < 10000) {
      index += 1;
      candidate = addFrequencyFromAnchor(firstDueDate, frequency, index);
    }
    return candidate;
  }

  function formatDate(dateString) {
    var parsed = parseDate(dateString);
    if (!parsed) return "";
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)));
  }

  function monthName(dateString) {
    var parsed = parseDate(dateString);
    if (!parsed) return "installment";
    return new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)));
  }

  function cloneActivity(activity, index) {
    return {
      id: cleanText(activity.id, 80) || "activity-" + index,
      type: activity.type === "borrowing" ? "borrowing" : "payment",
      date: String(activity.date || ""),
      amountCents: Number.isSafeInteger(activity.amountCents) ? activity.amountCents : 0,
      note: cleanText(activity.note, 240),
      order: Number.isSafeInteger(activity.order) ? activity.order : index,
    };
  }

  function sortedActivities(activities) {
    return (activities || []).map(cloneActivity).filter(function (activity) {
      return parseDate(activity.date) && activity.amountCents > 0;
    }).sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.order - b.order;
    });
  }

  function makeSchedule(principalCents, regularPaymentCents, frequency, firstDueDate, startNumber) {
    var schedule = [];
    var remaining = principalCents;
    var index = startNumber || 0;
    while (remaining > 0 && schedule.length < 10000) {
      var planned = Math.min(regularPaymentCents, remaining);
      schedule.push({
        number: index + 1,
        dueDate: addFrequencyFromAnchor(firstDueDate, frequency, index),
        plannedCents: planned,
        appliedCents: 0,
        original: startNumber === 0,
      });
      remaining -= planned;
      index += 1;
    }
    return schedule;
  }

  function appendPrincipal(schedule, principalCents, state, afterDate) {
    if (principalCents <= 0) return;
    var last = schedule[schedule.length - 1];
    var lastDue = last ? last.dueDate : "";
    var threshold = afterDate && (!lastDue || afterDate > lastDue) ? afterDate : (lastDue || state.firstDueDate);
    var firstNewDue = nextDueAfter(threshold, state.frequency, state.firstDueDate);
    var index = 0;
    var due = firstNewDue;
    var remaining = principalCents;
    while (remaining > 0 && index < 10000) {
      var planned = Math.min(state.regularPaymentCents, remaining);
      schedule.push({
        number: schedule.length + 1,
        dueDate: due,
        plannedCents: planned,
        appliedCents: 0,
        original: false,
      });
      remaining -= planned;
      index += 1;
      due = state.frequency === "monthly"
        ? addMonthsFromAnchor(firstNewDue, index)
        : addDays(firstNewDue, state.frequency === "weekly" ? index * 7 : index * 14);
    }
  }

  function allocationText(allocations, currency) {
    if (!allocations.length) return "Recorded excess not applied to a scheduled installment";
    var parts = allocations.map(function (allocation, index) {
      var preposition = index === allocations.length - 1 && allocations.length > 1 ? "and " : "";
      var toward = index === allocations.length - 1 && allocations.length > 2 ? "toward " : "to ";
      return preposition + formatMoney(allocation.amountCents, currency) + " " + toward + monthName(allocation.dueDate) + " installment";
    });
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(", ") + ", " + parts[parts.length - 1];
  }

  function calculateTracker(inputState, options) {
    var state = inputState || {};
    var asOfDate = (options && options.asOfDate) || localToday();
    var planEnabled = !!state.planEnabled;
    var startBalanceCents = Number.isSafeInteger(state.startBalanceCents) ? state.startBalanceCents : 0;
    var regularPaymentCents = Number.isSafeInteger(state.regularPaymentCents) ? state.regularPaymentCents : 0;
    var frequency = state.frequency || "monthly";
    var firstDueDate = state.firstDueDate || "";
    var activities = sortedActivities(state.activities);
    var rawBalanceCents = startBalanceCents;
    var paidSinceCents = 0;
    var additionalBorrowingCents = 0;
    var history = [];
    var schedule = [];
    var recordedExcessCents = 0;

    if (planEnabled && regularPaymentCents > 0 && parseDate(firstDueDate)) {
      schedule = makeSchedule(startBalanceCents, regularPaymentCents, frequency, firstDueDate, 0);
    }

    activities.forEach(function (activity) {
      var allocations = [];
      if (activity.type === "payment") {
        paidSinceCents += activity.amountCents;
        rawBalanceCents -= activity.amountCents;
        if (planEnabled) {
          var left = activity.amountCents;
          schedule.forEach(function (installment) {
            if (left <= 0) return;
            var stillNeeded = installment.plannedCents - installment.appliedCents;
            if (stillNeeded <= 0) return;
            var applied = Math.min(left, stillNeeded);
            installment.appliedCents += applied;
            left -= applied;
            allocations.push({ dueDate: installment.dueDate, amountCents: applied, installment: installment.number });
          });
          if (left > 0) recordedExcessCents += left;
        }
      } else {
        additionalBorrowingCents += activity.amountCents;
        rawBalanceCents += activity.amountCents;
        if (planEnabled) {
          var usedCredit = Math.min(recordedExcessCents, activity.amountCents);
          recordedExcessCents -= usedCredit;
          var newPrincipal = activity.amountCents - usedCredit;
          if (newPrincipal > 0) {
            var lastSchedule = schedule[schedule.length - 1];
            var comparisonDate = lastSchedule && lastSchedule.dueDate > activity.date ? lastSchedule.dueDate : activity.date;
            var appendState = {
              regularPaymentCents: regularPaymentCents,
              frequency: frequency,
              firstDueDate: firstDueDate,
            };
            if (schedule.length) {
              appendPrincipal(schedule, newPrincipal, appendState, comparisonDate);
            } else {
              var firstDue = nextDueAfter(comparisonDate, frequency, firstDueDate);
              var generated = makeSchedule(newPrincipal, regularPaymentCents, frequency, firstDue, 0);
              generated.forEach(function (row, index) { row.number = index + 1; row.original = false; });
              schedule = generated;
            }
          }
        }
      }
      history.push({
        id: activity.id,
        type: activity.type,
        date: activity.date,
        amountCents: activity.amountCents,
        note: activity.note,
        order: activity.order,
        allocations: allocations,
        appliedToText: activity.type === "payment" ? allocationText(allocations, state.currency) : "Added to the remaining loan balance and future projection",
        balanceAfterCents: rawBalanceCents,
      });
    });

    var remainingBalanceCents = Math.max(0, rawBalanceCents);
    var overpaymentCents = Math.max(0, -rawBalanceCents);
    var unpaid = schedule.filter(function (row) {
      return row.appliedCents < row.plannedCents;
    });
    var oldestUnpaid = unpaid[0] || null;
    var futurePaymentApplied = schedule.some(function (row) {
      return row.appliedCents > 0 && row.dueDate > asOfDate;
    });
    var planStatus;

    if (overpaymentCents > 0) {
      planStatus = "Check recorded amounts";
    } else if (!planEnabled) {
      planStatus = "No regular plan";
    } else if (remainingBalanceCents === 0 && !oldestUnpaid) {
      planStatus = "Paid in full";
    } else if (oldestUnpaid && oldestUnpaid.dueDate < asOfDate) {
      planStatus = "Overdue";
    } else if (oldestUnpaid && oldestUnpaid.dueDate === asOfDate) {
      planStatus = "Due today";
    } else if (futurePaymentApplied) {
      planStatus = "Ahead of plan";
    } else {
      planStatus = "On track";
    }

    schedule.forEach(function (row) {
      if (row.appliedCents >= row.plannedCents) row.status = "Paid";
      else if (remainingBalanceCents === 0) row.status = "No longer needed";
      else if (row.dueDate < asOfDate) row.status = "Overdue";
      else if (row.dueDate === asOfDate) row.status = "Due today";
      else if (row.appliedCents > 0) row.status = "Partly covered ahead";
      else row.status = "Upcoming";
    });

    var requiredRows = schedule.filter(function (row) { return row.status !== "No longer needed"; });
    var payoffRow = requiredRows.length ? requiredRows[requiredRows.length - 1] : null;
    return {
      asOfDate: asOfDate,
      currentRawBalanceCents: rawBalanceCents,
      remainingBalanceCents: remainingBalanceCents,
      overpaymentCents: overpaymentCents,
      paidSinceCents: paidSinceCents,
      additionalBorrowingCents: additionalBorrowingCents,
      paidBeforeCents: Number.isSafeInteger(state.paidBeforeCents) ? state.paidBeforeCents : 0,
      schedule: schedule,
      history: history,
      planStatus: planStatus,
      nextInstallment: oldestUnpaid && remainingBalanceCents > 0 ? oldestUnpaid : null,
      projectedPayoffDate: payoffRow && remainingBalanceCents > 0 ? payoffRow.dueDate : null,
      futurePaymentApplied: futurePaymentApplied,
    };
  }

  function frequencyPhrase(frequency) {
    return frequencyLabels[frequency] || "monthly";
  }

  function currentInstallmentText(result, state) {
    var installment = result.nextInstallment;
    if (!state.planEnabled) return "Not available without a regular plan";
    if (result.planStatus === "Paid in full") return "No unpaid installment";
    if (!installment) return "Not available";
    var remaining = formatMoney(installment.plannedCents - installment.appliedCents, state.currency);
    if (installment.dueDate < result.asOfDate) return "Overdue — " + remaining + " remaining from " + formatDate(installment.dueDate);
    if (installment.dueDate === result.asOfDate) return "Due today — " + remaining + " remaining";
    if (installment.appliedCents > 0) return "Partly covered ahead — " + remaining + " remaining";
    return "Upcoming — " + remaining + " due " + formatDate(installment.dueDate);
  }

  function nextPaymentText(result, state) {
    var installment = result.nextInstallment;
    if (!state.planEnabled) return "Not set";
    if (result.planStatus === "Paid in full") return "No payment due";
    if (!installment) return "Not available";
    var amount = formatMoney(installment.plannedCents - installment.appliedCents, state.currency);
    return installment.dueDate < result.asOfDate ? amount + ", due " + formatDate(installment.dueDate) : amount + " on " + formatDate(installment.dueDate);
  }

  function projectedPayoffText(result, state) {
    if (!state.planEnabled) return "Not available";
    if (result.planStatus === "Paid in full") return "Paid in full";
    return result.projectedPayoffDate ? formatDate(result.projectedPayoffDate) : "Not available";
  }

  function summaryText(state, result) {
    var loan = cleanText(state.loanName, 120) || "this loan";
    var person = cleanText(state.personName, 60) || "the other person";
    var remaining = formatMoney(result.remainingBalanceCents, state.currency);
    var paid = formatMoney(result.paidSinceCents, state.currency);
    var plan = state.planEnabled
      ? "The agreed plan is " + formatMoney(state.regularPaymentCents, state.currency) + " " + frequencyPhrase(state.frequency) + "."
      : "No regular repayment plan is attached.";
    var next;
    if (result.planStatus === "Paid in full") next = "The loan is recorded as paid in full.";
    else if (result.nextInstallment && result.nextInstallment.dueDate < result.asOfDate) next = "The next unpaid amount is " + formatMoney(result.nextInstallment.plannedCents - result.nextInstallment.appliedCents, state.currency) + ", due " + formatDate(result.nextInstallment.dueDate) + ".";
    else if (result.nextInstallment) next = "The next payment is " + formatMoney(result.nextInstallment.plannedCents - result.nextInstallment.appliedCents, state.currency) + " on " + formatDate(result.nextInstallment.dueDate) + ".";
    else next = "Check the recorded amounts before using this snapshot.";
    if (state.perspective === "borrowed") {
      return "I have " + remaining + " remaining on " + loan + " with " + person + ". I have paid " + paid + " since tracking began. " + plan + " " + next;
    }
    return loan + " with " + person + ": " + remaining + " remains. " + paid + " has been paid since tracking began. " + plan + " " + next;
  }

  function ready(callback) {
    if (!root.document) return;
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", callback, { once: true });
    else callback();
  }

  function byId(id) { return root.document.getElementById(id); }
  function setText(id, value) { var node = byId(id); if (node) node.textContent = value; }
  function setHidden(node, hidden) { if (node) node.hidden = !!hidden; }

  function showError(name, message) {
    var node = root.document.querySelector('[data-error-for="' + name + '"]');
    if (node) node.textContent = message || "";
  }

  function clearErrors() {
    root.document.querySelectorAll("[data-error-for]").forEach(function (node) { node.textContent = ""; });
    if (els.errorSummary) { els.errorSummary.hidden = true; els.errorSummary.replaceChildren(); }
  }

  function showErrors(errors) {
    clearErrors();
    if (!errors.length) return;
    errors.forEach(function (error) { showError(error.field, error.message); });
    var heading = root.document.createElement("p");
    heading.textContent = "Check the highlighted fields:";
    var list = root.document.createElement("ul");
    errors.forEach(function (error) {
      var item = root.document.createElement("li");
      var link = root.document.createElement("a");
      link.href = "#plpt-" + error.field;
      link.textContent = error.message;
      item.appendChild(link);
      list.appendChild(item);
    });
    els.errorSummary.replaceChildren(heading, list);
    els.errorSummary.hidden = false;
  }

  function selected(name) {
    var input = root.document.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function collectStartingState() {
    var inProgress = selected("loan-stage") === "in-progress";
    return {
      perspective: selected("perspective"),
      personName: cleanText(els.personName.value, 60),
      loanName: cleanText(els.loanName.value, 120),
      currency: cleanText(els.currency.value, 8),
      inProgress: inProgress,
      startBalanceCents: parseMoney(els.startBalance.value),
      trackingStartDate: els.trackingStart.value,
      paidBeforeCents: inProgress ? parseMoney(els.paidBefore.value) : 0,
      planEnabled: selected("plan-mode") === "regular",
      regularPaymentCents: parseMoney(els.regularPayment.value),
      frequency: els.frequency.value,
      firstDueDate: els.firstDue.value,
      activities: trackerState && trackerState.activities ? trackerState.activities.slice() : [],
    };
  }

  function validateStartingState(state) {
    var errors = [];
    if (!state.perspective) errors.push({ field: "perspective", message: "Choose whether you lent or borrowed the money." });
    if (!state.currency) errors.push({ field: "currency", message: "Choose a currency." });
    if (state.startBalanceCents === null) errors.push({ field: "start-balance", message: "Enter the amount owed when tracking begins." });
    else if (!Number.isSafeInteger(state.startBalanceCents) || state.startBalanceCents <= 0) errors.push({ field: "start-balance", message: "Enter an amount greater than zero." });
    if (!parseDate(state.trackingStartDate)) errors.push({ field: "tracking-start", message: "Choose a valid tracking start date." });
    if (state.inProgress && (state.paidBeforeCents === null || !Number.isSafeInteger(state.paidBeforeCents) || state.paidBeforeCents < 0)) errors.push({ field: "paid-before", message: "Enter zero or a positive amount." });
    if (state.planEnabled) {
      if (state.regularPaymentCents === null) errors.push({ field: "regular-payment", message: "Enter the agreed regular payment amount." });
      else if (!Number.isSafeInteger(state.regularPaymentCents) || state.regularPaymentCents <= 0) errors.push({ field: "regular-payment", message: "Enter a payment amount greater than zero." });
      if (!state.frequency) errors.push({ field: "frequency", message: "Choose how often payments are due." });
      if (!parseDate(state.firstDueDate)) errors.push({ field: "first-due", message: "Choose the first unpaid due date." });
    }
    return errors;
  }

  function updateDynamicFields() {
    var inProgress = selected("loan-stage") === "in-progress";
    var regular = selected("plan-mode") === "regular";
    setHidden(els.paidBeforeField, !inProgress);
    setHidden(els.planFields, !regular);
    setText("plpt-start-label", inProgress ? "Current amount still owed" : "Starting amount owed");
    setText("plpt-start-help", inProgress ? "Enter what is definitely still owed today. Payments made before tracking are context only and will not be subtracted again." : "Enter the amount owed before any payments recorded in this tracker.");
  }

  function activityLabel(type, perspective) {
    if (type === "borrowing") return perspective === "borrowed" ? "More money borrowed" : "More money lent";
    return perspective === "borrowed" ? "Payment made" : "Payment received";
  }

  function renderPlaceholder() {
    setHidden(els.activitySection, true);
    setHidden(els.resultContent, true);
    setHidden(els.startOver, true);
    setHidden(els.snapshotEmpty, false);
    setHidden(els.snapshotData, true);
  }

  function addCell(row, label, value, tag) {
    var cell = root.document.createElement(tag || "td");
    cell.setAttribute("data-label", label);
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function renderSchedule(result, state) {
    var body = els.scheduleBody;
    body.replaceChildren();
    if (!state.planEnabled) {
      setHidden(els.noPlanSchedule, false);
      setHidden(els.scheduleTableWrap, true);
      setHidden(els.showSchedule, true);
      return;
    }
    setHidden(els.noPlanSchedule, true);
    setHidden(els.scheduleTableWrap, false);
    var futureCount = 0;
    var hasHiddenRows = false;
    result.schedule.forEach(function (installment) {
      var visible = els.showSchedule.dataset.expanded === "true" || installment.status !== "Upcoming" || futureCount < 6;
      if (installment.status === "Upcoming") futureCount += 1;
      if (!visible) { hasHiddenRows = true; return; }
      var row = root.document.createElement("tr");
      addCell(row, "Installment", String(installment.number));
      addCell(row, "Due date", formatDate(installment.dueDate));
      addCell(row, "Planned amount", formatMoney(installment.plannedCents, state.currency));
      addCell(row, "Actual amount applied", formatMoney(installment.appliedCents, state.currency));
      addCell(row, "Still needed", formatMoney(Math.max(0, installment.plannedCents - installment.appliedCents), state.currency));
      addCell(row, "Status", installment.status);
      body.appendChild(row);
    });
    setHidden(els.showSchedule, !hasHiddenRows && els.showSchedule.dataset.expanded !== "true");
    els.showSchedule.textContent = els.showSchedule.dataset.expanded === "true" ? "Show shorter schedule" : "Show all future installments";
  }

  function renderActivityRows(result, state) {
    var editBody = els.activityBody;
    var historyBody = els.historyBody;
    editBody.replaceChildren();
    historyBody.replaceChildren();
    setHidden(els.activityEmpty, result.history.length !== 0);
    setHidden(els.historyEmpty, result.history.length !== 0);
    result.history.forEach(function (activity) {
      var editRow = root.document.createElement("tr");
      addCell(editRow, "Date", formatDate(activity.date));
      addCell(editRow, "Activity", activityLabel(activity.type, state.perspective));
      addCell(editRow, "Amount", formatMoney(activity.amountCents, state.currency));
      addCell(editRow, "Note", activity.note || "—");
      addCell(editRow, "Balance after activity", balanceAfterText(activity.balanceAfterCents, state.currency));
      var actions = root.document.createElement("td");
      actions.setAttribute("data-label", "Actions");
      var edit = root.document.createElement("button");
      edit.type = "button";
      edit.className = "plpt-inline-button";
      edit.textContent = "Edit";
      edit.dataset.action = "edit-activity";
      edit.dataset.id = activity.id;
      var remove = root.document.createElement("button");
      remove.type = "button";
      remove.className = "plpt-inline-button plpt-inline-button--danger";
      remove.textContent = "Delete";
      remove.dataset.action = "delete-activity";
      remove.dataset.id = activity.id;
      actions.append(edit, remove);
      editRow.appendChild(actions);
      editBody.appendChild(editRow);

      var historyRow = root.document.createElement("tr");
      addCell(historyRow, "Date", formatDate(activity.date));
      addCell(historyRow, "Activity", activityLabel(activity.type, state.perspective));
      addCell(historyRow, "Amount", formatMoney(activity.amountCents, state.currency));
      addCell(historyRow, "Note", activity.note || "—");
      addCell(historyRow, "Applied to", activity.appliedToText);
      addCell(historyRow, "Balance after activity", balanceAfterText(activity.balanceAfterCents, state.currency));
      historyBody.appendChild(historyRow);
    });
  }

  function balanceAfterText(cents, currency) {
    if (cents < 0) return "Recorded excess " + formatMoney(Math.abs(cents), currency);
    return formatMoney(cents, currency);
  }

  function renderSnapshot(result, state) {
    setHidden(els.snapshotEmpty, true);
    setHidden(els.snapshotData, false);
    setText("plpt-current-balance", formatMoney(result.remainingBalanceCents, state.currency));
    setText("plpt-paid-since", formatMoney(result.paidSinceCents, state.currency));
    setText("plpt-plan-status", result.planStatus);
    setText("plpt-current-installment", currentInstallmentText(result, state));
    setText("plpt-next-payment", nextPaymentText(result, state));
    setText("plpt-projected-payoff", projectedPayoffText(result, state));
    setText("plpt-additional-borrowing", formatMoney(result.additionalBorrowingCents, state.currency));
    setText("plpt-paid-before-result", state.inProgress ? formatMoney(result.paidBeforeCents, state.currency) : "Not recorded");
    setText("plpt-tracking-began", formatDate(state.trackingStartDate));
    setHidden(els.noActivityNotice, result.history.length !== 0);
    setHidden(els.noPlanNotice, state.planEnabled);
    setHidden(els.paidNotice, result.planStatus !== "Paid in full");
    setHidden(els.overpaymentNotice, result.overpaymentCents === 0);
    if (result.overpaymentCents > 0) setText("plpt-overpayment-copy", "The recorded payments exceed the current balance by " + formatMoney(result.overpaymentCents, state.currency) + ". Check whether a payment or starting balance needs correcting.");
  }

  function renderOutput(result, state) {
    var summary = summaryText(state, result);
    els.summary.textContent = summary;
    setText("plpt-print-person", state.personName || "Not supplied");
    setText("plpt-print-loan", state.loanName || "Not supplied");
    setText("plpt-print-perspective", state.perspective === "borrowed" ? "I borrowed money" : "I lent money");
    setText("plpt-print-currency", state.currency);
    setText("plpt-print-tracking-start", formatDate(state.trackingStartDate));
    setText("plpt-print-starting-balance", formatMoney(state.startBalanceCents, state.currency));
    setText("plpt-print-paid-before", state.inProgress ? formatMoney(state.paidBeforeCents, state.currency) : "Not recorded");
    setText("plpt-print-plan", state.planEnabled ? formatMoney(state.regularPaymentCents, state.currency) + " " + frequencyPhrase(state.frequency) + ", first unpaid due " + formatDate(state.firstDueDate) : "No regular plan");
    setText("plpt-print-generated", formatDate(localToday()));
    var ongoing = state.planEnabled && (
      result.schedule.filter(function (row) { return row.status !== "Paid" && row.status !== "No longer needed"; }).length > 1 ||
      result.schedule.some(function (row) { return row.status === "Partly paid" || row.status === "Partly covered ahead"; }) ||
      result.planStatus === "Ahead of plan" || result.planStatus === "Due today" || result.planStatus === "Overdue" ||
      result.history.filter(function (activity) { return activity.type === "payment"; }).length > 1 ||
      result.history.some(function (activity) { return activity.type === "borrowing"; })
    );
    setHidden(els.simpleNextStep, ongoing);
    setHidden(els.ongoingNextStep, !ongoing);
  }

  function renderTracker(announcement) {
    if (!trackerState) { renderPlaceholder(); return; }
    resultState = calculateTracker(trackerState);
    setHidden(els.activitySection, false);
    setHidden(els.resultContent, false);
    setHidden(els.startOver, false);
    renderSnapshot(resultState, trackerState);
    renderActivityRows(resultState, trackerState);
    renderSchedule(resultState, trackerState);
    renderOutput(resultState, trackerState);
    setText("plpt-live-status", announcement || "Current remaining balance is " + formatMoney(resultState.remainingBalanceCents, trackerState.currency) + ".");
  }

  function createOrUpdateTracker() {
    var nextState = collectStartingState();
    var errors = validateStartingState(nextState);
    if (errors.length) { showErrors(errors); return; }
    clearErrors();
    trackerState = nextState;
    editingActivityId = null;
    els.createTracker.textContent = "Update payment tracker";
    setHidden(els.updateWarning, true);
    renderTracker("Payment tracker created. Current remaining balance is " + formatMoney(resultState ? calculateTracker(trackerState).remainingBalanceCents : trackerState.startBalanceCents, trackerState.currency) + ".");
  }

  function onStartingInput() {
    updateDynamicFields();
    if (trackerState) {
      els.createTracker.textContent = "Update payment tracker";
      setHidden(els.updateWarning, false);
    }
  }

  function validateActivity() {
    var errors = [];
    var type = els.activityType.value;
    var date = els.activityDate.value;
    var amountCents = parseMoney(els.activityAmount.value);
    if (!parseDate(date)) errors.push({ field: "activity-date", message: "Choose the activity date." });
    else if (date < trackerState.trackingStartDate) errors.push({ field: "activity-date", message: "Choose a date on or after the tracking start date." });
    if (amountCents === null) errors.push({ field: "activity-amount", message: "Enter the activity amount." });
    else if (!Number.isSafeInteger(amountCents) || amountCents <= 0) errors.push({ field: "activity-amount", message: "Enter an amount greater than zero." });
    return { errors: errors, type: type, date: date, amountCents: amountCents };
  }

  function resetActivityForm() {
    editingActivityId = null;
    els.activityForm.reset();
    els.activityDate.value = localToday();
    els.addActivity.textContent = "Add payment";
    els.cancelEdit.hidden = true;
    updateActivityHelper();
  }

  function updateActivityHelper() {
    var borrowing = els.activityType.value === "borrowing";
    setText("plpt-activity-help", borrowing ? "Use this when more money was added to the same loan after tracking began." : "Record the full amount that was actually paid.");
    els.activityNote.placeholder = borrowing ? "For example, Repair cost added" : "For example, Bank transfer";
    els.addActivity.textContent = editingActivityId ? "Save changes" : (borrowing ? "Add borrowing" : "Add payment");
  }

  function submitActivity() {
    var check = validateActivity();
    if (check.errors.length) { showErrors(check.errors); return; }
    clearErrors();
    var activity = {
      id: editingActivityId || "activity-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      type: check.type,
      date: check.date,
      amountCents: check.amountCents,
      note: cleanText(els.activityNote.value, 240),
      order: editingActivityId ? trackerState.activities.find(function (item) { return item.id === editingActivityId; }).order : (trackerState.activities.reduce(function (max, item) { return Math.max(max, item.order || 0); }, -1) + 1),
    };
    var wasEditing = !!editingActivityId;
    if (wasEditing) trackerState.activities = trackerState.activities.map(function (item) { return item.id === activity.id ? activity : item; });
    else trackerState.activities.push(activity);
    resetActivityForm();
    renderTracker((wasEditing ? "Activity updated. " : (activity.type === "borrowing" ? "Additional borrowing added. " : "Payment added. ")) + "Current remaining balance is " + formatMoney(calculateTracker(trackerState).remainingBalanceCents, trackerState.currency) + ".");
  }

  function editActivity(id) {
    var activity = trackerState.activities.find(function (item) { return item.id === id; });
    if (!activity) return;
    editingActivityId = id;
    els.activityType.value = activity.type;
    els.activityDate.value = activity.date;
    els.activityAmount.value = (activity.amountCents / 100).toFixed(2);
    els.activityNote.value = activity.note;
    els.cancelEdit.hidden = false;
    updateActivityHelper();
    els.activityForm.scrollIntoView({ behavior: "smooth", block: "center" });
    els.activityType.focus();
  }

  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    dialog._trigger = trigger || root.document.activeElement;
    dialog.showModal();
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.close();
    if (dialog._trigger && typeof dialog._trigger.focus === "function") dialog._trigger.focus();
  }

  function deleteActivity(id) {
    els.deleteDialog.dataset.id = id;
    openDialog(els.deleteDialog, root.document.activeElement);
  }

  function confirmDeleteActivity() {
    var id = els.deleteDialog.dataset.id;
    trackerState.activities = trackerState.activities.filter(function (item) { return item.id !== id; });
    if (editingActivityId === id) resetActivityForm();
    closeDialog(els.deleteDialog);
    renderTracker("Activity deleted. Current remaining balance is " + formatMoney(calculateTracker(trackerState).remainingBalanceCents, trackerState.currency) + ".");
  }

  function loadExample() {
    var today = localToday();
    var start = addDays(today, -30);
    var firstDue = addDays(today, 10);
    root.document.querySelector('input[name="perspective"][value="lent"]').checked = true;
    root.document.querySelector('input[name="loan-stage"][value="new"]').checked = true;
    root.document.querySelector('input[name="plan-mode"][value="regular"]').checked = true;
    els.personName.value = "Alex";
    els.loanName.value = "Laptop purchase";
    if (!els.currency.value) els.currency.value = "$";
    els.startBalance.value = "1200";
    els.trackingStart.value = start;
    els.paidBefore.value = "";
    els.regularPayment.value = "200";
    els.frequency.value = "monthly";
    els.firstDue.value = firstDue;
    updateDynamicFields();
    trackerState = collectStartingState();
    trackerState.activities = [
      { id: "example-payment-one", type: "payment", date: addDays(today, -20), amountCents: 15000, note: "", order: 0 },
      { id: "example-payment-two", type: "payment", date: addDays(today, -10), amountCents: 30000, note: "", order: 1 },
      { id: "example-borrowing", type: "borrowing", date: addDays(today, -5), amountCents: 10000, note: "", order: 2 },
    ];
    editingActivityId = null;
    els.createTracker.textContent = "Update payment tracker";
    resetActivityForm();
    renderTracker("Worked example loaded. The current remaining balance is " + formatMoney(85000, trackerState.currency) + ".");
    var target = byId("current-loan-snapshot");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function copyText(text) {
    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) return root.navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var textarea = root.document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        root.document.body.appendChild(textarea);
        textarea.select();
        var copied = root.document.execCommand("copy");
        textarea.remove();
        if (copied) resolve(); else reject(new Error("copy failed"));
      } catch (error) { reject(error); }
    });
  }

  function csvValue(value) {
    var text = String(value === null || typeof value === "undefined" ? "" : value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function csvRow(values) { return values.map(csvValue).join(","); }

  function downloadCsv() {
    if (!trackerState || !resultState) { setText("plpt-output-status", "Add a valid starting balance before exporting."); return; }
    var regularPlan = trackerState.planEnabled ? "A regular repayment plan was agreed" : "No regular plan";
    var lines = [
      csvRow(["Field", "Value"]),
      csvRow(["Perspective", trackerState.perspective === "lent" ? "I lent money" : "I borrowed money"]),
      csvRow(["Person", trackerState.personName]),
      csvRow(["Loan", trackerState.loanName]),
      csvRow(["Currency", trackerState.currency]),
      csvRow(["Tracking start date", trackerState.trackingStartDate]),
      csvRow(["Starting/current balance", formatMoney(trackerState.startBalanceCents, trackerState.currency)]),
      csvRow(["Paid before tracking", trackerState.inProgress ? formatMoney(trackerState.paidBeforeCents, trackerState.currency) : ""]),
      csvRow(["Regular plan", regularPlan]),
      csvRow(["Regular payment amount", trackerState.planEnabled ? formatMoney(trackerState.regularPaymentCents, trackerState.currency) : ""]),
      csvRow(["Frequency", trackerState.planEnabled ? frequencyPhrase(trackerState.frequency) : ""]),
      csvRow(["First unpaid due date", trackerState.planEnabled ? trackerState.firstDueDate : ""]),
      csvRow(["Current remaining balance", formatMoney(resultState.remainingBalanceCents, trackerState.currency)]),
      csvRow(["Paid since tracking", formatMoney(resultState.paidSinceCents, trackerState.currency)]),
      csvRow(["Additional borrowing", formatMoney(resultState.additionalBorrowingCents, trackerState.currency)]),
      csvRow(["Plan status", resultState.planStatus]),
      csvRow(["Next payment", nextPaymentText(resultState, trackerState)]),
      csvRow(["Projected payoff", projectedPayoffText(resultState, trackerState)]),
      "",
      csvRow(["Date", "Activity", "Amount", "Note", "Applied to", "Balance after activity"]),
    ];
    resultState.history.forEach(function (activity) {
      lines.push(csvRow([activity.date, activityLabel(activity.type, trackerState.perspective), formatMoney(activity.amountCents, trackerState.currency), activity.note, activity.appliedToText, balanceAfterText(activity.balanceAfterCents, trackerState.currency)]));
    });
    if (trackerState.planEnabled) {
      lines.push("", csvRow(["Installment", "Due date", "Planned amount", "Actual amount applied", "Still needed", "Status"]));
      resultState.schedule.forEach(function (row) {
        lines.push(csvRow([row.number, row.dueDate, formatMoney(row.plannedCents, trackerState.currency), formatMoney(row.appliedCents, trackerState.currency), formatMoney(Math.max(0, row.plannedCents - row.appliedCents), trackerState.currency), row.status]));
      });
    }
    var blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var anchor = root.document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "personal-loan-payment-log-" + localToday() + ".csv";
    root.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    root.setTimeout(function () { URL.revokeObjectURL(anchor.href); }, 1000);
    setText("plpt-output-status", "");
  }

  function canUseStorage() {
    if (storageAvailable !== null) return storageAvailable;
    try {
      var probe = "uomi_personal_loan_payment_tracker_probe";
      root.localStorage.setItem(probe, "1");
      root.localStorage.removeItem(probe);
      storageAvailable = true;
    } catch (error) { storageAvailable = false; }
    return storageAvailable;
  }

  function savedPayload() {
    return { version: STORAGE_VERSION, data: trackerState };
  }

  function readSaved() {
    if (!canUseStorage()) return null;
    try {
      var saved = root.localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      var payload = JSON.parse(saved);
      if (!payload || payload.version !== STORAGE_VERSION || !payload.data) return null;
      return normalizeSavedState(payload.data);
    } catch (error) { return null; }
  }

  function normalizeSavedState(data) {
    if (!data || !Number.isSafeInteger(data.startBalanceCents) || data.startBalanceCents <= 0 || !parseDate(data.trackingStartDate)) return null;
    if (data.planEnabled && (!Number.isSafeInteger(data.regularPaymentCents) || data.regularPaymentCents <= 0 || !parseDate(data.firstDueDate))) return null;
    var safe = {
      perspective: data.perspective === "borrowed" ? "borrowed" : "lent",
      personName: cleanText(data.personName, 60),
      loanName: cleanText(data.loanName, 120),
      currency: cleanText(data.currency, 8) || "$",
      inProgress: !!data.inProgress,
      startBalanceCents: data.startBalanceCents,
      trackingStartDate: data.trackingStartDate,
      paidBeforeCents: Number.isSafeInteger(data.paidBeforeCents) && data.paidBeforeCents >= 0 ? data.paidBeforeCents : 0,
      planEnabled: !!data.planEnabled,
      regularPaymentCents: Number.isSafeInteger(data.regularPaymentCents) ? data.regularPaymentCents : 0,
      frequency: ["weekly", "biweekly", "monthly"].indexOf(data.frequency) >= 0 ? data.frequency : "monthly",
      firstDueDate: parseDate(data.firstDueDate) ? data.firstDueDate : "",
      activities: (data.activities || []).map(cloneActivity).filter(function (item) { return parseDate(item.date) && item.amountCents > 0; }),
    };
    return safe;
  }

  function syncFormFromState(state) {
    root.document.querySelector('input[name="perspective"][value="' + state.perspective + '"]').checked = true;
    root.document.querySelector('input[name="loan-stage"][value="' + (state.inProgress ? "in-progress" : "new") + '"]').checked = true;
    root.document.querySelector('input[name="plan-mode"][value="' + (state.planEnabled ? "regular" : "none") + '"]').checked = true;
    els.personName.value = state.personName;
    els.loanName.value = state.loanName;
    els.currency.value = state.currency;
    els.startBalance.value = (state.startBalanceCents / 100).toFixed(2);
    els.trackingStart.value = state.trackingStartDate;
    els.paidBefore.value = state.inProgress ? (state.paidBeforeCents / 100).toFixed(2) : "";
    els.regularPayment.value = state.planEnabled ? (state.regularPaymentCents / 100).toFixed(2) : "";
    els.frequency.value = state.frequency;
    els.firstDue.value = state.firstDueDate;
    updateDynamicFields();
  }

  function updateSavedControls() {
    var saved = readSaved();
    setHidden(els.savedFound, !saved || !!trackerState);
    setHidden(els.removeSaved, !saved || !trackerState);
    els.saveTracker.textContent = saved ? "Update saved tracker" : "Save this tracker on this device";
    if (!canUseStorage()) {
      setHidden(els.storageUnavailable, false);
      els.saveTracker.disabled = true;
    }
  }

  function saveTracker() {
    if (!trackerState || !canUseStorage()) return;
    var existing = readSaved();
    if (existing) { openDialog(els.replaceDialog, root.document.activeElement); return; }
    persistTracker();
  }

  function persistTracker() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPayload()));
      closeDialog(els.replaceDialog);
      setText("plpt-output-status", "Saved on this device.");
      setText("plpt-live-status", "Saved on this device.");
      updateSavedControls();
    } catch (error) {
      storageAvailable = false;
      setHidden(els.storageUnavailable, false);
      setText("plpt-output-status", "This browser is not allowing local saving. You can still copy, print, or export the record.");
    }
  }

  function restoreSaved() {
    var saved = readSaved();
    if (!saved) return;
    trackerState = saved;
    syncFormFromState(saved);
    els.createTracker.textContent = "Update payment tracker";
    resetActivityForm();
    renderTracker("Saved tracker restored. Current remaining balance is " + formatMoney(calculateTracker(saved).remainingBalanceCents, saved.currency) + ".");
    updateSavedControls();
  }

  function removeSaved() { openDialog(els.removeSavedDialog, root.document.activeElement); }

  function confirmRemoveSaved() {
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
    closeDialog(els.removeSavedDialog);
    setText("plpt-output-status", "Saved tracker removed from this device.");
    updateSavedControls();
  }

  function startOver() { openDialog(els.startOverDialog, root.document.activeElement); }

  function confirmStartOver() {
    closeDialog(els.startOverDialog);
    trackerState = null;
    resultState = null;
    els.startingForm.reset();
    els.currency.value = "$";
    els.trackingStart.value = localToday();
    els.firstDue.value = "";
    root.document.querySelector('input[name="perspective"][value="lent"]').checked = true;
    root.document.querySelector('input[name="loan-stage"][value="new"]').checked = true;
    root.document.querySelector('input[name="plan-mode"][value="none"]').checked = true;
    els.createTracker.textContent = "Create payment tracker";
    setHidden(els.updateWarning, true);
    resetActivityForm();
    updateDynamicFields();
    renderPlaceholder();
    updateSavedControls();
    setText("plpt-live-status", "Tracker cleared from this tab.");
  }

  function init() {
    ready(function () {
      els = {
        startingForm: byId("plpt-starting-form"), errorSummary: byId("plpt-error-summary"), personName: byId("plpt-person-name"), loanName: byId("plpt-loan-name"), currency: byId("plpt-currency"), startBalance: byId("plpt-start-balance"), trackingStart: byId("plpt-tracking-start"), paidBefore: byId("plpt-paid-before"), regularPayment: byId("plpt-regular-payment"), frequency: byId("plpt-frequency"), firstDue: byId("plpt-first-due"), paidBeforeField: byId("plpt-paid-before-field"), planFields: byId("plpt-plan-fields"), createTracker: byId("plpt-create-tracker"), startOver: byId("plpt-start-over"), updateWarning: byId("plpt-update-warning"), activitySection: byId("plpt-activity-section"), activityForm: byId("plpt-activity-form"), activityType: byId("plpt-activity-type"), activityDate: byId("plpt-activity-date"), activityAmount: byId("plpt-activity-amount"), activityNote: byId("plpt-activity-note"), addActivity: byId("plpt-add-activity"), cancelEdit: byId("plpt-cancel-edit"), activityBody: byId("plpt-activity-body"), activityEmpty: byId("plpt-activity-empty"), resultContent: byId("plpt-result-content"), snapshotEmpty: byId("plpt-snapshot-empty"), snapshotData: byId("plpt-snapshot-data"), noActivityNotice: byId("plpt-no-activity-notice"), noPlanNotice: byId("plpt-no-plan-notice"), paidNotice: byId("plpt-paid-notice"), overpaymentNotice: byId("plpt-overpayment-notice"), scheduleBody: byId("plpt-schedule-body"), scheduleTableWrap: byId("plpt-schedule-table-wrap"), noPlanSchedule: byId("plpt-no-plan-schedule"), showSchedule: byId("plpt-show-schedule"), historyBody: byId("plpt-history-body"), historyEmpty: byId("plpt-history-empty"), summary: byId("plpt-summary"), simpleNextStep: byId("plpt-simple-next-step"), ongoingNextStep: byId("plpt-ongoing-next-step"), saveTracker: byId("plpt-save-tracker"), removeSaved: byId("plpt-remove-saved"), savedFound: byId("plpt-saved-found"), storageUnavailable: byId("plpt-storage-unavailable"), replaceDialog: byId("plpt-replace-dialog"), removeSavedDialog: byId("plpt-remove-saved-dialog"), startOverDialog: byId("plpt-start-over-dialog"), deleteDialog: byId("plpt-delete-dialog")
      };
      els.trackingStart.value = localToday();
      els.activityDate.value = localToday();
      updateDynamicFields();
      renderPlaceholder();
      updateSavedControls();
      els.startingForm.addEventListener("submit", function (event) { event.preventDefault(); createOrUpdateTracker(); });
      els.startingForm.addEventListener("input", onStartingInput);
      els.startingForm.addEventListener("change", onStartingInput);
      els.activityForm.addEventListener("submit", function (event) { event.preventDefault(); submitActivity(); });
      els.activityType.addEventListener("change", updateActivityHelper);
      els.cancelEdit.addEventListener("click", resetActivityForm);
      els.activityBody.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-action]");
        if (!button) return;
        if (button.dataset.action === "edit-activity") editActivity(button.dataset.id);
        if (button.dataset.action === "delete-activity") deleteActivity(button.dataset.id);
      });
      els.showSchedule.addEventListener("click", function () { els.showSchedule.dataset.expanded = els.showSchedule.dataset.expanded === "true" ? "false" : "true"; renderSchedule(resultState, trackerState); });
      root.document.querySelectorAll('[data-action="load-example"]').forEach(function (button) { button.addEventListener("click", loadExample); });
      byId("plpt-copy-summary").addEventListener("click", function () { if (!trackerState || !resultState) return; copyText(els.summary.textContent).then(function () { setText("plpt-output-status", "Loan summary copied."); }).catch(function () { setText("plpt-output-status", "The summary could not be copied automatically. Select the summary text and copy it manually."); }); });
      byId("plpt-print").addEventListener("click", function () { root.print(); });
      byId("plpt-export").addEventListener("click", downloadCsv);
      els.saveTracker.addEventListener("click", saveTracker);
      els.removeSaved.addEventListener("click", removeSaved);
      byId("plpt-restore-saved").addEventListener("click", restoreSaved);
      byId("plpt-delete-saved-from-notice").addEventListener("click", removeSaved);
      els.startOver.addEventListener("click", startOver);
      byId("plpt-confirm-delete-activity").addEventListener("click", confirmDeleteActivity);
      byId("plpt-confirm-start-over").addEventListener("click", confirmStartOver);
      byId("plpt-confirm-replace").addEventListener("click", persistTracker);
      byId("plpt-confirm-remove-saved").addEventListener("click", confirmRemoveSaved);
      root.document.querySelectorAll("[data-dialog-cancel]").forEach(function (button) { button.addEventListener("click", function () { closeDialog(button.closest("dialog")); }); });
      root.addEventListener("beforeprint", function () {
        if (trackerState && resultState && trackerState.planEnabled) {
          els.showSchedule.dataset.expanded = "true";
          renderSchedule(resultState, trackerState);
        }
      });
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_VERSION: STORAGE_VERSION,
    parseMoney: parseMoney,
    parseDate: parseDate,
    addDays: addDays,
    addMonthsFromAnchor: addMonthsFromAnchor,
    addFrequencyFromAnchor: addFrequencyFromAnchor,
    nextDueAfter: nextDueAfter,
    calculateTracker: calculateTracker,
    formatMoney: formatMoney,
    formatDate: formatDate,
    currentInstallmentText: currentInstallmentText,
    nextPaymentText: nextPaymentText,
    projectedPayoffText: projectedPayoffText,
    summaryText: summaryText,
    init: init,
  };
});

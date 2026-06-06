(function () {
  "use strict";

  var centsPerUnit = 100;
  var maxRenderedRows = 480;
  var frequencyLabels = {
    weekly: "weekly",
    biweekly: "every 2 weeks",
    monthly: "monthly",
  };
  var PAYMENT_PLAN_TOOL_EVENT = "youoweme:payment-plan-tool-event";

  var els = {};
  var lastOutput = {
    message: "",
    summary: "",
    record: "",
  };
  var toolStartTracked = false;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function cleanText(value, maxLength) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function parseNumber(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function toCents(amount) {
    if (!Number.isFinite(amount)) return null;
    return Math.round(amount * centsPerUnit);
  }

  function todayDate() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function inputValueFromDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function parseInputDate(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return null;

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
      return null;
    }

    return date;
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function addMonthsClamped(date, months) {
    var targetMonth = date.getMonth() + months;
    var targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
    var normalizedMonth = ((targetMonth % 12) + 12) % 12;
    var day = Math.min(date.getDate(), daysInMonth(targetYear, normalizedMonth));
    return new Date(targetYear, normalizedMonth, day);
  }

  function addDays(date, days) {
    var next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function addFrequency(date, frequency) {
    if (frequency === "weekly") return addDays(date, 7);
    if (frequency === "biweekly") return addDays(date, 14);
    return addMonthsClamped(date, 1);
  }

  function defaultFirstPaymentDate() {
    var today = todayDate();
    return new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }

  function formatDate(date) {
    if (!date || Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function formatMoneyFromCents(cents, currency) {
    var symbol = cleanText(currency, 6) || "$";
    var value = Number(cents || 0) / centsPerUnit;

    return symbol + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function frequencyLabel(frequency) {
    return frequencyLabels[frequency] || "monthly";
  }

  function frequencyUnitLabel(frequency) {
    if (frequency === "weekly") return "week";
    if (frequency === "biweekly") return "2 weeks";
    return "month";
  }

  function dispatchToolEvent(eventName, values, extra) {
    if (!eventName || typeof window.CustomEvent !== "function") return;

    window.dispatchEvent(new CustomEvent(PAYMENT_PLAN_TOOL_EVENT, {
      detail: Object.assign({
        eventName: eventName,
        mode: values && values.mode ? values.mode : getMode(),
        frequency: values ? activeFrequency(values) : "",
        perspective: values && values.perspective ? values.perspective : "",
      }, extra || {}),
    }));
  }

  function trackToolStart(values) {
    if (toolStartTracked) return;
    toolStartTracked = true;
    dispatchToolEvent("payment_plan_tool_start", values);
  }

  function getMode() {
    var checked = document.querySelector("input[name='pp-mode']:checked");
    return checked ? checked.value : "amount";
  }

  function activeFrequency(values) {
    return values.mode === "date" ? values.frequencyDate : values.frequencyAmount;
  }

  function activeFirstDate(values) {
    return values.mode === "date" ? values.firstPaymentDate : values.firstPaymentAmount;
  }

  function getValues() {
    var mode = getMode();
    var currency = cleanText(els.currency ? els.currency.value : "", 6) || "$";
    var purpose = cleanText(els.purpose ? els.purpose.value : "", 120);
    var repayingPerson = cleanText(els.repayingPerson ? els.repayingPerson.value : "", 60);
    var receivingPerson = cleanText(els.receivingPerson ? els.receivingPerson.value : "", 60);

    return {
      mode: mode,
      currency: currency,
      total: parseNumber(els.total ? els.total.value : ""),
      totalRaw: els.total ? els.total.value : "",
      repaid: parseNumber(els.repaid ? els.repaid.value : ""),
      repaidRaw: els.repaid ? els.repaid.value : "",
      extra: parseNumber(els.extra ? els.extra.value : ""),
      extraRaw: els.extra ? els.extra.value : "",
      purpose: purpose,
      repayingPerson: repayingPerson,
      receivingPerson: receivingPerson,
      perspective: els.perspective ? els.perspective.value : "repaying",
      regularPayment: parseNumber(els.regularPayment ? els.regularPayment.value : ""),
      regularPaymentRaw: els.regularPayment ? els.regularPayment.value : "",
      frequencyAmount: els.frequencyAmount ? els.frequencyAmount.value : "monthly",
      frequencyDate: els.frequencyDate ? els.frequencyDate.value : "monthly",
      firstPaymentAmountRaw: els.firstPaymentAmount ? els.firstPaymentAmount.value : "",
      firstPaymentDateRaw: els.firstPaymentDate ? els.firstPaymentDate.value : "",
      firstPaymentAmount: parseInputDate(els.firstPaymentAmount ? els.firstPaymentAmount.value : ""),
      firstPaymentDate: parseInputDate(els.firstPaymentDate ? els.firstPaymentDate.value : ""),
      targetDateRaw: els.targetDate ? els.targetDate.value : "",
      targetDate: parseInputDate(els.targetDate ? els.targetDate.value : ""),
    };
  }

  function setError(key, message) {
    if (els.errors[key]) els.errors[key].textContent = message || "";
  }

  function clearErrors() {
    Object.keys(els.errors).forEach(function (key) {
      setError(key, "");
    });

    if (els.formStatus) els.formStatus.textContent = "";
  }

  function validate(values) {
    var isValid = true;
    clearErrors();

    if (values.totalRaw === "" || !Number.isFinite(values.total)) {
      setError("total", "Enter the total amount owed.");
      isValid = false;
    } else if (values.total <= 0) {
      setError("total", "Enter an amount greater than zero.");
      isValid = false;
    }

    if (values.repaidRaw !== "" && (!Number.isFinite(values.repaid) || values.repaid < 0)) {
      setError("repaid", "Already repaid cannot be negative.");
      isValid = false;
    }

    if (values.extraRaw !== "" && (!Number.isFinite(values.extra) || values.extra < 0)) {
      setError("extra", "Extra payment now cannot be negative.");
      isValid = false;
    }

    if (isValid && buildBaseAmounts(values).remainingAfterExtraCents <= 0) {
      return true;
    }

    if (values.mode === "amount") {
      if (values.regularPaymentRaw === "" || !Number.isFinite(values.regularPayment)) {
        setError("regular", "Enter the amount that can be paid each time.");
        isValid = false;
      } else if (values.regularPayment <= 0) {
        setError("regular", "Payment amount must be greater than zero.");
        isValid = false;
      }

      if (!values.firstPaymentAmount) {
        setError("firstAmount", "Choose a first payment date.");
        isValid = false;
      }
    }

    if (values.mode === "date") {
      if (!values.targetDate) {
        setError("target", "Choose a target payoff date.");
        isValid = false;
      }

      if (!values.firstPaymentDate) {
        setError("firstDate", "Choose a first payment date.");
        isValid = false;
      }

      if (values.targetDate && values.firstPaymentDate && values.targetDate < values.firstPaymentDate) {
        setError("target", "Choose a payoff date after the first payment date.");
        isValid = false;
      }
    }

    return isValid;
  }

  function buildBaseAmounts(values) {
    var repaid = Number.isFinite(values.repaid) ? values.repaid : 0;
    var extra = Number.isFinite(values.extra) ? values.extra : 0;
    var totalCents = toCents(values.total);
    var repaidCents = toCents(repaid);
    var extraCents = toCents(extra);
    var remainingBeforeExtraCents = totalCents - repaidCents;
    var remainingAfterExtraCents = remainingBeforeExtraCents - extraCents;

    return {
      totalCents: totalCents,
      repaidCents: repaidCents,
      extraCents: extraCents,
      remainingBeforeExtraCents: remainingBeforeExtraCents,
      remainingAfterExtraCents: remainingAfterExtraCents,
    };
  }

  function buildDatesThroughTarget(firstDate, targetDate, frequency) {
    var dates = [];
    var current = new Date(firstDate.getTime());
    var guard = 0;

    while (current <= targetDate && guard < 600) {
      dates.push(new Date(current.getTime()));
      current = addFrequency(current, frequency);
      guard += 1;
    }

    return dates;
  }

  function calculateAmountMode(values, amounts) {
    var regularCents = toCents(values.regularPayment);
    var numberOfPayments = Math.ceil(amounts.remainingAfterExtraCents / regularCents);
    var schedule = [];
    var balance = amounts.remainingAfterExtraCents;
    var currentDate = activeFirstDate(values);
    var rowsToRender = Math.min(numberOfPayments, maxRenderedRows);
    var i;

    for (i = 0; i < rowsToRender; i += 1) {
      var paymentCents = i === numberOfPayments - 1
        ? balance
        : Math.min(regularCents, balance);

      balance -= paymentCents;

      schedule.push({
        label: "Payment " + (i + 1),
        date: new Date(currentDate.getTime()),
        paymentCents: paymentCents,
        balanceCents: Math.max(0, balance),
      });

      currentDate = addFrequency(currentDate, values.frequencyAmount);
    }

    var finalPaymentCents = amounts.remainingAfterExtraCents - regularCents * (numberOfPayments - 1);
    var finalDate = schedule.length ? schedule[schedule.length - 1].date : activeFirstDate(values);

    if (numberOfPayments > maxRenderedRows) {
      finalDate = activeFirstDate(values);
      for (i = 1; i < numberOfPayments; i += 1) {
        finalDate = addFrequency(finalDate, values.frequencyAmount);
      }
    }

    return {
      mode: "amount",
      paymentCents: regularCents,
      regularCents: regularCents,
      finalPaymentCents: finalPaymentCents,
      finalSmallCents: finalPaymentCents < regularCents ? finalPaymentCents : null,
      numberOfPayments: numberOfPayments,
      finalDate: finalDate,
      frequency: values.frequencyAmount,
      firstDate: values.firstPaymentAmount,
      schedule: schedule,
      truncated: numberOfPayments > maxRenderedRows,
    };
  }

  function calculateDateMode(values, amounts) {
    var frequency = values.frequencyDate;
    var dates = buildDatesThroughTarget(values.firstPaymentDate, values.targetDate, frequency);

    if (!dates.length) {
      return {
        error: "Choose a payoff date after the first payment date.",
      };
    }

    var numberOfPayments = dates.length;
    var requiredCents = Math.max(1, Math.ceil(amounts.remainingAfterExtraCents / numberOfPayments));
    var balance = amounts.remainingAfterExtraCents;
    var schedule = [];
    var rowsToRender = Math.min(numberOfPayments, maxRenderedRows);
    var i;

    for (i = 0; i < rowsToRender; i += 1) {
      var paymentCents = i === numberOfPayments - 1
        ? balance
        : Math.min(requiredCents, balance);

      balance -= paymentCents;

      schedule.push({
        label: "Payment " + (i + 1),
        date: dates[i],
        paymentCents: paymentCents,
        balanceCents: Math.max(0, balance),
      });
    }

    return {
      mode: "date",
      paymentCents: requiredCents,
      regularCents: requiredCents,
      finalPaymentCents: schedule.length ? schedule[schedule.length - 1].paymentCents : requiredCents,
      finalSmallCents: schedule.length && schedule[schedule.length - 1].paymentCents < requiredCents
        ? schedule[schedule.length - 1].paymentCents
        : null,
      numberOfPayments: numberOfPayments,
      finalDate: dates[dates.length - 1],
      frequency: frequency,
      firstDate: values.firstPaymentDate,
      schedule: schedule,
      truncated: numberOfPayments > maxRenderedRows,
    };
  }

  function calculate(values) {
    var amounts = buildBaseAmounts(values);

    if (amounts.remainingAfterExtraCents <= 0) {
      return {
        state: amounts.remainingAfterExtraCents < 0 ? "overpaid" : "settled",
        amounts: amounts,
        schedule: [],
      };
    }

    var plan = values.mode === "date"
      ? calculateDateMode(values, amounts)
      : calculateAmountMode(values, amounts);

    if (plan.error) {
      return {
        state: "invalid",
        error: plan.error,
        amounts: amounts,
        schedule: [],
      };
    }

    return {
      state: "plan",
      amounts: amounts,
      plan: plan,
      schedule: buildScheduleWithExtra(values, amounts, plan.schedule),
    };
  }

  function buildScheduleWithExtra(values, amounts, regularRows) {
    var rows = [];

    if (amounts.extraCents > 0) {
      rows.push({
        label: "Extra payment now",
        dateText: "Today",
        paymentCents: amounts.extraCents,
        balanceCents: Math.max(0, amounts.remainingAfterExtraCents),
      });
    }

    return rows.concat(regularRows);
  }

  function purposePhrase(values) {
    return values.purpose ? " for " + values.purpose : "";
  }

  function buildPeoplePhrase(values) {
    if (values.repayingPerson && values.receivingPerson) {
      return values.repayingPerson + " to " + values.receivingPerson;
    }

    if (values.repayingPerson) {
      return values.repayingPerson;
    }

    if (values.receivingPerson) {
      return "the person repaying " + values.receivingPerson;
    }

    return "";
  }

  function buildMessage(values, result) {
    if (result.state === "settled") {
      return "This looks fully repaid. You may not need a payment plan. Keep a short note or receipt if you want a clear record.";
    }

    if (result.state === "overpaid") {
      return "This looks overpaid by " + formatMoneyFromCents(Math.abs(result.amounts.remainingAfterExtraCents), values.currency) + ". Check the numbers before creating a plan.";
    }

    var plan = result.plan;
    var payment = formatMoneyFromCents(plan.paymentCents, values.currency);
    var remaining = formatMoneyFromCents(result.amounts.remainingAfterExtraCents, values.currency);
    var firstDate = formatDate(plan.firstDate);
    var finalDate = formatDate(plan.finalDate);
    var frequency = frequencyLabel(plan.frequency);
    var purpose = purposePhrase(values);

    if (values.perspective === "receiving") {
      var people = buildPeoplePhrase(values);
      var peoplePart = people ? " for " + people : "";
      return "Based on the current remaining balance of " + remaining + ", a " + payment + " " + frequency + " repayment plan" + peoplePart + " starting " + firstDate + " would settle it around " + finalDate + ".";
    }

    return "I can repay " + payment + " " + frequency + " starting " + firstDate + purpose + ". Based on the current remaining balance of " + remaining + ", that would settle it around " + finalDate + ". I'll keep the repayments written down so the balance stays clear.";
  }

  function buildSummary(values, result) {
    if (result.state === "settled") {
      return [
        "Repayment plan:",
        "Original amount: " + formatMoneyFromCents(result.amounts.totalCents, values.currency),
        "Already repaid: " + formatMoneyFromCents(result.amounts.repaidCents, values.currency),
        result.amounts.extraCents > 0 ? "Extra payment now: " + formatMoneyFromCents(result.amounts.extraCents, values.currency) : null,
        "Remaining balance: " + formatMoneyFromCents(0, values.currency),
        "Status: Fully repaid",
      ].filter(Boolean).join("\n");
    }

    if (result.state === "overpaid") {
      return [
        "Repayment plan:",
        "Original amount: " + formatMoneyFromCents(result.amounts.totalCents, values.currency),
        "Already repaid: " + formatMoneyFromCents(result.amounts.repaidCents, values.currency),
        result.amounts.extraCents > 0 ? "Extra payment now: " + formatMoneyFromCents(result.amounts.extraCents, values.currency) : null,
        "Overpaid by: " + formatMoneyFromCents(Math.abs(result.amounts.remainingAfterExtraCents), values.currency),
        "Status: Check the numbers before creating a plan",
      ].filter(Boolean).join("\n");
    }

    var plan = result.plan;
    var lines = [
      "Repayment plan:",
      "Original amount: " + formatMoneyFromCents(result.amounts.totalCents, values.currency),
    ];

    if (result.amounts.repaidCents > 0) {
      lines.push("Already repaid: " + formatMoneyFromCents(result.amounts.repaidCents, values.currency));
    }

    if (result.amounts.extraCents > 0) {
      lines.push("Extra payment now: " + formatMoneyFromCents(result.amounts.extraCents, values.currency));
    }

    lines.push("Remaining balance: " + formatMoneyFromCents(result.amounts.remainingAfterExtraCents, values.currency));
    lines.push("Payment amount: " + formatMoneyFromCents(plan.paymentCents, values.currency) + " " + frequencyLabel(plan.frequency));
    lines.push("First payment: " + formatDate(plan.firstDate));
    lines.push("Estimated final payment: " + formatDate(plan.finalDate));

    if (plan.finalSmallCents) {
      lines.push("Final smaller payment: " + formatMoneyFromCents(plan.finalSmallCents, values.currency));
    }

    return lines.join("\n");
  }

  function buildRecord(values, result) {
    if (result.state === "settled") {
      return "Repayment plan: " + formatMoneyFromCents(result.amounts.totalCents, values.currency) + " total. This looks fully repaid.";
    }

    if (result.state === "overpaid") {
      return "Repayment plan check: " + formatMoneyFromCents(result.amounts.totalCents, values.currency) + " total. Entered repayments look over by " + formatMoneyFromCents(Math.abs(result.amounts.remainingAfterExtraCents), values.currency) + ".";
    }

    var plan = result.plan;
    var opener = values.purpose
      ? "Temporary support repayment plan: " + formatMoneyFromCents(result.amounts.totalCents, values.currency) + " for " + values.purpose + ". "
      : "Repayment plan: " + formatMoneyFromCents(result.amounts.totalCents, values.currency) + " total. ";
    var details = [];

    if (result.amounts.repaidCents > 0) {
      details.push(formatMoneyFromCents(result.amounts.repaidCents, values.currency) + " already repaid.");
    }

    if (result.amounts.extraCents > 0) {
      details.push(formatMoneyFromCents(result.amounts.extraCents, values.currency) + " extra payment now.");
    }

    details.push(formatMoneyFromCents(result.amounts.remainingAfterExtraCents, values.currency) + " remains.");
    details.push("Planned repayment: " + formatMoneyFromCents(plan.paymentCents, values.currency) + "/" + frequencyUnitLabel(plan.frequency) + " starting " + formatDate(plan.firstDate) + ".");

    if (plan.finalSmallCents) {
      details.push("Final smaller payment of " + formatMoneyFromCents(plan.finalSmallCents, values.currency) + ".");
    }

    return opener + details.join(" ");
  }

  function setText(selectorKey, value) {
    if (els.summary[selectorKey]) els.summary[selectorKey].textContent = value;
  }

  function renderSummary(values, result) {
    if (result.state === "settled") {
      setText("remaining", formatMoneyFromCents(0, values.currency));
      if (els.planLabel) els.planLabel.textContent = "Payment plan";
      setText("plan", "No regular plan needed");
      setText("count", "0");
      setText("finalDate", "Fully repaid");
      if (els.finalSmallCard) els.finalSmallCard.hidden = true;
      setText("finalSmall", "");
      return;
    }

    if (result.state === "overpaid") {
      setText("remaining", formatMoneyFromCents(0, values.currency));
      if (els.planLabel) els.planLabel.textContent = "Payment plan";
      setText("plan", "Check numbers");
      setText("count", "0");
      setText("finalDate", "Overpaid");
      if (els.finalSmallCard) els.finalSmallCard.hidden = true;
      setText("finalSmall", "");
      return;
    }

    var plan = result.plan;
    setText("remaining", formatMoneyFromCents(result.amounts.remainingAfterExtraCents, values.currency));
    if (els.planLabel) els.planLabel.textContent = plan.mode === "date" ? "Required payment" : "Payment plan";
    setText("plan", formatMoneyFromCents(plan.paymentCents, values.currency) + " " + frequencyLabel(plan.frequency));
    setText("count", String(plan.numberOfPayments));
    setText("finalDate", formatDate(plan.finalDate));

    if (els.finalSmallCard) {
      els.finalSmallCard.hidden = !plan.finalSmallCents;
    }

    if (plan.finalSmallCents) {
      setText("finalSmall", formatMoneyFromCents(plan.finalSmallCents, values.currency));
    } else {
      setText("finalSmall", "");
    }
  }

  function renderSchedule(values, result) {
    if (!els.scheduleBody) return;

    els.scheduleBody.textContent = "";

    result.schedule.forEach(function (row) {
      var tr = document.createElement("tr");
      var dateText = row.dateText || formatDate(row.date);
      var cells = [
        { label: "Payment", value: row.label },
        { label: "Date", value: dateText },
        { label: "Planned payment", value: formatMoneyFromCents(row.paymentCents, values.currency) },
        { label: "Balance after", value: formatMoneyFromCents(row.balanceCents, values.currency) },
      ];

      cells.forEach(function (cell) {
        var td = document.createElement("td");
        td.setAttribute("data-label", cell.label);
        td.textContent = cell.value;
        tr.appendChild(td);
      });

      els.scheduleBody.appendChild(tr);
    });

    if (!result.schedule.length) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.setAttribute("data-label", "Schedule");
      td.textContent = "No regular payment schedule is needed for these numbers.";
      tr.appendChild(td);
      els.scheduleBody.appendChild(tr);
    }
  }

  function renderNote(values, result) {
    var note = "";

    if (result.state === "settled") {
      note = "This looks fully repaid. You may not need a payment plan. A repayment receipt can help if you want a clear confirmation.";
    } else if (result.state === "overpaid") {
      note = "This looks overpaid by " + formatMoneyFromCents(Math.abs(result.amounts.remainingAfterExtraCents), values.currency) + ". Check the numbers before creating a plan.";
    } else if (result.plan.numberOfPayments === 1) {
      note = "This plan needs one payment of " + formatMoneyFromCents(result.plan.finalPaymentCents, values.currency) + ".";
    } else if (result.plan.numberOfPayments > 36) {
      note = "This is a long repayment plan. A check-in date may help both people keep expectations clear.";
    }

    if (result.plan && result.plan.truncated) {
      note += (note ? " " : "") + "The table shows the first " + maxRenderedRows + " payments to keep the page responsive.";
    }

    if (els.resultNote) els.resultNote.textContent = note;
  }

  function renderOutputs(values, result) {
    lastOutput.message = buildMessage(values, result);
    lastOutput.summary = buildSummary(values, result);
    lastOutput.record = buildRecord(values, result);

    if (els.outputs.message) els.outputs.message.textContent = lastOutput.message;
    if (els.outputs.summary) els.outputs.summary.textContent = lastOutput.summary;
    if (els.outputs.record) els.outputs.record.textContent = lastOutput.record;
    setCopyButtonsDisabled(false);
  }

  function render(values, result) {
    if (els.resultStatus) {
      if (result.state === "settled") els.resultStatus.textContent = "Fully repaid";
      else if (result.state === "overpaid") els.resultStatus.textContent = "Check numbers";
      else els.resultStatus.textContent = result.plan.mode === "date" ? "Target-date plan" : "Payment-amount plan";
    }

    renderSummary(values, result);
    renderNote(values, result);
    renderSchedule(values, result);
    renderOutputs(values, result);
  }

  function renderInvalid(message) {
    var safeMessage = message || "Check the highlighted fields.";

    if (els.formStatus) els.formStatus.textContent = safeMessage;
    if (els.resultStatus) els.resultStatus.textContent = "Check fields";
    if (els.resultNote) els.resultNote.textContent = message || "Check the fields above before using the plan.";
    if (els.planLabel) els.planLabel.textContent = "Payment plan";

    setText("remaining", "Check fields");
    setText("plan", "Needs valid input");
    setText("count", "-");
    setText("finalDate", "-");

    if (els.finalSmallCard) els.finalSmallCard.hidden = true;
    setText("finalSmall", "");
    if (els.scheduleBody) {
      els.scheduleBody.textContent = "";
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.setAttribute("data-label", "Schedule");
      td.textContent = safeMessage;
      tr.appendChild(td);
      els.scheduleBody.appendChild(tr);
    }

    lastOutput.message = "";
    lastOutput.summary = "";
    lastOutput.record = "";
    if (els.outputs.message) els.outputs.message.textContent = "Enter valid amounts to generate a repayment message.";
    if (els.outputs.summary) els.outputs.summary.textContent = "Enter valid amounts to generate a plan summary.";
    if (els.outputs.record) els.outputs.record.textContent = "Enter valid amounts to generate a record note.";
    setCopyButtonsDisabled(true);
  }

  function setCopyButtonsDisabled(isDisabled) {
    if (!els.outputButtons) return;

    els.outputButtons.forEach(function (button) {
      button.disabled = Boolean(isDisabled);
      button.setAttribute("aria-disabled", isDisabled ? "true" : "false");
    });
  }

  function generate(options) {
    var values = getValues();

    syncModePanels(values.mode);
    if (!(options && options.silent)) {
      trackToolStart(values);
    }

    if (!validate(values)) {
      renderInvalid();
      return false;
    }

    var result = calculate(values);

    if (result.state === "invalid") {
      renderInvalid(result.error);
      return false;
    }

    clearErrors();
    render(values, result);
    if (!(options && options.silent)) {
      dispatchToolEvent("payment_plan_calculate", values, {
        result_state: result.state,
        payment_count: result.plan ? result.plan.numberOfPayments : 0,
      });
    }

    if (options && options.scroll && els.results) {
      els.results.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return true;
  }

  function syncModePanels(mode) {
    if (els.amountPanel) {
      els.amountPanel.hidden = mode !== "amount";
      els.amountPanel.setAttribute("aria-hidden", mode !== "amount" ? "true" : "false");
    }

    if (els.datePanel) {
      els.datePanel.hidden = mode !== "date";
      els.datePanel.setAttribute("aria-hidden", mode !== "date" ? "true" : "false");
    }
  }

  function setDefaultDates() {
    var first = defaultFirstPaymentDate();
    var firstValue = inputValueFromDate(first);
    var targetValue = inputValueFromDate(addMonthsClamped(first, 2));

    if (els.firstPaymentAmount && !els.firstPaymentAmount.value) els.firstPaymentAmount.value = firstValue;
    if (els.firstPaymentDate && !els.firstPaymentDate.value) els.firstPaymentDate.value = firstValue;
    if (els.targetDate && !els.targetDate.value) els.targetDate.value = targetValue;
  }

  function loadExample() {
    var first = new Date(2026, 6, 1);
    var target = new Date(2026, 8, 1);

    if (els.currency) els.currency.value = "$";
    if (els.total) els.total.value = "720";
    if (els.repaid) els.repaid.value = "200";
    if (els.extra) els.extra.value = "0";
    if (els.purpose) els.purpose.value = "rent and groceries";
    if (els.repayingPerson) els.repayingPerson.value = "Maya";
    if (els.receivingPerson) els.receivingPerson.value = "Sam";
    if (els.perspective) els.perspective.value = "repaying";
    if (els.regularPayment) els.regularPayment.value = "200";
    if (els.frequencyAmount) els.frequencyAmount.value = "monthly";
    if (els.frequencyDate) els.frequencyDate.value = "monthly";
    if (els.firstPaymentAmount) els.firstPaymentAmount.value = inputValueFromDate(first);
    if (els.firstPaymentDate) els.firstPaymentDate.value = inputValueFromDate(first);
    if (els.targetDate) els.targetDate.value = inputValueFromDate(target);

    var amountMode = document.querySelector("input[name='pp-mode'][value='amount']");
    if (amountMode) amountMode.checked = true;
    syncModePanels("amount");
    generate({ scroll: true });
  }

  function clearFields() {
    var first = defaultFirstPaymentDate();

    if (els.currency) els.currency.value = "$";
    if (els.total) els.total.value = "";
    if (els.repaid) els.repaid.value = "0";
    if (els.extra) els.extra.value = "0";
    if (els.purpose) els.purpose.value = "";
    if (els.repayingPerson) els.repayingPerson.value = "";
    if (els.receivingPerson) els.receivingPerson.value = "";
    if (els.perspective) els.perspective.value = "repaying";
    if (els.regularPayment) els.regularPayment.value = "";
    if (els.frequencyAmount) els.frequencyAmount.value = "monthly";
    if (els.frequencyDate) els.frequencyDate.value = "monthly";
    if (els.firstPaymentAmount) els.firstPaymentAmount.value = inputValueFromDate(first);
    if (els.firstPaymentDate) els.firstPaymentDate.value = inputValueFromDate(first);
    if (els.targetDate) els.targetDate.value = inputValueFromDate(addMonthsClamped(first, 2));

    var amountMode = document.querySelector("input[name='pp-mode'][value='amount']");
    if (amountMode) amountMode.checked = true;
    syncModePanels("amount");
    generate();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function showCopied() {
    if (!els.copyStatus) return;
    els.copyStatus.textContent = "Copied";
    window.clearTimeout(els.copyStatusTimer);
    els.copyStatusTimer = window.setTimeout(function () {
      els.copyStatus.textContent = "";
    }, 1800);
  }

  function copyOutput(target) {
    var text = lastOutput[target] || "";
    if (!text) return;

    copyText(text).then(function () {
      showCopied();
      dispatchToolEvent(target === "summary"
        ? "payment_plan_copy_summary"
        : target === "record"
          ? "payment_plan_copy_record_note"
          : "payment_plan_copy_message", getValues(), {
        copy_target: target,
      });
    }).catch(function () {
      if (els.copyStatus) els.copyStatus.textContent = "Select the text and copy it manually.";
    });
  }

  function copyTemplate(button) {
    var card = button.closest(".pp-template-card");
    var textEl = card ? card.querySelector("[data-template-text]") : null;
    var text = textEl ? textEl.textContent : "";

    if (!text) return;

    copyText(text).then(function () {
      button.textContent = "Copied";
      window.setTimeout(function () {
        button.textContent = "Copy template";
      }, 1600);
    }).catch(function () {
      button.textContent = "Select and copy";
    });
  }

  function bindEvents() {
    if (!els.form) return;

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      generate({ scroll: true });
    });

    els.form.addEventListener("input", function () {
      generate();
    });

    els.form.addEventListener("change", function (event) {
      if (event.target && event.target.name === "pp-mode") {
        syncModePanels(getMode());
      }
      generate();
    });

    document.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        var action = actionButton.getAttribute("data-action");
        if (action === "load-example") loadExample();
        if (action === "clear-fields") clearFields();
        return;
      }

      var copyButton = event.target.closest("[data-copy-output]");
      if (copyButton) {
        copyOutput(copyButton.getAttribute("data-copy-output"));
        return;
      }

      var templateButton = event.target.closest("[data-copy-template]");
      if (templateButton) {
        copyTemplate(templateButton);
      }
    });
  }

  ready(function () {
    els = {
      form: byId("payment-plan-form"),
      results: byId("payment-plan-results"),
      currency: byId("pp-currency"),
      total: byId("pp-total"),
      repaid: byId("pp-repaid"),
      extra: byId("pp-extra"),
      purpose: byId("pp-purpose"),
      repayingPerson: byId("pp-repaying-person"),
      receivingPerson: byId("pp-receiving-person"),
      perspective: byId("pp-perspective"),
      regularPayment: byId("pp-regular-payment"),
      frequencyAmount: byId("pp-frequency-amount"),
      frequencyDate: byId("pp-frequency-date"),
      firstPaymentAmount: byId("pp-first-payment-amount"),
      firstPaymentDate: byId("pp-first-payment-date"),
      targetDate: byId("pp-target-date"),
      amountPanel: document.querySelector("[data-mode-panel='amount']"),
      datePanel: document.querySelector("[data-mode-panel='date']"),
      formStatus: document.querySelector("[data-form-status]"),
      resultStatus: document.querySelector("[data-result-status]"),
      resultNote: document.querySelector("[data-result-note]"),
      scheduleBody: document.querySelector("[data-schedule-body]"),
      copyStatus: document.querySelector("[data-copy-status]"),
      finalSmallCard: document.querySelector("[data-final-small-card]"),
      planLabel: document.querySelector("[data-summary='plan']") ? document.querySelector("[data-summary='plan']").previousElementSibling : null,
      errors: {
        total: byId("pp-total-error"),
        repaid: byId("pp-repaid-error"),
        extra: byId("pp-extra-error"),
        regular: byId("pp-regular-error"),
        firstAmount: byId("pp-first-amount-error"),
        target: byId("pp-target-error"),
        firstDate: byId("pp-first-date-error"),
      },
      summary: {
        remaining: document.querySelector("[data-summary='remaining']"),
        plan: document.querySelector("[data-summary='plan']"),
        count: document.querySelector("[data-summary='count']"),
        finalDate: document.querySelector("[data-summary='finalDate']"),
        finalSmall: document.querySelector("[data-summary='finalSmall']"),
      },
      outputs: {
        message: document.querySelector("[data-output='message']"),
        summary: document.querySelector("[data-output='summary']"),
        record: document.querySelector("[data-output='record']"),
      },
      outputButtons: Array.prototype.slice.call(document.querySelectorAll("[data-copy-output]")),
    };

    setDefaultDates();
    syncModePanels(getMode());
    bindEvents();
    generate({ silent: true });
  });
})();

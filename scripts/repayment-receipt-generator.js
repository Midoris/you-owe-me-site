(function () {
  "use strict";

  var allowedTone = ["Friendly", "Neutral", "More formal"];
  var allowedOutputLength = ["Short message", "Receipt summary", "Both"];
  var allowedMethods = ["", "Bank transfer", "Cash", "PayPal", "Venmo", "Wise", "Revolut", "Other"];
  var tolerance = 0.005;

  var els = {};
  var lastOutput = {
    message: "",
    summary: "",
    record: "",
  };

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

  function safeSelect(select, allowed, fallback) {
    if (!select || allowed.indexOf(select.value) === -1) return fallback;
    return select.value;
  }

  function todayInputValue() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function formatDateForInput(value) {
    if (!value) return "today";

    var parts = String(value).split("-");
    if (parts.length !== 3) return "today";

    var year = Number(parts[0]);
    var month = Number(parts[1]) - 1;
    var day = Number(parts[2]);
    var date = new Date(year, month, day);

    if (Number.isNaN(date.getTime())) return "today";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function parseNumber(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatMoney(amount, currency) {
    var value = Number(amount);
    var symbol = cleanText(currency, 6) || "$";

    if (!Number.isFinite(value)) return symbol + "0.00";

    return symbol + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function capitalizeFirst(value) {
    var text = String(value || "");
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getValues() {
    var paidByRaw = cleanText(els.paidBy ? els.paidBy.value : "", 60);
    var receivedByRaw = cleanText(els.receivedBy ? els.receivedBy.value : "", 60);
    var reasonRaw = cleanText(els.reason ? els.reason.value : "", 120);
    var noteRaw = cleanText(els.note ? els.note.value : "", 220);
    var currency = cleanText(els.currency ? els.currency.value : "", 6) || "$";
    var method = safeSelect(els.method, allowedMethods, "");

    return {
      currency: currency,
      amount: parseNumber(els.amount ? els.amount.value : ""),
      amountRaw: els.amount ? els.amount.value : "",
      dateRaw: els.date ? els.date.value : "",
      dateText: formatDateForInput(els.date ? els.date.value : ""),
      method: method,
      paidByRaw: paidByRaw,
      receivedByRaw: receivedByRaw,
      paidBySummary: paidByRaw || "They",
      paidBySubject: paidByRaw || "They",
      paidByObject: paidByRaw || "them",
      receivedBySummary: receivedByRaw || "you",
      reasonRaw: reasonRaw,
      reason: reasonRaw || "the balance",
      note: noteRaw,
      balanceBefore: parseNumber(els.balanceBefore ? els.balanceBefore.value : ""),
      balanceBeforeRaw: els.balanceBefore ? els.balanceBefore.value : "",
      tone: safeSelect(els.tone, allowedTone, "Friendly"),
      outputLength: safeSelect(els.outputLength, allowedOutputLength, "Both"),
    };
  }

  function validate(values) {
    var errors = {
      amount: "",
      balance: "",
    };
    var isValid = true;

    if (!Number.isFinite(values.amount) || values.amount <= 0) {
      errors.amount = "Enter an amount greater than 0.";
      isValid = false;
    }

    if (values.balanceBeforeRaw !== "" && (!Number.isFinite(values.balanceBefore) || values.balanceBefore < 0)) {
      errors.balance = "Leave this blank or enter 0 or more.";
      isValid = false;
    }

    if (els.amountError) els.amountError.textContent = errors.amount;
    if (els.balanceError) els.balanceError.textContent = errors.balance;

    return isValid;
  }

  function calculate(values) {
    if (values.balanceBeforeRaw === "") {
      return {
        status: "Payment received",
        balanceKnown: false,
        balanceAfter: null,
        remainingText: "Remaining balance was not calculated because no previous balance was entered.",
      };
    }

    var balanceAfter = values.balanceBefore - values.amount;

    if (balanceAfter > tolerance) {
      return {
        status: "Partially paid",
        balanceKnown: true,
        balanceAfter: balanceAfter,
        remainingText: "Remaining balance: " + formatMoney(balanceAfter, values.currency),
      };
    }

    if (Math.abs(balanceAfter) <= tolerance) {
      return {
        status: "Fully settled",
        balanceKnown: true,
        balanceAfter: 0,
        remainingText: "No remaining balance.",
      };
    }

    return {
      status: "Overpaid",
      balanceKnown: true,
      balanceAfter: balanceAfter,
      overpayment: Math.abs(balanceAfter),
      remainingText: "Overpayment: " + formatMoney(Math.abs(balanceAfter), values.currency),
    };
  }

  function sentenceLead(values) {
    if (values.paidByRaw) return "Thanks, " + values.paidByRaw + " -";
    return "Thanks -";
  }

  function forReason(values) {
    return "for " + values.reason;
  }

  function buildFriendlyMessage(values, calc) {
    var amount = formatMoney(values.amount, values.currency);
    var lead = sentenceLead(values);
    var datePart = values.dateText === "today" ? "today" : "on " + values.dateText;

    if (calc.status === "Partially paid") {
      return lead + " I received " + amount + " " + forReason(values) + " " + datePart + ". That leaves " + formatMoney(calc.balanceAfter, values.currency) + " still open. Just keeping the record clear.";
    }

    if (calc.status === "Fully settled") {
      return lead + " I received the final " + amount + " " + forReason(values) + " " + datePart + ". We're all settled now.";
    }

    if (calc.status === "Overpaid") {
      return lead + " I received " + amount + " " + forReason(values) + " " + datePart + ". That looks like " + formatMoney(calc.overpayment, values.currency) + " more than the balance, so we may need to adjust it.";
    }

    return lead + " I received " + amount + " " + forReason(values) + " " + datePart + ". Just keeping the record clear.";
  }

  function buildNeutralMessage(values, calc) {
    var amount = formatMoney(values.amount, values.currency);
    var from = "from " + values.paidByObject;
    var datePart = values.dateText === "today" ? "today" : "on " + values.dateText;
    var base = "Received " + amount + " " + from + " " + forReason(values) + " " + datePart + ".";

    if (calc.status === "Partially paid") {
      return base + " Remaining balance: " + formatMoney(calc.balanceAfter, values.currency) + ".";
    }

    if (calc.status === "Fully settled") {
      return "Received the final " + amount + " " + from + " " + forReason(values) + " " + datePart + ". No remaining balance.";
    }

    if (calc.status === "Overpaid") {
      return base + " Overpayment: " + formatMoney(calc.overpayment, values.currency) + ".";
    }

    return base + " Remaining balance was not calculated because no previous balance was entered.";
  }

  function buildFormalMessage(values, calc) {
    var amount = formatMoney(values.amount, values.currency);
    var from = "from " + values.paidByObject;
    var datePart = values.dateText === "today" ? "today" : "on " + values.dateText;
    var base = "Repayment confirmation: " + amount + " was received " + from + " " + forReason(values) + " " + datePart + ".";

    if (calc.status === "Partially paid") {
      return base + " Remaining balance after this payment: " + formatMoney(calc.balanceAfter, values.currency) + ".";
    }

    if (calc.status === "Fully settled") {
      return base + " The entered balance is now fully settled.";
    }

    if (calc.status === "Overpaid") {
      return base + " Overpayment after this payment: " + formatMoney(calc.overpayment, values.currency) + ".";
    }

    return base + " Remaining balance was not calculated because no previous balance was entered.";
  }

  function buildMessage(values, calc) {
    if (values.tone === "Neutral") return buildNeutralMessage(values, calc);
    if (values.tone === "More formal") return buildFormalMessage(values, calc);
    return buildFriendlyMessage(values, calc);
  }

  function buildSummary(values, calc) {
    var lines = [
      "Repayment confirmation",
      "",
      "Paid by: " + values.paidBySummary,
      "Received by: " + values.receivedBySummary,
      "Amount received: " + formatMoney(values.amount, values.currency),
      "Date received: " + capitalizeFirst(values.dateText),
      "For: " + capitalizeFirst(values.reason),
    ];

    if (values.method) {
      lines.push("Payment method: " + values.method);
    }

    if (calc.balanceKnown) {
      lines.push("Balance before payment: " + formatMoney(values.balanceBefore, values.currency));

      if (calc.status === "Overpaid") {
        lines.push("Overpayment: " + formatMoney(calc.overpayment, values.currency));
      } else {
        lines.push("Balance after payment: " + formatMoney(calc.balanceAfter, values.currency));
      }
    } else {
      lines.push("Remaining balance: Not calculated");
    }

    lines.push("Status: " + calc.status);

    if (values.note) {
      lines.push("Note: " + values.note);
    }

    return lines.join("\n");
  }

  function buildRecord(values, calc) {
    var amount = formatMoney(values.amount, values.currency);
    var date = capitalizeFirst(values.dateText);
    var reason = values.reason;
    var opener = date + " - " + values.paidBySubject + " repaid " + amount + " for " + reason + ".";

    if (calc.status === "Partially paid") {
      return opener + " Balance moved from " + formatMoney(values.balanceBefore, values.currency) + " to " + formatMoney(calc.balanceAfter, values.currency) + ".";
    }

    if (calc.status === "Fully settled") {
      return opener + " Balance is now fully settled.";
    }

    if (calc.status === "Overpaid") {
      return opener + " Payment is " + formatMoney(calc.overpayment, values.currency) + " over the entered balance.";
    }

    return opener;
  }

  function setOutputVisibility(outputLength) {
    var showMessage = outputLength === "Short message" || outputLength === "Both";
    var showSummary = outputLength === "Receipt summary" || outputLength === "Both";
    var showRecord = outputLength === "Both";

    if (els.messageCard) els.messageCard.classList.toggle("is-hidden", !showMessage);
    if (els.summaryCard) els.summaryCard.classList.toggle("is-hidden", !showSummary);
    if (els.recordCard) els.recordCard.classList.toggle("is-hidden", !showRecord);
  }

  function render(values, calc) {
    lastOutput.message = buildMessage(values, calc);
    lastOutput.summary = buildSummary(values, calc);
    lastOutput.record = buildRecord(values, calc);

    if (els.results) els.results.hidden = false;
    if (els.resultStatus) els.resultStatus.textContent = calc.status;
    if (els.resultSupport) els.resultSupport.textContent = calc.remainingText;
    if (els.outputMessage) els.outputMessage.textContent = lastOutput.message;
    if (els.outputSummary) els.outputSummary.textContent = lastOutput.summary;
    if (els.outputRecord) els.outputRecord.textContent = lastOutput.record;

    setOutputVisibility(values.outputLength);
  }

  function generate(options) {
    var values = getValues();
    if (!validate(values)) {
      if (els.results) els.results.hidden = true;
      if (options && options.scroll && els.form) {
        els.form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return false;
    }

    render(values, calculate(values));

    if (options && options.scroll && els.results) {
      els.results.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return true;
  }

  function loadExample() {
    if (els.currency) els.currency.value = "$";
    if (els.amount) els.amount.value = "120";
    if (els.date) els.date.value = todayInputValue();
    if (els.method) els.method.value = "Bank transfer";
    if (els.paidBy) els.paidBy.value = "Alex";
    if (els.receivedBy) els.receivedBy.value = "Maya";
    if (els.reason) els.reason.value = "concert tickets";
    if (els.balanceBefore) els.balanceBefore.value = "200";
    if (els.note) els.note.value = "This covers part of the ticket balance.";
    if (els.tone) els.tone.value = "Friendly";
    if (els.outputLength) els.outputLength.value = "Both";

    generate({ scroll: true });
  }

  function clearFields() {
    if (els.currency) els.currency.value = "$";
    if (els.amount) els.amount.value = "";
    if (els.date) els.date.value = todayInputValue();
    if (els.method) els.method.value = "";
    if (els.paidBy) els.paidBy.value = "";
    if (els.receivedBy) els.receivedBy.value = "";
    if (els.reason) els.reason.value = "";
    if (els.balanceBefore) els.balanceBefore.value = "";
    if (els.note) els.note.value = "";
    if (els.tone) els.tone.value = "Friendly";
    if (els.outputLength) els.outputLength.value = "Both";
    if (els.amountError) els.amountError.textContent = "";
    if (els.balanceError) els.balanceError.textContent = "";
    if (els.copyStatus) els.copyStatus.textContent = "";
    if (els.results) els.results.hidden = true;

    lastOutput = {
      message: "",
      summary: "",
      record: "",
    };
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

    copyText(text).then(showCopied).catch(function () {
      if (els.copyStatus) {
        els.copyStatus.textContent = "Select the text and copy it manually.";
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
      if (els.results && !els.results.hidden) generate();
    });

    els.form.addEventListener("change", function () {
      if (els.results && !els.results.hidden) generate();
    });

    document.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        var action = actionButton.getAttribute("data-action");
        if (action === "use-example") loadExample();
        if (action === "clear-fields") clearFields();
        return;
      }

      var copyButton = event.target.closest("[data-copy-target]");
      if (copyButton) {
        copyOutput(copyButton.getAttribute("data-copy-target"));
      }
    });
  }

  ready(function () {
    els = {
      form: byId("receipt-generator-form"),
      currency: byId("receipt-currency"),
      amount: byId("receipt-amount"),
      date: byId("receipt-date"),
      method: byId("receipt-method"),
      paidBy: byId("receipt-paid-by"),
      receivedBy: byId("receipt-received-by"),
      reason: byId("receipt-reason"),
      balanceBefore: byId("receipt-balance-before"),
      note: byId("receipt-note"),
      tone: byId("receipt-tone"),
      outputLength: byId("receipt-output-length"),
      amountError: byId("receipt-amount-error"),
      balanceError: byId("receipt-balance-error"),
      results: byId("receipt-results"),
      resultStatus: document.querySelector("[data-result-status]"),
      resultSupport: document.querySelector("[data-result-support]"),
      outputMessage: document.querySelector("[data-output-message]"),
      outputSummary: document.querySelector("[data-output-summary]"),
      outputRecord: document.querySelector("[data-output-record]"),
      messageCard: document.querySelector("[data-output-card='message']"),
      summaryCard: document.querySelector("[data-output-card='summary']"),
      recordCard: document.querySelector("[data-output-card='record']"),
      copyStatus: document.querySelector("[data-copy-status]"),
    };

    if (els.date && !els.date.value) {
      els.date.value = todayInputValue();
    }

    bindEvents();
  });
})();

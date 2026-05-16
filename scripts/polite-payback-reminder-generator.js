(function () {
  "use strict";

  var PAYBACK_EVENT = "youoweme:payback-generator-event";

  var allowed = {
    relationship: ["Friend", "Family member", "Partner", "Roommate", "Client", "Other"],
    situation: [
      "First reminder",
      "Balance is overdue",
      "They have not replied",
      "Promised date was missed",
      "Partial repayment received",
      "Ask for a specific repayment date",
      "Family reimbursement",
      "Roommate or shared bill",
      "Partner-sensitive balance",
      "Repayment update when I owe someone",
    ],
    tone: ["Friendly", "Polite", "Direct", "Firm", "Apologetic / reassuring"],
    messageLength: ["Short text", "Balanced", "More context"],
  };

  var defaultTiming = {
    Friendly: "when you get a chance",
    Polite: "when you have a moment",
    Direct: "this week",
    Firm: "as soon as possible",
    "Apologetic / reassuring": "whenever you can give me a quick update",
  };

  var resultEventNames = {
    short: "payback_generator_copy_short",
    clear: "payback_generator_copy_clear",
    context: "payback_generator_copy_context",
  };

  var els = {};
  var timingHardTouched = false;
  var lastMessages = {};

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

  function safeSelectValue(select, values, fallback) {
    if (!select) return fallback;
    return values.indexOf(select.value) === -1 ? fallback : select.value;
  }

  function getValues() {
    return {
      relationship: safeSelectValue(els.relationship, allowed.relationship, "Friend"),
      situation: safeSelectValue(els.situation, allowed.situation, "First reminder"),
      tone: safeSelectValue(els.tone, allowed.tone, "Polite"),
      name: cleanText(els.name ? els.name.value : "", 60),
      amount: cleanText(els.amount ? els.amount.value : "", 40),
      context: cleanText(els.context ? els.context.value : "", 120),
      timing: cleanText(els.timing ? els.timing.value : "", 80),
      remaining: cleanText(els.remaining ? els.remaining.value : "", 40),
      partial: cleanText(els.partial ? els.partial.value : "", 40),
      messageLength: safeSelectValue(els.messageLength, allowed.messageLength, "Balanced"),
      timingHard: !!(els.timingHard && els.timingHard.checked),
      statementLine: !!(els.statementLine && els.statementLine.checked),
    };
  }

  function eventPayload(values) {
    return {
      relationship: values.relationship,
      situation: values.situation,
      tone: values.tone,
      message_length: values.messageLength,
      include_statement_line: values.statementLine,
    };
  }

  function track(eventName, values) {
    var safeValues = values || getValues();
    window.dispatchEvent(new CustomEvent(PAYBACK_EVENT, {
      detail: Object.assign({ eventName: eventName }, eventPayload(safeValues)),
    }));
  }

  function isCasual(values) {
    if (values.relationship === "Client") return false;
    return values.tone === "Friendly" ||
      values.tone === "Apologetic / reassuring" ||
      values.relationship === "Family member" ||
      values.relationship === "Partner";
  }

  function greeting(values) {
    var hello = isCasual(values) ? "Hey" : "Hi";
    return values.name ? hello + " " + values.name + "," : hello + ",";
  }

  function amountBare(values) {
    return values.amount || "the amount";
  }

  function amountWithArticle(values) {
    return values.amount ? "the " + values.amount : "the amount";
  }

  function contextFrom(values) {
    return values.context ? "from " + values.context : "from what I covered";
  }

  function contextFor(values) {
    return values.context ? "for " + values.context : "for what I covered";
  }

  function contextBare(values, fallback) {
    return values.context || fallback || "what I covered";
  }

  function timingText(values) {
    if (values.timing) {
      return "by " + values.timing.replace(/^by\s+/i, "");
    }

    return defaultTiming[values.tone] || "when you have a moment";
  }

  function timingHardLine(values) {
    return values.timingHard ? "If the timing is difficult, just let me know what works." : "";
  }

  function statementLine(values) {
    return values.statementLine ? "I can also send the balance summary so it is easy to see what is included." : "";
  }

  function combine(parts) {
    return parts
      .filter(function (part) { return part && String(part).trim(); })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildFirstReminder(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);
    var timing = timingText(values);

    if (values.relationship === "Client") {
      return {
        short: combine([hi, "quick reminder about " + amountBare(values) + " " + contextFor(values) + ". Could you send it " + timing + "?"]),
        clear: combine([hi, "following up on " + amountBare(values) + " " + contextFor(values) + ". Could you send it " + timing + ", or let me know if you need anything from my side?"]),
        context: combine([hi, "I wanted to follow up on " + amountBare(values) + " " + contextFor(values) + " so we can keep the balance clear. Could you send it " + timing + "?", statementLine(values)]),
      };
    }

    if (values.tone === "Friendly") {
      return {
        short: combine([hi, "quick reminder about " + amount + " " + context + ". Could you send it " + timing + "?"]),
        clear: combine([hi, "just checking in on " + amount + " " + context + ". Could you send it " + timing + ", or let me know what timing works?"]),
        context: combine([hi, "I wanted to check in on " + amount + " " + context + " so we both have the same number. Could you send it " + timing + "?", timingHardLine(values), statementLine(values)]),
      };
    }

    if (values.tone === "Direct") {
      return {
        short: combine([hi, "following up on " + amount + " " + context + ". Could you send it " + timing + "?"]),
        clear: combine([hi, "I wanted to follow up on " + amount + " " + context + ". Could you send it " + timing + "?"]),
        context: combine([hi, "I wanted to close the loop on " + amount + " " + context + ". Could you send it " + timing + " so the balance is clear?", statementLine(values)]),
      };
    }

    if (values.tone === "Firm") {
      return {
        short: combine([hi, "following up again on " + amount + " " + context + ". Please send it " + timing + "."]),
        clear: combine([hi, "I wanted to follow up again on " + amount + " " + context + ". I'd like to get this settled " + timing + ". Please let me know if there's an issue."]),
        context: combine([hi, "I wanted to follow up again on " + amount + " " + context + ". I am trying to close this out and keep the balance clear. Please send it " + timing + ", or let me know if there is an issue.", statementLine(values)]),
      };
    }

    if (values.tone === "Apologetic / reassuring") {
      return {
        short: combine([hi, "I do not want this to feel awkward, but quick check on " + amount + " " + context + ". Could you send it " + timing + "?"]),
        clear: combine([hi, "I do not want this to feel like a big thing, but I wanted to check in on " + amount + " " + context + " so we both have the same number. Could you send it " + timing + "?"]),
        context: combine([hi, "I do not want this to feel awkward or pressured, but I wanted to keep the balance clear. I have " + amountBare(values) + " listed " + context + ". Could you send it " + timing + "?", timingHardLine(values), statementLine(values)]),
      };
    }

    return {
      short: combine([hi, "quick reminder about " + amount + " " + context + ". Could you send it " + timing + "?"]),
      clear: combine([hi, "just checking in on " + amount + " " + context + ". Could you send it " + timing + ", or let me know what timing works?"]),
      context: combine([hi, "I wanted to check in on " + amount + " " + context + " so we both have the same number. Could you send it " + timing + "?", timingHardLine(values), statementLine(values)]),
    };
  }

  function buildOverdue(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);
    var timing = timingText(values);
    var openPhrase = values.relationship === "Client" ? "is still outstanding" : "is still open";

    return {
      short: combine([hi, amount.charAt(0).toUpperCase() + amount.slice(1) + " " + context + " " + openPhrase + ". Could you send it " + timing + "?"]),
      clear: combine([hi, "I wanted to follow up on " + amount + " " + context + ". Since it has been open for a bit, could you send it " + timing + " or let me know when I should expect it?"]),
      context: combine([hi, "I wanted to follow up again on " + amount + " " + context + ". I am trying to close the loop on it and keep the balance clear. Could you send it " + timing + "?", timingHardLine(values), statementLine(values)]),
    };
  }

  function buildNoReply(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);

    return {
      short: combine([hi, "just checking in again about " + amount + " " + context + ". Please let me know where things stand."]),
      clear: combine([hi, "I wanted to check in one more time about " + amount + " " + context + ". I may have missed your update, so please let me know where things stand."]),
      context: combine([hi, "I wanted to follow up again about " + amount + " " + context + ". I do not want this to get awkward, but I do want us to have the same number. Could you let me know the timing?", statementLine(values)]),
    };
  }

  function buildMissedDate(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);
    var missedDate = values.timing ? values.timing : "the date we talked about";
    var newTiming = values.timing ? "as soon as possible" : timingText(values);

    return {
      short: combine([hi, "just following up because " + missedDate + " has passed. Could you send " + amount + " " + newTiming + "?"]),
      clear: combine([hi, "I wanted to follow up on " + amount + " " + context + ". Since " + missedDate + " has passed, could you send it " + newTiming + " or let me know the updated timing?"]),
      context: combine([hi, "I wanted to check in because " + missedDate + " has passed. The balance I have is " + amountBare(values) + " " + context + ". Could you send it " + newTiming + ", or let me know what timing is realistic?", statementLine(values)]),
    };
  }

  function buildPartial(values) {
    var hi = greeting(values);
    var context = contextFrom(values);
    var timing = timingText(values);
    var partial = values.partial;
    var remaining = values.remaining;

    if (!partial && !remaining) {
      return {
        short: "Thanks for sending part of it. I just wanted to check in on the remaining balance so we both have the same number.",
        clear: combine([hi, "thanks for sending part of it. I wanted to check in on the remaining balance " + context + " so we both have the same number. Could you send the rest " + timing + ", or let me know what timing works?"]),
        context: combine([hi, "thanks for the partial repayment. I just wanted to keep the record clear so neither of us has to guess later. Could you let me know the remaining balance and timing for the rest?", statementLine(values)]),
      };
    }

    if (partial && !remaining) {
      return {
        short: combine(["Thanks for sending " + partial + ". Could you confirm the remaining balance so we both have the same number?"]),
        clear: combine([hi, "thanks for sending " + partial + ". I wanted to confirm the remaining balance " + context + " so we both have the same number. Could you let me know what timing works for the rest?"]),
        context: combine([hi, "thanks for sending " + partial + ". I appreciate it. I want to keep the record clear, so could you confirm what remains " + context + " and when you expect to send the rest?", statementLine(values)]),
      };
    }

    return {
      short: combine(["Thanks for sending " + (partial || "part of it") + ". I just wanted to check in on the remaining " + remaining + " so we both have the same number."]),
      clear: combine([hi, "thanks for sending " + (partial || "part of it") + ". I have " + remaining + " remaining " + context + ". Could you send the rest " + timing + ", or let me know what timing works?"]),
      context: combine([hi, "thanks for the partial repayment. I have the remaining balance as " + remaining + " " + context + ". I just wanted to keep the record clear so neither of us has to guess later. Could you send the rest " + timing + "?", statementLine(values)]),
    };
  }

  function buildSpecificDate(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);
    var timing = timingText(values);

    return {
      short: combine([hi, "could you send " + amount + " " + context + " " + timing + "? Just trying to close the loop."]),
      clear: combine([hi, "could you send " + amount + " " + context + " " + timing + ", or let me know a date that works better?"]),
      context: combine([hi, "I wanted to close the loop on " + amount + " " + context + ". Could you send it " + timing + ", or tell me what date works so I can keep the balance clear?", timingHardLine(values)]),
    };
  }

  function buildFamily(values) {
    var hi = greeting(values);
    var amount = amountBare(values);
    var context = contextFrom(values);
    var timing = timingText(values);

    return {
      short: combine([hi, "just keeping track of the family reimbursements. I still have " + amount + " listed " + context + ". Could you send it when you get a chance?"]),
      clear: combine([hi, "I am keeping the family reimbursement record updated and still have " + amount + " listed " + context + ". Could you send it " + timing + ", or let me know if I missed something?"]),
      context: combine([hi, "I do not want this to feel awkward, but I am trying to keep the family reimbursements clear. I still have " + amount + " listed " + context + ". Could you send it " + timing + ", or let me know if your number is different?", statementLine(values)]),
    };
  }

  function buildRoommate(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var shared = contextBare(values, "the shared bill");
    var timing = timingText(values);

    return {
      short: combine([hi, "quick reminder about your part of " + shared + ". Could you send " + amount + " " + timing + "?"]),
      clear: combine([hi, "just checking in on your part of " + shared + ". I have it as " + amountBare(values) + ". Could you send it " + timing + " so we can close out the bill?"]),
      context: combine([hi, "I am trying to keep this month's shared costs clear. I still have " + amountBare(values) + " listed for your part of " + shared + ". Could you send it " + timing + "?", statementLine(values)]),
    };
  }

  function buildPartner(values) {
    var hi = greeting(values);
    var amount = amountWithArticle(values);
    var context = contextFrom(values);
    var timing = timingText(values);

    return {
      short: combine([hi, "quick check on " + amount + " " + context + " so we are on the same page. Could we settle it " + timing + "?"]),
      clear: combine([hi, "I do not want this to feel like scorekeeping, but I wanted to check in on " + amount + " " + context + " so we are on the same page. Could we settle it " + timing + "?"]),
      context: combine([hi, "I wanted to keep the shared spending clear before it becomes a bigger conversation. I have " + amountBare(values) + " listed " + context + ". Could we settle it " + timing + ", or talk about what timing feels fair?", statementLine(values)]),
    };
  }

  function repaymentUpdateDetails(values) {
    var timing = timingText(values);

    if (values.partial && values.remaining) {
      return "I can send " + values.partial + " now and the remaining " + values.remaining + " " + timing + ".";
    }

    if (values.partial) {
      return "I can send " + values.partial + " now and will keep you updated on the rest " + timing + ".";
    }

    if (values.remaining) {
      return "I have " + values.remaining + " remaining and can send it " + timing + ".";
    }

    return "I have not forgotten, and I will send it " + timing + ".";
  }

  function buildRepaymentUpdate(values) {
    var hi = greeting(values);
    var amount = amountBare(values);
    var context = values.context ? "for " + values.context : "from earlier";
    var details = repaymentUpdateDetails(values);

    return {
      short: combine([hi, "quick update on " + amount + " I owe you " + context + ". " + details]),
      clear: combine([hi, "I wanted to give you an update on " + amount + " I owe you " + context + ". I have not forgotten. " + details]),
      context: combine([hi, "I wanted to keep you updated about " + amount + " I owe you " + context + ". I do not want you to have to chase me for it. " + details, "Thanks for being patient."]),
    };
  }

  function buildMessages(values) {
    switch (values.situation) {
      case "Balance is overdue":
        return buildOverdue(values);
      case "They have not replied":
        return buildNoReply(values);
      case "Promised date was missed":
        return buildMissedDate(values);
      case "Partial repayment received":
        return buildPartial(values);
      case "Ask for a specific repayment date":
        return buildSpecificDate(values);
      case "Family reimbursement":
        return buildFamily(values);
      case "Roommate or shared bill":
        return buildRoommate(values);
      case "Partner-sensitive balance":
        return buildPartner(values);
      case "Repayment update when I owe someone":
        return buildRepaymentUpdate(values);
      case "First reminder":
      default:
        return buildFirstReminder(values);
    }
  }

  function recommendedKey(length) {
    if (length === "Short text") return "short";
    if (length === "More context") return "context";
    return "clear";
  }

  function renderMessages(messages, values) {
    var key = recommendedKey(values.messageLength);
    lastMessages = messages;

    els.messageShort.textContent = messages.short;
    els.messageClear.textContent = messages.clear;
    els.messageContext.textContent = messages.context;

    Object.keys(els.resultCards).forEach(function (resultKey) {
      els.resultCards[resultKey].classList.toggle("is-recommended", resultKey === key);
    });

    if (els.recommendation) {
      var label = key === "short" ? "Short version" : key === "context" ? "More context version" : "Clear version";
      els.recommendation.textContent = label + " is highlighted from your message length choice. You can copy any version.";
    }

    if (els.resultsSection.hidden) {
      els.resultsSection.hidden = false;
    }
  }

  function applyTimingDefault() {
    if (timingHardTouched || !els.timingHard) return;

    var values = getValues();
    var shouldCheck = values.tone === "Friendly" ||
      values.tone === "Polite" ||
      values.tone === "Apologetic / reassuring" ||
      values.relationship === "Family member" ||
      values.relationship === "Partner";

    if (values.tone === "Firm") shouldCheck = false;
    els.timingHard.checked = shouldCheck;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var success = document.execCommand("copy");
        document.body.removeChild(textarea);
        success ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function handleCopy(button) {
    var resultKey = button.getAttribute("data-copy-result");
    var text = lastMessages[resultKey];

    if (!text) return;

    var originalText = button.textContent;

    copyText(text).then(function () {
      button.textContent = "Copied";
      if (els.copyStatus) els.copyStatus.textContent = "Copied " + resultKey + " reminder message.";
      track(resultEventNames[resultKey] || "payback_generator_copy_clear");

      window.setTimeout(function () {
        button.textContent = originalText;
        if (els.copyStatus) els.copyStatus.textContent = "";
      }, 1800);
    }).catch(function () {
      if (els.copyStatus) els.copyStatus.textContent = "Copy did not work. Select the message text and copy it manually.";
    });
  }

  function handleGenerate(event) {
    event.preventDefault();
    applyTimingDefault();

    var values = getValues();
    var messages = buildMessages(values);
    renderMessages(messages, values);
    track("payback_generator_generate", values);

    if (els.copyStatus) els.copyStatus.textContent = "Generated three reminder messages.";
    els.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearFields() {
    var values = getValues();

    els.relationship.value = "Friend";
    els.situation.value = "First reminder";
    els.tone.value = "Polite";
    els.name.value = "";
    els.amount.value = "";
    els.context.value = "";
    els.timing.value = "";
    els.remaining.value = "";
    els.partial.value = "";
    els.messageLength.value = "Balanced";
    els.statementLine.checked = false;
    timingHardTouched = false;
    applyTimingDefault();

    lastMessages = {};
    els.resultsSection.hidden = true;
    if (els.copyStatus) els.copyStatus.textContent = "";
    track("payback_generator_clear", values);
  }

  function useExample() {
    els.relationship.value = "Friend";
    els.situation.value = "First reminder";
    els.tone.value = "Polite";
    els.name.value = "Alex";
    els.amount.value = "$45";
    els.context.value = "dinner and tickets";
    els.timing.value = "this weekend";
    els.remaining.value = "";
    els.partial.value = "";
    els.messageLength.value = "Balanced";
    els.statementLine.checked = false;
    els.timingHard.checked = true;
    timingHardTouched = false;
    track("payback_generator_use_example");
  }

  function cacheElements() {
    els.form = byId("payback-generator-form");
    els.relationship = byId("payback-relationship");
    els.situation = byId("payback-situation");
    els.tone = byId("payback-tone");
    els.name = byId("payback-name");
    els.amount = byId("payback-amount");
    els.context = byId("payback-context");
    els.timing = byId("payback-timing");
    els.remaining = byId("payback-remaining");
    els.partial = byId("payback-partial");
    els.messageLength = byId("payback-length");
    els.timingHard = byId("payback-timing-hard");
    els.statementLine = byId("payback-statement");
    els.resultsSection = byId("payback-results");
    els.messageShort = document.querySelector("[data-message-short]");
    els.messageClear = document.querySelector("[data-message-clear]");
    els.messageContext = document.querySelector("[data-message-context]");
    els.copyStatus = document.querySelector("[data-copy-status]");
    els.recommendation = document.querySelector("[data-recommendation]");
    els.resultCards = {
      short: document.querySelector("[data-result-card='short']"),
      clear: document.querySelector("[data-result-card='clear']"),
      context: document.querySelector("[data-result-card='context']"),
    };
  }

  function bindEvents() {
    els.form.addEventListener("submit", handleGenerate);

    els.timingHard.addEventListener("change", function () {
      timingHardTouched = true;
    });

    [els.relationship, els.tone].forEach(function (select) {
      select.addEventListener("change", applyTimingDefault);
    });

    document.querySelectorAll("[data-copy-result]").forEach(function (button) {
      button.addEventListener("click", function () {
        handleCopy(button);
      });
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.getAttribute("data-action");
        if (action === "clear-fields") clearFields();
        if (action === "use-example") useExample();
      });
    });

    document.querySelectorAll("[data-payback-event]").forEach(function (link) {
      link.addEventListener("click", function () {
        track(link.getAttribute("data-payback-event"));
      });
    });
  }

  ready(function () {
    cacheElements();
    if (!els.form) return;
    bindEvents();
    applyTimingDefault();
  });
})();

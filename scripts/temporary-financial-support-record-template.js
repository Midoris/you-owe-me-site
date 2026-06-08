(function () {
  "use strict";

  var supportTypes = ["gift", "repayable", "partial", "flexible", "undecided"];
  var SUPPORT_RECORD_TOOL_EVENT = "youoweme:temporary-support-record-tool-event";
  var els = {};
  var lastOutput = {
    record: "",
    message: "",
    note: "",
    next: "",
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

  function todayInputValue() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
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

  function formatDate(value, includeYear) {
    var date = parseInputDate(value);
    if (!date) return "the selected date";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
    }).format(date);
  }

  function radioValue(name, fallback) {
    var checked = document.querySelector("input[name='" + name + "']:checked");
    return checked ? checked.value : fallback;
  }

  function setRadio(name, value) {
    document.querySelectorAll("input[name='" + name + "']").forEach(function (input) {
      input.checked = input.value === value;
    });
  }

  function clearRadio(name) {
    document.querySelectorAll("input[name='" + name + "']").forEach(function (input) {
      input.checked = false;
    });
  }

  function checkedValues(name) {
    return Array.prototype.slice.call(document.querySelectorAll("input[name='" + name + "']:checked"))
      .map(function (input) {
        return cleanText(input.value, 120);
      })
      .filter(Boolean);
  }

  function setCheckboxDefaults() {
    document.querySelectorAll("input[name='clarify']").forEach(function (input) {
      input.checked = input.value === "whether this is a gift or repayable support" ||
        input.value === "how much should be repaid" ||
        input.value === "when to check in again";
    });
  }

  function safeSupportType(value) {
    return supportTypes.indexOf(value) === -1 ? "" : value;
  }

  function parseSimpleAmount(value) {
    var raw = cleanText(value, 80);
    var normalized;
    var match;
    var number;

    if (!raw) return null;

    normalized = raw.replace(/,/g, "").trim();

    if (/[a-zA-Z]/.test(normalized)) return null;

    match = normalized.match(/^([^0-9+\-.]*)\s*([0-9]+(?:\.[0-9]{1,2})?)\s*([^0-9.]*)$/);
    if (!match) return null;

    number = Number(match[2]);
    if (!Number.isFinite(number)) return null;

    return {
      number: number,
      symbol: cleanText(match[1] || match[3] || "$", 6) || "$",
      hasDecimals: match[2].indexOf(".") !== -1,
    };
  }

  function formatAmount(amount, reference) {
    var symbol = reference && reference.symbol ? reference.symbol : "$";
    var decimals = !Number.isInteger(amount) || (reference && reference.hasDecimals) ? 2 : 0;

    return symbol + amount.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 2,
    });
  }

  function naturalList(items) {
    var list = (items || []).filter(Boolean);
    if (list.length === 0) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return list[0] + " and " + list[1];
    return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
  }

  function sentenceJoin(parts) {
    return parts.filter(Boolean).join(" ");
  }

  function timingLabel(value) {
    if (value === "specific") return "on a specific date";
    if (value === "weekly") return "weekly";
    if (value === "monthly") return "monthly";
    if (value === "steps") return "in steps";
    if (value === "payday") return "after the next payday";
    return "not sure yet";
  }

  function partialRepaymentLabel(value) {
    if (value === "yes") return "okay";
    if (value === "no") return "not part of the plan";
    return "not discussed";
  }

  function getValues() {
    var helperRaw = cleanText(els.helper ? els.helper.value : "", 60);
    var receiverRaw = cleanText(els.receiver ? els.receiver.value : "", 60);
    var amountRaw = cleanText(els.amount ? els.amount.value : "", 80);
    var purposeRaw = cleanText(els.purpose ? els.purpose.value : "", 120);
    var supportType = safeSupportType(radioValue("supportType", ""));
    var dateRaw = els.date ? els.date.value : "";

    return {
      helperRaw: helperRaw,
      receiverRaw: receiverRaw,
      amountRaw: amountRaw,
      purposeRaw: purposeRaw,
      helper: helperRaw || "the person helping",
      receiver: receiverRaw || "the person receiving help",
      receiverAction: receiverRaw || "the receiver",
      helperAction: helperRaw || "the helper",
      amount: amountRaw || "",
      purpose: purposeRaw || "",
      dateRaw: dateRaw,
      dateFull: formatDate(dateRaw, true),
      dateShort: formatDate(dateRaw, false),
      category: cleanText(els.category ? els.category.value : "", 60),
      notes: cleanText(els.notes ? els.notes.value : "", 280),
      perspective: radioValue("perspective", "both"),
      supportType: supportType,
      thankYou: cleanText(els.thankYou ? els.thankYou.value : "", 260),
      privateNote: cleanText(els.privateNote ? els.privateNote.value : "", 260),
      repayAmount: cleanText(els.repayAmount ? els.repayAmount.value : "", 80),
      alreadyRepaid: cleanText(els.alreadyRepaid ? els.alreadyRepaid.value : "", 80),
      repayTiming: els.repayTiming ? els.repayTiming.value : "monthly",
      repayDateRaw: els.repayDate ? els.repayDate.value : "",
      repayDateFull: formatDate(els.repayDate ? els.repayDate.value : "", true),
      repayDateShort: formatDate(els.repayDate ? els.repayDate.value : "", false),
      partialOk: radioValue("partialOk", "yes"),
      timingChange: els.timingChange ? els.timingChange.value : "receiver-update",
      customTiming: cleanText(els.customTiming ? els.customTiming.value : "", 260),
      giftAmount: cleanText(els.giftAmount ? els.giftAmount.value : "", 80),
      partialRepayAmount: cleanText(els.partialRepayAmount ? els.partialRepayAmount.value : "", 80),
      partialAlreadyRepaid: cleanText(els.partialAlreadyRepaid ? els.partialAlreadyRepaid.value : "", 80),
      partialTiming: els.partialTiming ? els.partialTiming.value : "monthly",
      partialDateRaw: els.partialDate ? els.partialDate.value : "",
      partialDateFull: formatDate(els.partialDate ? els.partialDate.value : "", true),
      partialDateShort: formatDate(els.partialDate ? els.partialDate.value : "", false),
      partialChange: cleanText(els.partialChange ? els.partialChange.value : "", 260),
      flexAmount: cleanText(els.flexAmount ? els.flexAmount.value : "", 80),
      flexDateRaw: els.flexDate ? els.flexDate.value : "",
      flexDateFull: formatDate(els.flexDate ? els.flexDate.value : "", true),
      flexDateShort: formatDate(els.flexDate ? els.flexDate.value : "", false),
      updates: radioValue("updates", "before-ask"),
      flexChange: cleanText(els.flexChange ? els.flexChange.value : "", 260),
      clarify: checkedValues("clarify"),
      clarifyMessage: cleanText(els.clarifyMessage ? els.clarifyMessage.value : "", 260),
    };
  }

  function isBlankStart(values) {
    return !values.helperRaw &&
      !values.receiverRaw &&
      !values.amountRaw &&
      !values.purposeRaw &&
      !values.category &&
      !values.notes &&
      !values.supportType;
  }

  function supportSubject(values) {
    if (values.amountRaw && values.purposeRaw) return values.amountRaw + " for " + values.purposeRaw;
    if (values.amountRaw) return values.amountRaw;
    if (values.purposeRaw) return values.purposeRaw;
    return "temporary support";
  }

  function conversationSubject(values) {
    if (values.purposeRaw) return values.purposeRaw;
    if (values.amountRaw) return values.amountRaw;
    return "the temporary support";
  }

  function supportSentence(values, shortDate) {
    var date = shortDate ? values.dateShort : values.dateFull;
    return values.helper + " helped " + values.receiver + " with " + supportSubject(values) + " on " + date + ".";
  }

  function supportSentenceWithoutPeriod(values, shortDate) {
    return supportSentence(values, shortDate).replace(/\.$/, "");
  }

  function addContext(lines, values) {
    if (values.category) lines.push("Category: " + values.category + ".");
    if (values.notes) lines.push("Note: " + values.notes);
  }

  function remainingSentence(values, expectedRaw, repaidRaw) {
    var expected = parseSimpleAmount(expectedRaw);
    var repaid = parseSimpleAmount(repaidRaw);
    var remaining;

    if (!repaidRaw) return "";

    if (expected && repaid && expected.symbol === repaid.symbol) {
      remaining = Math.max(expected.number - repaid.number, 0);
      if (remaining === 0) {
        return values.receiverAction + " has already repaid " + repaidRaw + ". The amount to track appears to be fully repaid.";
      }
      return values.receiverAction + " has already repaid " + repaidRaw + ". The remaining amount to track is " + formatAmount(remaining, expected) + ".";
    }

    return values.receiverAction + " has already repaid " + repaidRaw + ".";
  }

  function timingChangeSentence(values) {
    if (values.timingChange === "custom") {
      return values.customTiming || "If timing changes, both people will update the record before relying on memory.";
    }

    if (values.timingChange === "check-in") {
      if (values.repayDateRaw) {
        return "If timing changes, both people will check in on " + values.repayDateFull + ".";
      }
      return "If timing changes, both people will choose a calm check-in date.";
    }

    if (values.timingChange === "no-plan") {
      return "No specific update plan has been recorded yet.";
    }

    return "If timing changes, " + values.receiverAction + " will send an update before " + values.helperAction + " has to ask.";
  }

  function updateSentence(values) {
    if (values.updates === "if-changes") return values.receiverAction + " will send an update if timing changes.";
    if (values.updates === "check-in") return "Both people will use the next check-in for updates.";
    if (values.updates === "not-discussed") return "Updates have not been discussed yet.";
    return values.receiverAction + " will send an update before " + values.helperAction + " has to ask.";
  }

  function buildDefaultOutput() {
    return {
      record: "Example: Anna helped Maya with $720 for rent and groceries on July 1. They agreed this is repayable temporary support, with monthly repayment and a check-in date.",
      message: "Thanks again for helping with rent and groceries. I saved the support as $720 from July 1, with monthly repayment planned and a check-in on July 15. I just want us both to have the same understanding so it stays clear.",
      note: "Temporary support: Anna helped Maya with $720 for rent and groceries on July 1. Repayable support. Planned repayment: monthly. Next check-in: July 15.",
      next: "Add your own details to create a private record, a message to send, and a compact note for You Owe Me.",
      context: "Example preview shown until you add your own details.",
    };
  }

  function buildGift(values) {
    var recordLines = [
      supportSentence(values, false),
      "This was recorded as a gift, with no repayment expected.",
      values.receiver + " may keep this note as a simple reminder of what happened and when.",
    ];
    var message;

    addContext(recordLines, values);
    if (values.privateNote) recordLines.push("Private note: " + values.privateNote);

    if (values.perspective === "receiving") {
      message = values.thankYou || ("Thank you again for helping with " + conversationSubject(values) + ". I wrote down that you helped with " + supportSubject(values) + " on " + values.dateShort + " and that no repayment is expected. I just wanted to keep the details clear and say I appreciate it.");
    } else if (values.perspective === "helping") {
      message = "I wrote this down only so we both remember it clearly: I helped with " + supportSubject(values) + " on " + values.dateShort + ", and I am treating it as a gift with no repayment expected.";
    } else {
      message = "For clarity, we recorded that " + supportSentenceWithoutPeriod(values, false) + ". This was a gift, with no repayment expected.";
    }

    return {
      record: recordLines.join(" "),
      message: message,
      note: "Temporary support record: " + supportSentenceWithoutPeriod(values, false) + ". Gift. No repayment expected.",
      next: "A simple thank-you message may be enough. You probably do not need a tracker unless support continues, more items are covered, or both people want a shared history.",
      context: "Gift record generated without remaining-balance language.",
    };
  }

  function buildRepayable(values) {
    var expected = values.repayAmount || values.amountRaw || "the amount to repay";
    var timing = timingLabel(values.repayTiming);
    var recordLines = [
      supportSentence(values, false),
      "They agreed this is repayable temporary support.",
      "The expected repayment amount is " + expected + ".",
      "The plan is to repay " + timing + ".",
    ];
    var messageLines;
    var noteParts = [
      "Temporary support: " + supportSentenceWithoutPeriod(values, false) + ".",
      "Repayable support.",
      "Planned repayment: " + timing + ".",
    ];
    var repaidLine = remainingSentence(values, expected, values.alreadyRepaid);

    if (values.repayDateRaw) {
      recordLines.push("The next repayment or check-in is on " + values.repayDateFull + ".");
      noteParts.push("Next check-in: " + values.repayDateFull + ".");
    }

    recordLines.push("Partial repayments are " + partialRepaymentLabel(values.partialOk) + ".");
    recordLines.push(timingChangeSentence(values));
    if (repaidLine) recordLines.push(repaidLine);
    addContext(recordLines, values);

    noteParts.push("Partial repayments: " + partialRepaymentLabel(values.partialOk) + ".");
    noteParts.push(timingChangeSentence(values));
    if (repaidLine) noteParts.push(repaidLine);

    if (values.perspective === "receiving") {
      messageLines = [
        "Thanks again for helping with " + conversationSubject(values) + ".",
        "I saved the support as " + (values.amountRaw || expected) + " from " + values.dateShort + ", with the plan to repay " + timing + (values.repayDateRaw ? " and check in again on " + values.repayDateShort : "") + ".",
        "I just want us both to have the same understanding so it stays clear.",
      ];
      if (repaidLine) messageLines.push(repaidLine);
    } else if (values.perspective === "helping") {
      messageLines = [
        "I wrote this down so neither of us has to rely on memory later: I helped with " + supportSubject(values) + " on " + values.dateShort + ".",
        "We have it as repayable temporary support, with " + timing + " repayment planned" + (values.repayDateRaw ? " and a check-in on " + values.repayDateShort : "") + ".",
        "We can adjust if timing changes.",
      ];
    } else {
      messageLines = [
        "For clarity, we recorded that " + supportSentenceWithoutPeriod(values, false) + ".",
        "This is repayable temporary support. The expected repayment amount is " + expected + ", with repayment " + timing + (values.repayDateRaw ? " and the next check-in on " + values.repayDateShort : "") + ".",
      ];
      if (repaidLine) messageLines.push(repaidLine);
    }

    return {
      record: recordLines.join(" "),
      message: messageLines.join(" "),
      note: noteParts.join(" "),
      next: "This is a good fit for You Owe Me if repayments will happen in steps, timing may change, or both people need a clear history. If you need to calculate weekly or monthly repayment amounts first, use the Payment Plan Calculator.",
      context: "Repayable support record generated.",
    };
  }

  function buildPartial(values) {
    var gift = values.giftAmount || "part of the support";
    var repay = values.partialRepayAmount || "the part to repay";
    var timing = timingLabel(values.partialTiming);
    var recordLines = [
      supportSentence(values, false),
      "They agreed that " + gift + " is a gift and " + repay + " should be repaid.",
      "The repayment plan is " + timing + ".",
    ];
    var noteParts = [
      "Temporary support: " + supportSentenceWithoutPeriod(values, false) + ".",
      "Partial gift: " + gift + ".",
      "Amount to repay: " + repay + ".",
      "Repayment timing: " + timing + ".",
    ];
    var repaidLine = remainingSentence(values, repay, values.partialAlreadyRepaid);
    var change = values.partialChange || ("If timing changes, " + values.receiverAction + " will send an update before " + values.helperAction + " has to ask.");
    var messageLines;

    if (values.partialDateRaw) {
      recordLines.push("The next repayment or check-in is on " + values.partialDateFull + ".");
      noteParts.push("Next check-in: " + values.partialDateFull + ".");
    }

    recordLines.push(change);
    if (repaidLine) recordLines.push(repaidLine);
    addContext(recordLines, values);
    if (repaidLine) noteParts.push(repaidLine);

    if (values.perspective === "receiving") {
      messageLines = [
        "Thanks again for helping with " + conversationSubject(values) + ".",
        "I wrote down that " + gift + " is a gift and " + repay + " is the part I should repay.",
        values.partialDateRaw ? "I have the next check-in as " + values.partialDateShort + "." : "",
        "I just want to make sure this matches your understanding.",
      ];
    } else if (values.perspective === "helping") {
      messageLines = [
        "I wrote this down so it stays clear: I helped with " + supportSubject(values) + " on " + values.dateShort + ".",
        "We are treating " + gift + " as a gift and " + repay + " as the amount to repay" + (values.partialDateRaw ? ", with the next check-in on " + values.partialDateShort : "") + ".",
      ];
    } else {
      messageLines = [
        "For clarity, we recorded that " + supportSentenceWithoutPeriod(values, false) + ".",
        "We are treating " + gift + " as a gift and " + repay + " as the amount to repay" + (values.partialDateRaw ? ", with the next check-in on " + values.partialDateShort : "") + ".",
      ];
    }

    if (repaidLine) messageLines.push(repaidLine);

    return {
      record: recordLines.join(" "),
      message: messageLines.filter(Boolean).join(" "),
      note: noteParts.join(" "),
      next: "Only track the repayable part in You Owe Me. Keep the gift part in the note so the full story is clear later.",
      context: "Partial gift record generated.",
    };
  }

  function buildFlexible(values) {
    var recordLines = [
      supportSentence(values, false),
      "They agreed this is flexible temporary support.",
      "Repayment is expected when possible.",
    ];
    var noteParts = [
      "Temporary support: " + supportSentenceWithoutPeriod(values, false) + ".",
      "Flexible support.",
      "Repayment timing not fixed yet.",
    ];
    var messageLines;

    if (values.flexAmount) {
      recordLines.push("Expected repayment amount, if circumstances allow: " + values.flexAmount + ".");
      noteParts.push("Expected repayment amount: " + values.flexAmount + ".");
    }

    if (values.flexDateRaw) {
      recordLines.push("They will check in again on " + values.flexDateFull + ".");
      noteParts.push("Next check-in: " + values.flexDateFull + ".");
    }

    recordLines.push(values.flexChange || updateSentence(values));
    addContext(recordLines, values);
    noteParts.push(updateSentence(values));

    if (values.perspective === "receiving") {
      messageLines = [
        "Thanks again for helping with " + conversationSubject(values) + ".",
        "I wrote this down as flexible support from " + values.dateShort + ".",
        values.flexDateRaw ? "I have our next check-in as " + values.flexDateShort + "," : "I will keep you updated,",
        "and I will send an update before then if anything changes.",
      ];
    } else if (values.perspective === "helping") {
      messageLines = [
        "I wrote this down so it stays clear without pressure: I helped with " + supportSubject(values) + " on " + values.dateShort + ".",
        "We are treating it as flexible support" + (values.flexDateRaw ? ", with a check-in on " + values.flexDateShort : "") + " and updates if timing changes.",
      ];
    } else {
      messageLines = [
        "For clarity, we recorded that " + supportSentenceWithoutPeriod(values, false) + ".",
        "We are treating it as flexible temporary support" + (values.flexDateRaw ? ", with a check-in on " + values.flexDateShort : "") + ".",
        updateSentence(values),
      ];
    }

    return {
      record: recordLines.join(" "),
      message: messageLines.join(" "),
      note: noteParts.join(" "),
      next: "Flexible support is exactly where records help. Use You Owe Me if the timing may change, repayments may happen in parts, or you want calm check-ins instead of reconstructing details from memory.",
      context: "Flexible support record generated.",
    };
  }

  function buildUndecided(values) {
    var clarify = values.clarify.length ? values.clarify : [
      "whether this is a gift, repayable support, partial gift, or flexible support",
      "how much should be repaid",
      "when to check in again",
    ];
    var messageStart = values.clarifyMessage || "I want to make sure I understand this correctly before I write it down.";
    var repayPhrase = "repayable support";

    if (values.perspective === "receiving") repayPhrase = "something I should repay";
    if (values.perspective === "helping") repayPhrase = "something you plan to repay";

    return {
      record: "Draft support record: " + supportSentence(values, false) + " The support type has not been confirmed yet. Before relying on this record, clarify " + naturalList(clarify) + ".",
      message: messageStart + " For the support with " + conversationSubject(values) + " on " + values.dateShort + ", should we treat it as a gift, " + repayPhrase + ", a partial gift, or flexible support? Also, should we set a check-in date so neither of us has to rely on memory later?",
      note: "Draft temporary support record: " + supportSentenceWithoutPeriod(values, false) + ". Support type not confirmed. Clarify " + naturalList(clarify) + " before tracking as final.",
      next: "Do not turn this into a final record yet. First confirm the missing details in writing. The most helpful record is the one both people understand the same way.",
      context: "Draft record generated because the support type is not decided yet.",
    };
  }

  function buildOutput(values) {
    if (isBlankStart(values)) return buildDefaultOutput();
    if (!values.supportType || values.supportType === "undecided") return buildUndecided(values);
    if (values.supportType === "gift") return buildGift(values);
    if (values.supportType === "repayable") return buildRepayable(values);
    if (values.supportType === "partial") return buildPartial(values);
    if (values.supportType === "flexible") return buildFlexible(values);
    return buildUndecided(values);
  }

  function eventPayload(values, extra) {
    var safeValues = values || getValues();

    return Object.assign({
      support_type: safeValues.supportType || "not_selected",
      perspective: safeValues.perspective || "both",
      has_helper: safeValues.helperRaw ? 1 : 0,
      has_receiver: safeValues.receiverRaw ? 1 : 0,
      has_amount: safeValues.amountRaw ? 1 : 0,
      has_purpose: safeValues.purposeRaw ? 1 : 0,
      has_date: safeValues.dateRaw ? 1 : 0,
      has_check_in: (safeValues.repayDateRaw || safeValues.partialDateRaw || safeValues.flexDateRaw) ? 1 : 0,
      clarify_count: safeValues.clarify ? safeValues.clarify.length : 0,
    }, extra || {});
  }

  function dispatchToolEvent(eventName, values, extra) {
    if (!eventName || typeof window.CustomEvent !== "function") return;

    window.dispatchEvent(new CustomEvent(SUPPORT_RECORD_TOOL_EVENT, {
      detail: Object.assign({ eventName: eventName }, eventPayload(values, extra)),
    }));
  }

  function trackToolStart(values) {
    if (toolStartTracked) return;
    toolStartTracked = true;
    dispatchToolEvent("temporary_support_record_tool_start", values);
  }

  function guidanceMessages(values) {
    var messages = [];
    if (isBlankStart(values)) return messages;
    if (!values.amountRaw && !values.purposeRaw) messages.push("Add the amount, item, or purpose so the record is easier to understand later.");
    if (!values.supportType) messages.push("Choose the support type so the template does not assume the arrangement is clear.");
    if (values.supportType === "repayable" && values.repayTiming === "unsure" && !values.repayDateRaw) {
      messages.push("Add a check-in date if repayment timing is not fully decided yet.");
    }
    if (values.supportType === "flexible" && !values.flexDateRaw) {
      messages.push("Add a check-in date if flexible repayment needs a calm next step.");
    }
    if (values.supportType === "partial" && !values.giftAmount && !values.partialRepayAmount) {
      messages.push("Add the gift part or repayable part if you know it.");
    }
    if (values.supportType === "undecided" && values.clarify.length === 0) {
      messages.push("Choose what still needs to be clarified.");
    }
    return messages;
  }

  function renderGuidance(values) {
    var messages = guidanceMessages(values);
    if (!els.guidanceRegion || !els.guidanceList) return;

    els.guidanceList.innerHTML = "";

    if (!messages.length) {
      els.guidanceRegion.hidden = true;
      return;
    }

    messages.forEach(function (message) {
      var item = document.createElement("li");
      item.textContent = message;
      els.guidanceList.appendChild(item);
    });

    els.guidanceRegion.hidden = false;
  }

  function render() {
    var values = getValues();
    var output = buildOutput(values);

    lastOutput = output;

    if (els.outputRecord) els.outputRecord.textContent = output.record;
    if (els.outputMessage) els.outputMessage.textContent = output.message;
    if (els.outputNote) els.outputNote.textContent = output.note;
    if (els.outputNext) els.outputNext.textContent = output.next;
    if (els.outputContext) els.outputContext.textContent = output.context;

    renderGuidance(values);
    updateConditional();
  }

  function updateConditional() {
    var type = safeSupportType(radioValue("supportType", ""));

    document.querySelectorAll("[data-conditional]").forEach(function (section) {
      section.hidden = section.getAttribute("data-conditional") !== type;
    });

    if (els.customTimingWrap && els.timingChange) {
      els.customTimingWrap.hidden = els.timingChange.value !== "custom" || type !== "repayable";
    }
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

  function showCopyStatus(message) {
    if (!els.copyStatus) return;
    els.copyStatus.textContent = message || "Copied";
    window.clearTimeout(els.copyStatusTimer);
    els.copyStatusTimer = window.setTimeout(function () {
      els.copyStatus.textContent = "";
    }, 1800);
  }

  function copyOutput(target) {
    var text = lastOutput[target] || "";
    if (!text) return;

    copyText(text).then(function () {
      showCopyStatus("Copied");
      dispatchToolEvent(target === "note" ? "temporary_support_record_copy_app_note" : "temporary_support_record_copy_" + target, getValues(), {
        copy_target: target,
      });
    }).catch(function () {
      showCopyStatus("Select the text and copy it manually.");
    });
  }

  function setValue(element, value) {
    if (element) element.value = value || "";
  }

  function resetConditionalFields() {
    setValue(els.thankYou, "");
    setValue(els.privateNote, "");
    setValue(els.repayAmount, "");
    setValue(els.alreadyRepaid, "");
    setValue(els.repayDate, "");
    setValue(els.customTiming, "");
    setValue(els.giftAmount, "");
    setValue(els.partialRepayAmount, "");
    setValue(els.partialAlreadyRepaid, "");
    setValue(els.partialDate, "");
    setValue(els.partialChange, "");
    setValue(els.flexAmount, "");
    setValue(els.flexDate, "");
    setValue(els.flexChange, "");
    setValue(els.clarifyMessage, "");

    if (els.repayTiming) els.repayTiming.value = "monthly";
    if (els.partialTiming) els.partialTiming.value = "monthly";
    if (els.timingChange) els.timingChange.value = "receiver-update";
    setRadio("partialOk", "yes");
    setRadio("updates", "before-ask");
    setCheckboxDefaults();
  }

  function clearForm() {
    setValue(els.helper, "");
    setValue(els.receiver, "");
    setValue(els.amount, "");
    setValue(els.purpose, "");
    setValue(els.category, "");
    setValue(els.notes, "");
    setValue(els.date, todayInputValue());
    setRadio("perspective", "both");
    clearRadio("supportType");
    resetConditionalFields();
    showCopyStatus("");
    render();
  }

  function loadExample(name) {
    resetConditionalFields();
    setRadio("perspective", "both");

    if (name === "friend-utility") {
      setValue(els.helper, "Sam");
      setValue(els.receiver, "Alex");
      setValue(els.amount, "$95");
      setValue(els.purpose, "a utility bill");
      setValue(els.date, "2026-08-03");
      setValue(els.category, "Utility bill");
      setValue(els.notes, "Sam covered the bill before it became late. Alex sent a first repayment right away.");
      setRadio("supportType", "repayable");
      setValue(els.repayAmount, "$95");
      setValue(els.alreadyRepaid, "$40");
      if (els.repayTiming) els.repayTiming.value = "payday";
      setValue(els.repayDate, "2026-08-17");
    } else if (name === "partner-groceries") {
      setValue(els.helper, "Jordan");
      setValue(els.receiver, "Taylor");
      setValue(els.amount, "$310");
      setValue(els.purpose, "shared groceries and household items");
      setValue(els.date, "2026-08-18");
      setValue(els.category, "Partner support");
      setValue(els.notes, "Covered during a temporary income gap.");
      setRadio("supportType", "partial");
      setValue(els.giftAmount, "$160");
      setValue(els.partialRepayAmount, "$150");
      if (els.partialTiming) els.partialTiming.value = "monthly";
      setValue(els.partialDate, "2026-09-01");
    } else if (name === "sibling-groceries") {
      setValue(els.helper, "Nina");
      setValue(els.receiver, "Leo");
      setValue(els.amount, "$180");
      setValue(els.purpose, "groceries and pharmacy items");
      setValue(els.date, "2026-09-25");
      setValue(els.category, "Family help");
      setValue(els.notes, "Part is a gift and part should be repaid when possible.");
      setRadio("supportType", "partial");
      setValue(els.giftAmount, "$80");
      setValue(els.partialRepayAmount, "$100");
      if (els.partialTiming) els.partialTiming.value = "unsure";
      setValue(els.partialDate, "2026-10-10");
      setValue(els.partialChange, "If timing changes, Leo will send an update before Nina has to ask.");
    } else {
      setValue(els.helper, "Anna");
      setValue(els.receiver, "Maya");
      setValue(els.amount, "$720");
      setValue(els.purpose, "rent and groceries");
      setValue(els.date, "2026-07-01");
      setValue(els.category, "Rent or housing");
      setValue(els.notes, "Covered during an uneven income month. We agreed to check in again after the next payday.");
      setRadio("supportType", "repayable");
      setValue(els.repayAmount, "$720");
      setValue(els.alreadyRepaid, "$200");
      if (els.repayTiming) els.repayTiming.value = "monthly";
      setValue(els.repayDate, "2026-07-15");
      setRadio("partialOk", "yes");
      if (els.timingChange) els.timingChange.value = "receiver-update";
    }

    render();

    if (els.form) {
      els.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindEvents() {
    if (!els.form) return;

    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      var values = getValues();
      trackToolStart(values);
      render();
      dispatchToolEvent("temporary_support_record_complete", values, {
        result_state: isBlankStart(values) ? "example_preview" : "generated",
      });
      if (els.results && window.matchMedia("(max-width: 1120px)").matches) {
        els.results.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    els.form.addEventListener("input", function () {
      var values = getValues();
      trackToolStart(values);
      render();
    });
    els.form.addEventListener("change", function () {
      var values = getValues();
      trackToolStart(values);
      render();
    });

    document.addEventListener("click", function (event) {
      var exampleButton = event.target.closest("[data-example]");
      var actionButton = event.target.closest("[data-action]");
      var copyButton = event.target.closest("[data-copy-target]");

      if (exampleButton) {
        loadExample(exampleButton.getAttribute("data-example"));
        trackToolStart(getValues());
        return;
      }

      if (actionButton && actionButton.getAttribute("data-action") === "clear") {
        clearForm();
        return;
      }

      if (copyButton) {
        copyOutput(copyButton.getAttribute("data-copy-target"));
      }
    });
  }

  ready(function () {
    els = {
      form: byId("support-record-form"),
      helper: byId("support-helper"),
      receiver: byId("support-receiver"),
      amount: byId("support-amount"),
      purpose: byId("support-purpose"),
      date: byId("support-date"),
      category: byId("support-category"),
      notes: byId("support-notes"),
      thankYou: byId("support-thank-you"),
      privateNote: byId("support-private-note"),
      repayAmount: byId("support-repay-amount"),
      alreadyRepaid: byId("support-repaid"),
      repayTiming: byId("support-repay-timing"),
      repayDate: byId("support-repay-date"),
      timingChange: byId("support-timing-change"),
      customTiming: byId("support-custom-timing"),
      customTimingWrap: document.querySelector("[data-custom-timing-wrap]"),
      giftAmount: byId("support-gift-amount"),
      partialRepayAmount: byId("support-partial-repay-amount"),
      partialAlreadyRepaid: byId("support-partial-repaid"),
      partialTiming: byId("support-partial-timing"),
      partialDate: byId("support-partial-date"),
      partialChange: byId("support-partial-change"),
      flexAmount: byId("support-flex-amount"),
      flexDate: byId("support-flex-date"),
      flexChange: byId("support-flex-change"),
      clarifyMessage: byId("support-clarify-message"),
      guidanceRegion: document.querySelector("[data-guidance-region]"),
      guidanceList: document.querySelector("[data-guidance-list]"),
      results: document.querySelector(".tsr-results"),
      outputContext: document.querySelector("[data-output-context]"),
      outputRecord: document.querySelector("[data-output-record]"),
      outputMessage: document.querySelector("[data-output-message]"),
      outputNote: document.querySelector("[data-output-note]"),
      outputNext: document.querySelector("[data-output-next]"),
      copyStatus: document.querySelector("[data-copy-status]"),
    };

    if (els.date && !els.date.value) {
      els.date.value = todayInputValue();
    }

    bindEvents();
    render();
  });
})();

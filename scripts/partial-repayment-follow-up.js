(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function parseMoney(value) {
    if (!value) return null;
    var cleaned = String(value).replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    var parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatMoney(value) {
    var rounded = Math.round(value * 100) / 100;
    var hasCents = Math.abs(rounded % 1) > 0.001;
    return "$" + rounded.toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
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

  function findStatus(button) {
    var scope = button.closest("[data-copy-scope]") || button.closest("section") || document;
    return scope.querySelector("[data-copy-status]") || document.querySelector("[data-copy-status]");
  }

  function announce(button, message) {
    var status = findStatus(button);
    if (status) {
      status.textContent = message;
      window.setTimeout(function () {
        status.textContent = "";
      }, 1800);
    }
  }

  function getTemplateText(templateId) {
    var card = document.querySelector('[data-template-id="' + templateId + '"]');
    var message = card ? card.querySelector(".template-card__message") : null;
    return {
      card: card,
      text: message ? message.textContent.trim() : "",
      title: card && card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "message",
    };
  }

  function tableToText(table) {
    var rows = Array.prototype.slice.call(table.querySelectorAll("tr"));
    return rows.map(function (row) {
      return Array.prototype.slice.call(row.children).map(function (cell) {
        return cell.textContent.replace(/\s+/g, " ").trim();
      }).join("\t");
    }).join("\n");
  }

  function trackCopy(type, id) {
    window.dispatchEvent(new CustomEvent("youoweme:partial-repayment-copy", {
      detail: {
        page: "partial_repayment_follow_up",
        copy_type: type,
        id: id || "unknown",
      },
    }));
  }

  function handleCopy(button, text, label, type, id) {
    if (!text || button.disabled) return;

    var originalText = button.textContent;

    copyText(text).then(function () {
      button.textContent = "Copied";
      announce(button, "Copied " + label + ".");
      trackCopy(type, id);

      window.setTimeout(function () {
        button.textContent = originalText;
      }, 1800);
    }).catch(function () {
      announce(button, "Copy did not work. Select the text and copy it manually.");
    });
  }

  function initCopyButtons() {
    document.addEventListener("click", function (event) {
      var templateButton = event.target.closest("[data-copy-template]");
      if (templateButton) {
        var templateId = templateButton.getAttribute("data-copy-template");
        var template = getTemplateText(templateId);
        handleCopy(templateButton, template.text, template.title, "template", templateId);
        return;
      }

      var targetButton = event.target.closest("[data-copy-text-target]");
      if (targetButton) {
        var targetId = targetButton.getAttribute("data-copy-text-target");
        var target = document.getElementById(targetId);
        handleCopy(targetButton, target ? target.textContent.trim() : "", "message", "helper", targetId);
        return;
      }

      var tableButton = event.target.closest("[data-copy-table]");
      if (tableButton) {
        var tableId = tableButton.getAttribute("data-copy-table");
        var table = document.getElementById(tableId);
        handleCopy(tableButton, table ? tableToText(table) : "", "table", "table", tableId);
      }
    });
  }

  function buildMessages(state) {
    var prefix = state.name ? "Hey " + state.name + ", " : "";
    var repaid = state.hasRepaid ? formatMoney(state.repaid) : "part of it";
    var remainingWarm = state.hasRemaining ? formatMoney(state.remaining) + " remaining" : "the remaining balance open";
    var remainingClear = state.hasRemaining ? formatMoney(state.remaining) : "a remaining balance";
    var context = state.context ? " from " + state.context : "";
    var clearTiming = state.timing ? "by " + state.timing : "when you can";
    var warmOpening = state.hasRepaid ? "Thanks for sending " + repaid + "." : "Thanks for sending part of it.";
    var clearOpening = state.hasRepaid ? "Thanks for the " + repaid + " repayment." : "Thanks for the partial repayment.";

    return {
      warm: prefix + warmOpening + " I still have " + remainingWarm + context + ". Could you send the rest when you get a chance?",
      clear: prefix + clearOpening + " That leaves " + remainingClear + " still open" + context + ". Could you send it " + clearTiming + ", or let me know what works?",
    };
  }

  function initHelper() {
    var form = document.querySelector("[data-partial-helper]");
    if (!form) return;

    var originalInput = form.querySelector('[name="original"]');
    var repaidInput = form.querySelector('[name="repaid"]');
    var contextInput = form.querySelector('[name="context"]');
    var nameInput = form.querySelector('[name="name"]');
    var timingInput = form.querySelector('[name="timing"]');
    var remainingOutput = document.querySelector("[data-remaining-output]");
    var helperNote = document.querySelector("[data-helper-note]");
    var warning = document.querySelector("[data-helper-warning]");
    var warmMessage = document.getElementById("partial-helper-warm");
    var clearMessage = document.getElementById("partial-helper-clear");
    var helperCopyButtons = Array.prototype.slice.call(document.querySelectorAll('[data-copy-text-target^="partial-helper"]'));

    function setHelperCopyDisabled(disabled) {
      helperCopyButtons.forEach(function (button) {
        button.disabled = disabled;
      });
    }

    function update() {
      var original = parseMoney(originalInput.value);
      var repaid = parseMoney(repaidInput.value);
      var hasOriginal = original !== null;
      var hasRepaid = repaid !== null;
      var hasRemaining = hasOriginal && hasRepaid;
      var remaining = hasRemaining ? original - repaid : null;
      var overpaid = hasRemaining && remaining < 0;
      var state = {
        original: original,
        repaid: repaid,
        remaining: remaining,
        hasRepaid: hasRepaid,
        hasRemaining: hasRemaining && !overpaid,
        context: contextInput.value.trim(),
        name: nameInput.value.trim(),
        timing: timingInput.value.trim(),
      };

      if (!hasRemaining) {
        remainingOutput.textContent = "Add amounts above";
        helperNote.textContent = "Enter the original amount and amount already repaid to see what is still open.";
        warning.hidden = true;
        setHelperCopyDisabled(false);
      } else if (overpaid) {
        remainingOutput.textContent = "Check numbers";
        helperNote.textContent = "The remaining balance cannot be calculated from these values.";
        warning.hidden = false;
        warmMessage.textContent = "Check the original amount and the amount already repaid before sending a follow-up.";
        clearMessage.textContent = "The repaid amount is higher than the original amount. Confirm the numbers first, then send a clear message.";
        setHelperCopyDisabled(true);
        return;
      } else {
        remainingOutput.textContent = formatMoney(remaining);
        helperNote.textContent = formatMoney(original) + " original - " + formatMoney(repaid) + " repaid = " + formatMoney(remaining) + " still open.";
        warning.hidden = true;
        setHelperCopyDisabled(false);
      }

      var messages = buildMessages(state);
      warmMessage.textContent = messages.warm;
      clearMessage.textContent = messages.clear;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    [originalInput, repaidInput, contextInput, nameInput, timingInput].forEach(function (input) {
      input.addEventListener("input", update);
    });

    update();
  }

  ready(function () {
    initHelper();
    initCopyButtons();
  });
})();

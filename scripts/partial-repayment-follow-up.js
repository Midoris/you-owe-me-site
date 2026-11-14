(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function readAmount(input) {
    var validity = input.validity;
    var value = input.value;
    var guidance = "Use regular decimal notation with up to two decimal places, such as 75 or 75.25.";
    if (validity.badInput) return { error: guidance };
    if (value === "") return { cents: null };
    if (validity.rangeUnderflow || value.charAt(0) === "-") {
      return { error: "Enter zero or more." };
    }

    // Read the decimal digits directly to avoid rounding money or misreading exponents.
    var amount = /^(\d*)(?:\.(\d{1,2}))?$/.exec(value);
    if (!amount || validity.stepMismatch) return { error: guidance };
    var cents = Number(amount[1] + ((amount[2] || "") + "00").slice(0, 2));
    if (!Number.isSafeInteger(cents)) return { error: "This amount is too large. Enter a smaller amount." };
    return { cents: cents };
  }

  function formatMoney(cents) {
    var fraction = cents % 100;
    var whole = (cents - fraction) / 100;
    return "$" + whole.toLocaleString("en-US") + (fraction ? "." + ("0" + fraction).slice(-2) : "");
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
    return scope.querySelector("[data-copy-status]") ||
      document.querySelector("#partial-repayment-texts [data-copy-status]");
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

  function initCopyButtons(updateHelper) {
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
        if (updateHelper) updateHelper();
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
    var context = state.context ? " from " + state.context : "";
    var clearTiming = state.timing ? "by " + state.timing : "when you can";
    var remaining = formatMoney(state.remaining);
    var repaid = formatMoney(state.repaid);
    var warmOpening = state.repaid ? "Thanks for sending " + repaid + ". " : "";
    var clearOpening = state.repaid ? "Thanks for the " + repaid + " repayment. That leaves " : "I have ";

    return {
      warm: prefix + warmOpening + "I still have " + remaining + " remaining" + context + ". Could you send the rest when you get a chance?",
      clear: prefix + clearOpening + remaining + " still open" + context + ". Could you send it " + clearTiming + ", or let me know what works?",
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
    var receipt = document.querySelector("[data-helper-receipt]");
    var results = document.querySelector(".partial-helper-results");
    var messageGroup = results.querySelector(".partial-helper-messages");
    var warmMessage = document.getElementById("partial-helper-warm");
    var clearMessage = document.getElementById("partial-helper-clear");
    var helperCopyButtons = messageGroup.querySelectorAll("[data-copy-text-target]");

    function setText(node, text) {
      if (node.textContent !== text) node.textContent = text;
    }

    function setInvalid(input, invalid) {
      if (invalid) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", warning.id);
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    }

    function update() {
      var original = readAmount(originalInput);
      var repaid = readAmount(repaidInput);
      var hasAmounts = !original.error && !repaid.error && original.cents !== null && repaid.cents !== null;
      var remaining = hasAmounts ? original.cents - repaid.cents : null;
      var overpaid = hasAmounts && remaining < 0;
      var hasNoBalance = hasAmounts && original.cents === 0 && repaid.cents === 0;
      var settled = hasAmounts && remaining === 0 && !hasNoBalance;
      var canCopy = hasAmounts && remaining > 0;
      var errors = [];
      if (original.error) errors.push("Original amount: " + original.error);
      if (repaid.error) errors.push("Amount already repaid: " + repaid.error);
      if (overpaid) errors.push("The amount already repaid is higher than the original amount. Check both amounts.");

      var balance = "Add amounts above";
      var note = "Enter the original amount and amount already repaid to see what is still open.";
      var messages = { warm: "", clear: "" };
      if (errors.length) {
        balance = "Check amounts";
        note = "";
      } else if (settled) {
        balance = "Paid in full";
        note = "There is no remaining balance. Use a receipt to confirm the repayment.";
      } else if (hasNoBalance) {
        balance = "No balance to repay";
        note = "Both amounts are zero.";
      } else if (canCopy) {
        balance = formatMoney(remaining);
        note = formatMoney(original.cents) + " original - " + formatMoney(repaid.cents) + " repaid = " + balance + " still open.";
        messages = buildMessages({
          repaid: repaid.cents,
          remaining: remaining,
          context: contextInput.value.trim(),
          name: nameInput.value.trim(),
          timing: timingInput.value.trim(),
        });
      }

      setText(remainingOutput, balance);
      setText(helperNote, note);
      helperNote.hidden = !note;
      setText(warning, errors.join(" "));
      warning.hidden = errors.length === 0;
      setInvalid(originalInput, !!original.error);
      setInvalid(repaidInput, !!repaid.error || overpaid);
      receipt.hidden = !settled;
      setText(warmMessage, messages.warm);
      setText(clearMessage, messages.clear);
      helperCopyButtons.forEach(function (button) {
        button.disabled = !canCopy;
      });
      messageGroup.hidden = !canCopy;
      results.classList.toggle("partial-helper-results--has-messages", canCopy);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    window.addEventListener("pageshow", update);
    update();
    return update;
  }

  ready(function () {
    initCopyButtons(initHelper());
  });
})();

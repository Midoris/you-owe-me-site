(function () {
  "use strict";

  var root = document.querySelector("[data-transition-planner]");
  if (!root) return;

  var form = root.querySelector("#support-transition-form");
  var personInput = root.querySelector("#planner-person");
  var itemsRegion = root.querySelector("[data-support-items]");
  var errorSummary = root.querySelector("[data-error-summary]");
  var errorList = root.querySelector("[data-error-list]");
  var resultTitle = root.querySelector("#result-title");
  var resultContent = root.querySelector("[data-result-content]");
  var copyStatus = root.querySelector("[data-copy-status]");
  var liveStatus = document.querySelector("[data-planner-status]");
  var productBridge = document.querySelector("[data-product-bridge]");
  var exampleDialog = document.querySelector("[data-example-dialog]");
  var clearDialog = document.querySelector("[data-clear-dialog]");
  var pendingExample = null;
  var initialResult = {
    title: "Your plan will appear here",
    body: "Add at least one support item and choose how it will change. The result will include your decisions, practical actions, a message to send, and the next step that matches any past money still open."
  };

  var TRANSITIONS = {
    stop: "Stop now",
    end: "Set an end date",
    taper: "Reduce gradually",
    fixed: "Continue a smaller fixed amount"
  };

  var PAST = {
    gift: "Past help was a gift — nothing repayable",
    agreed: "Repayment was already agreed",
    partial: "Part was a gift and part was repayable",
    unclear: "It was never clear",
    closed: "It has already been repaid or closed",
    none: "This item has no past balance"
  };

  function blankItem() {
    return {
      name: "", arrangement: "", frequency: "Monthly", transition: "", changeDate: "", endDate: "",
      reducedAmount: "", reductionDate: "", finalDate: "", newAmount: "", newLimitDate: "", reviewDate: "",
      action: "No account action", otherAction: "", past: "", agreedAmount: "", repaymentNext: "Not decided yet",
      repaymentDate: "", note: ""
    };
  }

  function trim(value) { return String(value || "").trim(); }
  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fieldValue(card, key) {
    var field = card.querySelector('[data-field="' + key + '"]');
    return field ? trim(field.value) : "";
  }
  function checkedValue(card, key) {
    var checked = card.querySelector('[data-field="' + key + '"]:checked');
    return checked ? checked.value : "";
  }
  function isoDate(offset) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }
  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T12:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
  }
  function plainText(value) { return trim(value).replace(/\s+/g, " "); }
  function isReducedMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function radio(id, name, fieldKey, value, label, helper, checked) {
    return '<label class="stm-radio-option"><input id="' + id + '" type="radio" name="' + name + '" value="' + value + '" data-field="' + fieldKey + '"' + (checked ? " checked" : "") + ' /><span><strong>' + label + '</strong><small>' + helper + '</small></span></label>';
  }

  function cardHtml(item, index) {
    var number = index + 1;
    var itemName = item.name || "Support item " + number;
    var key = "support-" + number;
    var transitionName = "transition-" + number;
    var pastName = "past-" + number;
    return [
      '<fieldset class="stm-item-card" data-item-card data-item-index="' + index + '">',
      '<legend>Support item ' + number + '</legend>',
      '<div class="stm-item-heading"><h3>Support item ' + number + '</h3><button type="button" class="stm-remove-button" data-remove-item aria-label="Remove ' + esc(itemName) + '">Remove this item</button></div>',
      '<div class="stm-field-grid">',
      '<div class="stm-field"><label for="' + key + '-name">Payment or type of help</label><input id="' + key + '-name" type="text" maxlength="120" autocomplete="off" data-field="name" value="' + esc(item.name) + '" placeholder="Example: phone bill, rent help, groceries" /><p class="stm-field-error" data-error-for="name"></p></div>',
      '<div class="stm-field"><label for="' + key + '-arrangement">Current amount or arrangement</label><input id="' + key + '-arrangement" type="text" maxlength="120" autocomplete="off" data-field="arrangement" value="' + esc(item.arrangement) + '" placeholder="Example: $80 per month" aria-describedby="' + key + '-arrangement-help" /><p id="' + key + '-arrangement-help" class="stm-field-hint">Use an amount, limit, item, or short description.</p><p class="stm-field-error" data-error-for="arrangement"></p></div>',
      '<div class="stm-field"><label for="' + key + '-frequency">How often is it happening?</label><select id="' + key + '-frequency" data-field="frequency"><option' + (item.frequency === "Weekly" ? " selected" : "") + '>Weekly</option><option' + (item.frequency === "Every two weeks" ? " selected" : "") + '>Every two weeks</option><option' + (item.frequency === "Monthly" ? " selected" : "") + '>Monthly</option><option' + (item.frequency === "Occasionally" ? " selected" : "") + '>Occasionally</option><option' + (item.frequency === "Other" ? " selected" : "") + '>Other</option></select></div>',
      '</div>',
      '<fieldset class="stm-choice-set"><legend>What will change?</legend><div class="stm-radio-grid" data-transition-group>',
      radio(key + '-stop', transitionName, "transition", "stop", "Stop now", "The support ends on a specific effective date.", item.transition === "stop"),
      radio(key + '-end', transitionName, "transition", "end", "Set an end date", "The current support continues until one final covered date.", item.transition === "end"),
      radio(key + '-taper', transitionName, "transition", "taper", "Reduce gradually", "A smaller amount continues temporarily, then regular support ends.", item.transition === "taper"),
      radio(key + '-fixed', transitionName, "transition", "fixed", "Continue a smaller fixed amount", "The support continues under a new limit with a review or end date.", item.transition === "fixed"),
      '</div><p class="stm-field-error" data-error-for="transition"></p></fieldset>',
      '<div class="stm-field-grid stm-conditional" data-transition-panel="stop"' + (item.transition === "stop" ? "" : " hidden") + '><div class="stm-field"><label for="' + key + '-change-date">Change starts on</label><input id="' + key + '-change-date" type="date" data-field="changeDate" value="' + esc(item.changeDate) + '" /><p class="stm-field-error" data-error-for="changeDate"></p></div></div>',
      '<div class="stm-field-grid stm-conditional" data-transition-panel="end"' + (item.transition === "end" ? "" : " hidden") + '><div class="stm-field"><label for="' + key + '-end-date">Last covered date</label><input id="' + key + '-end-date" type="date" data-field="endDate" value="' + esc(item.endDate) + '" aria-describedby="' + key + '-end-date-help" /><p id="' + key + '-end-date-help" class="stm-field-hint">This is the final date you will cover this item.</p><p class="stm-field-error" data-error-for="endDate"></p></div></div>',
      '<div class="stm-field-grid stm-conditional" data-transition-panel="taper"' + (item.transition === "taper" ? "" : " hidden") + '><div class="stm-field"><label for="' + key + '-reduced">Reduced amount or limit</label><input id="' + key + '-reduced" type="text" maxlength="120" data-field="reducedAmount" value="' + esc(item.reducedAmount) + '" placeholder="Example: $200 per month" /><p class="stm-field-error" data-error-for="reducedAmount"></p></div><div class="stm-field"><label for="' + key + '-reduction-date">Reduction starts on</label><input id="' + key + '-reduction-date" type="date" data-field="reductionDate" value="' + esc(item.reductionDate) + '" /><p class="stm-field-error" data-error-for="reductionDate"></p></div><div class="stm-field stm-field--full"><label for="' + key + '-final-date">Final support date</label><input id="' + key + '-final-date" type="date" data-field="finalDate" value="' + esc(item.finalDate) + '" aria-describedby="' + key + '-final-date-help" /><p id="' + key + '-final-date-help" class="stm-field-hint">After this date, regular support ends.</p><p class="stm-field-error" data-error-for="finalDate"></p></div></div>',
      '<div class="stm-field-grid stm-conditional" data-transition-panel="fixed"' + (item.transition === "fixed" ? "" : " hidden") + '><div class="stm-field"><label for="' + key + '-new-amount">New amount or limit</label><input id="' + key + '-new-amount" type="text" maxlength="120" data-field="newAmount" value="' + esc(item.newAmount) + '" placeholder="Example: up to $150 per month for groceries" /><p class="stm-field-error" data-error-for="newAmount"></p></div><div class="stm-field"><label for="' + key + '-new-limit-date">New limit starts on</label><input id="' + key + '-new-limit-date" type="date" data-field="newLimitDate" value="' + esc(item.newLimitDate) + '" /><p class="stm-field-error" data-error-for="newLimitDate"></p></div><div class="stm-field stm-field--full"><label for="' + key + '-review-date">Review or end date</label><input id="' + key + '-review-date" type="date" data-field="reviewDate" value="' + esc(item.reviewDate) + '" aria-describedby="' + key + '-review-date-help" /><p id="' + key + '-review-date-help" class="stm-field-hint">Choose when you will review or finish the new arrangement.</p><p class="stm-field-error" data-error-for="reviewDate"></p></div></div>',
      '<div class="stm-field-grid"><div class="stm-field"><label for="' + key + '-action">What practical action is needed?</label><select id="' + key + '-action" data-field="action"><option' + (item.action === "No account action" ? " selected" : "") + '>No account action</option><option' + (item.action === "Cancel an automatic payment" ? " selected" : "") + '>Cancel an automatic payment</option><option' + (item.action === "Remove or replace a payment method" ? " selected" : "") + '>Remove or replace a payment method</option><option' + (item.action === "Transfer the bill or account" ? " selected" : "") + '>Transfer the bill or account</option><option' + (item.action === "Confirm the change with the provider" ? " selected" : "") + '>Confirm the change with the provider</option><option' + (item.action === "Other" ? " selected" : "") + '>Other</option></select></div><div class="stm-field" data-other-action' + (item.action === "Other" ? "" : " hidden") + '><label for="' + key + '-other-action">Describe the action</label><input id="' + key + '-other-action" type="text" maxlength="200" data-field="otherAction" value="' + esc(item.otherAction) + '" placeholder="Example: remove my card after the final charge clears" /><p class="stm-field-error" data-error-for="otherAction"></p></div></div>',
      '<fieldset class="stm-choice-set"><legend>What does the past money mean?</legend><p class="stm-field-hint">Choose what was already understood before you decided to change future support.</p><div class="stm-radio-grid" data-past-group>',
      radio(key + '-gift', pastName, "past", "gift", PAST.gift, "", item.past === "gift"),
      radio(key + '-agreed', pastName, "past", "agreed", PAST.agreed, "", item.past === "agreed"),
      radio(key + '-partial', pastName, "past", "partial", PAST.partial, "", item.past === "partial"),
      radio(key + '-unclear', pastName, "past", "unclear", PAST.unclear, "", item.past === "unclear"),
      radio(key + '-closed', pastName, "past", "closed", PAST.closed, "", item.past === "closed"),
      radio(key + '-none', pastName, "past", "none", PAST.none, "", item.past === "none"),
      '</div><p class="stm-field-error" data-error-for="past"></p></fieldset>',
      '<div class="stm-field-grid stm-conditional" data-balance-panel' + (item.past === "agreed" || item.past === "partial" ? "" : " hidden") + '><div class="stm-field"><label for="' + key + '-agreed-amount">Agreed amount still open</label><input id="' + key + '-agreed-amount" type="text" maxlength="80" data-field="agreedAmount" value="' + esc(item.agreedAmount) + '" placeholder="Example: $400" aria-describedby="' + key + '-agreed-help" /><p id="' + key + '-agreed-help" class="stm-field-hint">Optional. Add only an amount both people already understand as repayable.</p></div><div class="stm-field"><label for="' + key + '-repayment-next">What happens next with the agreed amount?</label><select id="' + key + '-repayment-next" data-field="repaymentNext"><option' + (item.repaymentNext === "Keep the current repayment plan" ? " selected" : "") + '>Keep the current repayment plan</option><option' + (item.repaymentNext === "Create or revise a repayment plan" ? " selected" : "") + '>Create or revise a repayment plan</option><option' + (item.repaymentNext === "Check in on a specific date" ? " selected" : "") + '>Check in on a specific date</option><option' + (item.repaymentNext === "The amount is due in one payment" ? " selected" : "") + '>The amount is due in one payment</option><option' + (item.repaymentNext === "Not decided yet" ? " selected" : "") + '>Not decided yet</option></select></div><div class="stm-field stm-field--full"><label for="' + key + '-repayment-date">Next repayment or check-in date</label><input id="' + key + '-repayment-date" type="date" data-field="repaymentDate" value="' + esc(item.repaymentDate) + '" aria-describedby="' + key + '-repayment-date-help" /><p id="' + key + '-repayment-date-help" class="stm-field-hint">Optional.</p></div></div>',
      '<div class="stm-field"><label for="' + key + '-note">Private note</label><textarea id="' + key + '-note" maxlength="280" data-field="note" placeholder="Example: remove my card after the final charge clears">' + esc(item.note) + '</textarea><p class="stm-field-hint">Optional. This appears in your private transition summary, not in the generated message.</p></div>',
      '</fieldset>'
    ].join("");
  }

  function syncCard(card) {
    var transition = checkedValue(card, "transition");
    card.querySelectorAll("[data-transition-panel]").forEach(function (panel) { panel.hidden = panel.getAttribute("data-transition-panel") !== transition; });
    var action = fieldValue(card, "action");
    var other = card.querySelector("[data-other-action]");
    if (other) other.hidden = action !== "Other";
    var past = checkedValue(card, "past");
    var balance = card.querySelector("[data-balance-panel]");
    if (balance) balance.hidden = past !== "agreed" && past !== "partial";
  }

  function renderCards(items) {
    itemsRegion.innerHTML = items.map(cardHtml).join("");
    itemsRegion.querySelectorAll("[data-item-card]").forEach(syncCard);
  }

  function collectItems() {
    return Array.prototype.slice.call(itemsRegion.querySelectorAll("[data-item-card]")).map(function (card) {
      return {
        name: fieldValue(card, "name"), arrangement: fieldValue(card, "arrangement"), frequency: fieldValue(card, "frequency") || "Monthly",
        transition: checkedValue(card, "transition"), changeDate: fieldValue(card, "changeDate"), endDate: fieldValue(card, "endDate"),
        reducedAmount: fieldValue(card, "reducedAmount"), reductionDate: fieldValue(card, "reductionDate"), finalDate: fieldValue(card, "finalDate"),
        newAmount: fieldValue(card, "newAmount"), newLimitDate: fieldValue(card, "newLimitDate"), reviewDate: fieldValue(card, "reviewDate"),
        action: fieldValue(card, "action") || "No account action", otherAction: fieldValue(card, "otherAction"), past: checkedValue(card, "past"),
        agreedAmount: fieldValue(card, "agreedAmount"), repaymentNext: fieldValue(card, "repaymentNext") || "Not decided yet", repaymentDate: fieldValue(card, "repaymentDate"), note: fieldValue(card, "note")
      };
    });
  }

  function clearErrors() {
    errorSummary.hidden = true;
    errorList.innerHTML = "";
    root.querySelectorAll("[aria-invalid=\"true\"]").forEach(function (field) { field.removeAttribute("aria-invalid"); });
    root.querySelectorAll("[data-error-for]").forEach(function (node) { node.textContent = ""; });
  }

  function fieldFor(card, key) {
    if (key === "transition" || key === "past") return card.querySelector('[data-field="' + key + '"]');
    return card.querySelector('[data-field="' + key + '"]');
  }

  function setFieldError(card, key, message, errors) {
    var field = fieldFor(card, key);
    var errorNode = card.querySelector('[data-error-for="' + key + '"]');
    if (errorNode) errorNode.textContent = message;
    if (field) field.setAttribute("aria-invalid", "true");
    if (field && field.id) errors.push({ id: field.id, message: message });
  }

  function validDateOrder(first, second) { return !first || !second || first <= second; }

  function validate(items) {
    clearErrors();
    var errors = [];
    var cards = itemsRegion.querySelectorAll("[data-item-card]");
    var meaningful = items.some(function (item) { return item.name || item.arrangement || item.transition || item.past; });
    if (!meaningful) errors.push({ id: "support-1-name", message: "Add at least one support item to build your plan." });

    items.forEach(function (item, index) {
      var card = cards[index];
      if (!item.name) setFieldError(card, "name", "Name this payment or type of support.", errors);
      if (!item.arrangement) setFieldError(card, "arrangement", "Add the current amount or arrangement.", errors);
      if (!item.transition) setFieldError(card, "transition", "Choose how this support item will change.", errors);
      if (!item.past) setFieldError(card, "past", "Choose the past-money status for this item.", errors);
      if (item.transition === "stop" && !item.changeDate) setFieldError(card, "changeDate", "Choose the date this change starts.", errors);
      if (item.transition === "end" && !item.endDate) setFieldError(card, "endDate", "Choose the final covered date.", errors);
      if (item.transition === "taper") {
        if (!item.reducedAmount) setFieldError(card, "reducedAmount", "Add the temporary reduced amount or limit.", errors);
        if (!item.reductionDate) setFieldError(card, "reductionDate", "Choose when the reduced amount starts.", errors);
        if (!item.finalDate) setFieldError(card, "finalDate", "Choose the final support date.", errors);
        if (item.reductionDate && item.finalDate && !validDateOrder(item.reductionDate, item.finalDate)) setFieldError(card, "finalDate", "The final support date must be the same as or later than the reduction start date.", errors);
      }
      if (item.transition === "fixed") {
        if (!item.newAmount) setFieldError(card, "newAmount", "Add the new amount, purpose, or limit.", errors);
        if (!item.newLimitDate) setFieldError(card, "newLimitDate", "Choose when the new limit starts.", errors);
        if (!item.reviewDate) setFieldError(card, "reviewDate", "Choose a review or end date.", errors);
        if (item.newLimitDate && item.reviewDate && !validDateOrder(item.newLimitDate, item.reviewDate)) setFieldError(card, "reviewDate", "The review or end date must be the same as or later than the new-limit start date.", errors);
      }
      if (item.action === "Other" && !item.otherAction) setFieldError(card, "otherAction", "Describe the practical action.", errors);
    });

    if (errors.length) {
      errorList.innerHTML = errors.map(function (error) { return '<li><a href="#' + esc(error.id) + '">' + esc(error.message) + '</a></li>'; }).join("");
      errorSummary.hidden = false;
      errorSummary.focus();
      liveStatus.textContent = "Complete the highlighted fields before building the transition plan.";
      return false;
    }
    return true;
  }

  function decisionLine(item) {
    var subject = item.name;
    if (item.transition === "stop") return subject + ": I will stop covering this from " + formatDate(item.changeDate) + ".";
    if (item.transition === "end") return subject + ": I will continue covering this until " + formatDate(item.endDate) + ", and then it will end.";
    if (item.transition === "taper") return subject + ": I will reduce this to " + item.reducedAmount + " from " + formatDate(item.reductionDate) + " until " + formatDate(item.finalDate) + ". Regular support will end after that date.";
    return subject + ": I will change this to " + item.newAmount + " from " + formatDate(item.newLimitDate) + ", with a review or end date of " + formatDate(item.reviewDate) + ".";
  }

  function practicalLine(item) {
    if (item.action === "Cancel an automatic payment") return "Cancel the automatic payment for " + item.name + ".";
    if (item.action === "Remove or replace a payment method") return "Remove or replace the payment method used for " + item.name + ".";
    if (item.action === "Transfer the bill or account") return "Transfer responsibility for " + item.name + ".";
    if (item.action === "Confirm the change with the provider") return "Confirm the change for " + item.name + " with the relevant provider.";
    if (item.action === "Other") return item.otherAction;
    return "";
  }

  function pastLine(item) {
    if (item.past === "gift") return item.name + ": Past help was a gift. Nothing is being added as money owed.";
    if (item.past === "agreed") return item.name + ": Repayment was already agreed." + (item.agreedAmount ? " Agreed amount still open: " + item.agreedAmount + "." : "");
    if (item.past === "partial") return item.name + ": Only the part already understood as repayable belongs in the remaining balance." + (item.agreedAmount ? " Agreed amount still open: " + item.agreedAmount + "." : "");
    if (item.past === "unclear") return item.name + ": The past expectation is still unclear. Do not record an owed amount until both people clarify what they understood.";
    if (item.past === "closed") return item.name + ": The past money has already been repaid or closed.";
    return item.name + ": No past balance is attached to this support item.";
  }

  function messageItem(item) {
    if (item.transition === "stop") return "For " + item.name + ", I will stop covering it from " + formatDate(item.changeDate) + ".";
    if (item.transition === "end") return "For " + item.name + ", I can continue covering it until " + formatDate(item.endDate) + ". After that date, I will not be able to keep paying it.";
    if (item.transition === "taper") return "For " + item.name + ", I can reduce the support to " + item.reducedAmount + " from " + formatDate(item.reductionDate) + " until " + formatDate(item.finalDate) + ". After that, the regular support will end.";
    return "For " + item.name + ", I can change the support to " + item.newAmount + " from " + formatDate(item.newLimitDate) + ". We can review or finish that arrangement on " + formatDate(item.reviewDate) + ".";
  }

  function messagePast(item) {
    if (item.past === "gift") return "The help I gave before remains a gift. I am not reopening it as money owed.";
    if (item.past === "agreed") return item.agreedAmount ? "The previously agreed balance of " + item.agreedAmount + " is separate from this change." : "The previously agreed repayable amount is separate from this change.";
    if (item.past === "partial") return item.agreedAmount ? "The gift part remains a gift. Only the agreed remaining amount of " + item.agreedAmount + " stays separate from this change." : "The gift part remains a gift. Only the part we already understood as repayable stays separate from this change.";
    if (item.past === "unclear") return "I do not want either of us to guess about the past money. We should clarify what we each understood before calling any amount owed.";
    if (item.past === "closed") return "The past money is already closed, so this message is only about what changes going forward.";
    return "";
  }

  function buildMessage(person, items) {
    var lines = [];
    if (person) lines.push("Hi " + person + ",");
    lines.push("I need to change the financial help I’m providing, so I want to be clear about what will happen instead of changing things without explanation.");
    items.forEach(function (item) { lines.push(messageItem(item)); });
    var usedStatuses = {};
    items.forEach(function (item) {
      if (!usedStatuses[item.past]) {
        var sentence = messagePast(item);
        if (sentence) lines.push(sentence);
        usedStatuses[item.past] = true;
      }
    });
    lines.push("I know this may be difficult, but I need the plan to be clear from these dates.");
    return lines.join("\n\n");
  }

  function actionState(items) {
    var hasUnclear = items.some(function (item) { return item.past === "unclear"; });
    var hasAgreed = items.some(function (item) { return item.past === "agreed" || item.past === "partial"; });
    var hasFixed = items.some(function (item) { return item.transition === "fixed"; });
    var states = [];
    if (hasUnclear) states.push({ kind: "warning", title: "Clarify the past before recording a balance", body: "At least one item was never clearly a gift or something to repay. Do not add an owed amount yet. Compare what was said and agree on what — if anything — remains open.", label: "Clarify what the past money was", href: "/blog/how-to-clarify-if-money-was-a-gift-or-a-loan/" });
    if (hasAgreed) states.push({ kind: "", title: "An agreed balance remains", body: "Future support can end while the previously agreed balance stays separate. Use a payment plan if the amount is fixed, or an ongoing record if repayments, timing, notes, or reminders will keep changing.", links: [{ label: "Plan the agreed repayments", href: "/tools/payment-plan-calculator/" }, { label: "See how to track the remaining balance", href: "/solutions/temporary-financial-support-tracker/" }] });
    if (!hasAgreed && !hasUnclear && hasFixed) states.push({ kind: "", title: "The support is changing, not closing", body: "Keep the new amount, purpose, and review date clear. A simple written plan may be enough when no repayment balance exists.", label: "Create a simple support record", href: "/tools/temporary-financial-support-record-template/" });
    if (!hasAgreed && !hasUnclear && !hasFixed && items.every(function (item) { return item.past === "gift" || item.past === "closed" || item.past === "none"; })) states.push({ kind: "", title: "Nothing remains open", body: "Your plan can probably close with the message and final checklist. An ongoing money record may not be necessary.", label: "Prepare for the next request", href: "/blog/how-to-politely-say-no-when-people-ask-for-money/" });
    return states;
  }

  function shouldShowProductBridge(items) {
    var hasUnclear = items.some(function (item) { return item.past === "unclear"; });
    var hasAgreed = items.some(function (item) { return item.past === "agreed" || item.past === "partial"; });
    return hasAgreed && !hasUnclear;
  }

  function setProductBridgeVisible(visible) {
    if (productBridge) productBridge.hidden = !visible;
  }

  function resultHtml(person, items, message) {
    var decisionItems = items.map(function (item) { return "<li>" + esc(decisionLine(item)) + (item.note ? "<br /><span class=\"stm-private-note\">Private note: " + esc(item.note) + "</span>" : "") + "</li>"; }).join("");
    var actions = items.map(practicalLine).filter(Boolean);
    var pastItems = items.map(function (item) {
      var next = (item.past === "agreed" || item.past === "partial") ? "<br /><span class=\"stm-private-note\">What happens next: " + esc(item.repaymentNext) + "." + (item.repaymentDate ? " Next repayment or check-in date: " + esc(formatDate(item.repaymentDate)) + "." : "") + "</span>" : "";
      return "<li>" + esc(pastLine(item)) + next + "</li>";
    }).join("");
    var states = actionState(items).map(function (state) {
      var links = state.links ? state.links.map(function (link) { return '<a class="lt-cardCta stm-result-link" href="' + link.href + '">' + link.label + "</a>"; }).join(" ") : '<a class="lt-cardCta stm-result-link" href="' + state.href + '">' + state.label + "</a>";
      return '<section class="stm-result-state' + (state.kind ? " stm-result-state--" + state.kind : "") + '"><h3>' + state.title + "</h3><p>" + state.body + "</p>" + links + "</section>";
    }).join("");
    return [
      '<section class="stm-result-block"><h3>Your decisions</h3>', person ? "<p><strong>Plan for:</strong> " + esc(person) + "</p>" : "", "<ul>" + decisionItems + "</ul></section>",
      '<section class="stm-result-block"><h3>Practical actions</h3>' + (actions.length ? "<ul>" + actions.map(function (action) { return "<li>" + esc(action) + "</li>"; }).join("") + "</ul>" : "<p>No separate account or provider action was added.</p>") + "</section>",
      '<section class="stm-result-block"><h3>Past money</h3><ul>' + pastItems + "</ul></section>",
      states,
      '<section class="stm-result-block"><h3>Message to send</h3><p class="stm-message-output" data-message-output>' + esc(message) + "</p></section>",
      '<div class="stm-result-actions"><button type="button" class="lt-primaryCta" data-copy-plan>Copy transition plan</button><button type="button" class="stm-secondary-button" data-copy-message>Copy message</button><button type="button" class="stm-link-button" data-edit-plan>Edit plan</button></div>'
    ].join("");
  }

  function planText(person, items, message) {
    var lines = ["Your support transition plan"];
    if (person) lines.push("Plan for: " + person);
    lines.push("", "Your decisions", items.map(decisionLine).join("\n"));
    var actions = items.map(practicalLine).filter(Boolean);
    lines.push("", "Practical actions", actions.length ? actions.join("\n") : "No separate account or provider action was added.");
    lines.push("", "Past money", items.map(pastLine).join("\n"));
    items.forEach(function (item) { if (item.note) lines.push("Private note for " + item.name + ": " + item.note); });
    lines.push("", "Message to send", message);
    return lines.join("\n");
  }

  function resetResult() {
    resultTitle.textContent = initialResult.title;
    resultContent.innerHTML = "";
    var intro = root.querySelector(".stm-results-heading > div > p");
    if (intro) intro.textContent = initialResult.body;
    copyStatus.textContent = "";
  }

  function displayResult(person, items) {
    var message = buildMessage(person, items);
    resultTitle.textContent = "Your support transition plan";
    var intro = root.querySelector(".stm-results-heading > div > p");
    if (intro) intro.textContent = "Review the dates and wording before you copy anything. This is a private planning summary, not a contract or proof of what someone owes.";
    resultContent.innerHTML = resultHtml(person, items, message);
    root.dataset.planText = planText(person, items, message);
    root.dataset.messageText = message;
    setProductBridgeVisible(shouldShowProductBridge(items));
    copyStatus.textContent = "";
    resultTitle.focus({ preventScroll: true });
    if (!isReducedMotion()) resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
    liveStatus.textContent = "Your support transition plan is ready.";
  }

  function copyText(text, success) {
    if (!navigator.clipboard || !window.isSecureContext) {
      copyStatus.textContent = "Copying did not work. Select the text and copy it manually.";
      liveStatus.textContent = copyStatus.textContent;
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      copyStatus.textContent = success;
      liveStatus.textContent = success;
    }).catch(function () {
      copyStatus.textContent = "Copying did not work. Select the text and copy it manually.";
      liveStatus.textContent = copyStatus.textContent;
    });
  }

  function edited() {
    var items = collectItems();
    return Boolean(trim(personInput.value)) || items.some(function (item) {
      return Object.keys(item).some(function (key) { return key !== "frequency" && key !== "action" && key !== "repaymentNext" && Boolean(item[key]); });
    });
  }

  function preset(name) {
    var today = isoDate(0);
    if (name === "parent") return { person: "Jordan", items: [
      { name: "Phone bill", arrangement: "$65 per month", frequency: "Monthly", transition: "end", endDate: isoDate(30), action: "Transfer the bill or account", past: "gift" },
      { name: "Rent help", arrangement: "$400 per month", frequency: "Monthly", transition: "taper", reducedAmount: "$200 per month", reductionDate: isoDate(30), finalDate: isoDate(90), action: "No account action", past: "gift" }
    ] };
    if (name === "sibling") return { person: "Maya", items: [
      { name: "Groceries", arrangement: "About $120 most weeks", frequency: "Weekly", transition: "end", endDate: isoDate(14), action: "No account action", past: "gift" },
      { name: "Streaming subscriptions", arrangement: "$38 per month", frequency: "Monthly", transition: "stop", changeDate: isoDate(7), action: "Cancel an automatic payment", past: "none" },
      { name: "Earlier repayable support", arrangement: "No new money will be added", frequency: "Other", transition: "stop", changeDate: today, action: "No account action", past: "agreed", agreedAmount: "$600", repaymentNext: "Create or revise a repayment plan", repaymentDate: isoDate(30) }
    ] };
    return { person: "Alex", items: [
      { name: "Groceries and household costs", arrangement: "About $350 per month", frequency: "Monthly", transition: "fixed", newAmount: "Up to $150 per month", newLimitDate: isoDate(14), reviewDate: isoDate(60), action: "No account action", past: "partial", agreedAmount: "$300", repaymentNext: "Check in on a specific date", repaymentDate: isoDate(30) }
    ] };
  }

  function applyPreset(name) {
    var values = preset(name);
    personInput.value = values.person;
    renderCards(values.items.map(function (item) { return Object.assign(blankItem(), item); }));
    clearErrors();
    resetResult();
    liveStatus.textContent = "Example loaded.";
    personInput.focus();
  }

  function clearPlanner() {
    personInput.value = "";
    renderCards([blankItem()]);
    clearErrors();
    resetResult();
    setProductBridgeVisible(true);
    liveStatus.textContent = "Transition plan cleared.";
    personInput.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var items = collectItems();
    if (!validate(items)) return;
    displayResult(trim(personInput.value), items);
  });

  itemsRegion.addEventListener("change", function (event) {
    var card = event.target.closest("[data-item-card]");
    if (!card) return;
    if (event.target.matches('[data-field="transition"], [data-field="past"], [data-field="action"]')) syncCard(card);
  });

  itemsRegion.addEventListener("click", function (event) {
    var button = event.target.closest("[data-remove-item]");
    if (!button) return;
    var items = collectItems();
    var card = button.closest("[data-item-card]");
    var index = Number(card.getAttribute("data-item-index"));
    if (items.length === 1) items[0] = blankItem(); else items.splice(index, 1);
    renderCards(items);
    clearErrors();
    liveStatus.textContent = "Support item updated.";
  });

  root.querySelector("[data-add-item]").addEventListener("click", function () {
    var items = collectItems();
    items.push(blankItem());
    renderCards(items);
    var cards = itemsRegion.querySelectorAll("[data-item-card]");
    var latest = cards[cards.length - 1].querySelector('[data-field="name"]');
    latest.focus();
  });

  root.querySelector("[data-clear-planner]").addEventListener("click", function () {
    if (!edited()) { clearPlanner(); return; }
    if (clearDialog && typeof clearDialog.showModal === "function") clearDialog.showModal();
    else if (window.confirm("Clear this transition plan?\n\nThis will remove the support items and result currently shown in this browser.")) clearPlanner();
  });

  root.querySelector(".stm-example-loader").addEventListener("click", function (event) {
    var button = event.target.closest("[data-example]");
    if (!button) return;
    var name = button.getAttribute("data-example");
    if (!edited()) { applyPreset(name); return; }
    pendingExample = name;
    if (exampleDialog && typeof exampleDialog.showModal === "function") exampleDialog.showModal();
    else if (window.confirm("Loading this example will replace the details currently in the planner.")) applyPreset(name);
  });

  if (exampleDialog) exampleDialog.addEventListener("close", function () { if (exampleDialog.returnValue === "load" && pendingExample) applyPreset(pendingExample); pendingExample = null; });
  if (clearDialog) clearDialog.addEventListener("close", function () { if (clearDialog.returnValue === "clear") clearPlanner(); });

  root.querySelector("[data-results]").addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    if (button.matches("[data-copy-plan]")) copyText(root.dataset.planText || "", "Transition plan copied.");
    if (button.matches("[data-copy-message]")) copyText(root.dataset.messageText || "", "Message copied.");
    if (button.matches("[data-edit-plan]")) {
      setProductBridgeVisible(false);
      personInput.focus();
      if (!isReducedMotion()) form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.querySelectorAll("[data-copy-script]").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.closest(".stm-script-card").querySelector("[data-script-text]").textContent.trim();
      copyText(text, "Message copied.");
    });
  });

  errorList.addEventListener("click", function (event) {
    var link = event.target.closest("a[href^='#']");
    if (!link) return;
    event.preventDefault();
    var field = document.getElementById(link.getAttribute("href").slice(1));
    if (field) field.focus();
  });

  renderCards([blankItem()]);
}());

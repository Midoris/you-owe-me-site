(function () {
  "use strict";

  const MODEL = window.CoupleExpenseSplitMethodModel;
  if (!MODEL) return;

  const DEFAULT_COSTS = [
    { id: "housing", label: "Housing", amount: "", custom: false },
    { id: "utilities", label: "Utilities", amount: "", custom: false },
    { id: "groceries", label: "Groceries and household supplies", amount: "", custom: false },
    { id: "transport", label: "Shared transport", amount: "", custom: false },
    { id: "pets", label: "Pets", amount: "", custom: false },
    { id: "subscriptions", label: "Shared subscriptions", amount: "", custom: false },
    { id: "other", label: "Other shared costs", amount: "", custom: true, customLabel: "" }
  ];

  const state = {
    mode: "total",
    rows: cloneDefaultRows(),
    result: null,
    selected: null,
    dirty: false,
  };

  const els = {};

  function cloneDefaultRows() {
    return DEFAULT_COSTS.map((item, index) => ({ ...item, id: `${item.id}-${index}` }));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentCurrency() {
    if (els.currency.value === "custom") return String(els.currencyCustom.value || "$").trim().slice(0, 8) || "$";
    return els.currency.value;
  }

  function money(cents) {
    return MODEL.formatMoney(cents, currentCurrency());
  }

  function nameFor(index) {
    const value = index === 0 ? els.name1.value : els.name2.value;
    return String(value || "").trim() || `Partner ${index + 1}`;
  }

  function updatePartnerLabels() {
    const names = [nameFor(0), nameFor(1)];
    document.querySelectorAll("[data-partner-label]").forEach((label) => {
      const kind = label.dataset.partnerLabel;
      const index = kind.endsWith("-1") ? 0 : 1;
      if (kind.startsWith("income")) label.textContent = `${names[index]} monthly take-home income`;
      if (kind.startsWith("adjustment")) label.textContent = `${names[index]} agreed monthly adjustment`;
      if (kind.startsWith("custom")) label.textContent = `${names[index]} percentage`;
    });
  }

  function getItemTotal() {
    let total = 0;
    const errors = [];
    state.rows.forEach((row) => {
      const parsed = MODEL.parseMoney(row.amount);
      if (parsed.blank) return;
      if (parsed.negative) errors.push({ id: row.id, message: "Enter an amount of 0 or more." });
      else if (!parsed.valid) errors.push({ id: row.id, message: "Enter a valid number." });
      else total += parsed.cents;
    });
    return { total, errors };
  }

  function formatCentsInput(cents) {
    return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
  }

  function collectInput() {
    const items = getItemTotal();
    return {
      name1: els.name1.value,
      name2: els.name2.value,
      income1: els.income1.value,
      income2: els.income2.value,
      adjustment1: els.adjustment1.value,
      adjustment2: els.adjustment2.value,
      total: state.mode === "items" ? formatCentsInput(items.total) : els.total.value,
      custom1: els.custom1.value,
      custom2: els.custom2.value,
      itemErrors: state.mode === "items" ? items.errors : [],
    };
  }

  function setInvalid(input, message) {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    const error = document.getElementById(`${input.id}-error`);
    if (error) error.textContent = message;
  }

  function clearValidation() {
    document.querySelectorAll("#ces-calculator-form input[aria-invalid]").forEach((input) => input.removeAttribute("aria-invalid"));
    document.querySelectorAll("#ces-calculator-form .ces-validation").forEach((message) => { message.textContent = ""; });
  }

  function renderCostRows() {
    els.costRows.innerHTML = state.rows.map((row) => {
      const displayName = row.custom ? (String(row.customLabel || "").trim() || row.label) : row.label;
      const customField = row.custom
        ? `<div class="ces-field"><p class="ces-row-default-label">${escapeHtml(row.label)}</p><label for="ces-cost-name-${escapeHtml(row.id)}">Shared cost name</label><input id="ces-cost-name-${escapeHtml(row.id)}" type="text" maxlength="80" autocomplete="off" placeholder="For example: pet care" value="${escapeHtml(row.customLabel || "")}" data-cost-name="${escapeHtml(row.id)}" /></div>`
        : `<div class="ces-field"><p class="ces-row-default-label">${escapeHtml(row.label)}</p></div>`;
      return `<div class="ces-cost-row" data-cost-row="${escapeHtml(row.id)}">${customField}<div class="ces-field"><label for="ces-cost-amount-${escapeHtml(row.id)}">Amount for ${escapeHtml(displayName)}</label><input id="ces-cost-amount-${escapeHtml(row.id)}" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(row.amount)}" data-cost-amount="${escapeHtml(row.id)}" aria-describedby="ces-cost-error-${escapeHtml(row.id)}" /><p id="ces-cost-error-${escapeHtml(row.id)}" class="ces-validation"></p></div><button type="button" class="ces-remove-button" data-remove-cost="${escapeHtml(row.id)}" aria-label="Remove ${escapeHtml(displayName)}" title="Remove ${escapeHtml(displayName)}">×</button></div>`;
    }).join("");
    bindCostRowEvents();
    updateItemTotal();
  }

  function bindCostRowEvents() {
    els.costRows.querySelectorAll("[data-cost-amount]").forEach((input) => {
      input.addEventListener("input", () => {
        const row = state.rows.find((item) => item.id === input.dataset.costAmount);
        if (!row) return;
        row.amount = input.value;
        updateItemTotal();
        markDirty();
      });
    });
    els.costRows.querySelectorAll("[data-cost-name]").forEach((input) => {
      input.addEventListener("input", () => {
        const row = state.rows.find((item) => item.id === input.dataset.costName);
        if (!row) return;
        row.customLabel = input.value;
        const amount = document.getElementById(`ces-cost-amount-${row.id}`);
        const label = els.costRows.querySelector(`label[for="ces-cost-amount-${row.id}"]`);
        const displayName = String(row.customLabel || "").trim() || row.label;
        if (label) label.textContent = `Amount for ${displayName}`;
        if (amount) amount.setAttribute("aria-label", `Amount for ${displayName}`);
        const remove = els.costRows.querySelector(`[data-remove-cost="${row.id}"]`);
        if (remove) {
          remove.setAttribute("aria-label", `Remove ${displayName}`);
          remove.setAttribute("title", `Remove ${displayName}`);
        }
        markDirty();
      });
    });
    els.costRows.querySelectorAll("[data-remove-cost]").forEach((button) => {
      button.addEventListener("click", () => {
        state.rows = state.rows.filter((row) => row.id !== button.dataset.removeCost);
        renderCostRows();
        markDirty();
      });
    });
  }

  function updateItemTotal() {
    const itemTotal = getItemTotal();
    els.itemTotal.value = money(itemTotal.total);
  }

  function setCostMode(mode) {
    state.mode = mode;
    document.querySelectorAll("[data-cost-mode]").forEach((panel) => { panel.hidden = panel.dataset.costMode !== mode; });
    updateItemTotal();
    markDirty();
  }

  function markDirty() {
    if (!state.result) return;
    state.dirty = true;
    state.selected = null;
    els.formStatus.textContent = "Your inputs changed. Update the comparison to refresh the results.";
    els.submit.textContent = "Update the comparison";
    updateCopySurface();
    renderMethods();
  }

  function resetDirty() {
    state.dirty = false;
    els.formStatus.textContent = "";
    els.submit.textContent = "Compare the methods";
  }

  function firstErrorInput(errors) {
    const mapping = {
      income1: els.income1,
      income2: els.income2,
      adjustment1: els.adjustment1,
      adjustment2: els.adjustment2,
      total: els.total,
      custom: els.custom1,
    };
    for (const key of ["income1", "income2", "total", "adjustment1", "adjustment2", "custom"]) {
      if (errors[key] && mapping[key]) return mapping[key];
    }
    return null;
  }

  function validateItems(itemErrors) {
    itemErrors.forEach((error) => {
      const input = document.getElementById(`ces-cost-amount-${error.id}`);
      if (input) {
        input.setAttribute("aria-invalid", "true");
        const message = document.getElementById(`ces-cost-error-${error.id}`);
        if (message) message.textContent = error.message;
      }
    });
    return itemErrors.length > 0 ? document.getElementById(`ces-cost-amount-${itemErrors[0].id}`) : null;
  }

  function submit(event) {
    event.preventDefault();
    clearValidation();
    const input = collectInput();
    const itemErrorInput = validateItems(input.itemErrors);
    const result = MODEL.calculate(input);
    const errors = { ...result.errors };
    if (input.itemErrors.length > 0) errors.items = "Enter valid shared cost amounts.";

    if (Object.keys(errors).length > 0) {
      if (errors.income1) setInvalid(els.income1, errors.income1);
      if (errors.income2) setInvalid(els.income2, errors.income2);
      if (errors.adjustment1) setInvalid(els.adjustment1, errors.adjustment1);
      if (errors.adjustment2) setInvalid(els.adjustment2, errors.adjustment2);
      if (errors.total) setInvalid(els.total, errors.total);
      if (errors.custom) {
        setInvalid(els.custom1, errors.custom);
        setInvalid(els.custom2, errors.custom);
      }
      els.formStatus.textContent = "Review the highlighted fields and try again.";
      const focusTarget = itemErrorInput || firstErrorInput(errors);
      if (focusTarget) focusTarget.focus();
      return;
    }

    state.result = result;
    state.selected = null;
    resetDirty();
    els.resultsSection.hidden = false;
    renderResults();
    updateCopySurface();
  }

  function renderResults() {
    const result = state.result;
    if (!result) return;
    const adjustmentsIncluded = result.adjustments.some((amount) => amount !== 0);
    let summary = `Based on ${money(result.totalCents)} of shared monthly costs and monthly take-home incomes of ${money(result.incomes[0])} and ${money(result.incomes[1])}.`;
    if (adjustmentsIncluded) summary += ` The comparison also includes agreed monthly adjustments of ${money(result.adjustments[0])} for ${result.names[0]} and ${money(result.adjustments[1])} for ${result.names[1]}.`;
    els.resultSummary.textContent = summary;
    els.warnings.innerHTML = result.warnings.map((warning) => `<div class="ces-warning"><strong>${escapeHtml(warning.heading)}</strong><p>${escapeHtml(warning.body)}</p></div>`).join("");
    const count = result.methods.filter((method) => method.feasible).length;
    els.resultStatus.textContent = `Comparison updated. ${count} contribution method${count === 1 ? " is" : "s are"} available.`;
    renderMethods();
  }

  function comparisonNotes(method) {
    if (!method.feasible || method.key === "equal") return "Baseline for comparison";
    const baseline = state.result.methods.find((entry) => entry.key === "equal");
    const notes = [];
    method.contributionCents.forEach((amount, index) => {
      const difference = amount - baseline.contributionCents[index];
      if (difference !== 0) notes.push(`Compared with 50/50, ${state.result.names[index]} contributes ${money(Math.abs(difference))} ${difference > 0 ? "more" : "less"} each month.`);
    });
    return notes.join(" ");
  }

  function metric(label, value, helper) {
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}${helper ? `<small>${escapeHtml(helper)}</small>` : ""}</dd></div>`;
  }

  function renderVisual(method) {
    const rows = method.contributionCents.map((contribution, index) => {
      const left = method.moneyLeftCents[index];
      const total = Math.max(1, contribution + Math.abs(left));
      const contributionWidth = Math.max(2, contribution / total * 100);
      const remainingWidth = Math.max(2, Math.abs(left) / total * 100);
      const leftClass = left < 0 ? "ces-bar-negative" : "ces-bar-left";
      return `<div class="ces-person-bar"><span>${escapeHtml(state.result.names[index])}</span><div class="ces-bar-track" role="img" aria-label="${escapeHtml(`${state.result.names[index]} contributes ${money(contribution)} and has ${money(left)} left after included amounts.`)}" style="grid-template-columns: ${contributionWidth}% ${remainingWidth}%"><span class="ces-bar-contribution"></span><span class="${leftClass}"></span></div></div>`;
    }).join("");
    const key = `<div class="ces-bar-key"><span>Contribution</span><span>Money left</span>${method.moneyLeftCents.some((value) => value < 0) ? "<span>Below 0</span>" : ""}</div>`;
    return `<figure class="ces-visual"><figcaption>Comparison of each partner’s shared-cost contribution and money remaining under ${escapeHtml(method.title)}.</figcaption>${rows}${key}</figure>`;
  }

  function infeasibleDetail(method) {
    const reason = method.reason;
    const names = state.result.names;
    if (reason.type === "negative") {
      const otherLeft = state.result.available[reason.otherPartner] - state.result.totalCents;
      const negativeLeft = state.result.available[reason.negativePartner];
      return `<p class="ces-method-body">Equal-leftover is not achievable through shared-cost contributions alone. The formula would require ${escapeHtml(names[reason.negativePartner])} to contribute less than 0.</p><p class="ces-infeasible-boundary">Even if ${escapeHtml(names[reason.otherPartner])} covers the full shared cost and ${escapeHtml(names[reason.negativePartner])} contributes 0, they would still have ${money(otherLeft)} and ${money(negativeLeft)} left.</p>`;
    }
    if (reason.type === "exceeds") return `<p class="ces-method-body">Equal-leftover is not achievable without one partner contributing more than the money available after the included adjustment.</p>`;
    if (reason.type === "combined") return `<p class="ces-method-body">Equal-leftover is not feasible because the shared cost is higher than the combined money available after the included adjustments.</p>`;
    return `<p class="ces-method-body">${escapeHtml(method.body)}</p>`;
  }

  function renderMethod(method) {
    const selected = state.selected === method.key && !state.dirty;
    const headerStatus = selected ? "<span class=\"ces-working-label\">Working method selected</span>" : method.feasible ? `<span class="ces-principle">${escapeHtml(method.principle)}</span>` : "<span class=\"ces-status-label\">Not feasible under these inputs</span>";
    if (!method.feasible && method.key === "custom" && method.reason.type === "not-entered") {
      return `<article class="ces-method-card"><div class="ces-method-header"><div><h3>Custom</h3><span class="ces-principle">Your agreed percentage</span></div></div><p class="ces-method-body">Enter two custom percentages above if you want to compare an agreement of your own.</p><button type="button" class="ces-secondary-button" data-action="edit-custom">Edit the custom split</button></article>`;
    }
    if (!method.feasible && method.key === "income") {
      return `<article class="ces-method-card"><div class="ces-method-header"><div><h3>${escapeHtml(method.title)}</h3><span class="ces-principle">${escapeHtml(method.principle)}</span></div><span class="ces-status-label">Unavailable</span></div><p class="ces-method-body">${escapeHtml(method.body)}</p></article>`;
    }
    if (!method.feasible) {
      return `<article class="ces-method-card"><div class="ces-method-header"><div><h3>${escapeHtml(method.title)}</h3><span class="ces-principle">${escapeHtml(method.principle)}</span></div>${headerStatus}</div>${infeasibleDetail(method)}</article>`;
    }
    const metrics = [
      metric(`${state.result.names[0]} contributes`, money(method.contributionCents[0]), `${MODEL.formatPercent(method.shareOfCost[0])} of shared cost`),
      metric(`${state.result.names[1]} contributes`, money(method.contributionCents[1]), `${MODEL.formatPercent(method.shareOfCost[1])} of shared cost`),
      metric("Share of shared cost", `${state.result.names[0]}: ${MODEL.formatPercent(method.shareOfCost[0])}`),
      metric("Share of shared cost", `${state.result.names[1]}: ${MODEL.formatPercent(method.shareOfCost[1])}`),
      metric("Share of take-home income", `${state.result.names[0]}: ${MODEL.formatPercent(method.shareOfIncome[0])}`, method.shareOfIncome[0] === null ? "Take-home income is 0." : ""),
      metric("Share of take-home income", `${state.result.names[1]}: ${MODEL.formatPercent(method.shareOfIncome[1])}`, method.shareOfIncome[1] === null ? "Take-home income is 0." : ""),
      metric("Money left after included amounts", `${state.result.names[0]}: ${money(method.moneyLeftCents[0])}`),
      metric("Money left after included amounts", `${state.result.names[1]}: ${money(method.moneyLeftCents[1])}`),
      metric("Difference in money left", money(method.differenceInMoneyLeftCents))
    ].join("");
    return `<article class="ces-method-card" data-working="${selected ? "true" : "false"}"><div class="ces-method-header"><div><h3>${escapeHtml(method.title)}</h3><span class="ces-principle">${escapeHtml(method.principle)}</span></div>${selected ? headerStatus : ""}</div><p class="ces-method-body">${escapeHtml(method.body)}</p><dl class="ces-metric-list">${metrics}</dl>${renderVisual(method)}<p class="ces-comparison-note">${escapeHtml(comparisonNotes(method))}</p><button type="button" class="ces-primary-button" data-working-method="${escapeHtml(method.key)}">Use this as our working method</button></article>`;
  }

  function renderMethods() {
    if (!state.result) return;
    els.methodGrid.innerHTML = state.result.methods.map(renderMethod).join("");
    els.methodGrid.querySelectorAll("[data-working-method]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selected = button.dataset.workingMethod;
        state.dirty = false;
        renderMethods();
        updateCopySurface();
      });
    });
    els.methodGrid.querySelectorAll("[data-action=\"edit-custom\"]").forEach((button) => {
      button.addEventListener("click", () => {
        els.advanced.open = true;
        els.custom1.focus();
      });
    });
  }

  function dateValue() {
    if (!els.reviewDate.value) return "Not added";
    const date = new Date(`${els.reviewDate.value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "Not added" : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function methodCopy(method) {
    if (!method.feasible) {
      if (method.key === "custom") return "Custom\n- No custom split entered.";
      if (method.key === "income") return `Income-proportional\n- ${method.body}`;
      return `Equal-leftover\n- Not feasible under these inputs.\n- ${infeasiblePlainReason(method)}`;
    }
    const lines = [method.title];
    if (method.key === "custom") lines.push(`- Split: ${state.result.custom[0]}/${state.result.custom[1]}`);
    [0, 1].forEach((index) => lines.push(`- ${state.result.names[index]}: ${money(method.contributionCents[index])} (${MODEL.formatPercent(method.shareOfIncome[index])}); ${money(method.moneyLeftCents[index])} left`));
    return lines.join("\n");
  }

  function infeasiblePlainReason(method) {
    const reason = method.reason;
    if (reason.type === "negative") return `The formula would require ${state.result.names[reason.negativePartner]} to contribute less than 0.`;
    if (reason.type === "combined") return "The shared cost is higher than the combined money available after the included adjustments.";
    if (reason.type === "exceeds") return "One partner would need to contribute more than the money available after the included adjustment.";
    return method.body;
  }

  function fullComparisonCopy() {
    if (!state.result || state.dirty) return "Generate a comparison to create a selectable summary.";
    const result = state.result;
    const method = (key) => result.methods.find((item) => item.key === key);
    return [
      "Couple expense split comparison",
      "",
      "Monthly take-home income",
      `- ${result.names[0]}: ${money(result.incomes[0])}`,
      `- ${result.names[1]}: ${money(result.incomes[1])}`,
      "",
      `Shared monthly cost: ${money(result.totalCents)}`,
      "",
      "Agreed adjustments included",
      `- ${result.names[0]}: ${money(result.adjustments[0])}`,
      `- ${result.names[1]}: ${money(result.adjustments[1])}`,
      "",
      methodCopy(method("equal")),
      "",
      methodCopy(method("income")),
      "",
      methodCopy(method("leftover")),
      "",
      methodCopy(method("custom")),
      "",
      `Working method: ${state.selected ? result.methods.find((item) => item.key === state.selected).title : "No working method selected"}`,
      `What we count as shared: ${String(els.sharedNote.value || "").trim() || "Not added"}`,
      `Review date: ${dateValue()}`,
      `Review trigger: ${String(els.reviewTrigger.value || "").trim() || "Not added"}`,
      "",
      "This comparison shows what each method would do. It does not decide what is fair."
    ].join("\n");
  }

  function selectedMethodCopy() {
    if (!state.result || !state.selected || state.dirty) return "";
    const method = state.result.methods.find((item) => item.key === state.selected);
    return [
      "Our working couple expense split",
      "",
      `Method: ${method.title}`,
      `Shared monthly cost: ${money(state.result.totalCents)}`,
      "",
      `${state.result.names[0]} contribution: ${money(method.contributionCents[0])} (${MODEL.formatPercent(method.shareOfCost[0])} of the shared cost)`,
      `${state.result.names[1]} contribution: ${money(method.contributionCents[1])} (${MODEL.formatPercent(method.shareOfCost[1])} of the shared cost)`,
      "",
      "Money left after included amounts",
      `- ${state.result.names[0]}: ${money(method.moneyLeftCents[0])}`,
      `- ${state.result.names[1]}: ${money(method.moneyLeftCents[1])}`,
      "",
      `What we count as shared: ${String(els.sharedNote.value || "").trim() || "Not added"}`,
      `Review date: ${dateValue()}`,
      `Review trigger: ${String(els.reviewTrigger.value || "").trim() || "Not added"}`,
      "",
      "We chose this as a working method after comparing 50/50, income-proportional, equal-leftover, and custom outcomes. We can review it when our circumstances change."
    ].join("\n");
  }

  function updateCopySurface() {
    const canCopy = Boolean(state.result && !state.dirty);
    const canCopyWorking = Boolean(canCopy && state.selected);
    els.copyComparison.disabled = !canCopy;
    els.copyWorking.disabled = !canCopyWorking;
    els.copyHelper.textContent = canCopyWorking ? "" : state.dirty ? "Update the comparison before copying a summary." : "Select a working method to copy a chosen-method summary.";
    els.copyOutput.value = fullComparisonCopy();
  }

  async function copyText(text, successMessage) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      els.copyStatus.textContent = successMessage;
    } catch (error) {
      els.copyStatus.textContent = "Couldn’t copy automatically. Select the text below and copy it manually.";
      els.copyOutput.focus();
      els.copyOutput.select();
    }
  }

  function clearAll() {
    els.name1.value = "";
    els.name2.value = "";
    els.income1.value = "";
    els.income2.value = "";
    els.total.value = "";
    els.adjustment1.value = "0";
    els.adjustment2.value = "0";
    els.custom1.value = "";
    els.custom2.value = "";
    els.sharedNote.value = "";
    els.reviewDate.value = "";
    els.reviewTrigger.value = "";
    els.advanced.open = false;
    document.querySelector("input[name=\"ces-cost-mode\"][value=\"total\"]").checked = true;
    state.mode = "total";
    state.rows = cloneDefaultRows();
    state.result = null;
    state.selected = null;
    state.dirty = false;
    clearValidation();
    renderCostRows();
    updatePartnerLabels();
    document.querySelectorAll("[data-cost-mode]").forEach((panel) => { panel.hidden = panel.dataset.costMode !== "total"; });
    els.resultsSection.hidden = true;
    els.methodGrid.innerHTML = "";
    els.warnings.innerHTML = "";
    els.resultSummary.textContent = "";
    els.formStatus.textContent = "";
    els.copyStatus.textContent = "";
    els.submit.textContent = "Compare the methods";
    updateCopySurface();
    scrollToCalculator(true);
  }

  function loadExample(type) {
    const values = type === "similar"
      ? { name1: "Alex", name2: "Sam", income1: "4200", income2: "3800", total: "2000" }
      : { name1: "Alex", name2: "Sam", income1: "6000", income2: "2500", total: "3000" };
    els.name1.value = values.name1;
    els.name2.value = values.name2;
    els.income1.value = values.income1;
    els.income2.value = values.income2;
    els.total.value = values.total;
    els.adjustment1.value = "0";
    els.adjustment2.value = "0";
    els.custom1.value = "";
    els.custom2.value = "";
    updatePartnerLabels();
    if (state.result) markDirty();
    scrollToCalculator(false, els.submit);
  }

  function scrollToCalculator(preventScrollFocus, focusTarget) {
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    els.calculatorTitle.focus({ preventScroll: true });
    els.calculatorSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (focusTarget) window.setTimeout(() => focusTarget.focus({ preventScroll: true }), reduceMotion ? 0 : 350);
    if (preventScrollFocus) els.calculatorTitle.focus({ preventScroll: true });
  }

  function bindInputs() {
    [els.name1, els.name2].forEach((input) => {
      input.addEventListener("input", () => { updatePartnerLabels(); markDirty(); });
      input.addEventListener("blur", () => { input.value = input.value.trim(); updatePartnerLabels(); });
    });
    [els.income1, els.income2, els.total, els.adjustment1, els.adjustment2, els.custom1, els.custom2].forEach((input) => input.addEventListener("input", markDirty));
    [els.sharedNote, els.reviewDate, els.reviewTrigger].forEach((input) => input.addEventListener("input", updateCopySurface));
    els.currency.addEventListener("change", () => {
      els.currencyCustom.hidden = els.currency.value !== "custom";
      if (els.currency.value === "custom") els.currencyCustom.focus();
      updateItemTotal();
      markDirty();
    });
    els.currencyCustom.addEventListener("input", () => { updateItemTotal(); markDirty(); });
    document.querySelectorAll("input[name=\"ces-cost-mode\"]").forEach((radio) => radio.addEventListener("change", () => setCostMode(radio.value)));
    els.form.addEventListener("submit", submit);
    document.querySelector("[data-action=\"add-cost-row\"]").addEventListener("click", () => {
      const number = state.rows.filter((row) => row.custom).length + 1;
      state.rows.push({ id: `other-${Date.now().toString(36)}`, label: "Other shared costs", amount: "", custom: true, customLabel: number > 1 ? `Other shared cost ${number}` : "" });
      renderCostRows();
      markDirty();
      const input = document.getElementById(`ces-cost-name-${state.rows[state.rows.length - 1].id}`);
      if (input) input.focus();
    });
    document.querySelectorAll("[data-action=\"scroll-calculator\"]").forEach((button) => button.addEventListener("click", () => scrollToCalculator(false, els.income1)));
    document.querySelector("[data-action=\"clear-all\"]").addEventListener("click", clearAll);
    document.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", () => loadExample(button.dataset.example)));
    els.copyComparison.addEventListener("click", () => copyText(fullComparisonCopy(), "Comparison copied."));
    els.copyWorking.addEventListener("click", () => copyText(selectedMethodCopy(), "Working method copied."));
  }

  function init() {
    els.form = document.getElementById("ces-calculator-form");
    els.calculatorSection = document.getElementById("calculator");
    els.calculatorTitle = document.getElementById("calculator-title");
    els.formStatus = document.getElementById("ces-form-status");
    els.submit = document.getElementById("ces-submit");
    els.name1 = document.getElementById("ces-partner-1");
    els.name2 = document.getElementById("ces-partner-2");
    els.income1 = document.getElementById("ces-income-1");
    els.income2 = document.getElementById("ces-income-2");
    els.currency = document.getElementById("ces-currency");
    els.currencyCustom = document.getElementById("ces-currency-custom");
    els.total = document.getElementById("ces-total-cost");
    els.adjustment1 = document.getElementById("ces-adjustment-1");
    els.adjustment2 = document.getElementById("ces-adjustment-2");
    els.custom1 = document.getElementById("ces-custom-1");
    els.custom2 = document.getElementById("ces-custom-2");
    els.advanced = document.getElementById("ces-advanced");
    els.costRows = document.getElementById("ces-cost-rows");
    els.itemTotal = document.getElementById("ces-item-total");
    els.resultsSection = document.getElementById("comparison");
    els.resultSummary = document.getElementById("ces-result-summary");
    els.warnings = document.getElementById("ces-warnings");
    els.resultStatus = document.getElementById("ces-result-status");
    els.methodGrid = document.getElementById("ces-method-grid");
    els.sharedNote = document.getElementById("ces-shared-note");
    els.reviewDate = document.getElementById("ces-review-date");
    els.reviewTrigger = document.getElementById("ces-review-trigger");
    els.copyComparison = document.querySelector("[data-action=\"copy-comparison\"]");
    els.copyWorking = document.querySelector("[data-action=\"copy-working\"]");
    els.copyHelper = document.getElementById("ces-copy-helper");
    els.copyStatus = document.getElementById("ces-copy-status");
    els.copyOutput = document.getElementById("ces-copy-output");
    renderCostRows();
    updatePartnerLabels();
    updateCopySurface();
    bindInputs();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

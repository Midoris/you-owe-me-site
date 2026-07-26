(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CoupleExpenseSplitMethodModel = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const MAX_CENTS = Number.MAX_SAFE_INTEGER - 100;

  function normaliseDecimal(value) {
    let text = String(value ?? "").trim().replace(/[\s\u00a0]/g, "");
    if (!text) return "";
    if (/^[+-]/.test(text)) return text;

    const commas = (text.match(/,/g) || []).length;
    const dots = (text.match(/\./g) || []).length;
    if (commas && dots) {
      const lastComma = text.lastIndexOf(",");
      const lastDot = text.lastIndexOf(".");
      const decimal = lastComma > lastDot ? "," : ".";
      const grouping = decimal === "," ? /\./g : /,/g;
      text = text.replace(grouping, "").replace(decimal, ".");
    } else if (commas) {
      const part = text.slice(text.lastIndexOf(",") + 1);
      text = part.length <= 2 ? text.replace(",", ".") : text.replace(/,/g, "");
    } else if (dots > 1) {
      const last = text.lastIndexOf(".");
      const part = text.slice(last + 1);
      text = part.length <= 2 ? `${text.slice(0, last).replace(/\./g, "")}.${part}` : text.replace(/\./g, "");
    }
    return text;
  }

  function parseMoney(value) {
    const text = normaliseDecimal(value);
    if (text === "") return { blank: true, valid: false, cents: null, negative: false };
    if (!/^\d+(\.\d{0,2})?$/.test(text)) {
      return { blank: false, valid: false, cents: null, negative: text.startsWith("-") };
    }
    const [whole, fraction = ""] = text.split(".");
    const cents = Number(whole) * 100 + Number(`${fraction}00`.slice(0, 2));
    if (!Number.isSafeInteger(cents) || cents > MAX_CENTS) return { blank: false, valid: false, cents: null, negative: false };
    return { blank: false, valid: true, cents, negative: false };
  }

  function parsePercent(value) {
    const text = normaliseDecimal(value);
    if (text === "") return { blank: true, valid: false, value: null };
    if (!/^\d+(\.\d+)?$/.test(text)) return { blank: false, valid: false, value: null };
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0) return { blank: false, valid: false, value: null };
    return { blank: false, valid: true, value: number };
  }

  function formatMoney(cents, currency) {
    const symbol = String(currency || "$").trim() || "$";
    const negative = cents < 0;
    const absolute = Math.abs(Math.round(cents));
    const amount = (absolute / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const space = symbol.length > 1 ? " " : "";
    return `${negative ? "-" : ""}${symbol}${space}${amount}`;
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return "Not defined";
    const rounded = Math.round(value * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
  }

  function contributionPercent(contributionCents, totalCents) {
    return totalCents > 0 ? contributionCents / totalCents * 100 : 0;
  }

  function incomePercent(contributionCents, incomeCents) {
    if (incomeCents === 0) return contributionCents === 0 ? 0 : null;
    return contributionCents / incomeCents * 100;
  }

  function reconcileContribution(totalCents, rawP1) {
    const p1 = Math.max(0, Math.min(totalCents, Math.round(rawP1)));
    return [p1, totalCents - p1];
  }

  function makeMethod(key, title, principle, body, totalCents, available, incomes, rawP1) {
    const [p1, p2] = reconcileContribution(totalCents, rawP1);
    return {
      key,
      title,
      principle,
      body,
      feasible: true,
      contributionCents: [p1, p2],
      moneyLeftCents: [available[0] - p1, available[1] - p2],
      shareOfCost: [contributionPercent(p1, totalCents), contributionPercent(p2, totalCents)],
      shareOfIncome: [incomePercent(p1, incomes[0]), incomePercent(p2, incomes[1])],
      differenceInMoneyLeftCents: Math.abs((available[0] - p1) - (available[1] - p2)),
    };
  }

  function noMethod(key, title, principle, body, reason) {
    return { key, title, principle, body, feasible: false, reason };
  }

  function validate(input) {
    const errors = {};
    const income1 = parseMoney(input.income1);
    const income2 = parseMoney(input.income2);
    const adjustment1 = parseMoney(input.adjustment1 === undefined ? "0" : input.adjustment1);
    const adjustment2 = parseMoney(input.adjustment2 === undefined ? "0" : input.adjustment2);
    const total = parseMoney(input.total);

    [["income1", income1], ["income2", income2]].forEach(([key, amount]) => {
      if (amount.blank) errors[key] = "Enter a monthly take-home income of 0 or more.";
      else if (amount.negative) errors[key] = "Enter an amount of 0 or more.";
      else if (!amount.valid) errors[key] = "Enter a valid number.";
    });

    [["adjustment1", adjustment1], ["adjustment2", adjustment2]].forEach(([key, amount]) => {
      if (amount.negative) errors[key] = "Enter an amount of 0 or more.";
      else if (!amount.valid && !amount.blank) errors[key] = "Enter a valid number.";
    });

    if (total.blank || (total.valid && total.cents === 0)) errors.total = "Enter a shared monthly cost above 0 to compare the methods.";
    else if (total.negative) errors.total = "Enter an amount of 0 or more.";
    else if (!total.valid) errors.total = "Enter a valid number.";

    const custom1 = parsePercent(input.custom1);
    const custom2 = parsePercent(input.custom2);
    if (custom1.blank !== custom2.blank) {
      errors.custom = "Enter both custom percentages, or leave both empty.";
    } else if (!custom1.blank && (!custom1.valid || !custom2.valid)) {
      errors.custom = "Enter a valid number.";
    } else if (!custom1.blank && Math.abs(custom1.value + custom2.value - 100) > 0.000001) {
      errors.custom = "Custom percentages must total 100%.";
    }

    return { errors, income1, income2, adjustment1, adjustment2, total, custom1, custom2 };
  }

  function calculate(input) {
    const checked = validate(input);
    if (Object.keys(checked.errors).length > 0) return { valid: false, ...checked };

    const incomes = [checked.income1.cents, checked.income2.cents];
    const adjustments = [checked.adjustment1.cents, checked.adjustment2.cents];
    const available = [incomes[0] - adjustments[0], incomes[1] - adjustments[1]];
    const totalCents = checked.total.cents;
    const names = [String(input.name1 || "").trim() || "Partner 1", String(input.name2 || "").trim() || "Partner 2"];
    const equal = makeMethod(
      "equal", "50/50", "Equal contribution amounts",
      "Each partner pays half of the shared cost. This keeps the dollar contribution equal, even when the same amount uses a different share of each person’s income.",
      totalCents, available, incomes, totalCents / 2
    );
    const methods = [equal];
    const combinedIncome = incomes[0] + incomes[1];

    if (combinedIncome > 0) {
      methods.push(makeMethod(
        "income", "Income-proportional", "Equal percentage of take-home income",
        "Each partner contributes in proportion to monthly take-home income. Both partners use the same percentage of income for the shared cost.",
        totalCents, available, incomes, totalCents * incomes[0] / combinedIncome
      ));
    } else {
      methods.push(noMethod("income", "Income-proportional", "Equal percentage of take-home income", "The income-proportional method is unavailable because the combined take-home income is 0.", { type: "unavailable" }));
    }

    const equalLeftoverP1 = (totalCents + available[0] - available[1]) / 2;
    const equalLeftoverP2 = totalCents - equalLeftoverP1;
    let equalLeftoverReason = null;
    if (equalLeftoverP1 < 0) {
      equalLeftoverReason = { type: "negative", negativePartner: 0, otherPartner: 1, raw: [equalLeftoverP1, equalLeftoverP2] };
    } else if (equalLeftoverP2 < 0) {
      equalLeftoverReason = { type: "negative", negativePartner: 1, otherPartner: 0, raw: [equalLeftoverP1, equalLeftoverP2] };
    } else if (available[0] + available[1] < totalCents) {
      equalLeftoverReason = { type: "combined" };
    } else if (equalLeftoverP1 > Math.max(available[0], 0)) {
      equalLeftoverReason = { type: "exceeds", partner: 0 };
    } else if (equalLeftoverP2 > Math.max(available[1], 0)) {
      equalLeftoverReason = { type: "exceeds", partner: 1 };
    }
    if (equalLeftoverReason) {
      methods.push(noMethod("leftover", "Equal-leftover", "Same money left after included amounts", "Equal-leftover is not feasible under these inputs.", equalLeftoverReason));
    } else {
      methods.push(makeMethod(
        "leftover", "Equal-leftover", "Same money left after included amounts",
        "Contributions are set so both partners would have the same amount left after shared costs and any agreed adjustments included in the comparison.",
        totalCents, available, incomes, equalLeftoverP1
      ));
    }

    if (checked.custom1.blank) {
      methods.push(noMethod("custom", "Custom", "Your agreed percentage", "Enter two custom percentages above if you want to compare an agreement of your own.", { type: "not-entered" }));
    } else {
      const customTitle = `Custom ${formatRawPercent(checked.custom1.value)}/${formatRawPercent(checked.custom2.value)}`;
      methods.push(makeMethod(
        "custom", customTitle, "Your agreed percentage",
        "This applies the percentages you entered. A custom split can reflect an agreement that the other formulas do not capture.",
        totalCents, available, incomes, totalCents * checked.custom1.value / 100
      ));
    }

    const warnings = [];
    if (totalCents > available[0] + available[1]) {
      warnings.push({
        type: "affordability",
        heading: "Shared costs are higher than the combined money available",
        body: "These shared costs are higher than the combined money available after the adjustments included above. The comparison can show the shortfall, but it cannot make the costs affordable or recommend borrowing."
      });
    }
    available.forEach((value, index) => {
      if (value < 0) warnings.push({
        type: "available-negative",
        heading: "Review the agreed adjustment",
        body: `${names[index]}’s agreed adjustment is greater than their take-home income, so their available amount is below 0 before shared costs. Review the adjustment before using the result as a working agreement.`
      });
    });

    return {
      valid: true,
      names,
      incomes,
      adjustments,
      available,
      totalCents,
      methods,
      warnings,
      custom: checked.custom1.blank ? null : [checked.custom1.value, checked.custom2.value],
      proportionalUnavailable: combinedIncome === 0,
    };
  }

  function formatRawPercent(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  return { MAX_CENTS, parseMoney, parsePercent, formatMoney, formatPercent, validate, calculate };
});

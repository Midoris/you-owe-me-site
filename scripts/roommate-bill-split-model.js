(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RoommateBillSplitModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const WEIGHT_SCALE = 10000;
  // Leaves safe-integer headroom for every bill and adjustment allowed by the UI.
  const MAX_MONEY_CENTS = 100000000000000;

  function parseMoney(value) {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0) return NaN;
      value = String(value);
    }
    const text = String(value == null ? "" : value).trim().replace(/,/g, "");
    if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return NaN;
    const parts = text.split(".");
    const cents = Number(parts[0] || 0) * 100 + Number((parts[1] || "").padEnd(2, "0"));
    return Number.isSafeInteger(cents) && cents <= MAX_MONEY_CENTS ? cents : NaN;
  }

  function parseScaledDecimal(value, scale) {
    const text = String(value == null ? "" : value).trim();
    if (!/^\d+(?:\.\d+)?$/.test(text)) return NaN;
    const parts = text.split(".");
    const decimals = String(scale).length - 1;
    if ((parts[1] || "").length > decimals) return NaN;
    const fraction = (parts[1] || "").slice(0, decimals).padEnd(decimals, "0");
    const scaled = Number(parts[0]) * scale + Number(fraction || 0);
    return Number.isSafeInteger(scaled) ? scaled : NaN;
  }

  function formatMoney(cents, currency, compact) {
    const symbol = String(currency || "$").trim().slice(0, 8) || "$";
    const numericCents = Number(cents);
    const absolute = BigInt(Number.isSafeInteger(numericCents) ? Math.abs(numericCents) : 0);
    const whole = absolute / 100n;
    const fraction = Number(absolute % 100n);
    const wholeText = Number(whole).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const amount = compact && fraction === 0 ? wholeText : `${wholeText}.${String(fraction).padStart(2, "0")}`;
    return `${symbol}${symbol.length > 1 ? " " : ""}${amount}`;
  }

  function allocateEqual(totalCents, ids) {
    if (!ids.length) return [];
    const base = Math.floor(totalCents / ids.length);
    let remainder = totalCents - base * ids.length;
    return ids.map((id) => ({
      id,
      cents: base + (remainder-- > 0 ? 1 : 0),
    }));
  }

  function allocateWeighted(totalCents, participants) {
    if (!Number.isSafeInteger(totalCents) || totalCents < 0) return null;
    if (participants.some((participant) => !Number.isSafeInteger(participant.units) || participant.units < 0)) return null;
    if (totalCents === 0) {
      return participants.map((participant) => ({ id: participant.id, cents: 0 }));
    }
    const totalUnits = participants.reduce((sum, participant) => sum + BigInt(participant.units), 0n);
    if (totalUnits <= 0n) return null;

    let allocated = 0n;
    const rows = participants.map((participant, index) => {
      const numerator = BigInt(totalCents) * BigInt(participant.units);
      const cents = numerator / totalUnits;
      allocated += cents;
      return {
        id: participant.id,
        cents,
        remainder: numerator % totalUnits,
        index,
      };
    });

    const order = rows.slice().sort((a, b) => {
      if (a.remainder === b.remainder) return a.index - b.index;
      return a.remainder > b.remainder ? -1 : 1;
    });
    let remainderCents = BigInt(totalCents) - allocated;
    for (let index = 0; index < order.length && remainderCents > 0n; index += 1) {
      order[index].cents += 1n;
      remainderCents -= 1n;
    }
    return rows.map(({ id, cents }) => ({ id, cents: Number(cents) }));
  }

  function roommateName(roommates, id) {
    const index = roommates.findIndex((roommate) => roommate.id === id);
    if (index === -1) return "Someone";
    return String(roommates[index].name || "").trim() || `Roommate ${index + 1}`;
  }

  function expenseMode(expense) {
    if (expense.mode === "fixedUsage" || expense.mode === "custom") return expense.mode;
    return expense.splitType === "custom" ? "custom" : "simple";
  }

  function validateExpense(expense, roommates) {
    const errors = [];
    const amountCents = parseMoney(expense.amount);
    const validIds = new Set(roommates.map((roommate) => roommate.id));
    const includedIds = (expense.includedIds || []).filter((id) => validIds.has(id));
    const mode = expenseMode(expense);

    if (String(expense.amount == null ? "" : expense.amount).trim() && (!Number.isFinite(amountCents) || amountCents <= 0)) {
      errors.push({ field: "amount", message: "Enter an amount greater than zero with no more than two decimal places and within the supported range." });
    }
    if (!Number.isFinite(amountCents) || amountCents <= 0) return errors;
    if (!validIds.has(expense.paidBy)) errors.push({ field: "paidBy", message: "Choose who paid for this bill." });
    if (!includedIds.length) errors.push({ field: "included", message: "Select at least one roommate included in this bill." });

    if (mode === "custom" && includedIds.length) {
      const shares = includedIds.map((id) => parseMoney((expense.customShares || {})[id]));
      if (shares.some((share) => !Number.isFinite(share))) {
        errors.push({ field: "customShares", message: "Enter a valid non-negative custom amount for every included roommate." });
      } else if (shares.reduce((sum, share) => sum + share, 0) !== amountCents) {
        const sum = shares.reduce((total, share) => total + share, 0);
        errors.push({
          field: "customShares",
          message: `Custom shares currently add up to ${formatMoney(sum, "$")}. They need to add up to ${formatMoney(amountCents, "$")}.`,
        });
      }
    }

    if (mode === "fixedUsage") {
      const days = Number(expense.billingDays);
      const fixedType = expense.fixedInputType === "percent" ? "percent" : "amount";
      if (fixedType === "percent") {
        const percentScaled = parseScaledDecimal(expense.fixedPercent, WEIGHT_SCALE);
        if (!Number.isFinite(percentScaled) || percentScaled < 0 || percentScaled > 100 * WEIGHT_SCALE) {
          errors.push({ field: "fixedPercent", message: "Enter a fixed percentage from 0 through 100." });
        }
      } else {
        const fixedCents = parseMoney(expense.fixedAmount);
        if (!Number.isFinite(fixedCents) || fixedCents < 0 || fixedCents > amountCents) {
          errors.push({ field: "fixedAmount", message: "Enter a fixed amount from zero through the bill total." });
        }
      }

      const fixedCents = deriveFixedCents(expense, amountCents);
      const usageCents = Number.isFinite(fixedCents) ? amountCents - fixedCents : NaN;
      const usageIsActive = usageCents > 0;

      if (usageIsActive && (!Number.isSafeInteger(days) || days <= 0)) {
        errors.push({ field: "billingDays", message: "Billing-period days must be a positive whole number." });
      }

      if (usageIsActive && Number.isSafeInteger(days) && days > 0) {
        includedIds.forEach((id) => {
          const detail = (expense.usageDetails || {})[id] || {};
          const present = Number(detail.daysPresent);
          const weight = parseScaledDecimal(detail.weight, WEIGHT_SCALE);
          if (!Number.isSafeInteger(present) || present < 0 || present > days) {
            errors.push({ field: `days-${id}`, message: `${roommateName(roommates, id)}: days present must be a whole number from 0 through ${days}.` });
          }
          if (!Number.isFinite(weight) || weight < 0) {
            errors.push({ field: `weight-${id}`, message: `${roommateName(roommates, id)}: usage weight must be zero or greater.` });
          } else if (Number.isSafeInteger(present) && !Number.isSafeInteger(present * weight)) {
            errors.push({ field: `weight-${id}`, message: `${roommateName(roommates, id)}: days and usage weight are too large to calculate safely.` });
          }
        });

        const guest = expense.guest || {};
        if (guest.enabled) {
          const guestDays = Number(guest.daysPresent);
          const guestWeight = parseScaledDecimal(guest.weight, WEIGHT_SCALE);
          if (!String(guest.name || "").trim()) errors.push({ field: "guestName", message: "Add a name or label for the temporary occupant." });
          if (!Number.isSafeInteger(guestDays) || guestDays < 0 || guestDays > days) {
            errors.push({ field: "guestDays", message: `Temporary occupant days must be a whole number from 0 through ${days}.` });
          }
          if (!Number.isFinite(guestWeight) || guestWeight < 0) {
            errors.push({ field: "guestWeight", message: "Temporary occupant usage weight must be zero or greater." });
          } else if (Number.isSafeInteger(guestDays) && !Number.isSafeInteger(guestDays * guestWeight)) {
            errors.push({ field: "guestWeight", message: "Temporary occupant days and usage weight are too large to calculate safely." });
          }
          if (guest.responsibility === "host" && !includedIds.includes(guest.hostId)) {
            errors.push({ field: "guestHost", message: "Choose an included roommate who is responsible for the temporary occupant." });
          }
        }
      }

      if ((expense.fixedSplitType || "equal") === "custom" && includedIds.length) {
        if (Number.isFinite(fixedCents)) {
          const shares = includedIds.map((id) => parseMoney((expense.fixedCustomShares || {})[id]));
          if (shares.some((share) => !Number.isFinite(share))) {
            errors.push({ field: "fixedCustomShares", message: "Enter a valid custom fixed amount for every included roommate." });
          } else if (shares.reduce((sum, share) => sum + share, 0) !== fixedCents) {
            errors.push({
              field: "fixedCustomShares",
              message: `Custom fixed shares must add up to ${formatMoney(fixedCents, "$")}.`,
            });
          }
        }
      }

      if (!errors.length && usageIsActive && usageParticipants(expense, includedIds).every((participant) => participant.units === 0)) {
        errors.push({
          field: "usage",
          message: "The usage portion is greater than zero, but all usage units are zero. Add days or a usage weight, or choose another method.",
        });
      }
    }

    return errors;
  }

  function deriveFixedCents(expense, amountCents) {
    if (expense.fixedInputType === "percent") {
      const scaled = parseScaledDecimal(expense.fixedPercent, WEIGHT_SCALE);
      if (!Number.isFinite(scaled)) return NaN;
      const denominator = BigInt(100 * WEIGHT_SCALE);
      const numerator = BigInt(amountCents) * BigInt(scaled);
      return Number((numerator + denominator / 2n) / denominator);
    }
    return parseMoney(expense.fixedAmount);
  }

  function usageParticipants(expense, includedIds) {
    const rows = includedIds.map((id) => {
      const detail = (expense.usageDetails || {})[id] || {};
      const weight = parseScaledDecimal(detail.weight, WEIGHT_SCALE);
      return {
        id,
        days: Number(detail.daysPresent),
        weightScaled: weight,
        units: Number(detail.daysPresent) * weight,
        kind: "roommate",
      };
    });
    const guest = expense.guest || {};
    if (guest.enabled) {
      const weight = parseScaledDecimal(guest.weight, WEIGHT_SCALE);
      rows.push({
        id: `guest:${expense.id}`,
        days: Number(guest.daysPresent),
        weightScaled: weight,
        units: Number(guest.daysPresent) * weight,
        kind: "guest",
      });
    }
    return rows;
  }

  function allocateExpense(expense, roommates) {
    const errors = validateExpense(expense, roommates);
    const amountCents = parseMoney(expense.amount);
    if (errors.length || !Number.isFinite(amountCents) || amountCents <= 0) return { errors, breakdown: null };

    const validIds = new Set(roommates.map((roommate) => roommate.id));
    const includedIds = expense.includedIds.filter((id) => validIds.has(id));
    const mode = expenseMode(expense);
    let responsibilityRows = [];
    let fixedRows = [];
    let usageRows = [];
    let fixedCents = 0;
    let usageCents = 0;
    let participants = [];
    let guestDetail = null;

    if (mode === "custom") {
      responsibilityRows = includedIds.map((id) => ({ id, cents: parseMoney(expense.customShares[id]), kind: "roommate" }));
    } else if (mode === "fixedUsage") {
      fixedCents = deriveFixedCents(expense, amountCents);
      usageCents = amountCents - fixedCents;
      if ((expense.fixedSplitType || "equal") === "custom") {
        fixedRows = includedIds.map((id) => ({ id, cents: parseMoney(expense.fixedCustomShares[id]), kind: "roommate" }));
      } else {
        fixedRows = allocateEqual(fixedCents, includedIds).map((row) => ({ ...row, kind: "roommate" }));
      }

      if (usageCents > 0) {
        participants = usageParticipants(expense, includedIds);
        usageRows = allocateWeighted(usageCents, participants).map((row) => {
          const participant = participants.find((item) => item.id === row.id);
          return { ...row, kind: participant.kind };
        });
      }

      const byId = new Map();
      fixedRows.forEach((row) => byId.set(row.id, (byId.get(row.id) || 0) + row.cents));
      usageRows.forEach((row) => byId.set(row.id, (byId.get(row.id) || 0) + row.cents));

      const guest = expense.guest || {};
      if (guest.enabled && usageCents > 0) {
        const guestId = `guest:${expense.id}`;
        const guestCents = byId.get(guestId) || 0;
        byId.delete(guestId);
        guestDetail = {
          id: guestId,
          name: String(guest.name || "").trim(),
          cents: guestCents,
          responsibility: guest.responsibility === "host" ? "host" : "direct",
          hostId: guest.responsibility === "host" ? guest.hostId : null,
          days: Number(guest.daysPresent),
          weightScaled: parseScaledDecimal(guest.weight, WEIGHT_SCALE),
        };
        if (guestDetail.responsibility === "host") {
          byId.set(guest.hostId, (byId.get(guest.hostId) || 0) + guestCents);
        } else {
          byId.set(guestId, guestCents);
        }
      }
      responsibilityRows = Array.from(byId, ([id, cents]) => ({
        id,
        cents,
        kind: id.startsWith("guest:") ? "guest" : "roommate",
      }));
    } else {
      responsibilityRows = allocateEqual(amountCents, includedIds).map((row) => ({ ...row, kind: "roommate" }));
    }

    return {
      errors: [],
      breakdown: {
        id: expense.id,
        name: String(expense.description || "").trim() || "Shared bill",
        category: expense.category || "Other",
        amountCents,
        paidBy: expense.paidBy,
        includedIds,
        mode,
        methodLabel: mode === "fixedUsage" ? "Fixed + usage" : mode === "custom" ? "Custom allocation" : "Simple split",
        fixedCents,
        usageCents,
        fixedRule: mode === "fixedUsage" ? ((expense.fixedSplitType || "equal") === "custom" ? "Custom amounts" : "Equal") : null,
        billingDays: mode === "fixedUsage" && usageCents > 0 ? Number(expense.billingDays) : null,
        participants,
        fixedRows,
        usageRows,
        responsibilityRows,
        guest: guestDetail,
      },
    };
  }

  function validateAdjustment(row, type, roommates) {
    const errors = [];
    const amountText = String(row.amount == null ? "" : row.amount).trim();
    const cents = parseMoney(row.amount);
    if (!amountText) return errors;
    if (!Number.isFinite(cents) || cents <= 0) {
      errors.push({
        field: "amount",
        message: "Enter an amount greater than zero with no more than two decimal places and within the supported range.",
      });
      return errors;
    }
    const validIds = new Set((roommates || []).map((roommate) => typeof roommate === "string" ? roommate : roommate.id));
    const fromId = type === "repayment" ? row.fromId : row.debtorId;
    const toId = type === "repayment" ? row.toId : row.creditorId;
    if (!validIds.has(fromId) || !validIds.has(toId)) {
      errors.push({ field: "participants", message: "Choose valid roommates." });
    } else if (fromId === toId) {
      errors.push({
        field: "participants",
        message: type === "repayment"
          ? "Choose two different roommates for a repayment."
          : "Choose two different roommates for a previous balance.",
      });
    }
    return errors;
  }

  function simplifySettlements(rows) {
    const creditors = rows
      .filter((row) => row.netCents > 0)
      .map((row) => ({ id: row.id, name: row.name, cents: row.netCents }))
      .sort((a, b) => b.cents - a.cents);
    const debtors = rows
      .filter((row) => row.netCents < 0)
      .map((row) => ({ id: row.id, name: row.name, cents: -row.netCents }))
      .sort((a, b) => a.cents - b.cents);
    const transfers = [];
    let creditorIndex = 0;

    for (const debtor of debtors) {
      while (debtor.cents > 0 && creditorIndex < creditors.length) {
        const creditor = creditors[creditorIndex];
        const cents = Math.min(debtor.cents, creditor.cents);
        if (cents > 0) transfers.push({ fromId: debtor.id, from: debtor.name, toId: creditor.id, to: creditor.name, cents });
        debtor.cents -= cents;
        creditor.cents -= cents;
        if (creditor.cents === 0) creditorIndex += 1;
      }
    }
    return transfers;
  }

  function calculate(state) {
    const roommates = (state.roommates || []).map((roommate, index) => ({
      id: roommate.id,
      name: String(roommate.name || "").trim() || `Roommate ${index + 1}`,
      kind: "roommate",
    }));
    const participantMap = new Map(roommates.map((roommate) => [roommate.id, {
      ...roommate,
      paidCents: 0,
      responsibilityCents: 0,
      repaymentSentCents: 0,
      repaymentReceivedCents: 0,
      previousOwedCents: 0,
      previousOwedToCents: 0,
      netCents: 0,
    }]));
    const errors = [];
    const bills = [];
    let totalBillsCents = 0;

    (state.expenses || []).forEach((expense) => {
      const allocation = allocateExpense(expense, roommates);
      if (allocation.errors.length) {
        if (String(expense.amount == null ? "" : expense.amount).trim()) {
          errors.push({ expenseId: expense.id, errors: allocation.errors });
        }
        return;
      }
      if (!allocation.breakdown) return;
      const bill = allocation.breakdown;
      bills.push(bill);
      totalBillsCents += bill.amountCents;
      const payer = participantMap.get(bill.paidBy);
      payer.paidCents += bill.amountCents;
      payer.netCents += bill.amountCents;

      if (bill.guest && bill.guest.responsibility === "direct" && !participantMap.has(bill.guest.id)) {
        participantMap.set(bill.guest.id, {
          id: bill.guest.id,
          name: bill.guest.name,
          kind: "guest",
          paidCents: 0,
          responsibilityCents: 0,
          repaymentSentCents: 0,
          repaymentReceivedCents: 0,
          previousOwedCents: 0,
          previousOwedToCents: 0,
          netCents: 0,
        });
      }
      bill.responsibilityRows.forEach((share) => {
        const participant = participantMap.get(share.id);
        participant.responsibilityCents += share.cents;
        participant.netCents -= share.cents;
      });
    });

    const adjustmentErrors = [];
    let repaymentTotalCents = 0;
    let repaymentCount = 0;
    (state.repayments || []).forEach((repayment) => {
      const rowErrors = validateAdjustment(repayment, "repayment", roommates);
      if (rowErrors.length) {
        adjustmentErrors.push({ type: "repayment", adjustmentId: repayment.id, errors: rowErrors });
        return;
      }
      if (!String(repayment.amount == null ? "" : repayment.amount).trim()) return;
      const cents = parseMoney(repayment.amount);
      const sender = participantMap.get(repayment.fromId);
      const receiver = participantMap.get(repayment.toId);
      sender.netCents += cents;
      receiver.netCents -= cents;
      sender.repaymentSentCents += cents;
      receiver.repaymentReceivedCents += cents;
      repaymentTotalCents += cents;
      repaymentCount += 1;
    });

    let previousBalanceTotalCents = 0;
    let previousBalanceCount = 0;
    (state.previousBalances || []).forEach((balance) => {
      const rowErrors = validateAdjustment(balance, "previous", roommates);
      if (rowErrors.length) {
        adjustmentErrors.push({ type: "previous", adjustmentId: balance.id, errors: rowErrors });
        return;
      }
      if (!String(balance.amount == null ? "" : balance.amount).trim()) return;
      const cents = parseMoney(balance.amount);
      const debtor = participantMap.get(balance.debtorId);
      const creditor = participantMap.get(balance.creditorId);
      debtor.netCents -= cents;
      creditor.netCents += cents;
      debtor.previousOwedCents += cents;
      creditor.previousOwedToCents += cents;
      previousBalanceTotalCents += cents;
      previousBalanceCount += 1;
    });

    const participants = Array.from(participantMap.values());
    return {
      billingPeriod: String(state.billingPeriod || "").trim(),
      currency: state.currency || "$",
      bills,
      participants,
      errors,
      adjustmentErrors,
      totalBillsCents,
      expenseCount: bills.length,
      roommateCount: roommates.length,
      repaymentCount,
      repaymentTotalCents,
      previousBalanceCount,
      previousBalanceTotalCents,
      categories: Array.from(new Set(bills.map((bill) => bill.category))),
      settlements: simplifySettlements(participants),
    };
  }

  function responsibilityName(result, id) {
    const participant = result.participants.find((row) => row.id === id);
    return participant ? participant.name : "Someone";
  }

  function buildCopySummary(result) {
    const money = (cents) => formatMoney(cents, result.currency);
    const lines = [
      "ROOMMATE SETTLE-UP SUMMARY",
      `Billing period: ${result.billingPeriod || "Not specified"}`,
      `Participants: ${result.participants.map((row) => row.name).join(", ") || "None"}`,
      "",
      "BILLS",
    ];

    if (!result.bills.length) lines.push("No valid bills entered.");
    result.bills.forEach((bill, index) => {
      lines.push(`${index + 1}. ${bill.name} — ${money(bill.amountCents)} — ${bill.methodLabel}`);
      if (bill.mode === "fixedUsage") {
        const split = `   Fixed: ${money(bill.fixedCents)} (${bill.fixedRule}); usage: ${money(bill.usageCents)}`;
        lines.push(bill.billingDays == null ? split : `${split}; billing period: ${bill.billingDays} days`);
        bill.participants.forEach((participant) => {
          const name = participant.kind === "guest" ? bill.guest.name : responsibilityName(result, participant.id);
          lines.push(`   ${name}: ${participant.days} days × ${(participant.weightScaled / WEIGHT_SCALE).toString()} weight = ${(participant.units / WEIGHT_SCALE).toString()} usage units`);
        });
        if (bill.guest) {
          lines.push(bill.guest.responsibility === "host"
            ? `   Temporary occupant ${bill.guest.name}: ${money(bill.guest.cents)} assigned to ${responsibilityName(result, bill.guest.hostId)}`
            : `   Temporary occupant ${bill.guest.name}: ${money(bill.guest.cents)} pays directly`);
        }
      }
      bill.responsibilityRows.forEach((row) => {
        lines.push(`   ${responsibilityName(result, row.id)} responsibility: ${money(row.cents)}`);
      });
    });

    lines.push("", "TOTALS");
    result.participants.forEach((row) => {
      const direction = row.netCents > 0
        ? `should receive ${money(row.netCents)}`
        : row.netCents < 0
          ? `should pay ${money(-row.netCents)}`
          : "is settled";
      const previousParts = [];
      if (row.previousOwedCents) previousParts.push(`owed ${money(row.previousOwedCents)}`);
      if (row.previousOwedToCents) previousParts.push(`was owed ${money(row.previousOwedToCents)}`);
      lines.push(`${row.name}: responsibility ${money(row.responsibilityCents)}; paid ${money(row.paidCents)}; repayments sent ${money(row.repaymentSentCents)}; repayments received ${money(row.repaymentReceivedCents)}; previous balance ${previousParts.length ? previousParts.join(", ") : money(0)}; ${direction}.`);
    });

    lines.push("", "SETTLE UP");
    if (!result.settlements.length) lines.push("Everyone is settled up.");
    result.settlements.forEach((transfer) => lines.push(`${transfer.from} pays ${transfer.to} ${money(transfer.cents)}.`));
    const modes = new Set(result.bills.map((bill) => bill.mode));
    const assumptions = [];
    if (modes.has("simple")) assumptions.push("Simple splits divide each bill equally among the roommates included in that bill.");
    if (modes.has("custom")) assumptions.push("Custom allocations use the exact amounts entered for the included roommates.");
    if (modes.has("fixedUsage")) {
      assumptions.push("Fixed portions use the bill's selected household rule.");
    }
    if (result.bills.some((bill) => bill.mode === "fixedUsage" && bill.usageCents > 0)) {
      assumptions.push("Usage portions use days present × agreed usage weight.");
      assumptions.push("Days and weights are agreed estimates, not meter readings or proof of exact consumption.");
    }
    assumptions.push("This estimate does not determine lease, contract, deposit, or legal responsibility.");
    lines.push("", "ASSUMPTIONS", ...assumptions);
    return lines.join("\n");
  }

  return {
    WEIGHT_SCALE,
    MAX_MONEY_CENTS,
    allocateEqual,
    allocateExpense,
    allocateWeighted,
    buildCopySummary,
    calculate,
    deriveFixedCents,
    expenseMode,
    formatMoney,
    parseMoney,
    parseScaledDecimal,
    simplifySettlements,
    validateAdjustment,
    validateExpense,
  };
});

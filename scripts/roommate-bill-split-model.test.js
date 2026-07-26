#!/usr/bin/env node

"use strict";

const assert = require("assert");
const model = require("./roommate-bill-split-model.js");

const roommates = [
  { id: "alex", name: "Alex" },
  { id: "maya", name: "Maya" },
  { id: "sam", name: "Sam" },
];

function bill(overrides = {}) {
  return {
    id: overrides.id || "bill-1",
    description: overrides.description || "Electricity",
    category: overrides.category || "Electricity",
    amount: Object.prototype.hasOwnProperty.call(overrides, "amount") ? overrides.amount : "90",
    paidBy: overrides.paidBy || "alex",
    includedIds: overrides.includedIds || ["alex", "maya", "sam"],
    mode: overrides.mode || "simple",
    splitType: overrides.splitType || "equal",
    customShares: overrides.customShares || {},
    fixedInputType: overrides.fixedInputType || "amount",
    fixedAmount: Object.prototype.hasOwnProperty.call(overrides, "fixedAmount") ? overrides.fixedAmount : "",
    fixedPercent: Object.prototype.hasOwnProperty.call(overrides, "fixedPercent") ? overrides.fixedPercent : "",
    fixedSplitType: overrides.fixedSplitType || "equal",
    fixedCustomShares: overrides.fixedCustomShares || {},
    billingDays: Object.prototype.hasOwnProperty.call(overrides, "billingDays") ? overrides.billingDays : "30",
    usageDetails: overrides.usageDetails || {
      alex: { daysPresent: "30", weight: "1" },
      maya: { daysPresent: "30", weight: "1" },
      sam: { daysPresent: "30", weight: "1" },
    },
    guest: overrides.guest || { enabled: false },
  };
}

function calculate(overrides = {}) {
  return model.calculate({
    currency: "$",
    billingPeriod: "July 2026",
    roommates,
    expenses: [bill()],
    repayments: [],
    previousBalances: [],
    ...overrides,
  });
}

function row(result, id) {
  const found = result.participants.find((participant) => participant.id === id);
  assert(found, `missing participant ${id}`);
  return found;
}

function assertReconciles(result) {
  result.bills.forEach((item) => {
    assert.strictEqual(
      item.responsibilityRows.reduce((sum, share) => sum + share.cents, 0),
      item.amountCents,
      `${item.name} responsibilities reconcile`
    );
  });
  assert.strictEqual(result.participants.reduce((sum, participant) => sum + participant.netCents, 0), 0, "net positions reconcile");

  const remaining = new Map(result.participants.map((participant) => [participant.id, participant.netCents]));
  result.settlements.forEach((transfer) => {
    remaining.set(transfer.fromId, remaining.get(transfer.fromId) + transfer.cents);
    remaining.set(transfer.toId, remaining.get(transfer.toId) - transfer.cents);
  });
  assert.deepStrictEqual(Array.from(remaining.values()), Array(remaining.size).fill(0), "settlements resolve every balance");
}

assert.strictEqual(model.parseMoney("1,200.50"), 120050, "money parser strips commas");
assert.strictEqual(model.parseMoney("0"), 0, "zero is valid");
assert.strictEqual(model.parseMoney(".50"), 50, "leading-zero shorthand remains valid");
assert(Number.isNaN(model.parseMoney("1.234")), "money parser rejects fractional cents");
assert(Number.isNaN(model.parseMoney(1.234)), "numeric money input also rejects fractional cents");
assert(Number.isNaN(model.parseMoney("-1")), "money parser rejects negatives");
assert(Number.isNaN(model.parseMoney("99999999999999.99")), "money parser rejects unsafe cent values");
assert.strictEqual(model.parseMoney("1000000000000.00"), model.MAX_MONEY_CENTS, "supported money ceiling remains valid");
assert(Number.isNaN(model.parseMoney("1000000000000.01")), "money parser preserves aggregate safe-integer headroom");
assert.strictEqual(
  model.formatMoney(9007199254740991, "$"),
  "$90,071,992,547,409.91",
  "money formatting preserves the final cent near the safe integer limit"
);
assert.deepStrictEqual(
  model.allocateEqual(2, ["a", "b", "c", "d"]).map((item) => item.cents),
  [1, 1, 0, 0],
  "tiny custom-share defaults never create a negative remainder"
);

{
  const participants = [
    { id: "a", units: 2733787806 },
    { id: "b", units: 1439451993 },
    { id: "c", units: 1500239576 },
  ];
  assert.deepStrictEqual(
    model.allocateWeighted(101420289523, participants).map((item) => item.cents),
    [48869755656, 25731941237, 26818592630],
    "weighted allocation remains exact when intermediate products exceed Number safe precision"
  );
}
assert.strictEqual(
  model.deriveFixedCents({ fixedInputType: "percent", fixedPercent: "33.3333" }, 9007199254740000),
  3002396749180248,
  "percentage-derived fixed cents remain exact near the safe money limit"
);

// Existing simple behavior: two roommates, several roommates, exclusions, custom amounts,
// several bills, repayments, previous balances, fractional currency, and transfers.
{
  const result = calculate({
    roommates: roommates.slice(0, 2),
    expenses: [bill({ amount: "100", includedIds: ["alex", "maya"] })],
  });
  assert.strictEqual(row(result, "alex").responsibilityCents, 5000);
  assert.strictEqual(row(result, "maya").netCents, -5000);
  assert.deepStrictEqual(result.settlements.map((item) => [item.from, item.to, item.cents]), [["Maya", "Alex", 5000]]);
  assertReconciles(result);
}

{
  const result = calculate();
  assert.deepStrictEqual(result.participants.map((item) => item.responsibilityCents), [3000, 3000, 3000]);
  assertReconciles(result);
}

{
  const result = calculate({ expenses: [bill({ includedIds: ["alex", "maya"] })] });
  assert.strictEqual(row(result, "sam").responsibilityCents, 0, "excluded roommate gets zero");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({
      mode: "custom",
      splitType: "custom",
      customShares: { alex: "10", maya: "30", sam: "50" },
    })],
  });
  assert.deepStrictEqual(result.participants.map((item) => item.responsibilityCents), [1000, 3000, 5000]);
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [
      bill({ id: "rent", description: "Rent", amount: "900", paidBy: "maya" }),
      bill({ id: "water", description: "Water", amount: "60", paidBy: "sam", includedIds: ["maya", "sam"] }),
    ],
    repayments: [{ fromId: "alex", toId: "maya", amount: "100" }],
    previousBalances: [{ debtorId: "sam", creditorId: "alex", amount: "25" }],
  });
  assert.strictEqual(result.expenseCount, 2);
  assert.strictEqual(row(result, "alex").repaymentSentCents, 10000);
  assert.strictEqual(row(result, "sam").previousOwedCents, 2500);
  assertReconciles(result);
}

{
  const result = calculate({
    repayments: [{ fromId: "maya", toId: "alex", amount: "10" }],
    previousBalances: [{ debtorId: "sam", creditorId: "maya", amount: "5" }],
  });
  assert.deepStrictEqual(result.participants.map((item) => item.netCents), [5000, -1500, -3500], "repayment and previous balance apply once after bills");
  assertReconciles(result);
}

{
  const invalidRepayment = { id: "repayment-1", fromId: "maya", toId: "alex", amount: "1.234" };
  const errors = model.validateAdjustment(invalidRepayment, "repayment", roommates);
  assert(errors.some((error) => error.field === "amount"), "fractional-cent repayment is reported");

  const result = calculate({ repayments: [invalidRepayment] });
  assert.strictEqual(result.repaymentCount, 0, "invalid repayment is not applied");
  assert.strictEqual(result.adjustmentErrors.length, 1, "invalid repayment remains visible to model consumers");
  assert.strictEqual(result.adjustmentErrors[0].adjustmentId, "repayment-1");
  assertReconciles(result);
}

{
  const invalidBalance = { id: "previous-1", debtorId: "sam", creditorId: "sam", amount: "4.00" };
  const errors = model.validateAdjustment(invalidBalance, "previous", roommates);
  assert(errors.some((error) => error.field === "participants"), "same-person previous balance is reported");

  const result = calculate({ previousBalances: [invalidBalance] });
  assert.strictEqual(result.previousBalanceCount, 0, "invalid previous balance is not applied");
  assert.strictEqual(result.adjustmentErrors.length, 1, "invalid previous balance remains visible to model consumers");
  assertReconciles(result);
}

{
  const result = calculate({
    roommates: roommates.slice(0, 2),
    expenses: [bill({ amount: "10.01", includedIds: ["alex", "maya"] })],
  });
  assert.deepStrictEqual(result.bills[0].responsibilityRows.map((item) => item.cents), [501, 500], "remainder cent is deterministic");
  assertReconciles(result);
}

// Fixed + usage: amount/percentage, fixed-only, usage-only, mixed, days, weights,
// exclusions, custom base allocation, and validation boundaries.
{
  const result = calculate({
    expenses: [bill({ mode: "fixedUsage", fixedAmount: "90" })],
  });
  assert.strictEqual(result.bills[0].usageCents, 0, "fixed-only bill");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({ mode: "fixedUsage", fixedAmount: "0" })],
  });
  assert.strictEqual(result.bills[0].fixedCents, 0, "zero fixed amount is valid");
  assert.deepStrictEqual(result.bills[0].usageRows.map((item) => item.cents), [3000, 3000, 3000]);
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({ mode: "fixedUsage", fixedAmount: "30" })],
  });
  assert.strictEqual(result.bills[0].fixedCents, 3000);
  assert.strictEqual(result.bills[0].usageCents, 6000);
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({ mode: "fixedUsage", fixedInputType: "percent", fixedPercent: "25" })],
  });
  assert.strictEqual(result.bills[0].fixedCents, 2250, "percentage derives exact fixed amount");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({ mode: "fixedUsage", fixedInputType: "percent", fixedPercent: "100" })],
  });
  assert.strictEqual(result.bills[0].fixedCents, 9000, "100 percent fixed is valid");
  assert.strictEqual(result.bills[0].usageCents, 0);
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      fixedAmount: "30",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "15", weight: "1" },
        sam: { daysPresent: "0", weight: "1" },
      },
    })],
  });
  assert.deepStrictEqual(result.bills[0].usageRows.map((item) => item.cents), [4000, 2000, 0], "days present prorate usage");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      fixedAmount: "30",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1.5" },
        maya: { daysPresent: "30", weight: "0.5" },
        sam: { daysPresent: "30", weight: "0" },
      },
    })],
  });
  assert.deepStrictEqual(result.bills[0].usageRows.map((item) => item.cents), [4500, 1500, 0], "decimal and zero weights work");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      amount: "100",
      includedIds: ["alex", "maya"],
      fixedAmount: "40",
      fixedSplitType: "custom",
      fixedCustomShares: { alex: "10", maya: "30" },
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "30", weight: "1" },
        sam: { daysPresent: "30", weight: "9" },
      },
    })],
  });
  assert.deepStrictEqual(result.bills[0].responsibilityRows.map((item) => item.cents), [4000, 6000], "custom fixed base plus usage");
  assert.strictEqual(row(result, "sam").responsibilityCents, 0, "excluded roommate stays excluded");
  assertReconciles(result);
}

[
  ["fixed amount above total", bill({ mode: "fixedUsage", fixedAmount: "91" }), "fixed amount"],
  ["percentage below zero", bill({ mode: "fixedUsage", fixedInputType: "percent", fixedPercent: "-1" }), "percentage"],
  ["percentage above 100", bill({ mode: "fixedUsage", fixedInputType: "percent", fixedPercent: "101" }), "percentage"],
  ["days above period", bill({ mode: "fixedUsage", fixedAmount: "30", usageDetails: { alex: { daysPresent: "31", weight: "1" }, maya: { daysPresent: "30", weight: "1" }, sam: { daysPresent: "30", weight: "1" } } }), "days"],
  ["negative days", bill({ mode: "fixedUsage", fixedAmount: "30", usageDetails: { alex: { daysPresent: "-1", weight: "1" }, maya: { daysPresent: "30", weight: "1" }, sam: { daysPresent: "30", weight: "1" } } }), "days"],
  ["invalid billing period", bill({ mode: "fixedUsage", fixedAmount: "30", billingDays: "0" }), "Billing-period"],
].forEach(([name, expense, message]) => {
  const errors = model.validateExpense(expense, roommates);
  assert(errors.some((error) => error.message.includes(message)), name);
});

{
  const errors = model.validateExpense(bill({
    mode: "fixedUsage",
    fixedAmount: "0",
    usageDetails: {
      alex: { daysPresent: "0", weight: "1" },
      maya: { daysPresent: "0", weight: "0" },
      sam: { daysPresent: "0", weight: "1" },
    },
  }), roommates);
  assert(errors.some((error) => error.message.includes("all usage units are zero")), "positive usage with zero units is blocked");
}

{
  const errors = model.validateExpense(bill({
    mode: "fixedUsage",
    fixedAmount: "90",
    usageDetails: {
      alex: { daysPresent: "0", weight: "0" },
      maya: { daysPresent: "0", weight: "0" },
      sam: { daysPresent: "0", weight: "0" },
    },
  }), roommates);
  assert.strictEqual(errors.length, 0, "zero usage portion ignores zero usage units");
}

{
  const expense = bill({
    mode: "fixedUsage",
    fixedInputType: "percent",
    fixedPercent: "100",
    billingDays: "",
    usageDetails: {
      alex: { daysPresent: "", weight: "" },
      maya: { daysPresent: "-1", weight: "invalid" },
      sam: { daysPresent: "999", weight: "999999999999999" },
    },
    guest: {
      enabled: true,
      name: "",
      daysPresent: "invalid",
      weight: "invalid",
      responsibility: "host",
      hostId: "missing",
    },
  });
  const result = calculate({ expenses: [expense] });
  assert.strictEqual(result.errors.length, 0, "inactive usage and guest values are inert for a 100%-fixed bill");
  assert.strictEqual(result.bills[0].billingDays, null);
  assert.strictEqual(result.bills[0].participants.length, 0);
  assert.strictEqual(result.bills[0].guest, null);
  assert.deepStrictEqual(result.bills[0].responsibilityRows.map((item) => item.cents), [3000, 3000, 3000]);
  const summary = model.buildCopySummary(result);
  assert(!summary.includes("billing period:"));
  assert(!summary.includes("days ×"));
  assert(!summary.includes("Temporary occupant"));
  assertReconciles(result);
}

// Temporary occupant: direct responsibility, host assignment, zero usage, removal,
// and isolation from unrelated bills and adjustments.
{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      amount: "120",
      fixedAmount: "0",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "30", weight: "1" },
        sam: { daysPresent: "30", weight: "1" },
      },
      guest: { enabled: true, name: "Lee", daysPresent: "30", weight: "1", responsibility: "direct" },
    })],
  });
  assert.strictEqual(row(result, "guest:bill-1").responsibilityCents, 3000, "guest pays directly");
  assert(result.bills[0].guest, "guest calculation remains visible");
  assertReconciles(result);
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      amount: "120",
      fixedAmount: "0",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "30", weight: "1" },
        sam: { daysPresent: "30", weight: "1" },
      },
      guest: { enabled: true, name: "Lee", daysPresent: "30", weight: "1", responsibility: "host", hostId: "maya" },
    })],
  });
  assert.strictEqual(row(result, "maya").responsibilityCents, 6000, "host receives guest share once");
  assert(!result.participants.some((item) => item.kind === "guest"), "host-assigned guest has no direct net row");
  assert.strictEqual(result.bills[0].guest.cents, 3000, "guest amount remains visible");
  assertReconciles(result);
}

{
  const advanced = bill({
    id: "guest-bill",
    mode: "fixedUsage",
    amount: "100",
    fixedAmount: "0",
    guest: { enabled: true, name: "Lee", daysPresent: "0", weight: "2", responsibility: "direct" },
  });
  const unrelated = bill({ id: "rent", description: "Rent", amount: "300" });
  const result = calculate({ expenses: [advanced, unrelated] });
  assert.strictEqual(row(result, "guest:guest-bill").responsibilityCents, 0, "zero-day guest has zero usage responsibility");
  assert(!result.bills[1].responsibilityRows.some((item) => item.kind === "guest"), "guest excluded from unrelated bill");
  assertReconciles(result);
}

{
  const expense = bill({
    mode: "fixedUsage",
    amount: "120",
    fixedAmount: "0",
    guest: { enabled: true, name: "Lee", daysPresent: "30", weight: "1", responsibility: "direct" },
  });
  const withGuest = calculate({ expenses: [expense] });
  assert(withGuest.settlements.some((item) => item.fromId === "guest:bill-1" && item.toId === "alex" && item.cents === 3000), "direct guest settles coherently with the bill payer");

  expense.guest.enabled = false;
  const withoutGuest = calculate({ expenses: [expense] });
  assert(!withoutGuest.participants.some((item) => item.kind === "guest"), "removing the guest clears the guest participant");
  assert.deepStrictEqual(withoutGuest.bills[0].responsibilityRows.map((item) => item.cents), [4000, 4000, 4000], "removed guest share returns to included roommates");
  assertReconciles(withGuest);
  assertReconciles(withoutGuest);
}

{
  const result = calculate({
    roommates: roommates.slice(0, 2),
    expenses: [bill({
      mode: "fixedUsage",
      includedIds: ["alex", "maya", "sam"],
      fixedAmount: "30",
      guest: { enabled: true, name: "Lee", daysPresent: "10", weight: "1", responsibility: "host", hostId: "sam" },
    })],
  });
  assert(result.errors[0].errors.some((error) => error.field === "guestHost"), "a removed host is rejected instead of losing or double-assigning the guest share");
  assert.strictEqual(result.bills.length, 0);
}

{
  const simple = bill({
    mode: "simple",
    fixedAmount: "80",
    usageDetails: {
      alex: { daysPresent: "0", weight: "0" },
      maya: { daysPresent: "0", weight: "0" },
      sam: { daysPresent: "0", weight: "0" },
    },
    guest: { enabled: true, name: "Lee", daysPresent: "30", weight: "10", responsibility: "direct" },
  });
  const result = calculate({ expenses: [simple] });
  assert.strictEqual(result.participants.length, 3, "hidden guest and advanced values are inert in simple mode");
  assert.deepStrictEqual(result.bills[0].responsibilityRows.map((item) => item.cents), [3000, 3000, 3000]);
  assertReconciles(result);
}

{
  const custom = bill({
    mode: "custom",
    splitType: "custom",
    customShares: { alex: "10", maya: "30", sam: "50" },
    fixedAmount: "1",
    billingDays: "1",
    usageDetails: {
      alex: { daysPresent: "0", weight: "0" },
      maya: { daysPresent: "0", weight: "0" },
      sam: { daysPresent: "0", weight: "0" },
    },
    guest: { enabled: true, name: "Lee", daysPresent: "1", weight: "999", responsibility: "direct" },
  });
  const result = calculate({ expenses: [custom] });
  assert.strictEqual(result.participants.length, 3, "fixed, usage, and guest state is inert in custom mode");
  assert.deepStrictEqual(result.bills[0].responsibilityRows.map((item) => item.cents), [1000, 3000, 5000]);
  assertReconciles(result);
}

// Mixed modes, fractional remainder invariants, and deterministic copy output.
{
  const result = calculate({
    expenses: [
      bill({ id: "simple", amount: "10.01" }),
      bill({
        id: "advanced",
        amount: "25.03",
        mode: "fixedUsage",
        fixedInputType: "percent",
        fixedPercent: "33.3",
        usageDetails: {
          alex: { daysPresent: "30", weight: "1" },
          maya: { daysPresent: "17", weight: "1.25" },
          sam: { daysPresent: "2", weight: "0.5" },
        },
        guest: { enabled: true, name: "Lee", daysPresent: "11", weight: "0.8", responsibility: "host", hostId: "sam" },
      }),
      bill({
        id: "custom",
        amount: "9.99",
        mode: "custom",
        customShares: { alex: "3.33", maya: "3.33", sam: "3.33" },
      }),
    ],
    repayments: [{ fromId: "maya", toId: "alex", amount: "1.11" }],
    previousBalances: [{ debtorId: "sam", creditorId: "maya", amount: "2.22" }],
  });
  assert.strictEqual(result.errors.length, 0);
  assertReconciles(result);
}

{
  const result = calculate({
    roommates: roommates.slice(0, 2),
    expenses: [bill({
      description: "Electricity",
      includedIds: ["alex", "maya"],
      mode: "fixedUsage",
      fixedAmount: "30",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "15", weight: "1.5" },
      },
      guest: { enabled: true, name: "Lee", daysPresent: "10", weight: "1", responsibility: "host", hostId: "alex" },
    })],
    repayments: [{ fromId: "maya", toId: "alex", amount: "5" }],
    previousBalances: [{ debtorId: "maya", creditorId: "alex", amount: "2" }],
  });
  const summary = model.buildCopySummary(result);
  assert(summary.includes("Billing period: July 2026"));
  assert(summary.includes("Electricity — $90.00 — Fixed + usage"));
  assert(summary.includes("Temporary occupant Lee:"));
  assert(summary.includes("assigned to Alex"));
  assert(summary.includes("repayments sent"));
  assert(summary.includes("previous balance"));
  assert(summary.includes("Days and weights are agreed estimates"));
  assert.strictEqual(summary, model.buildCopySummary(result), "copy summary is deterministic");
}

{
  const result = calculate();
  const summary = model.buildCopySummary(result);
  assert(summary.includes("Electricity — $90.00 — Simple split"), "ordinary equal summary names the simple method");
  assert(!summary.includes("billing period: 30 days"), "ordinary summary omits inactive advanced values");
  assert(summary.includes("Simple splits divide each bill equally"), "ordinary summary includes only its active formula");
  assert(!summary.includes("Fixed portions"), "ordinary summary omits inactive fixed assumptions");
  assert(!summary.includes("Days and weights"), "ordinary summary omits inactive usage assumptions");
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      fixedAmount: "30",
      usageDetails: {
        alex: { daysPresent: "30", weight: "1" },
        maya: { daysPresent: "15", weight: "1" },
        sam: { daysPresent: "0", weight: "1" },
      },
    })],
  });
  const summary = model.buildCopySummary(result);
  assert(summary.includes("Maya: 15 days × 1 weight = 15 usage units"), "away summary includes days and weight");
  assert(summary.includes("Sam: 0 days × 1 weight = 0 usage units"), "away summary includes zero-day roommate");
}

{
  const result = calculate({
    expenses: [bill({
      mode: "fixedUsage",
      amount: "120",
      fixedAmount: "0",
      guest: { enabled: true, name: "Lee", daysPresent: "15", weight: "1", responsibility: "direct" },
    })],
  });
  const summary = model.buildCopySummary(result);
  assert(summary.includes("Temporary occupant Lee:"), "direct guest summary keeps guest visible");
  assert(summary.includes("pays directly"), "direct guest summary states responsibility outcome");
  assert(summary.includes("Lee responsibility:"), "direct guest total remains in summary");
}

console.log("roommate-bill-split-model tests passed");

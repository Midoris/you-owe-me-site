#!/usr/bin/env node

"use strict";

const assert = require("assert");
const tracker = require("./personal-loan-payment-tracker.js");

const cents = (amount) => Math.round(amount * 100);
const activity = (id, type, date, amount, order) => ({ id, type, date, amountCents: cents(amount), note: "", order });
const calculate = (state, asOfDate = "2026-09-02") => tracker.calculateTracker(Object.assign({
  perspective: "lent",
  currency: "$",
  inProgress: false,
  paidBeforeCents: 0,
  activities: [],
}, state), { asOfDate });

assert.strictEqual(tracker.parseMoney("1,200.50"), 120050, "parses a two-decimal amount into minor units");
assert(Number.isNaN(tracker.parseMoney("10.999")), "does not round a third decimal silently");

let result = calculate({ startBalanceCents: cents(500), planEnabled: false, activities: [activity("a", "payment", "2026-08-01", 125, 0)] });
assert.strictEqual(result.remainingBalanceCents, cents(375), "fixture A remaining");
assert.strictEqual(result.paidSinceCents, cents(125), "fixture A paid");
assert.strictEqual(result.planStatus, "No regular plan", "fixture A status");
assert.strictEqual(result.schedule.length, 0, "fixture A no schedule");
assert.strictEqual(result.nextInstallment, null, "fixture A no next payment");
assert.strictEqual(result.projectedPayoffDate, null, "fixture A no payoff");

const core = {
  startBalanceCents: cents(1200), planEnabled: true, regularPaymentCents: cents(200), frequency: "monthly", firstDueDate: "2026-08-01",
  activities: [activity("first", "payment", "2026-08-01", 150, 0), activity("second", "payment", "2026-09-01", 300, 1)],
};
result = calculate(core, "2026-09-02");
assert.strictEqual(result.remainingBalanceCents, cents(750), "fixture B remaining");
assert.strictEqual(result.paidSinceCents, cents(450), "fixture B paid");
assert.deepStrictEqual(result.schedule.slice(0, 3).map((row) => row.appliedCents), [cents(200), cents(200), cents(50)], "fixture B allocations");
assert.strictEqual(result.nextInstallment.dueDate, "2026-10-01", "fixture B next date");
assert.strictEqual(result.nextInstallment.plannedCents - result.nextInstallment.appliedCents, cents(150), "fixture B next amount");
assert.strictEqual(result.planStatus, "Ahead of plan", "fixture B ahead");
assert.strictEqual(result.projectedPayoffDate, "2027-01-01", "fixture B payoff");
result = calculate(Object.assign({}, core, { activities: core.activities.concat(activity("borrow", "borrowing", "2026-09-15", 100, 2)) }), "2026-09-16");
assert.strictEqual(result.remainingBalanceCents, cents(850), "fixture B borrowing remaining");
assert.deepStrictEqual(result.schedule.slice(0, 3).map((row) => row.appliedCents), [cents(200), cents(200), cents(50)], "fixture B history remains allocated");
assert.strictEqual(result.projectedPayoffDate, "2027-02-01", "fixture B borrowing payoff");

result = calculate({ startBalanceCents: cents(600), planEnabled: true, regularPaymentCents: cents(200), frequency: "monthly", firstDueDate: "2026-08-01", activities: [activity("large", "payment", "2026-08-01", 450, 0)] }, "2026-08-02");
assert.deepStrictEqual(result.schedule.map((row) => row.appliedCents), [cents(200), cents(200), cents(50)], "fixture C allocations");
assert.strictEqual(result.remainingBalanceCents, cents(150), "fixture C remaining");
assert.strictEqual(result.nextInstallment.dueDate, "2026-10-01", "fixture C next date");
assert.strictEqual(result.planStatus, "Ahead of plan", "fixture C ahead");

result = calculate({ startBalanceCents: cents(200), planEnabled: true, regularPaymentCents: cents(200), frequency: "monthly", firstDueDate: "2026-08-01", activities: [activity("pay", "payment", "2026-08-01", 200, 0), activity("more", "borrowing", "2026-09-10", 100, 1)] }, "2026-09-16");
assert.strictEqual(result.schedule[0].status, "Paid", "fixture D original remains paid");
assert.strictEqual(result.remainingBalanceCents, cents(100), "fixture D remaining");
assert.strictEqual(result.nextInstallment.dueDate, "2026-10-01", "fixture D new due date");
assert.strictEqual(result.projectedPayoffDate, "2026-10-01", "fixture D payoff");

result = calculate({ startBalanceCents: cents(100), planEnabled: false, activities: [activity("over", "payment", "2026-08-01", 120, 0)] });
assert.strictEqual(result.remainingBalanceCents, 0, "fixture E displayed remaining");
assert.strictEqual(result.overpaymentCents, cents(20), "fixture E excess");
assert.strictEqual(result.planStatus, "Check recorded amounts", "fixture E status");

result = calculate({ startBalanceCents: cents(700), paidBeforeCents: cents(500), inProgress: true, planEnabled: false, activities: [activity("after", "payment", "2026-08-01", 100, 0)] });
assert.strictEqual(result.remainingBalanceCents, cents(600), "fixture F remaining");
assert.strictEqual(result.paidSinceCents, cents(100), "fixture F paid since");
assert.strictEqual(result.paidBeforeCents, cents(500), "fixture F historical context");

result = calculate({ startBalanceCents: cents(100), planEnabled: true, regularPaymentCents: cents(33.33), frequency: "monthly", firstDueDate: "2026-01-01" }, "2025-12-01");
assert.deepStrictEqual(result.schedule.map((row) => row.plannedCents), [3333, 3333, 3333, 1], "fixture G no cumulative loss");

assert.deepStrictEqual([0, 1, 2, 3, 4].map((index) => tracker.addFrequencyFromAnchor("2026-01-31", "monthly", index)), ["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31"], "fixture H month-end dates");
const statusState = { startBalanceCents: cents(200), planEnabled: true, regularPaymentCents: cents(200), frequency: "monthly", firstDueDate: "2026-08-01" };
assert.strictEqual(calculate(statusState, "2026-07-31").planStatus, "On track", "fixture I on track");
assert.strictEqual(calculate(statusState, "2026-08-01").planStatus, "Due today", "fixture I due today");
assert.strictEqual(calculate(statusState, "2026-08-02").planStatus, "Overdue", "fixture I overdue");

const edited = Object.assign({}, core, { activities: [activity("first", "payment", "2026-08-01", 100, 0), core.activities[1]] });
assert.strictEqual(calculate(edited, "2026-09-02").remainingBalanceCents, cents(800), "fixture J edit recalculates");
assert.strictEqual(calculate(Object.assign({}, edited, { activities: [edited.activities[0]] }), "2026-09-02").remainingBalanceCents, cents(1100), "fixture J delete recalculates");

result = calculate({ startBalanceCents: cents(500), planEnabled: false, activities: [activity("first", "payment", "2026-08-01", 100, 0), activity("second", "borrowing", "2026-08-01", 50, 1)] });
assert.deepStrictEqual(result.history.map((row) => row.balanceAfterCents), [cents(400), cents(450)], "fixture K same-day creation order");

console.log("personal-loan-payment-tracker tests passed");

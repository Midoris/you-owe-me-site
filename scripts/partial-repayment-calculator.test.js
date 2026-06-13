#!/usr/bin/env node

"use strict";

const assert = require("assert");
const calculator = require("./partial-repayment-calculator.js");

function cents(amount) {
  return Math.round(amount * 100);
}

function runCase(name, state, expected) {
  const result = calculator.calculatePartialRepayment({
    currency: "$",
    purpose: "rent and groceries",
    repayingPerson: "Alex",
    receivingPerson: "Maya",
    perspective: "received",
    originalAmountCents: cents(state.original || 0),
    startingRepaidCents: cents(state.startingAlreadyRepaid || 0),
    adjustmentAddedCents: cents(state.added || 0),
    adjustmentWaivedCents: cents(state.waived || 0),
    repayments: (state.repayments || []).map((amount) => ({
      amountCents: cents(amount),
      note: "",
      date: "",
    })),
  });

  if (Object.prototype.hasOwnProperty.call(expected, "totalRepaid")) {
    assert.strictEqual(result.totalRepaidCents, cents(expected.totalRepaid), name + " total repaid");
  }

  if (Object.prototype.hasOwnProperty.call(expected, "remaining")) {
    assert.strictEqual(result.amountStillOpenCents, cents(expected.remaining), name + " remaining");
  }

  if (Object.prototype.hasOwnProperty.call(expected, "overpayment")) {
    assert.strictEqual(result.overpaymentCents, cents(expected.overpayment), name + " overpayment");
  }

  if (Object.prototype.hasOwnProperty.call(expected, "repayable")) {
    assert.strictEqual(result.repayableCents, cents(expected.repayable), name + " repayable amount");
  }

  assert.strictEqual(result.status, expected.status, name + " status");
}

assert.strictEqual(calculator.parseMoney("1,200.50"), 120050, "parse strips commas");
assert.strictEqual(calculator.parseMoney(" 75.25 "), 7525, "parse strips spaces");
assert(Number.isNaN(calculator.parseMoney("-10")), "parse rejects negative values");

runCase("case 1", {
  original: 720,
  repayments: [200, 150, 100],
}, {
  totalRepaid: 450,
  remaining: 270,
  status: "Partially repaid",
});

runCase("case 2", {
  original: 200,
  repayments: [120],
}, {
  remaining: 80,
  status: "Partially repaid",
});

runCase("case 3", {
  original: 75,
  repayments: [75],
}, {
  remaining: 0,
  status: "Fully repaid",
});

runCase("case 4", {
  original: 75,
  repayments: [100],
}, {
  remaining: 0,
  overpayment: 25,
  status: "Overpaid",
});

runCase("case 5", {
  original: 720,
  startingAlreadyRepaid: 200,
  repayments: [150],
}, {
  totalRepaid: 350,
  remaining: 370,
  status: "Partially repaid",
});

runCase("case 6", {
  original: 720,
  added: 30,
  waived: 50,
  repayments: [200],
}, {
  repayable: 700,
  remaining: 500,
  status: "Partially repaid",
});

runCase("case 7", {
  original: 100,
  waived: 150,
  repayments: [],
}, {
  repayable: 0,
  remaining: 0,
  status: "Nothing to repay",
});

assert(Number.isNaN(calculator.parseMoney("not a number")), "invalid original parses as invalid");

console.log("partial-repayment-calculator tests passed");

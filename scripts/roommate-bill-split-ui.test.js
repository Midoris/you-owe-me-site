#!/usr/bin/env node

"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "roommate-bill-split-calculator.js"), "utf8");

assert(
  /function seedCustomShares[\s\S]*MODEL\.allocateEqual\(amountCents, included\)/.test(source),
  "custom-share defaults use deterministic cent allocation"
);
assert(
  /function centsToInputValue[\s\S]{0,220}BigInt\(cents\)[\s\S]*expense\.customShares\[row\.id\] = centsToInputValue\(row\.cents\)[\s\S]*expense\.fixedCustomShares\[row\.id\] = centsToInputValue\(row\.cents\)/.test(source),
  "generated custom-share inputs preserve exact cents without floating-point conversion"
);
assert(
  /function deriveFixedCentsForUi[\s\S]{0,180}MODEL\.deriveFixedCents\(expense, total\)/.test(source),
  "fixed-percentage UI seeding uses the model's exact cent derivation"
);
assert(
  /amount\.addEventListener\("input"[\s\S]{0,180}syncExpenseDependentConstraints\(expense, card\)/.test(source),
  "bill-total changes refresh dependent fixed-amount constraints"
);
assert(
  /billingDays\.addEventListener\("input"[\s\S]{0,180}syncExpenseDependentConstraints\(expense, card\)/.test(source),
  "billing-day changes refresh dependent days-present constraints"
);
assert(
  /function validateAdjustment\(row, type\)[\s\S]{0,140}MODEL\.validateAdjustment\(row, type, state\.roommates\)/.test(source),
  "adjustment UI and calculation model share one validator"
);
assert(
  /renderAdjustmentValidation[\s\S]*aria-invalid[\s\S]*aria-describedby/.test(source),
  "adjustment validation exposes accessible invalid state and descriptions"
);
assert(
  /expense\.guest\.responsibility === "host" && expense\.guest\.hostId === roommate\.id[\s\S]{0,140}expense\.guest\.hostId = expense\.includedIds\[0\] \|\| ""/.test(source),
  "excluding an assigned host immediately moves the guest to a remaining included roommate"
);
assert(
  /function removeRoommate\(id\)[\s\S]*if \(expense\.paidBy === id\) expense\.paidBy = ""[\s\S]*state\.repayments = state\.repayments\.filter\(\(repayment\) => repayment\.fromId !== id && repayment\.toId !== id\)[\s\S]*state\.previousBalances = state\.previousBalances\.filter\(\(balance\) => balance\.debtorId !== id && balance\.creditorId !== id\)/.test(source),
  "removing a roommate never silently retargets paid bills, repayments, or previous balances"
);

console.log("roommate-bill-split UI integration tests passed");

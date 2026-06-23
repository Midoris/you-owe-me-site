#!/usr/bin/env node

"use strict";

const assert = require("assert");
const calculator = require("./group-payback-calculator.js");

function cents(amount) {
  return Math.round(amount * 100);
}

function person(name, options = {}) {
  return {
    id: options.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    isPayer: Boolean(options.isPayer),
    customShareCents: cents(options.customShare || 0),
    paidBackCents: cents(options.paidBack || 0),
    shareInvalid: Boolean(options.shareInvalid),
    paidBackInvalid: Boolean(options.paidBackInvalid),
  };
}

function calculate(overrides) {
  return calculator.calculateFromState({
    currency: "$",
    reason: "cabin deposit",
    totalCents: cents(360),
    splitMode: "equal",
    payerIncluded: true,
    payerName: "You",
    people: [
      person("You", { isPayer: true }),
      person("Alex", { paidBack: 60 }),
      person("Maya", { paidBack: 60 }),
      person("Leo", { paidBack: 30 }),
      person("Sam"),
      person("Nina"),
    ],
    ...overrides,
  });
}

function row(calc, name) {
  const found = calc.rows.find((item) => item.name === name);
  assert(found, `missing row for ${name}`);
  return found;
}

assert.strictEqual(calculator.parseAmount("1,200.50"), 120050, "parse strips commas");
assert.strictEqual(calculator.parseAmount(" 75.25 "), 7525, "parse strips spaces");
assert(Number.isNaN(calculator.parseAmount("-10")), "parse rejects negative values");
assert(Number.isNaN(calculator.parseAmount("10abc")), "parse rejects mixed text");

{
  const calc = calculate();

  assert.strictEqual(calc.totalCents, cents(360), "example total");
  assert.strictEqual(calc.payerOwnShareCents, cents(60), "payer own share");
  assert.strictEqual(calc.expectedBackCents, cents(300), "expected back excludes payer share");
  assert.strictEqual(calc.paidBackCents, cents(150), "paid back total");
  assert.strictEqual(calc.stillOpenCents, cents(150), "still open total");
  assert.strictEqual(calc.paidRows.length, 2, "paid count");
  assert.strictEqual(calc.partialRows.length, 1, "partial count");
  assert.strictEqual(calc.openRows.length, 2, "open count");
  assert.strictEqual(row(calc, "Leo").statusKey, "partial", "Leo is partial");
  assert.strictEqual(row(calc, "Leo").stillOpenCents, cents(30), "Leo open amount");
  assert.strictEqual(row(calc, "Sam").statusKey, "open", "Sam open");
  assert.strictEqual(row(calc, "You").statusKey, "covered", "payer covered own share");

  const update = calculator.buildGroupUpdate(calc);
  assert(update.includes("Total still open: $150.00."), "group update includes open total");
  assert(update.includes("Leo has $30.00 still open"), "group update names partial row");
  assert(update.includes("Sam and Nina each have $60.00 still open"), "group update groups same open amount");
}

{
  const calc = calculate({
    totalCents: cents(100),
    people: [
      person("You", { isPayer: true }),
      person("Alex", { paidBack: 33.34 }),
      person("Maya", { paidBack: 33.33 }),
    ],
  });

  assert.deepStrictEqual(calc.rows.map((item) => item.shareCents), [3334, 3333, 3333], "equal split distributes remainder cents");
  assert.strictEqual(calc.stillOpenCents, 0, "cent-remainder example settles cleanly");
  assert(calc.warnings.some((message) => message.includes("Small cent differences")), "cent remainder warning");
}

{
  const calc = calculate({
    payerIncluded: false,
    totalCents: cents(300),
    people: [
      person("You", { isPayer: true }),
      person("Alex", { paidBack: 150 }),
      person("Maya"),
    ],
  });

  assert.strictEqual(calc.payerOwnShareCents, 0, "payer not included has no own share");
  assert.strictEqual(row(calc, "You").shareCents, 0, "payer row not included in split");
  assert.strictEqual(row(calc, "Alex").shareCents, cents(150), "non-payer equal share");
  assert.strictEqual(row(calc, "Maya").shareCents, cents(150), "other non-payer equal share");
  assert.strictEqual(calc.expectedBackCents, cents(300), "expected back is full total when payer paid on behalf only");
  assert.strictEqual(calc.stillOpenCents, cents(150), "remaining excludes paid person");
}

{
  const calc = calculate({
    splitMode: "custom",
    totalCents: cents(220),
    people: [
      person("You", { isPayer: true, customShare: 40 }),
      person("Alex", { customShare: 80, paidBack: 80 }),
      person("Maya", { customShare: 100, paidBack: 25 }),
    ],
  });

  assert.strictEqual(calc.payerOwnShareCents, cents(40), "custom payer share");
  assert.strictEqual(calc.expectedBackCents, cents(180), "custom expected back");
  assert.strictEqual(calc.paidBackCents, cents(105), "custom paid back");
  assert.strictEqual(calc.stillOpenCents, cents(75), "custom still open");
  assert.strictEqual(row(calc, "Maya").statusKey, "partial", "custom partial status");
  assert.strictEqual(calc.warnings.length, 0, "custom shares matching total have no warning");
}

{
  const calc = calculate({
    splitMode: "custom",
    payerIncluded: false,
    totalCents: cents(180),
    people: [
      person("You", { isPayer: true, customShare: 999 }),
      person("Alex", { customShare: 80, paidBack: 80 }),
      person("Maya", { customShare: 100 }),
    ],
  });

  assert.strictEqual(row(calc, "You").shareCents, 0, "custom payer share is ignored when payer is excluded");
  assert.strictEqual(calc.payerOwnShareCents, 0, "excluded payer has no own share");
  assert.strictEqual(calc.expectedBackCents, cents(180), "custom payer-excluded expected back");
  assert.strictEqual(calc.stillOpenCents, cents(100), "custom payer-excluded open amount");
  assert.strictEqual(calc.warnings.length, 0, "custom payer-excluded matching shares have no warning");
}

{
  const short = calculate({
    splitMode: "custom",
    totalCents: cents(250),
    people: [
      person("You", { isPayer: true, customShare: 50 }),
      person("Alex", { customShare: 75 }),
      person("Maya", { customShare: 100 }),
    ],
  });
  assert(short.warnings.some((message) => message.includes("$25.00 short")), "custom short warning");

  const over = calculate({
    splitMode: "custom",
    totalCents: cents(200),
    people: [
      person("You", { isPayer: true, customShare: 50 }),
      person("Alex", { customShare: 100 }),
      person("Maya", { customShare: 75 }),
    ],
  });
  assert(over.warnings.some((message) => message.includes("$25.00 over")), "custom over warning");
}

{
  const calc = calculate({
    totalCents: cents(120),
    people: [
      person("You", { isPayer: true }),
      person("Alex", { paidBack: 70 }),
      person("Maya", { paidBack: 60 }),
    ],
  });

  assert.strictEqual(row(calc, "Alex").statusKey, "overpaid", "overpaid status");
  assert.strictEqual(row(calc, "Alex").overpaidCents, cents(30), "overpaid amount");
  assert.strictEqual(calc.stillOpenCents, 0, "overpayment does not create negative open balance");
  assert(calc.warnings.some((message) => message.includes("Alex has paid $30.00 more than their share")), "overpayment warning");
}

{
  const calc = calculate({
    totalCents: 0,
    totalInvalid: true,
    people: [
      person("You", { isPayer: true }),
      person("Alex", { paidBack: 60 }),
    ],
  });

  assert(calc.hardMessages.includes("Enter a total amount greater than 0."), "invalid total hard message");
  assert(!calc.warnings.some((message) => message.includes("more than their share")), "invalid total suppresses derived overpayment warnings");
  assert.strictEqual(calculator.buildRecordNote(calc), "Group Payback: add a total and people first.", "invalid record note");
}

{
  const calc = calculate({
    totalCents: 0,
    totalInvalid: true,
    people: [person("You", { isPayer: true })],
  });

  assert(calc.hardMessages.includes("Add at least one person besides the payer to track paybacks."), "single payer hard message");
}

{
  const calc = calculate({
    splitMode: "custom",
    totalCents: cents(100),
    people: [
      person("You", { isPayer: true, customShare: 25 }),
      person("Alex", { customShare: 75, shareInvalid: true, paidBackInvalid: true }),
    ],
  });

  assert(calc.warnings.some((message) => message.includes("Alex has an invalid custom share")), "invalid custom share warning");
  assert(calc.warnings.some((message) => message.includes("Alex has an invalid paid-back amount")), "invalid paid-back warning");
}

console.log("group-payback-calculator tests passed");

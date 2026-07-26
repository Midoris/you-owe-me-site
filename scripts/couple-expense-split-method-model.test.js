#!/usr/bin/env node

"use strict";

const assert = require("assert");
const model = require("./couple-expense-split-method-model.js");

function calculate(overrides = {}) {
  return model.calculate({
    name1: "Partner 1",
    name2: "Partner 2",
    income1: "4000",
    income2: "4000",
    adjustment1: "0",
    adjustment2: "0",
    total: "2000",
    custom1: "",
    custom2: "",
    ...overrides,
  });
}

function method(result, key) {
  const found = result.methods.find((item) => item.key === key);
  assert(found, `missing ${key}`);
  return found;
}

function assertReconciles(result) {
  result.methods.filter((item) => item.feasible).forEach((item) => {
    assert.strictEqual(item.contributionCents[0] + item.contributionCents[1], result.totalCents, `${item.key} contribution total reconciles`);
  });
}

assert.strictEqual(model.parseMoney("1,200.50").cents, 120050, "parser accepts grouped dot decimal");
assert.strictEqual(model.parseMoney("1.200,50").cents, 120050, "parser accepts grouped comma decimal");
assert.strictEqual(model.parseMoney("0").cents, 0, "parser accepts zero");
assert.strictEqual(model.parseMoney("-1").negative, true, "parser identifies negatives");
assert.strictEqual(model.formatMoney(100001, "$"), "$1,000.01", "money format keeps cents");

{
  const result = calculate();
  assert(result.valid, "equal-income fixture is valid");
  assert.deepStrictEqual(method(result, "equal").contributionCents, [100000, 100000]);
  assert.deepStrictEqual(method(result, "income").contributionCents, [100000, 100000]);
  assert.deepStrictEqual(method(result, "leftover").contributionCents, [100000, 100000]);
  assertReconciles(result);
}

{
  const result = calculate({ income1: "4200", income2: "3800" });
  assert.deepStrictEqual(method(result, "equal").contributionCents, [100000, 100000]);
  assert.deepStrictEqual(method(result, "income").contributionCents, [105000, 95000]);
  assert.deepStrictEqual(method(result, "leftover").contributionCents, [120000, 80000]);
  assertReconciles(result);
}

{
  const result = calculate({ income1: "6000", income2: "2500", total: "3000" });
  assert.deepStrictEqual(method(result, "equal").contributionCents, [150000, 150000]);
  assert.deepStrictEqual(method(result, "income").contributionCents, [211765, 88235]);
  assert.strictEqual(method(result, "leftover").feasible, false, "negative equal-leftover is unavailable");
  assert.strictEqual(method(result, "leftover").reason.type, "negative");
  assertReconciles(result);
}

{
  const result = calculate({ income1: "5000", income2: "0", total: "1000" });
  assert.deepStrictEqual(method(result, "income").contributionCents, [100000, 0]);
  assert.strictEqual(method(result, "equal").shareOfIncome[1], null, "zero income has no infinity percentage");
  assert.strictEqual(method(result, "leftover").feasible, false);
}

{
  const result = calculate({ income1: "0", income2: "0", total: "1000" });
  assert.strictEqual(method(result, "income").feasible, false);
  assert.strictEqual(method(result, "income").body, "The income-proportional method is unavailable because the combined take-home income is 0.");
  assert(result.warnings.some((warning) => warning.type === "affordability"));
}

{
  const result = calculate({ total: "0" });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.total, "Enter a shared monthly cost above 0 to compare the methods.");
}

{
  const result = calculate({ income1: "5000", income2: "4000", adjustment1: "1000", adjustment2: "0", total: "2000" });
  assert.strictEqual(method(result, "income").shareOfIncome[0], 22.2222, "income percentage remains based on take-home income");
  assert.deepStrictEqual(method(result, "income").moneyLeftCents, [288889, 311111], "money left includes agreed adjustment");
  assert.deepStrictEqual(method(result, "leftover").contributionCents, [100000, 100000], "equal-leftover uses available amounts");
  assertReconciles(result);
}

{
  const result = calculate({ custom1: "60", custom2: "40" });
  assert.strictEqual(method(result, "custom").feasible, true);
  assert.deepStrictEqual(method(result, "custom").contributionCents, [120000, 80000]);
  assertReconciles(result);
}

for (const total of ["99.9", "101"]) {
  const result = calculate({ custom1: total, custom2: "0" });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.custom, "Custom percentages must total 100%.");
}

{
  const result = calculate({ income1: "3", income2: "2", total: "1.01" });
  assert.deepStrictEqual(method(result, "income").contributionCents, [61, 40], "fractional cents reconcile deterministically");
  assertReconciles(result);
}

console.log("couple-expense-split-method-model tests passed");

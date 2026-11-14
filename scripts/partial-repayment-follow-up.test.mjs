import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pageRuntime } from "../tests/helpers/additional-page-runtime.mjs";

const html = await readFile(new URL("../blog/how-to-follow-up-after-a-partial-repayment/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("./partial-repayment-follow-up.js", import.meta.url), "utf8");
const original = "#partial-original";
const repaid = "#partial-repaid";
const warm = '[data-copy-text-target="partial-helper-warm"]';
const clear = '[data-copy-text-target="partial-helper-clear"]';

function setup() {
  const env = pageRuntime(html);
  env.editAmount = (input, value, validity = {}) => {
    env.query(input).validity = validity;
    env.edit(input, value);
  };
  env.query(original).validity = {};
  env.query(repaid).validity = {};
  env.run(script);
  return env;
}

async function assertNoGeneratedCopy(env) {
  const previousCopies = env.copied.length;
  assert.equal(env.query(".partial-helper-messages").hidden, true);
  for (const [button, message] of [[warm, "#partial-helper-warm"], [clear, "#partial-helper-clear"]]) {
    assert.equal(env.query(button).disabled, true);
    assert.equal(env.query(message).textContent, "");
    await env.click(button);
  }
  assert.equal(env.copied.length, previousCopies);
}

test("no amount request appears until both amounts are entered", async () => {
  const staticPage = pageRuntime(html);
  assert.equal(staticPage.query(".partial-helper-messages").hidden, true);
  assert.equal(staticPage.query(warm).hasAttribute("disabled"), true);
  assert.equal(staticPage.query(clear).hasAttribute("disabled"), true);
  const env = setup();
  assert.equal(env.query("[data-remaining-output]").textContent, "Add amounts above");
  await assertNoGeneratedCopy(env);
  env.editAmount(original, "75");
  await assertNoGeneratedCopy(env);
  assert.equal(env.query("[data-helper-warning]").hidden, true);
});

test("the existing warm and clear reminders copy the exact positive part-payment balance", async () => {
  const env = setup();
  env.editAmount(original, "75");
  env.editAmount(repaid, "40");
  env.edit("#partial-name", "Alex");
  env.edit("#partial-context", "dinner and parking");
  env.edit("#partial-timing", "Friday");
  assert.equal(env.query("[data-remaining-output]").textContent, "$35");
  assert.equal(env.query("[data-helper-warning]").hidden, true);
  assert.equal(env.query("[data-helper-receipt]").hidden, true);
  assert.equal(env.query(".partial-helper-messages").hidden, false);
  await env.click(warm);
  await env.click(clear);
  assert.equal(env.query(".partial-helper-results [data-copy-status]").textContent, "Copied message.");
  assert.equal(env.query("#partial-repayment-texts [data-copy-status]").textContent, "");
  assert.deepEqual(env.copied, [
    "Hey Alex, Thanks for sending $40. I still have $35 remaining from dinner and parking. Could you send the rest when you get a chance?",
    "Hey Alex, Thanks for the $40 repayment. That leaves $35 still open from dinner and parking. Could you send it by Friday, or let me know what works?",
  ]);
});

test("exact cents and zero repaid work; equality replaces reminders with the receipt", async () => {
  const env = setup();
  env.editAmount(original, "0.30");
  env.editAmount(repaid, "0.20");
  assert.equal(env.query("[data-remaining-output]").textContent, "$0.10");
  await env.click(clear);
  assert.match(env.copied.at(-1), /\$0\.20 repayment.*\$0\.10 still open/);

  env.editAmount(repaid, "0");
  await env.click(warm);
  assert.equal(env.copied.at(-1), "I still have $0.30 remaining. Could you send the rest when you get a chance?");

  env.editAmount(repaid, ".30");
  assert.equal(env.query("[data-remaining-output]").textContent, "Paid in full");
  assert.equal(env.query("[data-helper-receipt]").hidden, false);
  assert.equal(env.query("[data-helper-receipt] a").getAttribute("href"), "/tools/repayment-receipt-generator/");
  await assertNoGeneratedCopy(env);

  env.editAmount(repaid, "0");
  env.editAmount(original, "0");
  assert.equal(env.query("[data-remaining-output]").textContent, "No balance to repay");
  assert.equal(env.query("[data-helper-receipt]").hidden, true);
  await assertNoGeneratedCopy(env);
});

test("native bad input, negatives, precision, exponents and overpayment cannot copy a request", async () => {
  for (const [input, value, validity, guidance] of [
    [original, "", { badInput: true }, /Original amount: Use regular decimal notation/],
    [repaid, "-15", { rangeUnderflow: true }, /Amount already repaid: Enter zero or more/],
    [original, "-1", { rangeUnderflow: true }, /Original amount: Enter zero or more/],
    [repaid, "40.123", { stepMismatch: true }, /Amount already repaid:.*two decimal places/],
    [repaid, "40.100", {}, /Amount already repaid:.*two decimal places/],
    [original, "1e2", {}, /Original amount:.*such as 75 or 75.25/],
    [original, "90071992547409.92", {}, /Original amount: This amount is too large/],
    [repaid, "75.01", {}, /amount already repaid is higher than the original amount/],
  ]) {
    const env = setup();
    env.editAmount(original, "75");
    env.editAmount(repaid, "40");
    env.editAmount(input, value, validity);
    assert.equal(env.query("[data-remaining-output]").textContent, "Check amounts");
    assert.equal(env.query("[data-helper-warning]").hidden, false);
    assert.match(env.query("[data-helper-warning]").textContent, guidance);
    assert.equal(env.query(input).getAttribute("aria-invalid"), "true");
    assert.equal(env.query(input).getAttribute("aria-describedby"), "partial-helper-warning");
    assert.equal(env.query("[data-helper-receipt]").hidden, true);
    await assertNoGeneratedCopy(env);

    env.editAmount(input, input === original ? "75" : "40");
    assert.equal(env.query(input).hasAttribute("aria-invalid"), false);
    assert.equal(env.query(input).hasAttribute("aria-describedby"), false);
    assert.equal(env.query("[data-helper-warning]").hidden, true);
    assert.equal(env.query("[data-remaining-output]").textContent, "$35");
    assert.equal(env.query(warm).disabled, false);
  }
});

test("a stale displayed request is revalidated at copy time; standalone examples remain copyable", async () => {
  const env = setup();
  env.editAmount(original, "75");
  env.editAmount(repaid, "40");
  env.query(repaid).value = "75";
  await env.click(warm);
  assert.equal(env.copied.length, 0);
  assert.equal(env.query("[data-remaining-output]").textContent, "Paid in full");
  const id = "friendly-partial-repayment-follow-up";
  await env.click(`[data-copy-template="${id}"]`);
  assert.equal(env.copied[0], env.query(`[data-template-id="${id}"] .template-card__message`).textContent.trim());
  await env.click('[data-copy-template="quick-example-message"]');
  assert.equal(env.copied[1], env.query('[data-template-id="quick-example-message"] .template-card__message').textContent.trim());
  assert.match(env.query("#partial-repayment-texts [data-copy-status]").textContent, /^Copied /);
  assert.equal(env.query(".partial-helper-results [data-copy-status]").textContent, "");
  const tableId = env.query("[data-copy-table]").getAttribute("data-copy-table");
  await env.click(`[data-copy-table="${tableId}"]`);
  assert.match(env.copied[2], /\t/);
  assert.equal(env.query("#partial-repayment-texts [data-copy-status]").textContent, "Copied table.");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pageRuntime } from "../tests/helpers/additional-page-runtime.mjs";

const html = await readFile(new URL("../blog/how-to-split-parent-expenses-with-siblings-fairly/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("./sibling-contribution-plan.js", import.meta.url), "utf8");

function planner(options) {
  const env = pageRuntime(html, options);
  const q = env.query;
  const form = q("#sibling-plan-form");
  const printed = [];
  env.window.print = () => printed.push(q("#plan-summary-text").textContent);
  env.window.confirm = () => true;
  form.reset = () => {
    form.dispatchEvent({ type: "reset" });
    form.querySelectorAll("input, textarea").forEach((field) => {
      field.checked = false;
      field.value = field.getAttribute("value") || "";
    });
  };
  env.run(script);
  function build() { form.dispatchEvent({ type: "submit", preventDefault() {} }); }
  function checkUnavailable() {
    assert.equal(q("#result-generated").hidden, true);
    assert.equal(q("#plan-summary-text").textContent, "");
    assert.equal(q("#copy-plan").disabled, true);
    assert.equal(q("#print-plan").disabled, true);
  }
  assert.equal(q("#result-generated").hidden, true);
  assert.equal(q("#copy-plan").hasAttribute("disabled"), true);
  assert.equal(q("#print-plan").hasAttribute("disabled"), true);
  env.edit("#plan-name", "Household expenses");
  const method = q("#contribution-method-equal");
  method.checked = true;
  method.dispatchEvent({ type: "change" });
  env.edit("#participant-1-name", "Alex");
  env.edit("#participant-1-financial", "50%");
  env.edit("#participant-2-name", "Blair");
  build();
  return { ...env, q, printed, build, checkUnavailable };
}

test("an edited contribution disables copy and print until the updated summary is built", async () => {
  const { q, edit, click, build, copied, printed, checkUnavailable } = planner();
  const original = q("#plan-summary-text").textContent;
  await click("#copy-plan");
  await click("#print-plan");
  assert.deepEqual(copied, [original]);
  assert.deepEqual(printed, [original]);

  edit("#participant-1-financial", "30%");
  checkUnavailable();
  assert.match(q("#result-empty").textContent, /Update the plan summary/);
  assert.equal(q("#build-plan").textContent, "Update plan summary");
  assert.equal(q("[data-copy-status]").textContent, "");
  assert.equal(q("#contribution-method-equal").checked, true);
  await click("#copy-plan");
  await click("#print-plan");
  assert.equal(copied.length, 1);
  assert.equal(printed.length, 1);

  edit("#excluded-expenses", "Property repairs");
  edit("#review-date", "2027-03-20", "change");
  build();
  const updated = q("#plan-summary-text").textContent;
  assert.match(updated, /Alex: Financial contribution — 30%/);
  assert.match(updated, /Excluded expenses: Property repairs/);
  assert.match(updated, /Review date: 2027-03-20/);
  assert.doesNotMatch(updated, /50%/);
  assert.equal(q("#copy-plan").disabled, false);
  assert.equal(q("#print-plan").disabled, false);
  await click("#copy-plan");
  await click("#print-plan");
  assert.equal(copied.at(-1), updated);
  assert.equal(printed.at(-1), updated);
});

test("participant additions and removals require an update while a rejected removal preserves the current plan", async () => {
  const { q, edit, click, build, checkUnavailable } = planner();
  await click("[data-remove-participant]");
  assert.match(q("#participants-error").textContent, /at least two people/);
  assert.equal(q("#result-generated").hidden, false);
  assert.equal(q("#print-plan").disabled, false);

  await click("#add-participant");
  checkUnavailable();
  build();
  assert.equal(q("#planner-error-summary").hidden, false);
  checkUnavailable();

  edit("#participant-3-name", "Casey");
  build();
  assert.match(q("#plan-summary-text").textContent, /Casey/);
  const removeCasey = q("#participant-3-name").closest("[data-participant-row]").querySelector("[data-remove-participant]");
  assert.equal(removeCasey.getAttribute("aria-label"), "Remove Casey");
  removeCasey.dispatchEvent({ type: "click" });
  checkUnavailable();
  build();
  assert.equal(q("#planner-error-summary").hidden, true);
  assert.doesNotMatch(q("#plan-summary-text").textContent, /Casey/);
  assert.match(q("#plan-summary-text").textContent, /Blair/);
});

test("invalid submissions keep earlier output unavailable, and a confirmed reset returns to the blank state", async () => {
  const { q, edit, click, build, window, checkUnavailable } = planner();
  window.confirm = () => false;
  await click("#clear-planner");
  assert.equal(q("#result-generated").hidden, false);
  assert.match(q("#plan-summary-text").textContent, /Alex/);

  q("#plan-name").value = "";
  build();
  checkUnavailable();
  assert.equal(q("#planner-error-summary").hidden, false);
  assert.match(q("#result-empty").textContent, /Update the plan summary/);

  window.confirm = () => true;
  await click("#clear-planner");
  checkUnavailable();
  assert.equal(q("#planner-error-summary").hidden, true);
  assert.match(q("#result-empty").textContent, /after you complete the required fields/);
  assert.equal(q("#build-plan").textContent, "Create plan summary");
  assert.equal(q("#contribution-method-equal").checked, false);
  assert.equal(q("#participant-1-name").value, "");
});

test("a pending plan copy cannot announce or start a clipboard fallback after an edit, rebuild, or reset", async () => {
  for (const transition of ["edit", "rebuild", "reset"]) {
    const { q, edit, click, build, window, document, selections } = planner();
    let finishCopy;
    let fallbackAttempts = 0;
    document.execCommand = () => { fallbackAttempts += 1; return true; };
    window.navigator.clipboard.writeText = () => new Promise((resolve, reject) => {
      finishCopy = transition === "edit" ? resolve : () => reject(Error("Clipboard denied"));
    });

    await click("#copy-plan");
    if (transition === "reset") {
      await click("#clear-planner");
    } else {
      edit("#participant-1-financial", "30%");
      if (transition === "rebuild") build();
    }
    finishCopy();
    for (let i = 0; i < 10; i++) await Promise.resolve();
    assert.equal(q("[data-copy-status]").textContent, "");
    assert.equal(fallbackAttempts, 0);
    assert.equal(selections.length, 0);
  }
});

test("clipboard denial leaves the current summary available for manual copy", async () => {
  const { q, click, selections } = planner({ clipboardFails: true, fallbackFails: true });
  await click("#copy-plan");
  assert.match(q("[data-copy-status]").textContent, /copy it manually/);
  assert.deepEqual(selections, [q("#plan-summary-text")]);
  assert.equal(q("#result-generated").hidden, false);
});

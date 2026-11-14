import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pageRuntime } from "../tests/helpers/additional-page-runtime.mjs";

const html = await readFile(new URL("../blog/how-to-track-shared-expenses-without-a-joint-account/index.html", import.meta.url), "utf8");
const controller = await readFile(new URL("./shared-expense-setup-planner.js", import.meta.url), "utf8");

function planner(options) {
  const env = pageRuntime(html, options);
  const q = env.query;
  const form = q("#shared-expense-setup-form");
  form.reset = () => form.querySelectorAll("input").forEach((input) => {
    input.checked = false;
    input.value = input.getAttribute("value") || "";
  });
  function choose(name, value) {
    const choice = q(`input[name="${name}"][value="${value}"]`);
    if (choice.getAttribute("type") === "radio") {
      form.querySelectorAll(`input[name="${name}"]`).forEach((input) => { input.checked = input === choice; });
    } else {
      choice.checked = !choice.checked;
    }
    choice.dispatchEvent({ type: "change" });
  }
  function build() {
    form.dispatchEvent({ type: "submit", preventDefault() {} });
  }
  env.run(controller);
  assert.equal(q("#ses-result").hidden, true);
  assert.equal(q("#ses-copy-button").hasAttribute("disabled"), true);
  choose("shared-expense", "Utilities");
  choose("split-rule", "equal");
  choose("record-model", "one-person");
  choose("settlement-rhythm", "monthly");
  choose("unclear-rule", "discuss");
  build();
  return { ...env, q, choose, build, copy: () => env.click("#ses-copy-button") };
}

test("edits require a rebuild before copied or manually selected text is available", async () => {
  const { q, choose, build, copy, copied } = planner();
  assert.match(q("#ses-copy-summary").textContent, /equally/);
  assert.deepEqual(q("#ses-recommendation").querySelectorAll("a").map((link) => link.getAttribute("href")), [
    "/blog/what-is-a-running-balance-between-two-people/",
    "#product-fit-title",
  ]);
  await copy();
  assert.equal(copied.at(-1), q("#ses-copy-summary").textContent);

  choose("split-rule", "income");
  assert.equal(q('button[type="submit"]').textContent, "Update your setup");
  assert.match(q("#ses-copy-status").textContent, /Update your setup/);
  assert.equal(q("#ses-copy-button").disabled, true);
  assert.equal(q("#ses-copy-summary").hidden, true);
  assert.equal(q("#ses-copy-summary").textContent, "");
  assert.equal(q("#ses-result-fields").hidden, true);
  assert.equal(q("#ses-recommendation").hidden, true);
  await copy();
  assert.equal(copied.length, 1);

  choose("shared-expense", "Other");
  build();
  assert.equal(q("#ses-error-summary").hidden, false);
  assert.equal(q("#ses-copy-button").disabled, true);
  assert.equal(q("#ses-copy-summary").textContent, "");

  q("#ses-other-expense").value = "Childcare";
  q("#ses-other-expense").dispatchEvent({ type: "input" });
  build();
  assert.match(q("#ses-result-shared").textContent, /Utilities and Childcare/);
  assert.match(q("#ses-result-split").textContent, /income-based/);
  assert.equal(q("#ses-copy-button").disabled, false);
  await copy();
  assert.equal(copied.at(-1), q("#ses-copy-summary").textContent);
  assert.match(copied.at(-1), /income-based/);
  assert.doesNotMatch(copied.at(-1), /equally/);

  q("#ses-other-expense").value = "Parking";
  q("#ses-other-expense").dispatchEvent({ type: "input" });
  assert.equal(q("#ses-copy-button").disabled, true);
  await copy();
  assert.equal(copied.length, 2);
  build();
  assert.match(q("#ses-copy-summary").textContent, /Utilities and Parking/);
});

test("pending clipboard feedback cannot overwrite an edit, a rebuilt result, or a reset", async () => {
  for (const transition of ["edit", "rebuild", "reset"]) {
    const { q, choose, build, copy, click, window } = planner();
    let finishCopy;
    window.navigator.clipboard.writeText = () => new Promise((resolve, reject) => {
      finishCopy = transition === "rebuild" ? () => reject(Error("Clipboard denied")) : resolve;
    });
    await copy();
    if (transition === "reset") {
      await click("#ses-reset");
    } else {
      choose("split-rule", "income");
      if (transition === "rebuild") build();
    }
    finishCopy();
    await Promise.resolve();
    assert.equal(q("#ses-copy-button").textContent, "Copy this setup");
    assert.equal(q("#ses-copy-status").textContent,
      transition === "edit" ? "Your choices changed. Update your setup before copying." : "");
    if (transition === "reset") {
      assert.equal(q("#ses-result").hidden, true);
      assert.equal(q("#ses-copy-button").disabled, true);
      assert.equal(q('button[type="submit"]').textContent, "Build my setup");
    }
  }
});

test("other record models and the unagreed split retain their existing routes", () => {
  const { q, choose, build } = planner();
  const routes = () => q("#ses-recommendation").querySelectorAll("a").map((link) => link.getAttribute("href"));
  for (const [record, route] of [
    ["maintainer-view", "/blog/can-one-person-track-shared-money-without-everyone-installing-an-app/"],
    ["two-editors", "/compare/shared-expense-app-vs-running-balance-app/"],
    ["group", "/compare/shared-expense-app-vs-running-balance-app/"],
  ]) {
    choose("record-model", record);
    build();
    assert.deepEqual(routes(), [route]);
  }
  choose("record-model", "one-person");
  choose("split-rule", "not-agreed");
  build();
  assert.deepEqual(routes(), ["/tools/couple-expense-split-method-calculator/"]);
});

test("clipboard denial keeps the current summary available for manual copy", async () => {
  const { q, copy } = planner({ clipboardFails: true });
  await copy();
  assert.match(q("#ses-copy-status").textContent, /copy it manually/);
  assert.equal(q("#ses-copy-summary").hidden, false);
  assert.match(q("#ses-copy-summary").textContent, /equally/);
});

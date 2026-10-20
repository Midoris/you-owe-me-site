import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./sales.js", import.meta.url), "utf8");

function runSale(lang, month, day) {
  const badges = [{
    hidden: true,
    dataset: {},
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
  }];
  const events = [];
  const window = { setInterval() {}, dispatchEvent(event) { events.push(event); } };
  const FixedDate = class extends Date {
    constructor(...args) { super(...(args.length ? args : [2026, month - 1, day, 12])); }
  };
  const document = { readyState: "complete", documentElement: { lang }, querySelectorAll: () => badges };
  vm.runInNewContext(source, {
    window, document, Date: FixedDate,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
  });
  return { badge: badges[0], sale: window.YouOweMeSaleState.getActiveSale(), events };
}

test("Spanish sale labels preserve the campaign identity, dates and emitted English state", () => {
  for (const [month, day, label] of [[12, 24, "Navidad"], [1, 1, "Año Nuevo"], [6, 19, "Día del Padre"], [7, 4, "Día de la Independencia de Estados Unidos"]]) {
    const english = runSale("en", month, day);
    const spanish = runSale("es", month, day);
    assert.equal(spanish.badge.textContent, label + " • Oferta por tiempo limitado");
    assert.equal(spanish.badge.attributes["aria-label"], "Oferta activa: " + label);
    assert.equal(spanish.badge.hidden, false);
    assert.equal(JSON.stringify(spanish.sale), JSON.stringify(english.sale));
    assert.equal(JSON.stringify(spanish.events), JSON.stringify(english.events));
    assert.equal(spanish.badge.dataset.saleId, english.badge.dataset.saleId);
    assert.match(english.badge.textContent, / • Limited-Time Event$/);
  }
});

test("Spanish sale badges remain hidden outside an active campaign", () => {
  const { badge, sale } = runSale("es", 10, 20);
  assert.equal(badge.hidden, true);
  assert.equal(sale, null);
});


test("German sale labels preserve campaigns, dates and analytics state", () => {
  for (const [month, day, label] of [[12, 24, "Weihnachten"], [1, 1, "Neujahr"], [6, 19, "US-Vatertag"], [7, 4, "US-Unabhängigkeitstag"]]) {
    const english = runSale("en", month, day);
    const german = runSale("de", month, day);
    assert.equal(german.badge.textContent, label + " • Zeitlich begrenztes Angebot");
    assert.equal(german.badge.attributes["aria-label"], "Aktives Angebot: " + label);
    assert.equal(JSON.stringify(german.sale), JSON.stringify(english.sale));
    assert.equal(JSON.stringify(german.events), JSON.stringify(english.events));
  }
  assert.equal(runSale("de", 10, 20).badge.hidden, true);
});

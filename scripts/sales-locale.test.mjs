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

test("Japanese campaign labels retain English campaign dates, identity and analytics state", () => {
  for (const [month, day, label] of [[12, 24, "クリスマス"], [1, 1, "新年"], [6, 19, "米国の父の日"], [7, 4, "米国独立記念日"], [10, 31, "ハロウィーン"]]) {
    const english = runSale("en", month, day), japanese = runSale("ja", month, day);
    assert.equal(japanese.badge.textContent, label + "・期間限定");
    assert.equal(japanese.badge.attributes["aria-label"], "実施中のキャンペーン：" + label);
    assert.equal(JSON.stringify(japanese.sale), JSON.stringify(english.sale));
    assert.equal(JSON.stringify(japanese.events), JSON.stringify(english.events));
  }
  assert.equal(runSale("ja", 10, 20).badge.hidden, true);
});

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

test("French campaign presentation preserves original dates, identity and analytics", () => {
  for (const [month, day, label] of [[12, 24, "Noël"], [1, 1, "Nouvel An"], [6, 19, "Fête des pères aux États-Unis"], [7, 4, "Fête de l’indépendance des États-Unis"]]) {
    const english = runSale("en", month, day), french = runSale("fr", month, day);
    assert.equal(french.badge.textContent, label + " • Offre à durée limitée");
    assert.equal(french.badge.attributes["aria-label"], "Offre en cours : " + label);
    assert.equal(JSON.stringify(french.sale), JSON.stringify(english.sale));
    assert.equal(JSON.stringify(french.events), JSON.stringify(english.events));
    assert.equal(french.badge.dataset.saleId, english.badge.dataset.saleId);
  }
  assert.equal(runSale("fr", 10, 20).badge.hidden, true);
});


test("Portuguese campaign labels retain US campaign dates and original analytics state", () => {
 for (const [month,day,label] of [[12,24,"Natal"],[1,1,"Ano-Novo"],[6,19,"Dia dos Pais nos EUA"],[7,4,"Independência dos EUA"],[2,14,"Dia de São Valentim"],[4,5,"Páscoa"],[10,31,"Halloween"],[11,11,"Dia dos Solteiros"],[11,26,"Ação de Graças nos EUA"],[11,27,"Black Friday"],[11,30,"Cyber Monday"]]) {
  const en=runSale("en",month,day),pt=runSale("pt-BR",month,day);
  assert.equal(pt.badge.textContent,"Oferta de "+label);
  assert.equal(pt.badge.attributes["aria-label"],"Promoção em andamento: "+label);
  assert.equal(JSON.stringify(pt.sale),JSON.stringify(en.sale));
  assert.equal(JSON.stringify(pt.events),JSON.stringify(en.events));
 }
 assert.equal(runSale("pt-BR",6,12).badge.hidden,true);
 assert.equal(runSale("pt-BR",11,5).badge.hidden,true);
});


test("Italian presentation retains US holidays, campaign identities and analytics state", () => {
  for (const [month, day, label] of [[12,24,"Natale"],[1,1,"Capodanno"],[6,19,"Festa del papà negli Stati Uniti"],[7,4,"Giorno dell’Indipendenza degli Stati Uniti"],[2,14,"San Valentino"],[4,5,"Pasqua"],[10,31,"Halloween"],[11,11,"Festa dei single"],[11,26,"Giorno del Ringraziamento negli Stati Uniti"],[11,27,"Black Friday"],[11,30,"Cyber Monday"]]) {
    const en = runSale("en",month,day), it = runSale("it",month,day);
    assert.equal(it.badge.textContent,"Offerta: "+label);
    assert.equal(it.badge.attributes["aria-label"],"Promozione in corso: "+label);
    assert.equal(JSON.stringify(it.sale),JSON.stringify(en.sale));
    assert.equal(JSON.stringify(it.events),JSON.stringify(en.events));
  }
  assert.equal(runSale("it",3,19).badge.hidden,true);
  assert.equal(runSale("it",11,6).badge.hidden,true);
});


test("Polish campaign labels preserve US dates, identities and emitted analytics state", () => {
  for(const [month,day,label] of [[12,24,"Boże Narodzenie"],[1,1,"Nowy Rok"],[6,19,"Dzień Ojca w USA"],[7,4,"Dzień Niepodległości USA"],[2,14,"Walentynki"],[4,5,"Wielkanoc"],[10,31,"Halloween"],[11,11,"Dzień Singla"],[11,26,"Święto Dziękczynienia w USA"],[11,27,"Black Friday"],[11,30,"Cyber Monday"]]) {
    const en=runSale("en",month,day),pl=runSale("pl",month,day);
    assert.equal(pl.badge.textContent,"Promocja: "+label);
    assert.equal(pl.badge.attributes["aria-label"],"Aktualna promocja: "+label);
    assert.equal(JSON.stringify(pl.sale),JSON.stringify(en.sale));
    assert.equal(JSON.stringify(pl.events),JSON.stringify(en.events));
  }
  assert.equal(runSale("pl",6,23).badge.hidden,true);
  assert.equal(runSale("pl",11,6).badge.hidden,true);
});


test("Korean labels preserve original US campaign dates, identities and analytics", () => {
  for(const [month,day,label]of [[12,24,"크리스마스"],[1,1,"새해"],[6,19,"미국 아버지의 날"],[7,4,"미국 독립기념일"],[2,14,"밸런타인데이"],[4,5,"부활절"],[10,31,"핼러윈"],[11,11,"싱글즈 데이"],[11,26,"미국 추수감사절"],[11,27,"블랙 프라이데이"],[11,30,"사이버 먼데이"]]) {
    const en=runSale("en",month,day),ko=runSale("ko",month,day);
    assert.equal(ko.badge.textContent,label+" 할인");
    assert.equal(ko.badge.attributes["aria-label"],"진행 중인 할인: "+label);
    assert.equal(JSON.stringify(ko.sale),JSON.stringify(en.sale));
    assert.equal(JSON.stringify(ko.events),JSON.stringify(en.events));
  }
  assert.equal(runSale("ko",5,8).badge.hidden,true);
  assert.equal(runSale("ko",11,6).badge.hidden,true);
});

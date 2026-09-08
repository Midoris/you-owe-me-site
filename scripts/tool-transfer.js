/* EXP-003: activation is deliberately false until native and hosted experience acceptance. */
(function (root) {
  "use strict";
  const config = Object.freeze({enabled: false, endpoint: "https://us-central1-you-owe-me-app.cloudfunctions.net/toolTransfer", continuation: "https://continue.you-owe-me.com/split/"});
  function prepare(state) {
    if (state.people.length < 2 || state.people.length > 4 || !state.expenses.length || state.expenses.length > 6) return null;
    const organizerID = state.expenses[0].paidBy;
    const participants = state.people.map((p, index) => ({id: p.id, name: p.name.trim() || `Person ${index + 1}`}));
    const costs = [];
    for (const e of state.expenses) {
      const value = Number(String(e.amount).replace(/,/g, "")), amount = Math.round(value * 100);
      if (!Number.isFinite(value) || Math.abs(value * 100 - amount) > 0.000001 || amount < 1 || amount > 100000000 || e.paidBy !== organizerID || !e.includedPeople.length) return null;
      costs.push({id: e.id, label: e.description.trim() || "Shared expense", amount, payerID: organizerID, participantIDs: [...e.includedPeople]});
    }
    const draft = {version: 1, source: "split-calculator", type: "payer-split", currencyLabel: state.currency, organizerID, participants, costs};
    const rows = costs.map(c => {
      const rounded = Math.floor(c.amount / c.participantIDs.length + 0.5);
      const row = Object.fromEntries(c.participantIDs.map(p => [p, rounded]));
      const residual = c.amount - rounded * c.participantIDs.length;
      if (c.participantIDs.includes(organizerID)) row[organizerID] += residual;
      else if (residual) return null;
      return Object.values(row).some(v => v < 0) ? null : row;
    });
    if (rows.some(r => !r)) return null;
    for (const p of participants.filter(p => p.id !== organizerID)) {
      const actual = rows.reduce((s, r) => s + (r[p.id] || 0), 0);
      const displayed = Math.floor((costs.reduce((s, c) => s + (c.participantIDs.includes(p.id) ? c.amount * 12 / c.participantIDs.length : 0), 0) + 6) / 12);
      // Match the calculator's existing dollar-space floating-point rounding too.
      // Example: 0.29 / 2 displays 0.14 there, while native half-up cents gives 0.15.
      const browserDisplayed = Math.round(state.expenses.reduce((sum, e) => sum +
        (e.includedPeople.includes(p.id) ? Number(String(e.amount).replace(/,/g, "")) / e.includedPeople.length : 0), 0) * 100);
      if (actual <= 0 || actual !== displayed || actual !== browserDisplayed) return null;
    }
    return draft;
  }
  const api = {config, prepare};
  if (typeof module !== "undefined") module.exports = api;
  else root.UomiToolTransfer = api;
})(typeof window === "undefined" ? globalThis : window);

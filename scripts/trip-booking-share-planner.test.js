#!/usr/bin/env node
"use strict";

const assert = require("assert");
const planner = require("./trip-booking-share-planner.js");

function base(overrides = {}) {
  return {
    bookingStatus: "not-booked",
    bookingType: "Hotel",
    bookingName: "Lisbon hotel",
    totalCents: 112000,
    currency: "USD",
    refundability: "Refundable",
    refundDeadline: "2026-09-01",
    refundDeadlineDisplay: "September 1, 2026",
    otherPeople: 3,
    includeSelf: true,
    comfortableCarry: "Yes",
    priorDelays: "No",
    deadline: "2026-08-25",
    deadlineDisplay: "August 25, 2026",
    cancellationRule: "replace",
    customRule: "",
    participants: [{ name: "Maya", receivedCents: 0 }, { name: "Leo", receivedCents: 15000 }, { name: "Sam", receivedCents: 28000 }],
    ...overrides,
  };
}

assert.strictEqual(planner.parseCents("1,200.50"), 120050);
assert.strictEqual(planner.parseCents(" .5 "), 50);
assert.strictEqual(planner.parseCents("90,071,992,547,409.91"), Number.MAX_SAFE_INTEGER);
assert.strictEqual(planner.money(Number.MAX_SAFE_INTEGER - 92), "90071992547408.99");
for (const invalid of ["1200,50", "1,,200", "12,34.56", "10abc", "1.005", "1.", "-0.01", "1e3", "90,071,992,547,409.92"]) {
  assert(Number.isNaN(planner.parseCents(invalid)), `rejects ${invalid}`);
}

assert.strictEqual(planner.calculate(base({ refundability: "Nonrefundable", comfortableCarry: "No" })).result.label, "Collect before booking", "case A: nonrefundable and cannot carry");
assert.strictEqual(planner.calculate(base({ priorDelays: "Yes" })).result.label, "Collect before booking", "case B: prior delay history");
assert.strictEqual(planner.calculate(base()).result.label, "Book first, then collect before departure", "case C: flexible refundable booking");
assert.strictEqual(planner.calculate(base({ bookingStatus: "already-booked" })).result.label, "Set a fixed pay-before-departure date", "case D: already booked");
const covered = planner.calculate(base({ participants: [{ name: "Maya", receivedCents: 28000 }, { name: "Leo", receivedCents: 28000 }, { name: "Sam", receivedCents: 28000 }] }));
assert.strictEqual(covered.result.label, "Fixed shares are covered", "case E: all covered");
assert(covered.artifacts.policy.includes("Everyone else’s fixed share is covered."), "case E: covered policy confirms payment state");
assert(covered.artifacts.message.includes("everyone else’s fixed share for Lisbon hotel is covered."), "case E: covered message confirms payment state");
assert(!covered.artifacts.message.includes("Please send"), "case E: covered message does not request payment again");

const partial = planner.calculate(base());
assert.strictEqual(partial.selfShareCents, 28000, "equal share uses organizer inclusion");
assert.strictEqual(partial.participants[1].status, "partial", "case F: partial status");
assert.strictEqual(partial.participants[1].remainingCents, 13000, "case F: partial remaining");
assert.strictEqual(partial.participants[0].status, "open", "case G: open status");
assert.strictEqual(partial.participants[2].status, "paid");

function requestsIndividualBalance(plan, originalShare) {
  for (const text of [plan.artifacts.policy, plan.artifacts.message]) {
    assert.match(text, /check your remaining balance/i);
    assert.doesNotMatch(text, new RegExp(`${originalShare}|Maya|Leo|Sam`, "i"));
    assert.match(text, /August 25, 2026/);
  }
}

for (const timing of [{}, { bookingStatus: "already-booked" }, { refundability: "Nonrefundable" }]) {
  requestsIndividualBalance(planner.calculate(base(timing)), "USD 280\\.00");
}

const unpaidTravelers = base().participants.map((person) => ({ ...person, receivedCents: 0 }));
const uneven = planner.calculate(base({ totalCents: 24999, participants: unpaidTravelers }));
assert.deepStrictEqual(uneven.shareCents, [6250, 6250, 6250, 6249], "extra cent goes to travelers first, keeping exact total");
assert.deepStrictEqual(uneven.participants.map((person) => person.remainingCents), [6250, 6250, 6250]);
assert.strictEqual(uneven.selfShareCents, 6249);
requestsIndividualBalance(uneven, "USD 62\\.(?:49|50)");
const unevenPaid = planner.calculate(base({ totalCents: 24999, participants: unpaidTravelers.map((person) => ({ ...person, receivedCents: 6250 })) }));
assert.strictEqual(unevenPaid.result.key, "covered", "rounded-up assigned share covers each traveler's balance");
const tiny = planner.calculate(base({ totalCents: 1, participants: unpaidTravelers }));
assert.deepStrictEqual(tiny.participants.map((person) => person.remainingCents), [1, 0, 0], "zero-cent shares have no payment due");
assert.notStrictEqual(tiny.result.key, "covered");

const noSelf = planner.calculate(base({ totalCents: 90000, includeSelf: false, participants: unpaidTravelers }));
assert.strictEqual(noSelf.shareCount, 3, "organizer exclusion uses other people only");
assert.strictEqual(noSelf.selfShareCents, null, "organizer exclusion calculation");
assert.deepStrictEqual(noSelf.shareCents, [30000, 30000, 30000]);
assert.match(noSelf.artifacts.message, /Please send your fixed share of USD 300\.00/);
assert.deepStrictEqual(planner.allocateShares(25000, 3, false).shareCents, [8334, 8333, 8333]);
assert.strictEqual(planner.allocateShares(Number.MAX_SAFE_INTEGER, 100, true).shareCents.reduce((a, b) => a + b), Number.MAX_SAFE_INTEGER);

const custom = planner.calculate(base({ cancellationRule: "custom", customRule: "Refunds reduce the share first; we will discuss anything left." }));
assert(custom.artifacts.policy.includes("Refunds reduce the share first; we will discuss anything left."), "case J: exact custom rule in policy");
assert(custom.artifacts.message.includes("Refunds reduce the share first; we will discuss anything left."), "case J: exact custom rule in message");
assert(!custom.artifacts.policy.includes("legally owes"), "no legal-liability wording");

console.log("trip-booking-share-planner tests passed");

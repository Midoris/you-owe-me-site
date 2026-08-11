#!/usr/bin/env node
"use strict";

const assert = require("assert");
const planner = require("./trip-booking-share-planner.js");

function base(overrides = {}) {
  return {
    bookingStatus: "not-booked",
    bookingType: "Hotel",
    bookingName: "Lisbon hotel",
    total: 1120,
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
    participants: [{ name: "Maya", received: 0 }, { name: "Leo", received: 150 }, { name: "", received: 280 }],
    ...overrides,
  };
}

assert.strictEqual(planner.parseAmount("1,200.50"), 1200.5);
assert(Number.isNaN(planner.parseAmount("10abc")));
assert.strictEqual(planner.statusFor(0, 280), "open");
assert.strictEqual(planner.statusFor(150, 280), "partial");
assert.strictEqual(planner.statusFor(280, 280), "paid");

assert.strictEqual(planner.calculate(base({ refundability: "Nonrefundable", comfortableCarry: "No" })).result.label, "Collect before booking", "case A: nonrefundable and cannot carry");
assert.strictEqual(planner.calculate(base({ priorDelays: "Yes" })).result.label, "Collect before booking", "case B: prior delay history");
assert.strictEqual(planner.calculate(base()).result.label, "Book first, then collect before departure", "case C: flexible refundable booking");
assert.strictEqual(planner.calculate(base({ bookingStatus: "already-booked" })).result.label, "Set a fixed pay-before-departure date", "case D: already booked");
assert.strictEqual(planner.calculate(base({ participants: [{ name: "Maya", received: 280 }, { name: "Leo", received: 280 }, { name: "Sam", received: 280 }] })).result.label, "Fixed shares are covered", "case E: all covered");

const partial = planner.calculate(base());
assert.strictEqual(partial.share, 280, "equal share uses organizer inclusion");
assert.strictEqual(planner.statusFor(partial.participants[1].received, partial.share), "partial", "case F: partial status");
assert.strictEqual(partial.share - partial.participants[1].received, 130, "case F: partial remaining");
assert.strictEqual(planner.statusFor(partial.participants[0].received, partial.share), "open", "case G: open status");

const uneven = planner.calculate(base({ total: 100, otherPeople: 2, participants: [{ name: "A", received: 0 }, { name: "B", received: 0 }] }));
assert.strictEqual(uneven.share, 100 / 3, "case H: full precision retained");
assert.notStrictEqual(Number(planner.money(uneven.share)) * uneven.shareCount, uneven.total, "case H: cents do not silently alter total");

const noSelf = planner.calculate(base({ total: 900, otherPeople: 3, includeSelf: false, participants: [{ name: "A", received: 0 }, { name: "B", received: 0 }, { name: "C", received: 0 }] }));
assert.strictEqual(noSelf.shareCount, 3, "organizer exclusion uses other people only");
assert.strictEqual(noSelf.share, 300, "organizer exclusion calculation");

const custom = planner.calculate(base({ cancellationRule: "custom", customRule: "Refunds reduce the share first; we will discuss anything left." }));
assert(custom.artifacts.policy.includes("Refunds reduce the share first; we will discuss anything left."), "case J: exact custom rule in policy");
assert(custom.artifacts.message.includes("Refunds reduce the share first; we will discuss anything left."), "case J: exact custom rule in message");
assert(!custom.artifacts.policy.includes("legally owes"), "no legal-liability wording");

console.log("trip-booking-share-planner tests passed");

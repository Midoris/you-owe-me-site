import assert from "node:assert/strict";
import test from "node:test";

import {
  CURRENCIES,
  createProposal,
  decodeProposal,
  encodeProposal,
  formatDate,
  formatMoney,
  scheduleFor,
  validateProposalInputs,
} from "../scripts/repayment-proposal-model.mjs";

const input = {
  amount: "100.01",
  currency: "USD",
  count: "3",
  cadence: "monthly",
  firstDate: "2024-01-31",
};
const plan = {
  id: "A".repeat(22),
  currency: "USD",
  totalMinor: 10001,
  count: 3,
  cadence: "monthly",
  firstDate: "2024-01-31",
};
const payload = [1, plan.id, plan.totalMinor, plan.currency, plan.count, plan.cadence, plan.firstDate];
const tokenFor = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const inputWith = (changes) => validateProposalInputs({ ...input, ...changes });

test("creates a new 128-bit opaque ID for each proposal and round trips the canonical terms", () => {
  const first = createProposal(input);
  const second = createProposal(input);
  assert.notEqual(first.id, second.id);
  assert.equal(Buffer.from(first.id, "base64url").length, 16);

  const token = encodeProposal(first);
  assert.match(token, /^[A-Za-z0-9_-]+$/u);
  assert.ok(token.length <= 128);
  assert.deepEqual(decodeProposal(token), first);
  assert.deepEqual(decodeProposal(token), first);
  assert.equal(encodeProposal(decodeProposal(token)), token);
});

test("encodes only the version, opaque ID, and listed financial terms", () => {
  const token = encodeProposal({ ...plan, names: ["Alex", "David"], note: "Personal information" });
  assert.deepEqual(JSON.parse(Buffer.from(token, "base64url").toString()), payload);
  assert.deepEqual(decodeProposal(token), plan);
});

test("parses exact minor units for all supported currencies", () => {
  assert.deepEqual(CURRENCIES, ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY"]);
  for (const currency of CURRENCIES.filter((code) => code !== "JPY")) {
    assert.equal(inputWith({ currency, amount: " 0012.30 " }).totalMinor, 1230);
    assert.equal(inputWith({ currency, amount: "9999999.99" }).totalMinor, 999_999_999);
  }
  assert.equal(inputWith({ amount: ".10" }).totalMinor, 10);
  assert.equal(inputWith({ amount: "0.1" }).totalMinor, 10);
  assert.equal(inputWith({ amount: "0.01", count: 1 }).totalMinor, 1);
  assert.equal(inputWith({ currency: "JPY", amount: "9999999" }).totalMinor, 9_999_999);
});

test("rejects amounts that require rounding or fall outside the supported range", () => {
  for (const amount of [
    "0", "0.00", "-1.00", "+1.00", "1e3", "1.001", "1.010", "1,000.00",
    "1.", ".", "", "NaN", "Infinity", "10000000", "9".repeat(35), 100,
  ]) {
    assert.throws(() => inputWith({ amount }), { field: "amount" }, String(amount));
  }

  for (const amount of ["0", "1.00", ".7", "10000000"]) {
    assert.throws(() => inputWith({ currency: "JPY", amount }), { field: "amount" }, amount);
  }
  for (const currency of ["usd", "XYZ", "__proto__", null]) {
    assert.throws(() => inputWith({ currency }), { field: "currency" }, String(currency));
  }
});

test("requires valid cadence, count, and a positive amount for every payment", () => {
  for (const count of [0, 25, 1.5, "2.0", "2e0", "+2", "", null]) {
    assert.throws(() => inputWith({ count }), { field: "count" }, String(count));
  }
  assert.throws(() => inputWith({ amount: "0.02", count: 3 }), { field: "count" });
  assert.throws(() => inputWith({ cadence: "fortnightly" }), { field: "cadence" });
  assert.equal(inputWith({ count: 24 }).count, 24);
  assert.deepEqual(scheduleFor(inputWith({ amount: "0.03", count: 3 })).map((entry) => entry.amountMinor), [1, 1, 1]);
});

test("splits a large total exactly and adds the remainder to the final installment", () => {
  const terms = inputWith({ amount: "9999999.99", count: 24 });
  const schedule = scheduleFor(terms);
  const [first] = schedule;
  const final = schedule.at(-1);

  assert.equal(schedule.length, 24);
  assert.equal(first.amountMinor, 41_666_666);
  assert.ok(schedule.slice(0, -1).every((item) => item.amountMinor === first.amountMinor));
  assert.equal(final.amountMinor, 41_666_681);
  assert.equal(schedule.reduce((sum, item) => sum + item.amountMinor, 0), terms.totalMinor);
});

test("weekly dates keep their weekday through daylight saving time and year boundaries", () => {
  const march = scheduleFor(inputWith({ cadence: "weekly", firstDate: "2025-03-02" }));
  const december = scheduleFor(inputWith({ cadence: "weekly", firstDate: "2024-12-29" }));
  assert.deepEqual(march, [
    { date: "2025-03-02", amountMinor: 3333 },
    { date: "2025-03-09", amountMinor: 3333 },
    { date: "2025-03-16", amountMinor: 3335 },
  ]);
  assert.deepEqual(december.map((item) => item.date), ["2024-12-29", "2025-01-05", "2025-01-12"]);
});

test("monthly dates clamp at month end and return to their original day", () => {
  const expectedByYear = new Map([[2023, "28"], [2024, "29"], [2100, "28"]]);
  for (const [year, februaryDay] of expectedByYear) {
    const schedule = scheduleFor(inputWith({ firstDate: `${year}-01-31`, count: 5 }));
    assert.deepEqual(schedule.map((entry) => entry.date), [
      `${year}-01-31`, `${year}-02-${februaryDay}`, `${year}-03-31`, `${year}-04-30`, `${year}-05-31`,
    ]);
  }
});

test("rejects invalid civil dates and dates outside the supported schedule range", () => {
  for (const firstDate of [
    "1999-12-31", "2101-01-01", "2100-02-29", "2025-02-29", "2024-04-31",
    "2024-00-01", "2024-01-00", "2024-13-01", "2024-1-01", "2024-01-1",
    "2024-01-01\n", "2024-01-01T00:00:00Z",
  ]) {
    assert.throws(() => inputWith({ firstDate }), { field: "firstDate" }, firstDate);
  }
  assert.throws(() => inputWith({ firstDate: "2100-12-25", cadence: "weekly" }), { field: "firstDate" });
  assert.throws(() => inputWith({ firstDate: "2100-12-01", cadence: "monthly" }), { field: "firstDate" });
  assert.deepEqual(scheduleFor(inputWith({ firstDate: "2100-12-31", count: 1 })), [
    { date: "2100-12-31", amountMinor: 10001 },
  ]);
  const firstSupportedDate = { ...plan, firstDate: "2000-01-01" };
  assert.deepEqual(decodeProposal(encodeProposal(firstSupportedDate)), firstSupportedDate);
});

test("rejects missing, oversized, invalid, or noncanonical encodings", () => {
  const validToken = tokenFor(payload);
  const formatted = Buffer.from(JSON.stringify(payload, null, 1)).toString("base64url");
  assert.ok(formatted.length <= 128);

  for (const token of [
    undefined, null, 123, "", "A", "A".repeat(129), "#p=" + validToken, validToken + "=",
    " " + validToken, validToken + "\n", validToken.slice(1), "bad+token", "bad/token",
    Buffer.from("invalid JSON").toString("base64url"), formatted,
  ]) {
    assert.throws(() => decodeProposal(token), /link is incomplete or invalid/u);
  }
});

test("rejects unexpected payloads and values instead of coercing them", () => {
  const withField = (index, value) => {
    const changed = [...payload];
    changed[index] = value;
    return changed;
  };

  const invalidJpy = withField(3, "JPY");
  invalidJpy[2] = 10_000_000;

  for (const invalid of [
    null, {}, plan, payload.slice(0, -1), [...payload, "extra"],
    withField(0, 2), withField(0, "1"), withField(1, "B".repeat(22)),
    withField(2, "10001"), withField(2, 0), withField(2, 1), withField(2, 1.5),
    withField(2, 1_000_000_000), withField(3, "unknown"), invalidJpy,
    withField(4, 25), withField(4, "3"), withField(5, "daily"), withField(6, "2024-02-30"),
    withField(6, "2100-12-31"),
  ]) {
    assert.throws(() => decodeProposal(tokenFor(invalid)), /link is incomplete or invalid/u, JSON.stringify(invalid));
  }
});

test("formats currency and civil dates without the viewer time zone", () => {
  assert.match(formatMoney(123450, "USD"), /^USD\s1,234\.50$/u);
  assert.match(formatMoney(123450, "JPY"), /^JPY\s123,450$/u);
  assert.equal(formatDate("2024-02-29"), "February 29, 2024");
  assert.equal(formatDate("2000-01-01"), "January 1, 2000");
});

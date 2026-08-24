const test = require("node:test");
const assert = require("node:assert/strict");
const {
  APP_STORE_EVENT_URL,
  APP_STORE_URL,
  STATES,
  phaseForDate,
} = require("./ten-years.js");

const PRELAUNCH_BODY = "The anniversary experience opens in You Owe Me on August 26. Eligible free users can also explore a limited upgrade offer through September 4.";
const ACTIVE_BODY = "Open You Owe Me for the ten-year story. Eligible free users can also explore the anniversary upgrade offer through September 4.";
const RETROSPECTIVE_BODY = "The anniversary offer has ended, but the story remains. Open You Owe Me to revisit the ten-year experience.";

test("campaign dates resolve to the expected phases", () => {
  assert.equal(phaseForDate(new Date(2026, 7, 25, 12)), "prelaunch");
  assert.equal(phaseForDate(new Date(2026, 7, 26, 12)), "active");
  assert.equal(phaseForDate(new Date(2026, 8, 4, 12)), "active");
  assert.equal(phaseForDate(new Date(2026, 8, 5, 12)), "retrospective");
});

test("prelaunch uses the normal App Store listing", () => {
  assert.equal(STATES.prelaunch.secondaryLabel, "View You Owe Me on the App Store");
  assert.equal(STATES.prelaunch.secondaryUrl, APP_STORE_URL);
  assert.equal(STATES.prelaunch.body, PRELAUNCH_BODY);
});

test("active uses the public App Store event", () => {
  assert.equal(STATES.active.secondaryLabel, "View the App Store event");
  assert.equal(STATES.active.secondaryUrl, APP_STORE_EVENT_URL);
  assert.equal(STATES.active.body, ACTIVE_BODY);
});

test("retrospective returns to the normal App Store listing", () => {
  assert.equal(STATES.retrospective.secondaryUrl, APP_STORE_URL);
  assert.equal(STATES.retrospective.body, RETROSPECTIVE_BODY);
});

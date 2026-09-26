import assert from "node:assert/strict";
import test from "node:test";

import {
  IPHONE_HANDOFF_OFFER_VIEWED_EVENT,
  IPHONE_HANDOFF_REQUESTED_EVENT,
  IPHONE_QR_VIEWED_EVENT,
  bindIphoneHandoffAnalytics,
} from "./iphone-handoff-analytics-bridge.mjs";

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, listener) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(listener);
    },
    emit(type, detail) {
      for (const listener of listeners.get(type) || []) listener({ type, detail });
    },
  };
}

test("maps only approved handoff events and cta_location into the logger", () => {
  const eventTarget = createEventTarget();
  const logged = [];
  const trackEvent = (name, params) => logged.push({ name, params });

  assert.equal(bindIphoneHandoffAnalytics({ eventTarget, trackEvent }), true);
  assert.equal(bindIphoneHandoffAnalytics({ eventTarget, trackEvent }), false, "the bridge binds once");

  eventTarget.emit(IPHONE_HANDOFF_OFFER_VIEWED_EVENT, {
    cta_location: "homepage_iphone_handoff",
    invented_parameter: "not forwarded",
  });
  eventTarget.emit(IPHONE_HANDOFF_REQUESTED_EVENT, {
    cta_location: "roommate_template_iphone_handoff",
    event_name: "not caller-controlled",
  });
  eventTarget.emit(IPHONE_QR_VIEWED_EVENT, {
    cta_location: "split_result_iphone_handoff",
    result: "not forwarded",
  });
  for (const ctaLocation of [
    "money_owed_hero_iphone_handoff",
    "roommate_calculator_iphone_handoff",
    "payment_plan_results_iphone_handoff",
    "polite_reminder_post_copy_iphone_handoff",
    "friend_borrow_story_iphone_handoff",
    "homepage_story_iphone_handoff",
    "roommate_expense_story_iphone_handoff",
  ]) {
    eventTarget.emit(IPHONE_QR_VIEWED_EVENT, {
      cta_location: ctaLocation,
      invented_parameter: "not forwarded",
    });
  }
  eventTarget.emit(IPHONE_HANDOFF_OFFER_VIEWED_EVENT, { cta_location: "unapproved" });
  eventTarget.emit("youoweme:iphone-handoff-unknown", { cta_location: "homepage_iphone_handoff" });

  assert.deepEqual(logged, [
    {
      name: "uomi_web_iphone_handoff_offer_viewed",
      params: { cta_location: "homepage_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_handoff_requested",
      params: { cta_location: "roommate_template_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "split_result_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "money_owed_hero_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "roommate_calculator_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "payment_plan_results_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "polite_reminder_post_copy_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "friend_borrow_story_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "homepage_story_iphone_handoff" },
    },
    {
      name: "uomi_web_iphone_qr_viewed",
      params: { cta_location: "roommate_expense_story_iphone_handoff" },
    },
  ]);
});

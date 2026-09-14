export const IPHONE_HANDOFF_OFFER_VIEWED_EVENT = "youoweme:iphone-handoff-offer-viewed";
export const IPHONE_HANDOFF_REQUESTED_EVENT = "youoweme:iphone-handoff-requested";
export const IPHONE_QR_VIEWED_EVENT = "youoweme:iphone-qr-viewed";

const LOCATION_VALUES = new Set([
  "homepage_iphone_handoff",
  "roommate_template_iphone_handoff",
  "split_result_iphone_handoff",
  "money_owed_hero_iphone_handoff",
  "roommate_calculator_iphone_handoff",
  "payment_plan_results_iphone_handoff",
  "polite_reminder_post_copy_iphone_handoff",
]);

const FIREBASE_EVENTS = {
  [IPHONE_HANDOFF_OFFER_VIEWED_EVENT]: "uomi_web_iphone_handoff_offer_viewed",
  [IPHONE_HANDOFF_REQUESTED_EVENT]: "uomi_web_iphone_handoff_requested",
  [IPHONE_QR_VIEWED_EVENT]: "uomi_web_iphone_qr_viewed",
};

export function bindIphoneHandoffAnalytics({ eventTarget, trackEvent }) {
  if (!eventTarget || typeof eventTarget.addEventListener !== "function" || typeof trackEvent !== "function") return false;
  if (eventTarget.__youOweMeIphoneHandoffAnalyticsBound) return false;

  eventTarget.__youOweMeIphoneHandoffAnalyticsBound = true;
  const onHandoffEvent = function (event) {
    const detail = event && event.detail ? event.detail : {};
    const eventName = FIREBASE_EVENTS[event.type];
    const ctaLocation = typeof detail.cta_location === "string" ? detail.cta_location : "";
    if (!eventName || !LOCATION_VALUES.has(ctaLocation)) return;
    void trackEvent(eventName, { cta_location: ctaLocation });
  };

  eventTarget.addEventListener(IPHONE_HANDOFF_OFFER_VIEWED_EVENT, onHandoffEvent);
  eventTarget.addEventListener(IPHONE_HANDOFF_REQUESTED_EVENT, onHandoffEvent);
  eventTarget.addEventListener(IPHONE_QR_VIEWED_EVENT, onHandoffEvent);
  return true;
}

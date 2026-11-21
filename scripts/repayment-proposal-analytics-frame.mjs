import { FIREBASE_CONFIG } from "./site-analytics-config.mjs";
import {
  canCollectProposalAnalytics,
  isProposalRecipientEvent,
  PROPOSAL_ANALYTICS_FRAME_PATH,
  PROPOSAL_ANALYTICS_READY,
  PROPOSAL_RECIPIENT_PATH,
} from "./repayment-proposal-events.mjs";

const { origin } = window.location;

function isPrivateAnalyticsFrame() {
  return canCollectProposalAnalytics() && window.frameElement && !document.referrer &&
    window.location.href === `${origin}${PROPOSAL_ANALYTICS_FRAME_PATH}`;
}

async function initRecipientAnalytics() {
  if (!isPrivateAnalyticsFrame()) return;

  try {
    const [{ initializeApp }, { initializeAnalytics, isSupported, logEvent }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js"),
    ]);
    if (!await isSupported() || !isPrivateAnalyticsFrame()) return;

    const app = initializeApp(FIREBASE_CONFIG);
    const analytics = initializeAnalytics(app, {
      config: {
        page_location: `${origin}${PROPOSAL_RECIPIENT_PATH}`,
        page_referrer: "",
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      },
    });

    window.addEventListener("message", event => {
      if (event.source === window.parent && event.origin === origin && isProposalRecipientEvent(event.data)) {
        logEvent(analytics, event.data);
      }
    });
    window.parent.postMessage(PROPOSAL_ANALYTICS_READY, origin);
  } catch {
    // The proposal stays usable if analytics is blocked or unavailable.
  }
}

void initRecipientAnalytics();

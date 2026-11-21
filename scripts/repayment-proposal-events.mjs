import { FIREBASE_CONFIG, isSiteAnalyticsHost } from "./site-analytics-config.mjs";

export const PROPOSAL_SENDER_PATH = "/blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/";
export const PROPOSAL_RECIPIENT_PATH = "/repayment-plan/";
export const PROPOSAL_ANALYTICS_FRAME_PATH = "/repayment-plan/analytics/";
export const PROPOSAL_ANALYTICS_READY = "youoweme:proposal-analytics-ready";
const SENDER_STORAGE_KEY = "yom.repayment-proposal.sender-ids.v1";
const MAX_SENDER_IDS = 32;
const MAX_PENDING_EVENTS = 16;
const PUBLIC_CAMPAIGN_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content", "utm_source_platform",
  "utm_creative_format", "utm_marketing_tactic", "gclid", "dclid", "gbraid", "wbraid", "fbclid", "msclkid",
]);

const SENDER_EVENTS = new Map([
  ["builder_opened", "uomi_web_plan_builder_opened"],
  ["link_shared", "uomi_web_plan_link_shared"],
  ["link_copied", "uomi_web_plan_link_copied"],
]);
const RECIPIENT_EVENTS = new Map([
  ["recipient_opened", "uomi_web_plan_recipient_opened"],
  ["recipient_engaged", "uomi_web_plan_recipient_engaged"],
  ["recipient_saved", "uomi_web_plan_recipient_saved"],
]);
const RECIPIENT_EVENT_NAMES = new Set(RECIPIENT_EVENTS.values());

export function isProposalRecipientEvent(name) {
  return RECIPIENT_EVENT_NAMES.has(name);
}

const pendingEvents = [];
let logProposalEvent;
let recipientAnalyticsStarted = false;
let recentSenderIds = [];

function isProposalId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{21}[AQgw]$/.test(id) && id.length === 22;
}

function readSenderIds(storage) {
  try {
    const ids = JSON.parse(storage.getItem(SENDER_STORAGE_KEY));
    if (Array.isArray(ids)) return ids.slice(-MAX_SENDER_IDS).filter(isProposalId);
  } catch {
    // Storage can be disabled or contain data from an earlier page visit.
  }
  return [];
}

export function markProposalSender(id) {
  if (!isProposalId(id)) return;
  recentSenderIds = [...recentSenderIds.filter(value => value !== id), id].slice(-MAX_SENDER_IDS);

  for (const storageName of ["localStorage", "sessionStorage"]) {
    try {
      const storage = window[storageName];
      const ids = readSenderIds(storage).filter(value => value !== id);
      storage.setItem(SENDER_STORAGE_KEY, JSON.stringify([...ids, id].slice(-MAX_SENDER_IDS)));
      return;
    } catch {
      // Try session storage if persistent storage is unavailable.
    }
  }
}

export function isProposalSender(id) {
  if (!isProposalId(id)) return false;
  if (recentSenderIds.includes(id)) return true;

  for (const storageName of ["localStorage", "sessionStorage"]) {
    try {
      if (readSenderIds(window[storageName]).includes(id)) return true;
    } catch {
      // Access to a storage property can also be blocked.
    }
  }
  return false;
}

export function isProposalSenderPath(pathname) {
  return pathname === PROPOSAL_SENDER_PATH || pathname === `${PROPOSAL_SENDER_PATH}index.html`;
}

export function proposalSenderAnalyticsConfig(location, document) {
  if (!isProposalSenderPath(location.pathname)) return null;
  if (location.hash && !document.getElementById(location.hash.slice(1))) return null;

  const publicPage = new URL(PROPOSAL_SENDER_PATH, location.origin);
  for (const [name, value] of new URL(location.href).searchParams) {
    if (!PUBLIC_CAMPAIGN_PARAMETERS.has(name) || !/^[A-Za-z0-9_.~ -]{1,128}$/.test(value) ||
        isProposalId(value) || value.startsWith("WzEsI")) return null;
    publicPage.searchParams.append(name, value);
  }

  let pageReferrer = "";
  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (!isHttpUrl(referrer)) return null;
      if (isSiteAnalyticsHost(referrer.hostname) && referrer.pathname.startsWith(PROPOSAL_RECIPIENT_PATH) &&
          (referrer.search || referrer.hash)) return null;
      pageReferrer = referrer.origin;
    } catch {
      return null;
    }
  }

  return {
    page_location: publicPage.href,
    page_referrer: pageReferrer,
  };
}

function isHttpUrl(url) {
  return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
}

function isSafeRecipientReferrer(referrer) {
  if (!referrer) return true;

  try {
    const url = new URL(referrer);
    if (!isHttpUrl(url)) return false;
    return referrer === `${url.origin}/` || (
      isSiteAnalyticsHost(url.hostname) && referrer === `${url.origin}${PROPOSAL_SENDER_PATH}`
    );
  } catch {
    return false;
  }
}

export function canCollectProposalAnalytics() {
  return typeof window !== "undefined" && window.location.protocol === "https:" &&
    isSiteAnalyticsHost(window.location.hostname) && !window[`ga-disable-${FIREBASE_CONFIG.measurementId}`];
}

function canCollectRecipientAnalytics() {
  if (!canCollectProposalAnalytics()) return false;

  const { location, document } = window;
  return location.href === `${location.origin}${PROPOSAL_RECIPIENT_PATH}` &&
    isSafeRecipientReferrer(document.referrer);
}

export function trackProposal(stage) {
  if (!canCollectProposalAnalytics()) return;

  const { location, document } = window;
  let eventName;
  if (isProposalSenderPath(location.pathname) && proposalSenderAnalyticsConfig(location, document)) {
    eventName = SENDER_EVENTS.get(stage);
  } else if (recipientAnalyticsStarted && canCollectRecipientAnalytics()) {
    eventName = RECIPIENT_EVENTS.get(stage);
  }

  if (!eventName) return;
  if (logProposalEvent) {
    logProposalEvent(eventName);
  } else if (pendingEvents.length < MAX_PENDING_EVENTS) {
    pendingEvents.push(eventName);
  }
}

function bindProposalAnalytics(logEvent) {
  if (logProposalEvent) return;
  logProposalEvent = logEvent;
  for (const eventName of pendingEvents.splice(0)) logProposalEvent(eventName);
}

export function bindProposalSenderAnalytics(logEvent) {
  if (!canCollectProposalAnalytics() || !proposalSenderAnalyticsConfig(window.location, window.document)) return;
  bindProposalAnalytics(logEvent);
}

export function startProposalRecipientAnalytics() {
  if (recipientAnalyticsStarted || !canCollectRecipientAnalytics()) return;
  recipientAnalyticsStarted = true;

  // Google's automatic URL and interaction collection stays in this static frame.
  const { origin } = window.location;
  const frame = window.document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Repayment proposal analytics";
  frame.referrerPolicy = "no-referrer";
  frame.src = PROPOSAL_ANALYTICS_FRAME_PATH;

  function onFrameReady(event) {
    if (event.source !== frame.contentWindow || event.origin !== origin || event.data !== PROPOSAL_ANALYTICS_READY) return;
    window.removeEventListener("message", onFrameReady);
    bindProposalAnalytics(eventName => {
      if (canCollectRecipientAnalytics()) frame.contentWindow.postMessage(eventName, origin);
    });
  }

  window.addEventListener("message", onFrameReady);
  window.document.body.append(frame);
}

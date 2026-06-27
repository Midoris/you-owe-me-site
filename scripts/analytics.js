import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setDefaultEventParameters,
  setUserProperties,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOsFoz3lixG5KA7aGu_IQg_N3Pc_tIpt4",
  authDomain: "you-owe-me-app.firebaseapp.com",
  databaseURL: "https://you-owe-me-app.firebaseio.com",
  projectId: "you-owe-me-app",
  storageBucket: "you-owe-me-app.firebasestorage.app",
  messagingSenderId: "1056899447246",
  appId: "1:1056899447246:web:9880554b4d5bf68003539f",
  measurementId: "G-TJDLPVM702",
};

const APP_STORE_HOST_MATCH = "apps.apple.com";
const APP_STORE_ID_MATCH = "id1147058670";
const WEB_EVENT_PREFIX = "uomi_web_";
const PAGE_VISITED_EVENT = "uomi_web_page_visited";
const APP_STORE_OPENED_EVENT = "uomi_web_app_store_opened";
const SALE_CHANGED_EVENT = "youoweme:sale-changed";
const SUPPORT_FORM_SENT_EVENT = "youoweme:support-form-sent";
const SUPPORT_FORM_ERROR_EVENT = "youoweme:support-form-error";
const TOOL_TEMPLATE_COPY_EVENT = "youoweme:tool-template-copy";
const PAYBACK_GENERATOR_EVENT = "youoweme:payback-generator-event";
const TEMPORARY_HELP_COPY_EVENT = "youoweme:temporary-financial-help-copy";
const PAYMENT_PLAN_TOOL_EVENT = "youoweme:payment-plan-tool-event";
const TEMPORARY_SUPPORT_RECORD_TOOL_EVENT = "youoweme:temporary-support-record-tool-event";
const PAYBACK_GENERATOR_EVENTS = new Set([
  "payback_generator_generate",
  "payback_generator_copy_short",
  "payback_generator_copy_clear",
  "payback_generator_copy_context",
  "payback_generator_clear",
  "payback_generator_use_example",
  "payback_generator_app_store_click",
  "payback_generator_examples_click",
  "payback_generator_solution_click",
]);
const PAYMENT_PLAN_EVENTS = new Set([
  "payment_plan_tool_start",
  "payment_plan_calculate",
  "payment_plan_copy_message",
  "payment_plan_copy_summary",
  "payment_plan_copy_record_note",
]);
const TEMPORARY_SUPPORT_RECORD_EVENTS = new Set([
  "temporary_support_record_tool_start",
  "temporary_support_record_complete",
  "temporary_support_record_copy_record",
  "temporary_support_record_copy_message",
  "temporary_support_record_copy_app_note",
]);

const APP_STORE_CPP_BY_PPID = {
  "0ad25f49-9026-4d8b-99ea-9581a98702db": "money_owed_followups",
  "7f9074ac-4090-4e07-aebe-c5722e76eedc": "shared_expenses",
  "8e720a01-7489-4044-9f6a-0080793442a0": "couples_relationship_spending",
  "bc366b6c-90ff-4cde-9ae7-d420c6512e7a": "family_reimbursements",
  "18039f2b-da9e-4d5f-9ba1-b60f117ecf12": "roommates_household_costs",
  "794c6086-e032-4408-ab2f-acb4ad23ec98": "elderly_parent_caregiving",
  "15af0298-82ca-4a0e-8230-d12774916992": "client_payment_records",
  "07350272-1b8a-4f9f-a267-dc72c33b4404": "long_term_interest_balances",
  "d333ba53-318b-44d7-ad07-f29841091043": "group_paybacks",
  "d845bed2-b88d-47a2-854a-9aa0c35eb049": "temporary_support",
};

const PAGE_METADATA = {
  "/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/index.html": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/find/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/quick-start/": { page_type: "feature", cluster: "multi_cluster", app_store_cpp: "default" },
  "/features/": { page_type: "feature", cluster: "multi_cluster", app_store_cpp: "default" },
  "/reviews/": { page_type: "review", cluster: "multi_cluster", app_store_cpp: "default" },
  "/solutions/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/tools/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/compare/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/blog/": { page_type: "hub", cluster: "multi_cluster", app_store_cpp: "default" },
  "/privacy-policy/": { page_type: "legal", cluster: "legal_support", app_store_cpp: "none" },
  "/contact/": { page_type: "legal", cluster: "legal_support", app_store_cpp: "none" },
  "/redeem/": { page_type: "feature", cluster: "multi_cluster", app_store_cpp: "default" },
  "/solutions/app-to-track-money-owed/": { page_type: "solution", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/solutions/shared-expense-tracker/": { page_type: "solution", cluster: "shared_expenses", app_store_cpp: "shared_expenses" },
  "/solutions/group-payback-tracker/": { page_type: "solution", cluster: "group_paybacks", app_store_cpp: "group_paybacks" },
  "/solutions/roommate-expense-tracker/": { page_type: "solution", cluster: "roommates_household_costs", app_store_cpp: "roommates_household_costs" },
  "/solutions/expense-tracker-for-couples/": { page_type: "solution", cluster: "couples_relationship_spending", app_store_cpp: "couples_relationship_spending" },
  "/solutions/family-reimbursement-tracker/": { page_type: "solution", cluster: "family_reimbursements", app_store_cpp: "family_reimbursements" },
  "/solutions/elderly-parent-expense-tracker/": { page_type: "solution", cluster: "elderly_parent_caregiving", app_store_cpp: "elderly_parent_caregiving" },
  "/solutions/temporary-financial-support-tracker/": { page_type: "solution", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/solutions/client-payment-records/": { page_type: "solution", cluster: "client_payment_records", app_store_cpp: "client_payment_records" },
  "/tools/split-expense-calculator/": { page_type: "tool", cluster: "shared_expenses", app_store_cpp: "shared_expenses" },
  "/tools/couple-shared-expense-balance-calculator/": { page_type: "tool", cluster: "couples_relationship_spending", app_store_cpp: "couples_relationship_spending" },
  "/tools/running-balance-calculator/": { page_type: "tool", cluster: "running_balance", app_store_cpp: "default" },
  "/tools/roommate-bill-split-calculator/": { page_type: "tool", cluster: "roommates_household_costs", app_store_cpp: "roommates_household_costs" },
  "/tools/partial-repayment-calculator/": { page_type: "tool", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/tools/group-payback-calculator/": { page_type: "tool", cluster: "group_paybacks", app_store_cpp: "group_paybacks" },
  "/tools/payment-plan-calculator/": { page_type: "tool", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/tools/polite-payback-reminder-generator/": { page_type: "tool", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/tools/repayment-reminder-text-examples/": { page_type: "tool", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/tools/repayment-receipt-generator/": { page_type: "tool", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/tools/temporary-financial-support-record-template/": { page_type: "tool", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/tools/family-reimbursement-tracker-template/": { page_type: "tool", cluster: "family_reimbursements", app_store_cpp: "family_reimbursements" },
  "/compare/best-way-to-track-ious-between-people/": { page_type: "comparison", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/compare/splitwise-alternative/": { page_type: "comparison", cluster: "group_paybacks", app_store_cpp: "group_paybacks" },
  "/compare/spreadsheet-vs-app-for-tracking-money-owed/": { page_type: "comparison", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/compare/shared-expense-app-vs-running-balance-app/": { page_type: "compare", cluster: "shared_expenses", app_store_cpp: "shared_expenses" },
  "/blog/how-to-keep-track-of-who-owes-you-money/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-remind-someone-they-owe-you-money-politely/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-ask-someone-to-pay-you-back-without-being-rude/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-do-you-confront-someone-who-owes-you-money-without-ruining-the-relationship/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-follow-up-after-a-partial-repayment/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/when-to-ask-for-money-back-or-send-a-repayment-update/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-handle-awkward-money-conversations/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-politely-say-no-when-people-ask-for-money/": { page_type: "blog", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/blog/why-simple-loans-dont-stay-simple/": { page_type: "blog", cluster: "money_owed_followups", app_store_cpp: "money_owed_followups" },
  "/blog/how-to-send-a-repayment-update-when-you-need-more-time/": { page_type: "blog", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/blog/how-to-ask-family-for-temporary-financial-help/": { page_type: "blog", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/blog/how-to-support-someone-financially-without-confusion/": { page_type: "blog", cluster: "temporary_financial_support", app_store_cpp: "temporary_support" },
  "/blog/what-is-a-running-balance-between-two-people/": { page_type: "blog", cluster: "running_balance", app_store_cpp: "default" },
  "/blog/how-to-track-shared-expenses-without-constantly-reconciling-every-transaction/": { page_type: "blog", cluster: "shared_expenses", app_store_cpp: "shared_expenses" },
  "/blog/how-to-track-who-paid-you-back-for-a-group-expense/": { page_type: "blog", cluster: "group_paybacks", app_store_cpp: "group_paybacks" },
  "/blog/how-to-track-money-between-roommates/": { page_type: "blog", cluster: "roommates_household_costs", app_store_cpp: "roommates_household_costs" },
  "/blog/how-to-split-rent-utilities-and-groceries-with-roommates/": { page_type: "blog", cluster: "roommates_household_costs", app_store_cpp: "roommates_household_costs" },
  "/blog/how-to-split-expenses-in-a-relationship-without-fighting/": { page_type: "blog", cluster: "couples_relationship_spending", app_store_cpp: "couples_relationship_spending" },
  "/blog/how-to-keep-track-of-money-between-family-members/": { page_type: "blog", cluster: "family_reimbursements", app_store_cpp: "family_reimbursements" },
  "/blog/how-to-track-money-you-pay-for-elderly-parents/": { page_type: "blog", cluster: "elderly_parent_caregiving", app_store_cpp: "elderly_parent_caregiving" },
  "/blog/how-to-track-subscriptions-and-bills-you-pay-for-family/": { page_type: "blog", cluster: "family_reimbursements", app_store_cpp: "family_reimbursements" },
};

const app = shouldInitializeFirebase() ? initializeApp(FIREBASE_CONFIG) : null;
const analyticsPromise = initAnalytics();
const saleBadgeEventsSent = new Set();
let pageVisitTracked = false;

let activeSale = null;

function shouldInitializeFirebase() {
  const hostname = window.location.hostname;
  return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
}

async function initAnalytics() {
  try {
    if (!app) return null;

    const supported = await isSupported();
    if (!supported) return null;

    const analytics = getAnalytics(app);

    setDefaultEventParameters({
      site_platform: "web",
      experience_surface: "marketing_site",
      page_type: getPageMetadata().page_type,
      cluster: getPageMetadata().cluster,
      app_store_cpp: getPageMetadata().app_store_cpp,
    });

    setUserProperties(analytics, {
      site_platform: "web",
      experience_surface: "marketing_site",
    });

    return analytics;
  } catch (error) {
    return null;
  }
}

function normalizePath(path) {
  if (!path || path === "/index.html") return "/";
  if (path.endsWith("/index.html")) return path.slice(0, -"index.html".length);
  return path.endsWith("/") ? path : path + "/";
}

function getPageMetadata() {
  const normalizedPath = normalizePath(window.location.pathname);
  return PAGE_METADATA[normalizedPath] || {
    page_type: "hub",
    cluster: "multi_cluster",
    app_store_cpp: "default",
  };
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeEventName(eventName) {
  return String(eventName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeEventName(eventName) {
  const sanitizedName = sanitizeEventName(eventName);
  if (!sanitizedName) return WEB_EVENT_PREFIX + "event";
  if (sanitizedName.indexOf(WEB_EVENT_PREFIX) === 0) return sanitizedName.slice(0, 40);
  return (WEB_EVENT_PREFIX + sanitizedName).slice(0, 40);
}

function normalizeSale(sale) {
  if (!sale) return null;
  return {
    id: sanitizeText(sale.id, 64),
    saleName: sanitizeText(sale.saleName, 80),
  };
}

function getActiveSale() {
  try {
    if (window.YouOweMeSaleState && typeof window.YouOweMeSaleState.getActiveSale === "function") {
      return normalizeSale(window.YouOweMeSaleState.getActiveSale());
    }
  } catch (error) {
    return null;
  }

  return null;
}

function getSaleParams() {
  if (!activeSale) {
    return {
      sale_active: 0,
      sale_name: "none",
      sale_id: "none",
    };
  }

  return {
    sale_active: 1,
    sale_name: activeSale.saleName || "unknown",
    sale_id: activeSale.id || "unknown",
  };
}

async function trackEvent(eventName, params) {
  const analytics = await analyticsPromise;
  if (!analytics) return;
  const pageMetadata = getPageMetadata();

  logEvent(analytics, normalizeEventName(eventName), Object.assign(
    {
      page_type: pageMetadata.page_type,
      cluster: pageMetadata.cluster,
      app_store_cpp: pageMetadata.app_store_cpp,
      page_path: window.location.pathname,
      site_platform: "web",
      experience_surface: "marketing_site",
    },
    params || {}
  ));
}

function getReferrerContext() {
  const currentOrigin = window.location.origin;
  let referrerUrl = null;

  try {
    referrerUrl = document.referrer ? new URL(document.referrer) : null;
  } catch (error) {
    referrerUrl = null;
  }

  if (referrerUrl && referrerUrl.origin === currentOrigin) {
    return {
      entry_type: "internal_navigation",
      is_initial_entry: 0,
      referrer_type: "same_site",
      previous_page_path: normalizePath(referrerUrl.pathname),
      referrer_domain: referrerUrl.hostname,
    };
  }

  return {
    entry_type: "initial_entry",
    is_initial_entry: 1,
    referrer_type: referrerUrl ? "external" : "none",
    previous_page_path: "none",
    referrer_domain: referrerUrl ? referrerUrl.hostname : "none",
  };
}

function hasSmartAppBanner() {
  return document.querySelector('meta[name="apple-itunes-app"]') ? 1 : 0;
}

function isIosMobile() {
  const ua = window.navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (
    window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1
  );
}

function trackPageVisited() {
  if (pageVisitTracked) return;
  pageVisitTracked = true;

  void trackEvent(PAGE_VISITED_EVENT, Object.assign({}, getReferrerContext(), {
    page_title: sanitizeText(document.title, 160),
    page_url: sanitizeText(window.location.href, 240),
    smart_app_banner_available: hasSmartAppBanner(),
    smart_app_banner_ios_mobile: hasSmartAppBanner() && isIosMobile() ? 1 : 0,
  }));
}

function getCtaLocation(link) {
  if (link.dataset.ctaLocation) return link.dataset.ctaLocation;
  if (link.dataset.trackLocation) return link.dataset.trackLocation;
  if (link.closest(".lt-hero")) return "hero_cta";
  if (link.closest(".lt-cta")) return "article_cta";
  if (link.closest("#nav")) return "nav";
  if (link.closest("#main")) return "main";
  return "unknown";
}

function normalizeClusterValue(value) {
  const key = sanitizeText(value, 80).replace(/-/g, "_");
  const aliases = {
    app_store: "app_store",
    caregiving: "elderly_parent_caregiving",
    client_records: "client_payment_records",
    compare: "multi_cluster",
    couples: "couples_relationship_spending",
    family: "family_reimbursements",
    features: "multi_cluster",
    group_paybacks: "group_paybacks",
    homepage: "multi_cluster",
    money_owed: "money_owed_followups",
    repayments: "money_owed_followups",
    reviews: "multi_cluster",
    roommates: "roommates_household_costs",
    shared_expenses: "shared_expenses",
    temporary_support: "temporary_financial_support",
    tools: "multi_cluster",
  };

  return aliases[key] || key || "unknown";
}

function normalizeAppStoreCppValue(value) {
  const normalizedValue = normalizeClusterValue(value);
  if (normalizedValue === "temporary_financial_support") return "temporary_support";
  return normalizedValue;
}

function getAppStoreCppFromLink(link) {
  try {
    const url = new URL(link.href);
    const ppid = url.searchParams.get("ppid");
    if (ppid && APP_STORE_CPP_BY_PPID[ppid]) return APP_STORE_CPP_BY_PPID[ppid];
  } catch (error) {
    return "default";
  }

  return "default";
}

function getAppStoreIntendedCpp(link, pageMetadata, appStoreCpp) {
  const stepDestination = sanitizeText(link.dataset.stepDestination, 160);
  const stepMatch = stepDestination.match(/^app-store:(.+)$/);
  if (stepMatch && stepMatch[1]) {
    return normalizeAppStoreCppValue(stepMatch[1]);
  }

  if (appStoreCpp && appStoreCpp !== "default") return appStoreCpp;
  if (pageMetadata.app_store_cpp && pageMetadata.app_store_cpp !== "none") return pageMetadata.app_store_cpp;
  return appStoreCpp || "default";
}

function getAppStoreButtonVariant(link) {
  if (link.closest('[data-module="best-next-step"]')) return "best_next_step";
  if (link.querySelector("img")) return "app_store_badge";
  if (link.target && link.target.toLowerCase() === "_blank") return "external_link";
  return "custom_link";
}

function getAppStoreCtaSurface(link) {
  if (link.closest('[data-module="best-next-step"]')) return "best_next_step";
  if (link.closest(".lt-toolsHero") || link.closest(".lt-detailHero") || link.closest(".lt-hero")) return "hero";
  if (link.closest("footer") || link.closest("#footer")) return "footer";
  if (link.closest(".lt-finalCta") || link.closest(".lt-bottomCta")) return "final_cta";
  if (link.closest("#main")) return "inline";
  if (link.closest("#nav")) return "nav";
  return "other";
}

function shouldInterceptNavigation(event, link) {
  if (event.defaultPrevented) return false;
  if (event.button && event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target.toLowerCase() === "_blank") return false;
  return true;
}

function trackAppStoreClick(link, event) {
  const pageMetadata = getPageMetadata();
  const sourceCluster = link.dataset.sourceCluster
    ? normalizeClusterValue(link.dataset.sourceCluster)
    : pageMetadata.cluster;
  const appStoreCpp = getAppStoreCppFromLink(link);
  const intendedCpp = getAppStoreIntendedCpp(link, pageMetadata, appStoreCpp);
  const eventPayload = Object.assign({}, getSaleParams(), {
    source_page_path: window.location.pathname,
    page_title: sanitizeText(document.title, 160),
    cta_location: getCtaLocation(link),
    cta_surface: getAppStoreCtaSurface(link),
    cta_cluster: sourceCluster,
    app_store_cpp: appStoreCpp,
    app_store_intended_cpp: intendedCpp,
    app_store_button_variant: getAppStoreButtonVariant(link),
    link_url: link.href,
    app_store_destination_url: link.href,
    link_text: sanitizeText(link.getAttribute("aria-label") || link.textContent, 120),
  });

  if (!shouldInterceptNavigation(event, link)) {
    void trackEvent(APP_STORE_OPENED_EVENT, eventPayload);
    return;
  }

  event.preventDefault();

  let navigated = false;
  const navigate = function () {
    if (navigated) return;
    navigated = true;
    window.location.assign(link.href);
  };

  void trackEvent(APP_STORE_OPENED_EVENT, eventPayload);
  window.setTimeout(navigate, 200);
}

function bindAppStoreClicks() {
  const links = document.querySelectorAll("a[href*='apps.apple.com']");

  links.forEach(function (link) {
    if (link.dataset.analyticsBound === "1") return;
    if (link.href.indexOf(APP_STORE_HOST_MATCH) === -1) return;
    if (link.href.indexOf(APP_STORE_ID_MATCH) === -1) return;

    link.dataset.analyticsBound = "1";
    link.addEventListener("click", function (event) {
      trackAppStoreClick(link, event);
    });
  });
}

function trackBlogArticleOpen() {
  if (getPageMetadata().page_type !== "blog") return;
  if (window.__youowemeBlogArticleOpenTracked) return;

  window.__youowemeBlogArticleOpenTracked = true;

  const pagePath = window.location.pathname;
  const slug = sanitizeText(pagePath.replace(/^\/blog\//, "").replace(/\/$/, ""), 120) || "unknown";
  const heading = document.querySelector("h1");

  void trackEvent("blog_article_open", Object.assign({}, getSaleParams(), {
    article_slug: slug,
    article_title: sanitizeText(heading ? heading.textContent : "unknown", 160),
  }));
}

function bindMediumClicks() {
  const links = document.querySelectorAll("a[href*='medium.com']");

  links.forEach(function (link) {
    if (link.dataset.mediumAnalyticsBound === "1") return;

    link.dataset.mediumAnalyticsBound = "1";
    link.addEventListener("click", function () {
      void trackEvent("medium_article_click", Object.assign({}, getSaleParams(), {
        cta_location: getCtaLocation(link),
        link_url: link.href,
        link_text: sanitizeText(link.textContent, 120),
      }));
    });
  });
}

function bindTrackedLinkClicks() {
  const links = document.querySelectorAll("a[data-track-event]");

  links.forEach(function (link) {
    if (link.dataset.linkAnalyticsBound === "1") return;
    if (link.href && link.href.indexOf(APP_STORE_HOST_MATCH) !== -1 && link.href.indexOf(APP_STORE_ID_MATCH) !== -1) return;

    link.dataset.linkAnalyticsBound = "1";
    link.addEventListener("click", function () {
      const eventName = sanitizeText(link.dataset.trackEvent, 80) || "site_link_click";
      const bestNextStepModule = link.closest('[data-module="best-next-step"]');
      const bestNextStepPayload = bestNextStepModule
        ? {
            source_page: sanitizeText(link.dataset.sourcePage || bestNextStepModule.dataset.sourcePage, 120),
            source_cluster: sanitizeText(link.dataset.sourceCluster || bestNextStepModule.dataset.sourceCluster, 80),
            destination_url: sanitizeText(link.href, 240),
            destination_cluster: sanitizeText(link.dataset.destinationCluster, 80),
            step_type: sanitizeText(link.dataset.stepType, 40),
            step_intent: sanitizeText(link.dataset.stepIntent, 80),
            step_destination: sanitizeText(link.dataset.stepDestination, 160),
            step_position: sanitizeText(link.dataset.stepPosition, 10),
            module_variant: sanitizeText(link.dataset.moduleVariant || bestNextStepModule.dataset.moduleVariant, 40),
            module_template: sanitizeText(link.dataset.moduleTemplate || bestNextStepModule.dataset.moduleTemplate, 80),
          }
        : {};

      void trackEvent(eventName, Object.assign({}, getSaleParams(), bestNextStepPayload, {
        cta_location: getCtaLocation(link),
        link_url: link.href,
        link_text: sanitizeText(link.getAttribute("aria-label") || link.textContent, 120),
      }));
    });
  });
}

function trackSaleBadgeVisible() {
  if (!activeSale) return;

  const visibleBadges = Array.prototype.filter.call(
    document.querySelectorAll(".lt-salePill"),
    function (badge) {
      return !badge.hidden;
    }
  );

  if (!visibleBadges.length) return;

  const pageKey = window.location.pathname + "|" + (activeSale.id || "unknown");
  if (saleBadgeEventsSent.has(pageKey)) return;

  saleBadgeEventsSent.add(pageKey);

  void trackEvent("sale_badge_visible", Object.assign({}, getSaleParams(), {
    badge_count: visibleBadges.length,
  }));
}

function onSaleChanged(event) {
  activeSale = normalizeSale(event && event.detail ? event.detail.sale : null);
  trackSaleBadgeVisible();
}

function onSupportFormSent() {
  void trackEvent("support_form_sent");
}

function onSupportFormError() {
  void trackEvent("support_form_error");
}

function onToolTemplateCopy(event) {
  const detail = event && event.detail ? event.detail : {};

  void trackEvent("tool_template_copy", Object.assign({}, getSaleParams(), {
    page: sanitizeText(detail.page, 80),
    template_id: sanitizeText(detail.template_id, 120),
    tone: sanitizeText(detail.tone, 80),
    category: sanitizeText(detail.category, 80),
  }));
}

function onPaybackGeneratorEvent(event) {
  const detail = event && event.detail ? event.detail : {};
  const eventName = sanitizeText(detail.eventName, 80);

  if (!PAYBACK_GENERATOR_EVENTS.has(eventName)) return;

  void trackEvent(eventName, Object.assign({}, getSaleParams(), {
    relationship: sanitizeText(detail.relationship, 80),
    situation: sanitizeText(detail.situation, 120),
    tone: sanitizeText(detail.tone, 80),
    preferred_version: sanitizeText(detail.preferred_version, 80),
    include_timing_hard_line: detail.include_timing_hard_line ? 1 : 0,
    include_statement_line: detail.include_statement_line ? 1 : 0,
  }));
}

function onTemporaryHelpCopy(event) {
  const detail = event && event.detail ? event.detail : {};
  const copyType = sanitizeText(detail.copy_type, 40);
  const eventName = copyType === "record"
    ? "temporary_help_support_record_copy"
    : "temporary_help_template_copy";

  void trackEvent(eventName, Object.assign({}, getSaleParams(), {
    copy_type: copyType || "template",
    template_id: sanitizeText(detail.id, 120),
  }));
}

function onPaymentPlanToolEvent(event) {
  const detail = event && event.detail ? event.detail : {};
  const eventName = sanitizeText(detail.eventName, 80);

  if (!PAYMENT_PLAN_EVENTS.has(eventName)) return;

  void trackEvent(eventName, Object.assign({}, getSaleParams(), {
    mode: sanitizeText(detail.mode, 40),
    frequency: sanitizeText(detail.frequency, 40),
    perspective: sanitizeText(detail.perspective, 40),
    result_state: sanitizeText(detail.result_state, 40),
    payment_count: Number.isFinite(Number(detail.payment_count)) ? Number(detail.payment_count) : 0,
    copy_target: sanitizeText(detail.copy_target, 40),
  }));
}

function onTemporarySupportRecordToolEvent(event) {
  const detail = event && event.detail ? event.detail : {};
  const eventName = sanitizeText(detail.eventName, 80);

  if (!TEMPORARY_SUPPORT_RECORD_EVENTS.has(eventName)) return;

  void trackEvent(eventName, Object.assign({}, getSaleParams(), {
    support_type: sanitizeText(detail.support_type, 40),
    perspective: sanitizeText(detail.perspective, 40),
    has_helper: detail.has_helper ? 1 : 0,
    has_receiver: detail.has_receiver ? 1 : 0,
    has_amount: detail.has_amount ? 1 : 0,
    has_purpose: detail.has_purpose ? 1 : 0,
    has_date: detail.has_date ? 1 : 0,
    has_check_in: detail.has_check_in ? 1 : 0,
    clarify_count: Number.isFinite(Number(detail.clarify_count)) ? Number(detail.clarify_count) : 0,
    copy_target: sanitizeText(detail.copy_target, 40),
    result_state: sanitizeText(detail.result_state, 40),
  }));
}

function initEventTracking() {
  activeSale = getActiveSale();
  trackPageVisited();
  bindAppStoreClicks();
  bindMediumClicks();
  bindTrackedLinkClicks();
  trackBlogArticleOpen();
  trackSaleBadgeVisible();
  window.addEventListener(SALE_CHANGED_EVENT, onSaleChanged);
  window.addEventListener(SUPPORT_FORM_SENT_EVENT, onSupportFormSent);
  window.addEventListener(SUPPORT_FORM_ERROR_EVENT, onSupportFormError);
  window.addEventListener(TOOL_TEMPLATE_COPY_EVENT, onToolTemplateCopy);
  window.addEventListener(PAYBACK_GENERATOR_EVENT, onPaybackGeneratorEvent);
  window.addEventListener(TEMPORARY_HELP_COPY_EVENT, onTemporaryHelpCopy);
  window.addEventListener(PAYMENT_PLAN_TOOL_EVENT, onPaymentPlanToolEvent);
  window.addEventListener(TEMPORARY_SUPPORT_RECORD_TOOL_EVENT, onTemporarySupportRecordToolEvent);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEventTracking, { once: true });
} else {
  initEventTracking();
}

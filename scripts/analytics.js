import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setDefaultEventParameters,
  setUserProperties,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD0sFoz3lixG5KA7aGu_IQg_N3Pc_tIpt4",
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
const SALE_CHANGED_EVENT = "youoweme:sale-changed";
const SUPPORT_FORM_SENT_EVENT = "youoweme:support-form-sent";
const SUPPORT_FORM_ERROR_EVENT = "youoweme:support-form-error";
const TOOL_TEMPLATE_COPY_EVENT = "youoweme:tool-template-copy";
const PAYBACK_GENERATOR_EVENT = "youoweme:payback-generator-event";
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
const app = shouldInitializeFirebase() ? initializeApp(FIREBASE_CONFIG) : null;
const analyticsPromise = initAnalytics();
const saleBadgeEventsSent = new Set();

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
      page_type: getPageType(),
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

function getPageType() {
  const path = window.location.pathname;
  if (path === "/" || path === "/index.html") return "landing";
  if (path === "/privacy-policy/" || path === "/privacy-policy/index.html") return "privacy_policy";
  if (path === "/solutions/" || path === "/solutions/index.html") return "solutions_index";
  if (path.startsWith("/solutions/")) return "solution_page";
  if (path === "/features/" || path === "/features/index.html") return "features";
  if (path === "/tools/" || path === "/tools/index.html") return "tools_index";
  if (path.startsWith("/tools/")) return "tool_page";
  if (path === "/blog/" || path === "/blog/index.html") return "blog_index";
  if (path.startsWith("/blog/")) return "blog_article";
  if (path === "/contact/" || path === "/contact/index.html") return "contact";
  if (path.startsWith("/redeem/")) return "redeem";
  return "other";
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
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

  logEvent(analytics, eventName, Object.assign(
    {
      page_type: getPageType(),
      page_path: window.location.pathname,
      site_platform: "web",
      experience_surface: "marketing_site",
    },
    params || {}
  ));
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

function shouldInterceptNavigation(event, link) {
  if (event.defaultPrevented) return false;
  if (event.button && event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target.toLowerCase() === "_blank") return false;
  return true;
}

function trackAppStoreClick(link, event) {
  const eventPayload = Object.assign({}, getSaleParams(), {
    cta_location: getCtaLocation(link),
    link_url: link.href,
    link_text: sanitizeText(link.getAttribute("aria-label") || link.textContent, 120),
  });

  if (!shouldInterceptNavigation(event, link)) {
    void trackEvent("app_store_click", eventPayload);
    return;
  }

  event.preventDefault();

  let navigated = false;
  const navigate = function () {
    if (navigated) return;
    navigated = true;
    window.location.assign(link.href);
  };

  void trackEvent("app_store_click", eventPayload);
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
  if (getPageType() !== "blog_article") return;
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

function initEventTracking() {
  activeSale = getActiveSale();
  bindAppStoreClicks();
  bindMediumClicks();
  trackBlogArticleOpen();
  trackSaleBadgeVisible();
  window.addEventListener(SALE_CHANGED_EVENT, onSaleChanged);
  window.addEventListener(SUPPORT_FORM_SENT_EVENT, onSupportFormSent);
  window.addEventListener(SUPPORT_FORM_ERROR_EVENT, onSupportFormError);
  window.addEventListener(TOOL_TEMPLATE_COPY_EVENT, onToolTemplateCopy);
  window.addEventListener(PAYBACK_GENERATOR_EVENT, onPaybackGeneratorEvent);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEventTracking, { once: true });
} else {
  initEventTracking();
}

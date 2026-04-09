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
const SUPPORT_EMAIL_REVEALED_EVENT = "youoweme:support-email-revealed";
const SUPPORT_EMAIL_COPIED_EVENT = "youoweme:support-email-copied";
const app = initializeApp(FIREBASE_CONFIG);
const analyticsPromise = initAnalytics();
const saleBadgeEventsSent = new Set();

let activeSale = null;

async function initAnalytics() {
  try {
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
  if (path === "/blog/" || path === "/blog/index.html") return "blog_index";
  if (path.startsWith("/blog/")) return "blog_article";
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
  const links = document.querySelectorAll("a[href*='apps.apple.com/app']");

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

function onSupportEmailRevealed() {
  void trackEvent("support_email_revealed");
}

function onSupportEmailCopied() {
  void trackEvent("support_email_copied");
}

function initEventTracking() {
  activeSale = getActiveSale();
  bindAppStoreClicks();
  bindMediumClicks();
  trackBlogArticleOpen();
  trackSaleBadgeVisible();
  window.addEventListener(SALE_CHANGED_EVENT, onSaleChanged);
  window.addEventListener(SUPPORT_EMAIL_REVEALED_EVENT, onSupportEmailRevealed);
  window.addEventListener(SUPPORT_EMAIL_COPIED_EVENT, onSupportEmailCopied);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEventTracking, { once: true });
} else {
  initEventTracking();
}

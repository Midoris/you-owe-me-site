(function () {
  "use strict";

  const GA_MEASUREMENT_ID = "G-TJDLPVM702";
  const APP_STORE_HOST_MATCH = "apps.apple.com";
  const APP_STORE_ID_MATCH = "id1147058670";
  const SALE_CHANGED_EVENT = "youoweme:sale-changed";
  const saleBadgeEventsSent = new Set();

  function initGoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return false;

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    if (!document.querySelector("script[data-youoweme-ga='1']")) {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
      gaScript.setAttribute("data-youoweme-ga", "1");
      document.head.appendChild(gaScript);
    }

    if (!window.__youowemeGaConfigured) {
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
      window.__youowemeGaConfigured = true;
    }

    return true;
  }

  function getPageType() {
    const path = window.location.pathname;
    if (path === "/" || path === "/index.html") return "landing";
    if (path === "/blog/" || path === "/blog/index.html") return "blog_index";
    if (path.indexOf("/blog/") === 0) return "blog_article";
    if (path.indexOf("/redeem/") === 0) return "redeem";
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

  let activeSale = null;

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

  function trackEvent(eventName, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag(
      "event",
      eventName,
      Object.assign(
        {
          page_type: getPageType(),
          page_path: window.location.pathname,
        },
        params || {}
      )
    );
  }

  function getCtaLocation(link) {
    if (link.dataset.trackLocation) return link.dataset.trackLocation;
    if (link.closest(".lt-stickyCTA")) return "sticky_cta";
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
      trackEvent("app_store_click", eventPayload);
      return;
    }

    event.preventDefault();
    let navigated = false;
    const navigate = function () {
      if (navigated) return;
      navigated = true;
      window.location.assign(link.href);
    };

    trackEvent(
      "app_store_click",
      Object.assign({}, eventPayload, {
        event_callback: navigate,
      })
    );

    window.setTimeout(navigate, 450);
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

    trackEvent(
      "blog_article_open",
      Object.assign({}, getSaleParams(), {
        article_slug: slug,
        article_title: sanitizeText(heading ? heading.textContent : "unknown", 160),
      })
    );
  }

  function bindMediumClicks() {
    const links = document.querySelectorAll("a[href*='medium.com']");
    links.forEach(function (link) {
      if (link.dataset.mediumAnalyticsBound === "1") return;
      link.dataset.mediumAnalyticsBound = "1";
      link.addEventListener("click", function () {
        trackEvent(
          "medium_article_click",
          Object.assign({}, getSaleParams(), {
            cta_location: getCtaLocation(link),
            link_url: link.href,
            link_text: sanitizeText(link.textContent, 120),
          })
        );
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

    trackEvent(
      "sale_badge_visible",
      Object.assign({}, getSaleParams(), {
        badge_count: visibleBadges.length,
      })
    );
  }

  function onSaleChanged(event) {
    activeSale = normalizeSale(event && event.detail ? event.detail.sale : null);
    trackSaleBadgeVisible();
  }

  function initEventTracking() {
    activeSale = getActiveSale();
    bindAppStoreClicks();
    bindMediumClicks();
    trackBlogArticleOpen();
    trackSaleBadgeVisible();
    window.addEventListener(SALE_CHANGED_EVENT, onSaleChanged);
  }

  if (!initGoogleAnalytics()) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEventTracking);
  } else {
    initEventTracking();
  }
})();

(function () {
  "use strict";

  var STORAGE_KEY = "youoweme_privacy_consent_v1";
  var CHANGE_EVENT = "youoweme:privacy-consent-changed";
  var currentScript = document.currentScript;
  var analyticsSrc = (currentScript && currentScript.dataset.analyticsSrc) || "/scripts/analytics.js";
  var privacyPolicyUrl = (currentScript && currentScript.dataset.privacyPolicyUrl) || "/privacy-policy/";
  var privacyChoicesUrl = (currentScript && currentScript.dataset.privacyChoicesUrl) || "/privacy-choices/";
  var analyticsLoaded = false;

  function injectBannerStyles() {
    if (document.getElementById("youoweme-privacy-consent-styles")) return;

    var style = document.createElement("style");
    style.id = "youoweme-privacy-consent-styles";
    style.textContent =
      ".lt-consentBanner{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:10000;max-width:62rem;margin:0 auto;padding:1rem 1.1rem 1.05rem;border-radius:20px;border:1px solid rgba(15,23,42,.12);background:rgba(255,255,255,.96);box-shadow:0 18px 42px rgba(15,23,42,.18);backdrop-filter:blur(12px);}" +
      ".lt-consentBannerTitle{margin:0 0 .35rem;color:#18212b;font-size:1rem;font-weight:700;line-height:1.3;}" +
      ".lt-consentBannerBody{margin:0;color:rgba(33,41,49,.88);font-size:.96rem;line-height:1.6;}" +
      ".lt-consentBannerLinks{display:flex;flex-wrap:wrap;gap:.85rem;margin-top:.65rem;}" +
      ".lt-consentBannerLinks a{color:#355428;text-decoration:none;border-bottom:0;font-weight:600;}" +
      ".lt-consentBannerActions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:.9rem;}" +
      ".lt-consentBannerButton{display:inline-flex;align-items:center;justify-content:center;min-height:2.65rem;padding:.72rem 1rem;border-radius:999px;border:1px solid rgba(15,23,42,.12);background:#fff;color:#18212b;font-size:.95rem;font-weight:700;line-height:1.2;cursor:pointer;}" +
      ".lt-consentBannerButton--primary{background:rgba(175,230,126,.28);border-color:rgba(107,161,69,.24);}" +
      ".lt-consentBannerButton:hover{transform:translateY(-1px);}" +
      "@media (max-width:700px){.lt-consentBanner{left:.75rem;right:.75rem;bottom:.75rem;padding:.95rem 1rem 1rem;}}";
    document.head.appendChild(style);
  }

  function safeGetStatus() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function dispatchChange(status) {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { status: status } }));
  }

  function loadAnalyticsIfAllowed() {
    if (analyticsLoaded || window.__youowemeAnalyticsLoaded) return;
    if (safeGetStatus() !== "granted") return;

    var script = document.createElement("script");
    script.type = "module";
    script.src = analyticsSrc;
    script.dataset.injectedAnalytics = "1";
    document.head.appendChild(script);

    analyticsLoaded = true;
    window.__youowemeAnalyticsLoaded = true;
  }

  function updateStatusLabels() {
    var status = safeGetStatus();
    var labels = document.querySelectorAll("[data-privacy-consent-status]");
    var text = "Website analytics preference: not set.";

    if (status === "granted") {
      text = "Website analytics preference: allowed.";
    } else if (status === "denied") {
      text = "Website analytics preference: declined.";
    }

    labels.forEach(function (node) {
      node.textContent = text;
    });
  }

  function removeBanner() {
    var banner = document.querySelector("[data-privacy-banner]");
    if (banner) {
      banner.remove();
    }
  }

  function setStatus(status) {
    try {
      if (status) {
        window.localStorage.setItem(STORAGE_KEY, status);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      // Ignore storage failures; consent controls still update in-memory behavior.
    }

    updateStatusLabels();

    if (status) {
      removeBanner();
    }

    if (status === "granted") {
      loadAnalyticsIfAllowed();
    }

    dispatchChange(status);
  }

  function buildBanner() {
    if (safeGetStatus()) return;
    if (document.querySelector("[data-privacy-banner]")) return;

    injectBannerStyles();

    var banner = document.createElement("section");
    banner.className = "lt-consentBanner";
    banner.setAttribute("data-privacy-banner", "1");
    banner.innerHTML =
      '<p class="lt-consentBannerTitle">Privacy choices</p>' +
      '<p class="lt-consentBannerBody">We use optional analytics to understand site usage and App Store clicks. You can allow or decline analytics, and you can change this choice later.</p>' +
      '<div class="lt-consentBannerLinks">' +
      '<a href="' + privacyPolicyUrl + '">Privacy Policy</a>' +
      '<a href="' + privacyChoicesUrl + '">Privacy Choices</a>' +
      "</div>" +
      '<div class="lt-consentBannerActions">' +
      '<button type="button" class="lt-consentBannerButton lt-consentBannerButton--primary" data-consent-accept="1">Allow analytics</button>' +
      '<button type="button" class="lt-consentBannerButton" data-consent-decline="1">Decline</button>' +
      "</div>";

    document.body.appendChild(banner);

    var accept = banner.querySelector("[data-consent-accept]");
    var decline = banner.querySelector("[data-consent-decline]");

    accept.addEventListener("click", function () {
      setStatus("granted");
    });

    decline.addEventListener("click", function () {
      setStatus("denied");
    });
  }

  function bindPageControls() {
    document.querySelectorAll("[data-privacy-consent-accept]").forEach(function (button) {
      if (button.dataset.privacyBound === "1") return;
      button.dataset.privacyBound = "1";
      button.addEventListener("click", function () {
        setStatus("granted");
      });
    });

    document.querySelectorAll("[data-privacy-consent-reject]").forEach(function (button) {
      if (button.dataset.privacyBound === "1") return;
      button.dataset.privacyBound = "1";
      button.addEventListener("click", function () {
        setStatus("denied");
      });
    });

    document.querySelectorAll("[data-privacy-consent-reset]").forEach(function (button) {
      if (button.dataset.privacyBound === "1") return;
      button.dataset.privacyBound = "1";
      button.addEventListener("click", function () {
        setStatus(null);
        buildBanner();
      });
    });
  }

  function init() {
    updateStatusLabels();
    bindPageControls();
    loadAnalyticsIfAllowed();
    buildBanner();
  }

  window.YouOweMePrivacyConsent = {
    getStatus: safeGetStatus,
    allowAnalytics: function () {
      setStatus("granted");
    },
    declineAnalytics: function () {
      setStatus("denied");
    },
    resetChoice: function () {
      setStatus(null);
      buildBanner();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

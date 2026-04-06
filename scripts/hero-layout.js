(function () {
  const DESKTOP_MQ = window.matchMedia("(min-width: 981px)");
  const SCREENSHOT_ASPECT_RATIO = 1290 / 2796;
  const MIN_SHOT_HEIGHT_REM = 24;
  const MAX_SHOT_HEIGHT_REM = 38;
  let rafId = 0;

  function remToPx(rem) {
    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    return rem * rootFontSize;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function updateHeroLayout() {
    rafId = 0;

    const hero = document.querySelector(".lt-hero");
    const visual = hero?.querySelector(".lt-heroVisual");
    const gallery = hero?.querySelector(".lt-heroGallery");

    if (!hero || !visual || !gallery) {
      return;
    }

    if (!DESKTOP_MQ.matches) {
      hero.style.removeProperty("--lt-hero-shot-height");
      return;
    }

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const galleryRect = gallery.getBoundingClientRect();
    const visualStyles = getComputedStyle(visual);
    const galleryStyles = getComputedStyle(gallery);
    const galleryGap =
      parseFloat(galleryStyles.columnGap || galleryStyles.gap) || 0;
    const bottomBreathingRoom =
      parseFloat(visualStyles.paddingBottom) || 0;
    const maxGalleryWidth = parseFloat(galleryStyles.maxWidth);
    const availableInlineSize = Number.isFinite(maxGalleryWidth)
      ? Math.min(visual.clientWidth, maxGalleryWidth)
      : visual.clientWidth;
    const heightFromViewport =
      viewportHeight - galleryRect.top - bottomBreathingRoom;
    const heightFromWidth =
      (availableInlineSize - galleryGap * 2) /
      (3 * SCREENSHOT_ASPECT_RATIO);
    const shotHeight = clamp(
      Math.min(heightFromViewport, heightFromWidth),
      remToPx(MIN_SHOT_HEIGHT_REM),
      remToPx(MAX_SHOT_HEIGHT_REM)
    );

    hero.style.setProperty("--lt-hero-shot-height", `${Math.round(shotHeight)}px`);
  }

  function requestUpdate() {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(updateHeroLayout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", requestUpdate, { once: true });
  } else {
    requestUpdate();
  }

  window.addEventListener("load", requestUpdate);
  window.addEventListener("resize", requestUpdate);
  window.visualViewport?.addEventListener("resize", requestUpdate);
  DESKTOP_MQ.addEventListener?.("change", requestUpdate);
  document.fonts?.ready.then(requestUpdate).catch(function () {});
})();

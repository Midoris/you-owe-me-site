(function () {
  function tryPlay(video) {
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function bindHeroPreviewVideos() {
    document.querySelectorAll(".lt-heroPreviewVideo").forEach(function (video) {
      if (video.dataset.heroPreviewBound === "1") {
        return;
      }

      video.dataset.heroPreviewBound = "1";

      video.load();
      tryPlay(video);
      video.addEventListener("loadedmetadata", function () {
        tryPlay(video);
      });
      video.addEventListener("loadeddata", function () {
        tryPlay(video);
      });
      video.addEventListener("canplay", function () {
        tryPlay(video);
      });
    });
  }

  function resumeVisibleVideos() {
    if (document.hidden) {
      return;
    }

    document.querySelectorAll(".lt-heroPreviewVideo").forEach(tryPlay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindHeroPreviewVideos, {
      once: true,
    });
  } else {
    bindHeroPreviewVideos();
  }

  window.addEventListener("load", resumeVisibleVideos);
  window.addEventListener("pageshow", resumeVisibleVideos);
  document.addEventListener("visibilitychange", resumeVisibleVideos);
})();

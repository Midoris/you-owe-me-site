(function () {
  function forcePlay(video) {
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function forcePlayAll() {
    document.querySelectorAll(".lt-heroPreviewVideo").forEach(forcePlay);
  }

  function bindVideo(video) {
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    if (video.dataset.heroPreviewAutoplayBound === "1") {
      return;
    }

    video.dataset.heroPreviewAutoplayBound = "1";

    ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"].forEach(
      function (eventName) {
        video.addEventListener(eventName, function () {
          forcePlay(video);
        });
      }
    );
  }

  function init() {
    document.querySelectorAll(".lt-heroPreviewVideo").forEach(bindVideo);
    forcePlayAll();

    window.setTimeout(forcePlayAll, 200);
    window.setTimeout(forcePlayAll, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("load", forcePlayAll);
  window.addEventListener("pageshow", forcePlayAll);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      forcePlayAll();
    }
  });
})();

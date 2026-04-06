(function () {
  function buildEmbedUrl(link) {
    const embedUrl = link.getAttribute("data-youtube-embed");

    if (!embedUrl) {
      return null;
    }

    const url = new URL(embedUrl);

    url.searchParams.set("autoplay", "1");
    url.searchParams.set("modestbranding", "1");
    url.searchParams.set("playsinline", "1");

    if (
      window.location.protocol === "http:" ||
      window.location.protocol === "https:"
    ) {
      url.searchParams.set("origin", window.location.origin);
    }

    return url.toString();
  }

  function createEmbed(link) {
    const shell = link.closest("[data-video-shell]");
    const src = buildEmbedUrl(link);

    if (!shell || !src || shell.dataset.videoLoaded === "true") {
      return;
    }

    const iframe = document.createElement("iframe");

    iframe.className = "lt-videoIframe";
    iframe.src = src;
    iframe.title =
      link.getAttribute("data-video-title") ||
      "Embedded YouTube video";
    if (link.hasAttribute("aria-describedby")) {
      iframe.setAttribute(
        "aria-describedby",
        link.getAttribute("aria-describedby")
      );
    }
    iframe.loading = "lazy";
    iframe.referrerPolicy = "origin";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    shell.dataset.videoLoaded = "true";
    link.replaceWith(iframe);
  }

  function shouldUseFallbackNavigation(event) {
    return (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !/^https?:$/.test(window.location.protocol)
    );
  }

  function bindLinks() {
    document.querySelectorAll(".lt-videoPoster").forEach((link) => {
      link.addEventListener("click", function (event) {
        if (shouldUseFallbackNavigation(event)) {
          return;
        }

        event.preventDefault();
        createEmbed(link);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLinks, { once: true });
    return;
  }

  bindLinks();
})();

// A fragment selects presentation only. Never read the private reference or data.
(function () {
  function renderLocale() {
    var locale = window.location.hash === "#es" ? "es" : "en";
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-locale]").forEach(function (section) {
      section.hidden = section.getAttribute("data-locale") !== locale;
      if (!section.hidden) document.title = section.getAttribute("data-title");
    });
    var navigation = document.querySelector("[data-language-navigation]");
    if (navigation) {
      navigation.setAttribute("aria-label", locale === "es" ? "Idioma de la página" : "Page language");
      navigation.querySelectorAll("a").forEach(function (link) {
        if (link.getAttribute("lang") === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }
  }
  renderLocale();
  window.addEventListener("hashchange", renderLocale);
}());

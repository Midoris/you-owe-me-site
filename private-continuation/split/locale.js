// A fragment selects presentation only. Never read the private reference or data.
(function () {
  function renderLocale() {
    var fragment = window.location.hash;
    var locale = fragment === "#es" ? "es" : fragment === "#de" ? "de" : "en";
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-locale]").forEach(function (section) {
      section.hidden = section.getAttribute("data-locale") !== locale;
      if (!section.hidden) document.title = section.getAttribute("data-title");
    });
    var navigation = document.querySelector("[data-language-navigation]");
    if (navigation) {
      navigation.setAttribute("aria-label", locale === "es" ? "Idioma de la página" : locale === "de" ? "Sprache der Seite" : "Page language");
      navigation.querySelectorAll("a").forEach(function (link) {
        if (link.getAttribute("lang") === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }
  }
  renderLocale();
  window.addEventListener("hashchange", renderLocale);
}());

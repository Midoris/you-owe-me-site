(function () {
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-find-card]"));
  const count = document.querySelector(".find-filter-count");

  if (!buttons.length || !cards.length) return;

  function setFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const filters = (card.getAttribute("data-filters") || "").split(/\s+/);
      const shouldShow = filter === "all" || filters.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) visible += 1;
    });

    buttons.forEach((button) => {
      const isActive = button.getAttribute("data-filter") === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (count) {
      count.textContent = filter === "all"
        ? "Showing all situation cards."
        : `Showing ${visible} matching situation ${visible === 1 ? "card" : "cards"}.`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.getAttribute("data-filter") || "all");
    });
  });
})();

// Native controls progressively enhance the real app screenshot preview.
// Without JavaScript, the overview and its caption remain visible.
for (const showcase of document.querySelectorAll("[data-stats-showcase]")) {
  const picker = showcase.querySelector(".stats-screen-picker");
  const preview = showcase.querySelector("[data-stats-preview]");
  const description = showcase.querySelector("[data-stats-description]");
  const buttons = [...showcase.querySelectorAll("[data-stats-screen]")];
  if (!picker || !preview || !description || buttons.length === 0) continue;

  for (const button of buttons) {
    button.addEventListener("click", () => {
      preview.src = button.dataset.statsImage;
      preview.alt = button.dataset.statsAlt;
      description.textContent = button.dataset.statsCaption;
      for (const option of buttons) {
        option.setAttribute("aria-pressed", String(option === button));
      }
    });
  }
  picker.hidden = false;
  showcase.classList.add("is-enhanced");
}

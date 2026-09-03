(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  ready(function () {
    var prompt = document.querySelector("[data-friend-borrow-post-copy]");
    if (!prompt) return;

    var eligibleButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-friend-borrow-post-copy-eligible]")
    );

    function matchingButton(detail) {
      if (!detail) return null;

      for (var index = 0; index < eligibleButtons.length; index += 1) {
        var button = eligibleButtons[index];

        if (detail.copy_type === "template" && button.getAttribute("data-copy-template") === detail.id) {
          return button;
        }

        if (detail.copy_type === "record" && button.getAttribute("data-copy-text-target") === detail.id) {
          return button;
        }
      }

      return null;
    }

    function handleSuccessfulCopy(event) {
      var detail = event && event.detail ? event.detail : null;
      var button = matchingButton(detail);

      if (!button) {
        prompt.hidden = true;
        return;
      }

      var card = button.closest(".template-card, .friend-borrow-card");
      if (card) {
        card.insertAdjacentElement("afterend", prompt);
      } else {
        button.insertAdjacentElement("afterend", prompt);
      }

      prompt.hidden = false;
    }

    window.addEventListener("youoweme:friend-borrow-money-copy", handleSuccessfulCopy);
  });
})();

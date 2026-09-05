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

    var eyebrow = document.querySelector("[data-friend-borrow-post-copy-eyebrow]");
    var heading = document.querySelector("#friend-borrow-post-copy-title");
    var message = document.querySelector(".friend-borrow-post-copy__message");
    if (!eyebrow || !heading || !message) return;

    var eligibleButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-friend-borrow-post-copy-eligible]")
    );

    var copyVariants = {
      "template:reply-after-yes": {
        eyebrow: "Reply copied",
        heading: "Keep the amount and repayment date together",
        message: "Use You Owe Me to record what you borrowed, when you agreed to repay it, and each payment you make."
      },
      "record:friend-borrow-example-record": {
        eyebrow: "Record copied",
        heading: "Keep this record up to date as you repay",
        message: "Record each payment in You Owe Me and see what’s left, without rewriting your notes."
      },
      "template:need-more-time-update": {
        eyebrow: "Update copied",
        heading: "Keep the revised plan clear",
        message: "Record what you’ve repaid, what’s left, and the next agreed date in You Owe Me."
      }
    };

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

    function matchingVariant(detail) {
      if (!detail) return null;
      return copyVariants[`${detail.copy_type}:${detail.id}`] || null;
    }

    function handleSuccessfulCopy(event) {
      var detail = event && event.detail ? event.detail : null;
      var button = matchingButton(detail);
      var variant = matchingVariant(detail);

      if (!button || !variant) {
        prompt.hidden = true;
        return;
      }

      eyebrow.textContent = variant.eyebrow;
      heading.textContent = variant.heading;
      message.textContent = variant.message;

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

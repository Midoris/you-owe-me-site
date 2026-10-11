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
    if (!prompt || prompt.__friendBorrowTrackingInitialized) return;

    var home = document.querySelector("[data-friend-borrow-tracking-home]");
    var eyebrow = prompt.querySelector("[data-friend-borrow-post-copy-eyebrow]");
    var heading = prompt.querySelector("#friend-borrow-post-copy-title");
    var message = prompt.querySelector(".friend-borrow-post-copy__message");
    var boundary = prompt.querySelector(".friend-borrow-post-copy__boundary");
    if (!home || !eyebrow || !heading || !message || !boundary) return;

    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-copy-template], [data-copy-text-target]")
    );
    var defaultCopy = {
      eyebrow: "After they agree",
      heading: "Keep the repayment plan clear",
      message: "If your friend agrees to lend you money, use You Owe Me on iPhone to record what you borrowed, any agreed repayment date, and each payment you make."
    };
    var copyVariants = {
      "template:reply-after-yes": {
        eyebrow: "Reply copied",
        heading: "Keep the amount and repayment plan together",
        message: defaultCopy.message
      },
      "record:friend-borrow-example-record": {
        eyebrow: "Record copied",
        heading: "Keep repayments and the remaining amount together",
        message: "If you’re tracking a loan like this, use You Owe Me on iPhone to record repayments and see what remains."
      },
      "template:need-more-time-update": {
        eyebrow: "Update copied",
        heading: "Keep the revised plan clear",
        message: "If you and your friend agree on a revised plan, record repayments, the remaining amount, and any agreed repayment date in You Owe Me on iPhone."
      }
    };

    function matchingButton(detail) {
      if (!detail || typeof detail.id !== "string") return null;
      if (detail.copy_type !== "template" && detail.copy_type !== "record") return null;
      var attribute = detail.copy_type === "template" ? "data-copy-template" : "data-copy-text-target";
      return buttons.find(function (button) {
        return button.getAttribute(attribute) === detail.id
          && document.contains(button)
          && button.closest(".template-card, .friend-borrow-card");
      }) || null;
    }

    function applyCopy(copy) {
      eyebrow.textContent = copy.eyebrow;
      heading.textContent = copy.heading;
      message.textContent = copy.message;
    }

    function handleSuccessfulCopy(event) {
      var detail = event && event.detail;
      var button = matchingButton(detail);
      if (!button) return;

      var variant = button.hasAttribute("data-friend-borrow-post-copy-eligible")
        ? copyVariants[detail.copy_type + ":" + detail.id] : null;
      if (variant) {
        button.closest(".template-card, .friend-borrow-card").insertAdjacentElement("afterend", prompt);
        applyCopy(variant);
      } else {
        home.appendChild(prompt);
        applyCopy(defaultCopy);
      }
    }

    prompt.__friendBorrowTrackingInitialized = true;
    window.addEventListener("youoweme:friend-borrow-money-copy", handleSuccessfulCopy);
  });
})();

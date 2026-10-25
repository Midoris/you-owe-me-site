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
      heading: "Keep track of your promise",
      message: "If your friend agrees to lend you money, record what you borrowed and any repayment date you agreed on. As you pay it back, You Owe Me keeps the payments and remaining balance together."
    };
    var copyVariants = {
      "template:reply-after-yes": {
        eyebrow: "Reply copied",
        heading: "Keep track of your promise",
        message: "Record what you borrowed and the repayment date you agreed on. As you pay it back, You Owe Me keeps the payments and remaining balance together, so your next update starts with the right amount."
      },
      "record:friend-borrow-example-record": {
        eyebrow: "Record copied",
        heading: "See what you have left to repay",
        message: "Create your loan record in You Owe Me, then add each repayment as you make it. Keep the original amount, payments, and remaining balance together."
      },
      "template:need-more-time-update": {
        eyebrow: "Update copied",
        heading: "Keep the revised plan clear",
        message: "If you and your friend agree on new timing, keep that update with the loan record. Record repayments as you make them and set a reminder for your next check-in."
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

(function () {
  "use strict";

  var targetPage = "blog_how_to_remind_someone_they_owe_you_money_politely";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function cardShowsPostCopyPrompt(card) {
    return Boolean(card && card.hasAttribute("data-post-copy-app-eligible"));
  }

  ready(function () {
    var postCopyPrompt = document.querySelector("[data-post-copy-app-prompt]");
    if (!postCopyPrompt) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll(".template-card[data-template-id]"));

    function handleSuccessfulCopy(event) {
      var detail = event && event.detail ? event.detail : {};
      if (detail.page !== targetPage) return;

      var card = cards.find(function (item) {
        return item.getAttribute("data-template-id") === detail.template_id;
      });

      if (!card) return;

      if (!cardShowsPostCopyPrompt(card)) {
        postCopyPrompt.hidden = true;
        return;
      }

      var button = card.querySelector("[data-copy-template]");
      if (!button || button.getAttribute("data-copy-template") !== detail.template_id) return;

      button.insertAdjacentElement("afterend", postCopyPrompt);
      postCopyPrompt.hidden = false;
    }

    window.addEventListener("youoweme:tool-template-copy", handleSuccessfulCopy);
  });
})();

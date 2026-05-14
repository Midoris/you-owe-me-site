(function () {
  var placeholderSelectors = [
    "[partial amount paid]",
    "[remaining amount]",
    "[what it was for]",
    "[amount]",
    "[Name]",
    "[date]",
  ];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function getReplacementValues(inputs) {
    var values = {};

    inputs.forEach(function (input) {
      var placeholder = input.getAttribute("data-placeholder");
      var value = input.value.trim();
      values[placeholder] = value || placeholder;
    });

    return values;
  }

  function renderTemplate(template, values) {
    var output = template;

    placeholderSelectors.forEach(function (placeholder) {
      output = output.split(placeholder).join(values[placeholder] || placeholder);
    });

    return output;
  }

  function updateMessages(inputs, messages) {
    var values = getReplacementValues(inputs);

    messages.forEach(function (message) {
      var template = message.getAttribute("data-template") || "";
      message.textContent = renderTemplate(template, values);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var success = document.execCommand("copy");
        document.body.removeChild(textarea);
        success ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function trackTemplateCopy(card) {
    window.dispatchEvent(new CustomEvent("youoweme:tool-template-copy", {
      detail: {
        page: "repayment_reminder_text_examples",
        template_id: card.getAttribute("data-template-id") || "unknown",
        tone: card.getAttribute("data-tone") || "unknown",
        category: card.getAttribute("data-category") || "unknown",
      },
    }));
  }

  function initCopyButtons(cards, status) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-copy-template]"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var templateId = button.getAttribute("data-copy-template");
        var card = cards.find(function (item) {
          return item.getAttribute("data-template-id") === templateId;
        });
        var message = card ? card.querySelector(".template-card__message") : null;

        if (!message) return;

        var originalText = button.textContent;
        var textToCopy = message.textContent.trim();

        copyText(textToCopy).then(function () {
          button.textContent = "Copied";
          if (status) status.textContent = "Copied " + (card.querySelector("h3") ? card.querySelector("h3").textContent : "message") + ".";
          trackTemplateCopy(card);

          window.setTimeout(function () {
            button.textContent = originalText;
            if (status) status.textContent = "";
          }, 1800);
        }).catch(function () {
          if (status) status.textContent = "Copy did not work. Select the message text and copy it manually.";
        });
      });
    });
  }

  function setFilter(filter, cards, buttons, count) {
    var visible = 0;

    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter") === filter ? "true" : "false");
    });

    cards.forEach(function (card) {
      var filters = (card.getAttribute("data-filters") || "").split(/\s+/);
      var matches = filter === "all" || filters.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !matches);
      if (matches) visible += 1;
    });

    if (count) {
      count.textContent = "Showing " + visible + " example" + (visible === 1 ? "" : "s");
    }
  }

  function initFilters(cards) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var count = document.querySelector("[data-filter-count]");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setFilter(button.getAttribute("data-filter"), cards, buttons, count);
      });
    });

    setFilter("all", cards, buttons, count);
  }

  ready(function () {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".repayment-customizer input"));
    var messages = Array.prototype.slice.call(document.querySelectorAll(".template-card__message"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".template-card"));
    var status = document.querySelector("[data-copy-status]");

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        updateMessages(inputs, messages);
      });
    });

    updateMessages(inputs, messages);
    initFilters(cards);
    initCopyButtons(cards, status);
  });
})();

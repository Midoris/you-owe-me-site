(function () {
  "use strict";
  // Keep this localized interaction scoped to the Arabic borrowing guide.
  var root = document.querySelector("body.borrow-ar-page");
  if (!root) return;
  var timers = new WeakMap();
  var copying = new WeakSet();

  function legacyCopy(text) {
    var textarea = document.createElement("textarea");
    var focused = document.activeElement;
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(textarea);
    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      return Boolean(document.execCommand && document.execCommand("copy"));
    } catch (error) {
      return false;
    } finally {
      textarea.remove();
      if (focused && typeof focused.focus === "function") focused.focus({ preventScroll: true });
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Browsers may deny Clipboard API access; retain the established fallback.
    }
    return legacyCopy(text);
  }

  function selectText(source) {
    if (!source || !window.getSelection || !document.createRange) return false;
    try {
      var selection = window.getSelection();
      if (!selection) return false;
      var range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      source.scrollIntoView({ block: "nearest" });
      return selection.toString() === source.textContent.trim();
    } catch (error) {
      return false;
    }
  }

  root.addEventListener("click", async function (event) {
    var button = event.target.closest("[data-copy-template]");
    if (!button || !root.contains(button) || copying.has(button)) return;
    var card = button.closest(".borrow-ar-card");
    var source = card && card.querySelector(".template-card__message");
    var status = card && card.querySelector("[data-copy-status]");
    if (!source || !status) return;
    var text = source.textContent.trim();
    var record = button.hasAttribute("data-copy-record");
    var originalText = record ? "نسخ النموذج" : "نسخ الرسالة";
    window.clearTimeout(timers.get(button));
    copying.add(button);
    button.setAttribute("aria-busy", "true");
    button.textContent = "جارٍ النسخ…";
    status.textContent = "";
    try {
      var copied = await copyText(text);
      if (copied) {
        button.textContent = "تم النسخ";
        status.textContent = record ? "تم نسخ النموذج." : "تم نسخ الرسالة. راجع البيانات قبل إرسالها.";
        window.dispatchEvent(new CustomEvent("youoweme:tool-template-copy", {
          detail: {
            page: "ar_blog_borrow_from_friend",
            template_id: button.dataset.copyTemplate,
            tone: button.dataset.tone,
            category: button.dataset.category,
          },
        }));
      } else if (selectText(source)) {
        button.textContent = "تم تحديد النص";
        status.textContent = "تم تحديد النص. انسخه باستخدام خيار النسخ في جهازك.";
      } else {
        button.textContent = originalText;
        status.textContent = "تعذّر نسخ النص تلقائيًا. حدّده وانسخه يدويًا.";
      }
    } finally {
      copying.delete(button);
      button.removeAttribute("aria-busy");
      timers.set(button, window.setTimeout(function () { button.textContent = originalText; }, 2200));
    }
  });
  // Show only controls with a source and a live status region after the handler exists.
  root.querySelectorAll("[data-copy-template]").forEach(function (button) {
    var card = button.closest(".borrow-ar-card");
    if (!card || !card.querySelector(".template-card__message") || !card.querySelector("[data-copy-status]")) return;
    button.hidden = false;
    var hint = card.querySelector("[data-copy-hint]");
    if (hint) hint.hidden = true;
  });
})();

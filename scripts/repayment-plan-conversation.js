(function () {
  "use strict";

  function textFor(button) {
    var target = document.getElementById(button.getAttribute("data-copy-target"));
    return target ? target.textContent.trim() : "";
  }

  function selectTarget(button) {
    var target = document.getElementById(button.getAttribute("data-copy-target"));
    var selection = window.getSelection && window.getSelection();

    if (!target || !selection || !document.createRange) return false;

    var range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function fallbackCopy(button) {
    if (!selectTarget(button) || !document.execCommand) return false;

    try {
      return document.execCommand("copy");
    } catch (error) {
      return false;
    }
  }

  function copy(text, button) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (fallbackCopy(button)) return undefined;
        return Promise.reject();
      });
    }

    return fallbackCopy(button) ? Promise.resolve() : Promise.reject();
  }

  function setCopyState(button, message, copied) {
    var status = button.parentNode.querySelector(".rp-copy-status");
    button.textContent = copied ? "Copied" : button.getAttribute("data-copy-label");
    if (status) status.textContent = message;
  }

  function initialiseCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach(function (button) {
      button.setAttribute("data-copy-label", button.textContent);
      button.addEventListener("click", function () {
        var text = textFor(button);
        if (!text || button.disabled) return;

        copy(text, button).then(function () {
          setCopyState(button, "Copied", true);
          window.setTimeout(function () {
            setCopyState(button, "", false);
          }, 1800);
        }).catch(function () {
          selectTarget(button);
          setCopyState(button, "Couldn’t copy. Select the message and copy it manually.", false);
        });
      });
    });
  }

  function initialiseStateWorkflow() {
    var workflow = document.querySelector(".rp-state-workflow");
    if (!workflow) return;

    var tabs = Array.prototype.slice.call(workflow.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });

    if (tabs.length !== panels.length || panels.some(function (panel) { return !panel; })) return;

    function selectTab(index, moveFocus) {
      tabs.forEach(function (tab, tabIndex) {
        var selected = tabIndex === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });

      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        selectTab(index, false);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;

        event.preventDefault();
        selectTab(nextIndex, true);
      });
    });

    selectTab(0, false);
  }

  function initialise() {
    initialiseCopyButtons();
    initialiseStateWorkflow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }
}());

(function () {
  "use strict";

  var states = {
    "1": {
      name: "Plan created",
      summary: ["1,200", "0", "Upcoming", "200 monthly", "200 on 1 August", "On track", "1 January"],
      activity: ["10 July — Laptop purchase loan started: 1,200"],
      schedule: [
        "1 August — 200 — Upcoming",
        "1 September — 200 — Upcoming",
        "1 October — 200 — Upcoming",
        "Later installments continue to the projected payoff."
      ],
      explanation: "The schedule is a projection. No repayment has happened yet, so the real loan balance is still 1,200."
    },
    "2": {
      name: "150 paid",
      summary: ["1,050", "150", "Partly paid — 50 remaining", "200 monthly", "50 on 1 August", "Due today", "1 January"],
      activity: [
        "10 July — Laptop purchase loan started: 1,200",
        "1 August — Payment received: 150"
      ],
      schedule: [
        "1 August — 150 of 200 paid — 50 remaining",
        "1 September — 200 — Upcoming",
        "1 October — 200 — Upcoming"
      ],
      explanation: "The real 150 payment stays in history. The first scheduled installment is not falsely marked as complete: 50 is still needed."
    },
    "3": {
      name: "300 paid",
      summary: ["750", "450", "Partly covered ahead — 150 remaining", "200 monthly", "150 on 1 October", "Ahead", "1 January"],
      activity: [
        "10 July — Laptop purchase loan started: 1,200",
        "1 August — Payment received: 150",
        "20 August — Payment received: 300"
      ],
      schedule: [
        "1 August — 200 of 200 paid",
        "1 September — 200 of 200 paid early",
        "1 October — 50 of 200 covered — 150 remaining"
      ],
      explanation: "The first unpaid 50 is completed, 200 covers the next installment, and the remaining 50 moves forward. The full 300 payment remains visible as one real entry."
    },
    "4": {
      name: "100 added later",
      summary: ["850", "450", "Partly covered ahead — 150 remaining", "200 monthly", "150 on 1 October", "Ahead", "1 February"],
      activity: [
        "10 July — Laptop purchase loan started: 1,200",
        "1 August — Payment received: 150",
        "20 August — Payment received: 300",
        "10 September — Additional borrowing: 100"
      ],
      schedule: [
        "Earlier paid and partly covered installments remain visible.",
        "The future schedule is recalculated from the new 850 balance.",
        "A final projected payment is added on 1 February."
      ],
      explanation: "The additional 100 increases the real loan balance. Earlier payments remain honest history while future installments, the next reminder, and the projected payoff are recalculated."
    }
  };

  function renderList(element, items) {
    var fragment = document.createDocumentFragment();

    items.forEach(function (item) {
      var listItem = document.createElement("li");
      listItem.textContent = item;
      fragment.appendChild(listItem);
    });

    element.replaceChildren(fragment);
  }

  function initLoanDemo(demo) {
    var controls = Array.prototype.slice.call(demo.querySelectorAll("[data-loan-state]"));
    var summaryFields = Array.prototype.slice.call(demo.querySelectorAll("[data-loan-summary] dd"));
    var status = demo.querySelector("[data-loan-status]");
    var activity = demo.querySelector("[data-loan-activity]");
    var schedule = demo.querySelector("[data-loan-schedule]");
    var explanation = demo.querySelector("[data-loan-explanation]");
    var liveRegion = demo.querySelector("[data-loan-live]");

    if (!controls.length || summaryFields.length !== 7 || !status || !activity || !schedule || !explanation || !liveRegion) return;

    function selectState(stateId, shouldFocus) {
      var state = states[stateId];
      if (!state) return;

      summaryFields.forEach(function (field, index) {
        if (index !== 5) field.textContent = state.summary[index];
      });
      status.textContent = state.summary[5];
      renderList(activity, state.activity);
      renderList(schedule, state.schedule);
      explanation.textContent = state.explanation;

      controls.forEach(function (control) {
        var isSelected = control.getAttribute("data-loan-state") === stateId;
        control.classList.toggle("is-active", isSelected);
        control.setAttribute("aria-pressed", String(isSelected));
        if (isSelected && shouldFocus) control.focus();
      });

      liveRegion.textContent = "Showing example state " + stateId + " of 4: " + state.name + ".";
    }

    controls.forEach(function (control, index) {
      control.addEventListener("click", function () {
        selectState(control.getAttribute("data-loan-state"), false);
      });

      control.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;

        event.preventDefault();
        var nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % controls.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + controls.length) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        selectState(controls[nextIndex].getAttribute("data-loan-state"), true);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-loan-demo]"), initLoanDemo);
  });
}());

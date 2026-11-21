import { decodeProposal, formatDate, formatMoney, scheduleFor } from "./repayment-proposal-model.mjs";
import { isProposalSender, startProposalRecipientAnalytics, trackProposal } from "./repayment-proposal-events.mjs";

const navigation = window.repaymentProposalNavigation;
const copyPrefix = "uomi-repayment-copy-v1:";
const signalPrefix = "uomi-repayment-recipient-v1:";
const removedCopy = "removed";
const previewCount = 6;
const tabSignals = new Set();

const byId = id => document.getElementById(id);
const proposal = byId("proposal");
const library = byId("saved-library");
const invalid = byId("invalid-link");
const saveButton = byId("save-proposal");
const removeButton = byId("remove-proposal");
const removeConfirmation = byId("remove-confirmation");
const cancelRemoval = byId("cancel-removal");
const confirmRemoval = byId("confirm-removal");
const remainingDates = byId("remaining-dates");
const expandButton = byId("show-all-dates");

let current = null;
let pendingOpen = null;

function decoded(token) {
  try {
    return decodeProposal(token);
  } catch {
    return null;
  }
}

function copyFromValue(value, key) {
  try {
    const copy = JSON.parse(value);
    const plan = decoded(copy?.token);
    if (plan && key === copyPrefix + plan.id && Number.isFinite(copy.savedAt)) {
      return { ...copy, plan };
    }
  } catch {
    // A corrupt or removed local entry has no copy to display.
  }
  return null;
}

function savedCopies() {
  try {
    const storage = window.localStorage;
    const copies = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(copyPrefix)) continue;
      const copy = copyFromValue(storage.getItem(key), key);
      if (copy) copies.push(copy);
    }
    return copies.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return null;
  }
}

function mutateCopies(mutate) {
  // Serialize duplicate saves and removals in browsers with cross-tab locks.
  if (window.navigator.locks) {
    return window.navigator.locks.request("uomi-repayment-copies-v1", mutate);
  }
  return mutate();
}

function signal(subject, stage) {
  if (!subject.analyticsEligible || !navigation.isClean() || document.prerendering
      || document.visibilityState !== "visible") return;

  try {
    if (isProposalSender(subject.plan.id)) return;

    if (stage !== "recipient_saved") {
      const key = signalPrefix + stage + ":" + subject.plan.id;
      if (tabSignals.has(key) || subject.view[stage]) return;
      tabSignals.add(key);
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
      } catch {
        // In-memory and history markers still cover the active history entry.
      }
      if (current === subject) {
        subject.view = { ...subject.view, [stage]: true };
        navigation.remember(subject.view);
      }
    }

    startProposalRecipientAnalytics();
    trackProposal(stage);
  } catch {
    // Tracking is independent of reading, saving, and removing a plan.
  }
}

function openWhenVisible() {
  if (!pendingOpen || document.visibilityState !== "visible" || document.prerendering) return;
  signal(pendingOpen, "recipient_opened");
  pendingOpen = null;
}

function showOnly(view) {
  for (const section of [proposal, library, invalid]) {
    section.hidden = section !== view;
  }
}

function text(id, message) {
  byId(id).textContent = message;
}

function paymentRow(payment, currency) {
  const row = document.createElement("tr");
  const date = document.createElement("td");
  const time = document.createElement("time");
  time.dateTime = payment.date;
  time.textContent = formatDate(payment.date);
  date.append(time);
  const amount = document.createElement("td");
  amount.textContent = formatMoney(payment.amountMinor, currency);
  row.append(date, amount);
  return row;
}

function renderPayments(plan) {
  const schedule = scheduleFor(plan);
  const rows = schedule.map(payment => paymentRow(payment, plan.currency));
  text("schedule-count", rows.length === 1 ? "1 proposed payment" : rows.length + " proposed payments");
  byId("payment-dates").replaceChildren(...rows.slice(0, previewCount));
  remainingDates.replaceChildren(...rows.slice(previewCount));
  remainingDates.hidden = true;
  expandButton.hidden = rows.length <= previewCount;
  expandButton.setAttribute("aria-expanded", "false");
  expandButton.textContent = "Show all " + rows.length + " payments";
}

function closeConfirmation(restoreFocus = false) {
  removeConfirmation.hidden = true;
  removeButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) removeButton.focus();
}

function refreshControls(copies) {
  const isSaved = Boolean(copies?.some(copy => copy.plan.id === current.plan.id));
  saveButton.hidden = isSaved;
  byId("saved-label").hidden = !isSaved;
  byId("saved-detail").hidden = !isSaved;
  removeButton.hidden = !isSaved;
  byId("show-saved-plans").hidden = !copies?.length;
  if (!isSaved) closeConfirmation();
}

function showLibrary(copies, focus = false, notice = "") {
  current = null;
  pendingOpen = null;
  const list = byId("saved-plans");
  const items = (copies ?? []).map(({ plan }) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    const amount = document.createElement("strong");
    amount.textContent = formatMoney(plan.totalMinor, plan.currency);
    const detail = document.createElement("span");
    const payments = plan.count === 1 ? "1 payment" : plan.count + " payments";
    detail.textContent = payments + " · Starts " + formatDate(plan.firstDate);
    button.append(amount, detail);
    button.addEventListener("click", () => changeView({ kind: "saved", id: plan.id }));
    item.append(button);
    return item;
  });
  list.replaceChildren(...items);
  let description = "Open a copy you saved in this browser.";
  if (copies === null) {
    description = "This browser couldn’t access saved copies. Open a plan using the original link.";
  } else if (copies.length === 0) {
    description = "There are no saved plans in this browser. Open a plan from the original message to see it here.";
  }
  text("library-description", description);
  text("library-status", notice);
  showOnly(library);
  if (focus) byId("library-title").focus();
}

function display({ view, incoming }, focus = false) {
  pendingOpen = null;
  const copies = savedCopies();
  const saved = view.kind === "saved" ? copies?.find(copy => copy.plan.id === view.id) : null;
  const plan = view.kind === "link" ? decoded(view.token) : saved?.plan;
  if (plan) {
    current = {
      plan,
      view,
      analyticsEligible: view.kind === "link"
        && !view.hasQuery
        && !copies?.some(copy => copy.plan.id === plan.id),
    };
    closeConfirmation();
    text("proposal-total", formatMoney(plan.totalMinor, plan.currency));
    text("proposal-status", "");
    renderPayments(plan);
    refreshControls(copies);
    showOnly(proposal);
    if (focus) byId("proposal-title").focus();
    if (incoming && current.analyticsEligible) {
      pendingOpen = current;
      openWhenVisible();
    }
  } else if (view.kind === "invalid" || view.kind === "link") {
    current = null;
    navigation.remember({ kind: "invalid" });
    byId("invalid-show-saved").hidden = !copies?.length;
    showOnly(invalid);
    if (focus) byId("invalid-title").focus();
  } else {
    showLibrary(copies, focus);
  }
}

function changeView(view) {
  navigation.remember(view);
  display({ view, incoming: false }, true);
}

saveButton.addEventListener("click", async event => {
  const subject = current;
  if (!subject || subject.view.kind !== "link") return;

  if (event.isTrusted) signal(subject, "recipient_engaged");
  saveButton.disabled = true;
  text("proposal-status", "");
  try {
    const firstSave = await mutateCopies(() => {
      const storage = window.localStorage;
      const key = copyPrefix + subject.plan.id;
      const existing = storage.getItem(key);
      if (copyFromValue(existing, key)) return false;
      storage.setItem(key, JSON.stringify({ token: subject.view.token, savedAt: Date.now() }));
      return existing !== removedCopy;
    });
    if (firstSave && event.isTrusted) signal(subject, "recipient_saved");
    if (current === subject) {
      refreshControls(savedCopies());
      if (!byId("saved-label").hidden) byId("saved-label").focus();
    }
  } catch {
    if (current === subject) {
      text("proposal-status", "This browser couldn’t save the plan. Keep the original link to reopen it.");
    }
  } finally {
    saveButton.disabled = false;
  }
});

removeButton.addEventListener("click", () => {
  removeConfirmation.hidden = false;
  removeButton.setAttribute("aria-expanded", "true");
  cancelRemoval.focus();
});

cancelRemoval.addEventListener("click", () => closeConfirmation(true));
removeConfirmation.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeConfirmation(true);
  }
});

confirmRemoval.addEventListener("click", async () => {
  const subject = current;
  if (!subject) return;
  confirmRemoval.disabled = true;
  text("proposal-status", "");
  try {
    // Leave only a local deduplication marker, with no schedule or link.
    await mutateCopies(() => window.localStorage.setItem(copyPrefix + subject.plan.id, removedCopy));
    if (current === subject) {
      navigation.remember({ kind: "library" });
      showLibrary(savedCopies(), true, "Saved copy removed.");
    }
  } catch {
    if (current === subject) {
      text("proposal-status", "This browser couldn’t remove the copy. Try again.");
    }
  } finally {
    confirmRemoval.disabled = false;
  }
});

expandButton.addEventListener("click", event => {
  if (event.isTrusted && current) signal(current, "recipient_engaged");
  remainingDates.hidden = !remainingDates.hidden;
  expandButton.setAttribute("aria-expanded", String(!remainingDates.hidden));
  const count = current.plan.count;
  expandButton.textContent = remainingDates.hidden ? "Show all " + count + " payments" : "Show fewer payments";
});

for (const button of [byId("show-saved-plans"), byId("invalid-show-saved")]) {
  button.addEventListener("click", () => changeView({ kind: "library" }));
}

document.addEventListener("visibilitychange", openWhenVisible);
document.addEventListener("prerenderingchange", openWhenVisible);
for (const event of ["hashchange", "popstate"]) {
  window.addEventListener(event, () => display(navigation.capture(), true));
}
window.addEventListener("storage", event => {
  if (event.key !== null && !event.key.startsWith(copyPrefix)) return;
  const copies = savedCopies();
  if (current) {
    if (current.view.kind === "saved" && !copies?.some(copy => copy.plan.id === current.plan.id)) {
      changeView({ kind: "library" });
    } else {
      refreshControls(copies);
    }
  } else if (!library.hidden) {
    showLibrary(copies);
  } else {
    byId("invalid-show-saved").hidden = !copies?.length;
  }
});

display(navigation.isClean() ? navigation.initial : navigation.capture());

export const CURRENCIES = Object.freeze(["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY"]);

const VERSION = 1;
const MAX_TOKEN_LENGTH = 128;
const MAX_INSTALLMENTS = 24;
const MAX_WHOLE_AMOUNT = 9_999_999;
const FIRST_YEAR = 2000;
const LAST_YEAR = 2100;
const INVALID_LINK = "This repayment proposal link is incomplete or invalid.";
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function inputError(field, message) {
  return Object.assign(new Error(message), { field });
}

function currencyScale(currency) {
  if (!CURRENCIES.includes(currency)) {
    throw inputError("currency", "Choose a supported currency.");
  }
  return currency === "JPY" ? 1 : 100;
}

function parseAmount(amount, currency) {
  const scale = currencyScale(currency);
  const text = typeof amount === "string" ? amount.trim() : "";
  const validAmount = scale === 1
    ? /^[0-9]+$/u
    : /^(?:[0-9]+(?:\.[0-9]{1,2})?|\.[0-9]{1,2})$/u;

  if (text.length > 32 || !validAmount.test(text)) {
    const message = scale === 1
      ? "Enter a whole amount for JPY."
      : "Enter an amount with up to two decimal places.";
    throw inputError("amount", message);
  }

  const [whole, fraction = ""] = text.split(".");
  const minorUnits = scale === 1 ? 0 : Number(fraction.padEnd(2, "0"));
  return Number(whole) * scale + minorUnits;
}

function readDate(value) {
  const message = `Select a valid date from ${FIRST_YEAR} through ${LAST_YEAR}.`;
  if (typeof value !== "string" || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw inputError("firstDate", message);
  }
  const [year, month, day] = value.split("-").map(Number);
  if (year < FIRST_YEAR || year > LAST_YEAR) {
    throw inputError("firstDate", message);
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.toISOString().slice(0, 10) !== value) {
    throw inputError("firstDate", message);
  }
  return date;
}

function scheduledDate(first, index, cadence) {
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const day = first.getUTCDate();
  if (cadence === "weekly") {
    return new Date(Date.UTC(year, month, day + index * 7));
  }
  // Resolve each month against the original day, even after a short month.
  const monthEnd = new Date(Date.UTC(year, month + index + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month + index, Math.min(day, monthEnd)));
}

function validateTerms({ currency, totalMinor, count, cadence, firstDate }) {
  const scale = currencyScale(currency);
  const maxMinor = (MAX_WHOLE_AMOUNT + 1) * scale - 1;
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 1 || totalMinor > maxMinor) {
    const message = scale === 1
      ? "Enter a total from 1 to 9,999,999."
      : "Enter a total from 0.01 to 9,999,999.99.";
    throw inputError("amount", message);
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS) {
    throw inputError("count", `Enter a number of installments from 1 to ${MAX_INSTALLMENTS}.`);
  }
  if (totalMinor < count) {
    throw inputError("count", "Use fewer installments so each payment is greater than zero.");
  }
  if (cadence !== "weekly" && cadence !== "monthly") {
    throw inputError("cadence", "Choose a weekly or monthly schedule.");
  }

  const first = readDate(firstDate);
  if (scheduledDate(first, count - 1, cadence).getUTCFullYear() > LAST_YEAR) {
    throw inputError("firstDate", `Choose an earlier first date so the schedule ends by ${LAST_YEAR}.`);
  }
  return first;
}

export function validateProposalInputs(inputs) {
  const { amount, currency, count, cadence, firstDate } = inputs ?? {};
  const countInput = typeof count === "string" ? count.trim() : count;
  const installmentCount = typeof countInput === "string" && /^[0-9]+$/u.test(countInput)
    ? Number(countInput)
    : countInput;
  const terms = {
    currency,
    totalMinor: parseAmount(amount, currency),
    count: installmentCount,
    cadence,
    firstDate,
  };
  validateTerms(terms);
  return terms;
}

function encodeBase64Url(ascii) {
  return btoa(ascii).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function randomId() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("This browser could not create a shareable repayment proposal.");
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return encodeBase64Url(String.fromCharCode(...bytes));
}

export function createProposal(inputs) {
  const terms = validateProposalInputs(inputs);
  return { id: randomId(), ...terms };
}

export function encodeProposal(plan) {
  const { id, currency, totalMinor, count, cadence, firstDate } = plan ?? {};
  // Sixteen bytes encode to 22 characters with four zero bits in the final character.
  if (typeof id !== "string" || id.length !== 22 || !/^[A-Za-z0-9_-]{21}[AQgw]$/u.test(id)) {
    throw new Error("This repayment proposal has an invalid ID.");
  }
  validateTerms({ currency, totalMinor, count, cadence, firstDate });
  return encodeBase64Url(JSON.stringify([VERSION, id, totalMinor, currency, count, cadence, firstDate]));
}

export function decodeProposal(token) {
  if (typeof token !== "string" || !token.length || token.length > MAX_TOKEN_LENGTH || /[^A-Za-z0-9_-]/u.test(token)) {
    throw new Error(INVALID_LINK);
  }

  try {
    const payload = JSON.parse(atob(token.replaceAll("-", "+").replaceAll("_", "/")));
    if (!Array.isArray(payload) || payload.length !== 7 || payload[0] !== VERSION) {
      throw new Error(INVALID_LINK);
    }
    const [, id, totalMinor, currency, count, cadence, firstDate] = payload;
    const plan = { id, currency, totalMinor, count, cadence, firstDate };

    // Validate every field and require the same compact representation the sender creates.
    if (encodeProposal(plan) !== token) {
      throw new Error(INVALID_LINK);
    }
    return plan;
  } catch {
    throw new Error(INVALID_LINK);
  }
}

export function scheduleFor(plan) {
  const { totalMinor, count, cadence } = plan;
  const first = validateTerms(plan);
  const regularAmount = Math.floor(totalMinor / count);
  const finalRemainder = totalMinor % count;

  return Array.from({ length: count }, (_, index) => ({
    date: scheduledDate(first, index, cadence).toISOString().slice(0, 10),
    amountMinor: regularAmount + (index === count - 1 ? finalRemainder : 0),
  }));
}

export function formatMoney(minor, currency) {
  const scale = currencyScale(currency);
  if (!Number.isSafeInteger(minor) || minor < 0) {
    throw new Error("This repayment proposal has an invalid amount.");
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" })
    .format(minor / scale);
}

export function formatDate(iso) {
  return dateFormatter.format(readDate(iso));
}

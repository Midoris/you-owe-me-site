export function loanAllowanceMessage(retryAfter, now = Date.now()) {
  const seconds = Number(retryAfter);
  const when = Number.isFinite(seconds) && seconds > 0 ? new Date(now + seconds * 1000).toLocaleString() : null;
  return `Today's AI import allowance is used up.${when ? ` Try again after ${when}.` : ' Try again tomorrow.'} Your input is kept. You can enter the history manually.`;
}

export function loanAllowanceMessage(retryAfter, now = Date.now(), reason = 'service') {
  if (reason === 'temporary') return 'Automatic import is busy. Please try again in a few minutes.';
  const seconds = Number(retryAfter);
  const when = Number.isFinite(seconds) && seconds > 0 && seconds <= 86400 ? new Date(now + seconds * 1000).toLocaleString() : null;
  const explanation = reason === 'network' ? 'This network has reached today’s import limit.' : 'Automatic import has reached today’s limit.';
  return `${explanation} ${when ? `Try again after ${when}.` : 'Please try again later.'}`;
}
export class LoanImportLimitError extends Error {
  constructor(body, retryAfter) {
    super(loanAllowanceMessage(retryAfter, Date.now(), body.error === 'daily_limit' ? body.limitReason : 'temporary'));
  }
}

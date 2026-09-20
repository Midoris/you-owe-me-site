// EXP-011: enable publicly only after backend, native/Clip and Apple acceptance.
export const loanImportEnabled = false;
export const localPreview = ['localhost','127.0.0.1'].includes(globalThis.location?.hostname) && new URLSearchParams(globalThis.location.search).get('loan-import') === '1';
export const enabled = loanImportEnabled || localPreview;
export const apiBase = localPreview ? 'http://127.0.0.1:5001/demo-exp011/us-central1/' : 'https://us-central1-you-owe-me-app.cloudfunctions.net/';
export const continuationBase = 'https://continue.you-owe-me.com/loan/';

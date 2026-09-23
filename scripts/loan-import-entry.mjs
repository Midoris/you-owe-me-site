import {enabled, localPreview} from './loan-import-config.mjs?v=20260922';

let importer;
const initializedOffers = new WeakSet();
let offerViewed = false;
let offerChosen = false;

// Public explanations are already in HTML; the rollout gate controls interaction only.
// No DOM, importer, storage read or request while rollout is off.
if (enabled) {
  document.querySelectorAll('[data-loan-rollout]').forEach(element => { element.hidden = false; });
  const direct = document.querySelector('[data-loan-import-root]');
  if (direct) void openImporter(direct).then(root => {
    if (location.hash === '#import-loan-history') root.scrollIntoView({block: 'start'});
  }).catch(() => showLoadError(direct));
  document.querySelectorAll('[data-loan-offer]').forEach(enhanceOffer);
}

function event(name) {
  if (!localPreview) window.dispatchEvent(new CustomEvent('youoweme:loan-import-event', {detail: {name}}));
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
async function openImporter(host) {
  importer ||= Promise.all([import('./loan-import-ui.mjs'), import('./loan-import.mjs?v=20260922'), loadStyles(), loadQR()])
    .catch(error => { importer = null; throw error; });
  const [{loanImportMarkup}, {startLoanImport}] = await importer;
  if (!host.querySelector('#import-loan-history')) {
    // The direct page keeps a static link target while rollout is off. Once
    // mounted, the actual intake owns that ID so it stays unique.
    if (host.id === 'import-loan-history') host.removeAttribute('id');
    host.innerHTML = loanImportMarkup;
  }
  host.hidden = false;
  const root = host.querySelector('#import-loan-history');
  startLoanImport(root);
  return root;
}
function loadQR() {
  if (typeof window.qrcode === 'function' || /iPhone|iPod/.test(navigator.userAgent)) return Promise.resolve();
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = '/scripts/vendor/qrcode-2.0.4.js';
    script.onload = resolve;
    // Existing transfer UI retains its private-link and backup-file fallbacks.
    script.onerror = () => {script.remove(); resolve();};
    document.head.append(script);
  });
}
function loadStyles() {
  if (document.querySelector('link[href="/styles/loan-import.css"]')) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = '/styles/loan-import.css';
    link.onload = resolve;
    link.onerror = () => {link.remove(); reject(new Error('Styles unavailable'));};
    document.head.append(link);
  });
}
function showLoadError(host) {
  host.hidden = false;
  const note = element('p', 'The importer could not load. Please try again.');
  note.setAttribute('role', 'alert'); host.replaceChildren(note);
}
function enhanceOffer(host) {
  if (initializedOffers.has(host)) return;
  const card = host.querySelector('.loan-import-offer');
  const button = card?.querySelector('[data-loan-import-open]');
  const workspace = host.querySelector('#loan-import-workspace');
  if (!card || !button || !workspace || !workspace.hidden) return;
  initializedOffers.add(host);
  let loading = false;
  button.addEventListener('click', async () => {
    if (loading) return;
    loading = true; button.disabled = true; button.textContent = 'Opening…';
    try {
      const root = await openImporter(workspace);
      button.setAttribute('aria-expanded', 'true'); button.textContent = 'Return to your import';
      root.tabIndex = -1; root.focus({preventScroll: true}); root.scrollIntoView({block: 'start'});
      if (!offerChosen) {event('offer_chosen'); offerChosen = true;}
    } catch {
      showLoadError(workspace); button.textContent = 'Try opening again';
    } finally {loading = false; button.disabled = false;}
  });
  button.hidden = false;
  // One actual viewport exposure per page, not merely a rendered hidden module.
  if (typeof IntersectionObserver === 'function') {
    let visible = false;
    const report = () => {
      if (!visible || document.visibilityState !== 'visible') return;
      if (!offerViewed) {event('offer_viewed'); offerViewed = true;}
      observer.disconnect(); document.removeEventListener('visibilitychange', report);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .5); report();
    }, {threshold: .5});
    observer.observe(card); document.addEventListener('visibilitychange', report);
  }
}

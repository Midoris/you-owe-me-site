import {enabled, localPreview} from './loan-import-config.mjs';
import {loanImportOffers} from './loan-import-offers.mjs';

let importer;

// No template, image, importer, storage read or request while rollout is off.
if (enabled) {
  document.querySelectorAll('[data-loan-rollout]').forEach(element => { element.hidden = false; });
  const direct = document.querySelector('[data-loan-import-root]');
  if (direct) void openImporter(direct).then(root => {
    if (location.hash === '#import-loan-history') root.scrollIntoView({block: 'start'});
  }).catch(() => showLoadError(direct));
  document.querySelectorAll('[data-loan-offer]').forEach(renderOffer);
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
  importer ||= Promise.all([import('./loan-import-ui.mjs'), import('./loan-import.mjs'), loadStyles(), loadQR()])
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
function renderOffer(host) {
  const copy = loanImportOffers[host.dataset.loanOffer];
  if (!copy) return;
  host.className = 'loan-import-entry';
  const card = element('section', null, 'loan-import-offer' + (copy.featured ? ' loan-import-offer--featured' : ''));
  const content = element('div', null, 'loan-import-offer__copy');
  const title = element('h2', copy.title); title.id = 'loan-import-offer-title';
  card.setAttribute('aria-labelledby', title.id);
  content.append(element('p', 'Start with what you already have', 'loan-import-offer__eyebrow'), title,
    element('p', copy.body, 'loan-import-offer__intro'),
    element('p', 'Text · CSV · Excel (.xlsx) · Word (.docx) · Photo', 'loan-import-offer__formats'));
  const button = element('button', 'Import loan history', 'loan-import-offer__button');
  button.type = 'button'; button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'loan-import-workspace');
  const actions = element('div', null, 'loan-import-offer__actions');
  actions.append(button, element('span', 'Review here. Keep tracking on iPhone.', 'loan-import-offer__reassurance'));
  content.append(actions); card.append(content);
  if (copy.featured) {
    const image = element('img'); image.src = '/images/shared/loan-import-history.webp';
    image.width = 640; image.height = 427; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
    image.className = 'loan-import-offer__image'; card.append(image);
  }
  const workspace = element('div'); workspace.id = 'loan-import-workspace'; workspace.hidden = true;
  host.append(card, workspace); host.hidden = false;
  let loading = false, opened = false;
  button.addEventListener('click', async () => {
    if (loading) return;
    loading = true; button.disabled = true; button.textContent = 'Opening…';
    try {
      const root = await openImporter(workspace);
      button.setAttribute('aria-expanded', 'true'); button.textContent = 'Return to your import';
      root.tabIndex = -1; root.focus({preventScroll: true}); root.scrollIntoView({block: 'start'});
      if (!opened) {event('offer_chosen'); opened = true;}
    } catch {
      showLoadError(workspace); button.textContent = 'Try opening again';
    } finally {loading = false; button.disabled = false;}
  });
  // One actual viewport exposure per page, not merely a rendered hidden module.
  if (typeof IntersectionObserver === 'function') {
    let visible = false;
    const report = () => {
      if (!visible || document.visibilityState !== 'visible') return;
      event('offer_viewed'); observer.disconnect(); document.removeEventListener('visibilitychange', report);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .5); report();
    }, {threshold: .5});
    observer.observe(card); document.addEventListener('visibilitychange', report);
  }
}

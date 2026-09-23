import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {loanImportOffers, loanImportOfferShared} from './loan-import-offers.mjs';

const expectedKeys = ['home', 'payment-plan', 'partial-repayment', 'money-owed', 'personal-loan', 'loan-guide', 'polite-reminder', 'running-balance', 'record-guide'];
const startMarker = '<!-- loan-import-offer:start -->';
const endMarker = '<!-- loan-import-offer:end -->';
const siteRoot = fileURLToPath(new URL('../', import.meta.url));

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
}

export function renderOffer(key, offer, shared = loanImportOfferShared) {
  if (!key || !offer?.title || !offer?.body) throw new Error(`Incomplete offer: ${key}`);
  const e = escapeHtml;
  const lines = [
    `<div id="loan-import-offer" class="loan-import-entry" data-loan-offer="${e(key)}">`,
    `  <section class="loan-import-offer${offer.featured ? ' loan-import-offer--featured' : ''}" aria-labelledby="loan-import-offer-title">`,
    '    <div class="loan-import-offer__copy">',
    `      <p class="loan-import-offer__eyebrow">${e(shared.eyebrow)}</p>`,
    `      <h2 id="loan-import-offer-title">${e(offer.title)}</h2>`,
    `      <p class="loan-import-offer__intro">${e(offer.body)}</p>`,
    `      <p class="loan-import-offer__formats">${e(shared.formats)}</p>`,
    `      <p class="loan-import-offer__limits">${e(shared.limits)}</p>`,
    '      <div class="loan-import-offer__actions">',
    `        <button type="button" class="loan-import-offer__button" data-loan-import-open aria-expanded="false" aria-controls="loan-import-workspace" hidden>${e(shared.button)}</button>`,
    `        <a class="loan-import-offer__guide" href="/tools/personal-loan-payment-tracker/#loan-import-guide">${e(shared.guide)}</a>`,
    `        <span class="loan-import-offer__reassurance">${e(shared.reassurance)}</span>`,
    '      </div>',
    '    </div>'
  ];
  if (offer.featured) lines.push('    <img class="loan-import-offer__image" src="/images/shared/loan-import-history.webp" width="640" height="427" alt="" loading="lazy" decoding="async" />');
  lines.push('  </section>', '  <div id="loan-import-workspace" hidden></div>', '</div>');
  return lines.join('\n');
}

function replaceBlock(source, key, offer, filename) {
  const starts = [...source.matchAll(/<!-- loan-import-offer:start -->/g)];
  const ends = [...source.matchAll(/<!-- loan-import-offer:end -->/g)];
  if (starts.length !== 1 || ends.length !== 1 || starts[0].index >= ends[0].index) throw new Error(`${filename}: expected one ordered offer marker pair`);
  const beforeStart = source.lastIndexOf('\n', starts[0].index - 1) + 1;
  const indent = source.slice(beforeStart, starts[0].index);
  if (!/^[ \t]*$/.test(indent)) throw new Error(`${filename}: start marker must be alone on a line`);
  const beforeEnd = source.lastIndexOf('\n', ends[0].index - 1) + 1;
  if (source.slice(beforeEnd, ends[0].index) !== indent) throw new Error(`${filename}: end marker indentation differs`);
  const endAt = ends[0].index + endMarker.length;
  if (source.slice(endAt, endAt + 1) !== '\n' && endAt !== source.length) throw new Error(`${filename}: end marker must be alone on a line`);
  const existingBlock = source.slice(starts[0].index + startMarker.length, beforeEnd);
  const keys = [...source.matchAll(/data-loan-offer="([^"]+)"/g)].map(match => match[1]);
  if (keys.length !== 1 || keys[0] !== key || !existingBlock.includes(`data-loan-offer="${key}"`)) throw new Error(`${filename}: unexpected offer key`);
  const rendered = renderOffer(key, offer).split('\n').map(line => indent + line).join('\n');
  return source.slice(0, starts[0].index + startMarker.length) + '\n' + rendered + '\n' + source.slice(beforeEnd);
}

export async function updateOffers({mode, rootDir = siteRoot, offers = loanImportOffers} = {}) {
  if (!['--write', '--check'].includes(mode)) throw new Error('Use --write or --check');
  if (JSON.stringify(Object.keys(offers)) !== JSON.stringify(expectedKeys)) throw new Error('Unexpected offer keys or order');
  const paths = new Set();
  const changes = [];
  // Validate every target before writing any target.
  for (const [key, offer] of Object.entries(offers)) {
    if (!/^\/(?:[a-z0-9-]+\/)*$/.test(offer.route)) throw new Error(`Invalid route for ${key}`);
    const filename = path.join(rootDir, offer.route.slice(1), 'index.html');
    if (paths.has(filename)) throw new Error(`Duplicate route for ${key}`);
    paths.add(filename);
    const current = await readFile(filename, 'utf8');
    const next = replaceBlock(current, key, offer, filename);
    if (current !== next) changes.push({filename, next});
  }
  if (mode === '--check' && changes.length) throw new Error(`Generated offers differ: ${changes.map(change => path.relative(rootDir, change.filename)).join(', ')}`);
  if (mode === '--write') for (const change of changes) await writeFile(change.filename, change.next);
  return changes.length;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  updateOffers({mode: process.argv[2]}).then(count => {
    console.log(process.argv[2] === '--check' ? 'Nine committed offer blocks match the renderer' : `${count} offer page${count === 1 ? '' : 's'} updated`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}

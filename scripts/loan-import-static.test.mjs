import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loanImportOffers, loanImportOfferShared} from './loan-import-offers.mjs';
import {escapeHtml, renderOffer, updateOffers} from './render-loan-import-offers.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file), 'utf8');
const entryPages = Object.entries(loanImportOffers).map(([key, offer]) => ({key, offer, file: path.join(offer.route.slice(1), 'index.html')}));

test('nine initial HTML offers are readable, bounded, and match the generator', async () => {
  assert.equal(entryPages.length, 9);
  assert.equal(await updateOffers({mode: '--check'}), 0);
  for (const {key, offer, file} of entryPages) {
    const html = await read(file);
    const blocks = [...html.matchAll(/<!-- loan-import-offer:start -->([\s\S]*?)<!-- loan-import-offer:end -->/g)];
    assert.equal(blocks.length, 1, file);
    const block = blocks[0][1];
    assert.match(block, new RegExp(`data-loan-offer="${key}"`));
    assert.match(block, /<h2 id="loan-import-offer-title">/);
    assert.ok(block.includes(escapeHtml(offer.title)), file);
    assert.ok(block.includes(escapeHtml(offer.body)), file);
    for (const text of [loanImportOfferShared.formats, loanImportOfferShared.limits, loanImportOfferShared.guide]) assert.ok(block.includes(text), file);
    assert.match(block, /href="\/tools\/personal-loan-payment-tracker\/#loan-import-guide"/);
    assert.match(block, /<button[^>]*data-loan-import-open[^>]*hidden>/);
    assert.match(block, /<div id="loan-import-workspace" hidden><\/div>/);
    assert.doesNotMatch(block, /data-loan-private|<form\b|<input\b/);
    assert.equal((html.match(/data-loan-offer=/g) || []).length, 1, file);
    assert.ok(html.includes('loan-import-entry.css?v=20260923-discovery1'), file);
    assert.ok(html.includes('loan-import-entry.mjs?v=20260923-discovery1'), file);
  }
});

test('renderer escapes content, is idempotent, and validates all pages before writing', async () => {
  const escaped = renderOffer('a"<&', {title: '<unsafe & title>', body: '"quote" and \'apostrophe\''});
  assert.match(escaped, /data-loan-offer="a&quot;&lt;&amp;"/);
  assert.match(escaped, /&lt;unsafe &amp; title&gt;/);
  assert.match(escaped, /&quot;quote&quot; and &#39;apostrophe&#39;/);
  const directory = await mkdtemp(path.join(tmpdir(), 'loan-import-offers-'));
  try {
    for (const {key, offer, file} of entryPages) {
      const target = path.join(directory, file);
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, `before\n<!-- loan-import-offer:start -->\n<div data-loan-offer="${key}"></div>\n<!-- loan-import-offer:end -->\nafter\n`);
    }
    assert.equal(await updateOffers({mode: '--write', rootDir: directory}), 9);
    assert.equal(await updateOffers({mode: '--write', rootDir: directory}), 0);
    assert.equal(await updateOffers({mode: '--check', rootDir: directory}), 0);
    const first = path.join(directory, entryPages[0].file);
    const original = await readFile(first, 'utf8');
    await writeFile(first, original.replace('loan-import-offer__intro', 'loan-import-offer__changed'));
    await assert.rejects(updateOffers({mode: '--check', rootDir: directory}), /Generated offers differ/);
    const malformed = path.join(directory, entryPages.at(-1).file);
    await writeFile(malformed, '<!-- loan-import-offer:start -->\n<div data-loan-offer="record-guide"></div>\n');
    await assert.rejects(updateOffers({mode: '--write', rootDir: directory}), /marker pair/);
    assert.match(await readFile(first, 'utf8'), /loan-import-offer__changed/);
  } finally { await rm(directory, {recursive: true, force: true}); }
});

test('tracker guide and supporting explanations are in public HTML', async () => {
  const tracker = await read('tools/personal-loan-payment-tracker/index.html');
  const guide = tracker.match(/<section id="loan-import-guide"[\s\S]*?<\/section>/)?.[0];
  assert.ok(guide);
  assert.ok(tracker.indexOf(guide) < tracker.indexOf('<div id="import-loan-history" data-loan-import-root hidden>'));
  assert.match(guide, /<h2 id="loan-import-guide-title">/);
  assert.equal((guide.match(/<li>/g) || []).length, 3);
  assert.match(guide, /<details class="loan-import-guide__example">/);
  assert.doesNotMatch(guide, /data-loan-offer|data-loan-private|<form\b|<details[^>]*open/);
  assert.match(guide, /JavaScript is required to review and import a loan on this website/);
  assert.equal((tracker.match(/id="import-loan-history"/g) || []).length, 1);
  assert.equal((tracker.match(/id="loan-import-guide"/g) || []).length, 1);
  for (const {file} of entryPages) assert.match(await read(file), /href="\/tools\/personal-loan-payment-tracker\/#loan-import-guide"/);
  const features = await read('features/index.html');
  assert.ok(features.indexOf('id="loan-records"') < features.indexOf('id="loan-history-import"'));
  assert.ok(features.indexOf('id="loan-history-import"') < features.indexOf('id="repayment-plans"'));
  assert.match(features, /Import your loan history/);
  assert.match(features, /figcaption>Illustration: existing records become a loan history you review\./);
  assert.match(features, /alt="Illustration of notes, a spreadsheet and a photographed record becoming one reviewed loan history\."/);
  assert.match(features, /width="1536" height="1024"/);
  assert.match(await read('quick-start/index.html'), /You do not have to start an existing loan from a blank record/);
  const comparison = await read('compare/spreadsheet-vs-app-for-tracking-money-owed/index.html');
  assert.match(comparison, /<div id="loan-history-import"><h3>Bring one loan’s history with you/);
  assert.doesNotMatch(comparison, /data-loan-rollout/);
});

test('feature assets and changed FAQ answers match their declared public facts', async () => {
  for (const [name, width, height] of [['loan-history-import-768.webp', 768, 512], ['loan-history-import-1536.webp', 1536, 1024]]) {
    const bytes = await readFile(path.join(root, 'images/pages/features', name));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(bytes.readUInt16LE(26) & 0x3fff, width);
    assert.equal(bytes.readUInt16LE(28) & 0x3fff, height);
  }
  for (const [file, question] of [
    ['tools/personal-loan-payment-tracker/index.html', 'Does this page save my information?'],
    ['compare/spreadsheet-vs-app-for-tracking-money-owed/index.html', 'Can I start with a spreadsheet and switch to an app later?']
  ]) {
    const html = await read(file);
    const json = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const findQuestion = value => {
      if (Array.isArray(value)) return value.map(findQuestion).find(Boolean);
      if (value && typeof value === 'object') return value.name === question ? value : Object.values(value).map(findQuestion).find(Boolean);
      return null;
    };
    const structured = json.map(findQuestion).find(Boolean);
    assert.ok(structured, file);
    const visible = html.match(new RegExp(`<summary>${question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</summary>\\s*<p>([^<]+)</p>`))?.[1];
    assert.equal(visible, structured.acceptedAnswer.text, file);
  }
});

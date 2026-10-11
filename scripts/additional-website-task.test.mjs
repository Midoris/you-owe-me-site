import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';
const read = file => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const refusal = await read('blog/how-to-politely-say-no-when-people-ask-for-money/index.html');
const sharedCopy = await read('scripts/repayment-reminder-text-examples.js');
const group = await read('tools/group-payback-calculator/index.html');
const groupController = await read('scripts/group-payback-calculator.js');
const language = createRequire(import.meta.url)('./app-language-support.js');

// These checks execute the existing copy engines on authored markup. They do
// not model layout, browser clipboard permissions, keyboard input or zoom.
test('all fifteen refusal controls copy rendered text and preserve the shared success event schema', async () => {
  const env = pageRuntime(refusal); env.run(sharedCopy);
  const buttons = env.document.querySelectorAll('[data-copy-template]');
  assert.equal(buttons.length, 15);
  assert.equal(env.document.querySelectorAll('[data-copy-status]').length, 1);
  const ids = buttons.map(button => button.getAttribute('data-copy-template'));
  assert.equal(new Set(ids).size, 15);
  for (const id of ids) {
    const card = env.query(`[data-template-id="${id}"]`);
    const text = card.querySelector('.template-card__message').textContent.trim();
    await env.click(`[data-copy-template="${id}"]`);
    assert.equal(env.copied.at(-1), text);
    assert.deepEqual(env.events.at(-1), { type: 'youoweme:tool-template-copy', detail: {
      page: 'repayment_reminder_text_examples', template_id: id,
      tone: card.getAttribute('data-tone'), category: card.getAttribute('data-category'),
    } });
    assert.equal(env.query(`[data-copy-template="${id}"]`).textContent, 'Copied');
    assert.match(env.query('[data-copy-status]').textContent, /^Copied /);
  }
  assert.equal(env.events.length, 15);
});

test('refusal textarea fallback succeeds and a denied fallback only announces failure', async () => {
  for (const fallbackFails of [false, true]) {
    const env = pageRuntime(refusal, { clipboardFails: true, fallbackFails }); env.run(sharedCopy);
    await env.click('[data-copy-template="polite-no-pushback-urgent"]');
    assert.equal(env.events.length, fallbackFails ? 0 : 1);
    assert.equal(env.copied.length, fallbackFails ? 0 : 1);
    assert.equal(env.document.querySelectorAll('textarea').length, 0);
    assert.match(env.query('[data-copy-status]').textContent, fallbackFails ? /Copy did not work/ : /^Copied /);
  }
});

test('family opening copies the exact visible gift-or-loan conversation without changing its event', async () => {
  const env = pageRuntime(await read('blog/how-to-ask-family-for-temporary-financial-help/index.html'));
  env.run(await read('scripts/temporary-financial-help-answer.js'));
  const message = env.query('[data-template-id="simple-family-money-ask"] .template-card__message').textContent.trim();
  await env.click('[data-copy-template="simple-family-money-ask"]');
  assert.equal(env.copied[0], message);
  assert.match(message, /whether this would be a gift or a loan/);
  assert.deepEqual(env.events[0], { type: 'youoweme:temporary-financial-help-copy', detail: { copy_type: 'template', id: 'simple-family-money-ask' } });
});

test('borrower supported language travels once with the prompt; English and unsupported locales stay silent', async () => {
  const html = await read('blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html');
  const controller = await read('scripts/friend-borrow-post-copy.js');
  for (const locale of ['de-DE', 'ar', 'en-US', 'xx']) {
    const env = pageRuntime(html); env.run(controller);
    const anchor = env.query('[data-app-language-support-anchor]');
    language.render(env.document, { languages: [locale] });
    language.render(env.document, { languages: [locale] });
    const supported = locale === 'de-DE' || locale === 'ar';
    assert.equal(anchor.hidden, !supported);
    assert.equal(env.document.querySelectorAll('[data-app-language-support-rendered]').length, supported ? 1 : 0);
    for (const [copy_type, id] of [['template', 'reply-after-yes'], ['record', 'friend-borrow-example-record'], ['template', 'need-more-time-update'], ['template', 'short-ask']]) {
      env.emit({ copy_type, id });
      assert.equal(env.query('[data-app-language-support-anchor]'), anchor);
      assert.ok(env.query('[data-friend-borrow-post-copy]').contains(anchor));
      assert.equal(anchor.hidden, !supported);
    }
  }
});

const keys = ['groupUpdate', 'individualReminder', 'partialAcknowledgment', 'closingMessage', 'recordNote'];
async function checkOutputs(env) {
  const api = env.context.GroupPaybackCalculator, calc = api.calculate();
  const selected = calc.peopleWithOpen.find(row => row.id === env.query('[data-reminder-select]').value) || calc.peopleWithOpen[0] || null;
  const expected = [api.buildGroupUpdate(calc), api.buildIndividualReminder(selected, calc), api.buildPartialAcknowledgment(calc), api.buildClosingMessage(calc), api.buildRecordNote(calc)];
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    assert.equal(env.query(`[data-output="${key}"]`).textContent, expected[index]);
    await env.click(`[data-copy-output="${key}"]`);
    assert.equal(env.copied.at(-1), expected[index]);
  }
  assert.match(env.query('[data-copy-status]').textContent, /^Copied/);
  return calc;
}

test('static group results order retains all five full-controller outputs through selection, partial repayment, settlement and reset', async () => {
  const env = pageRuntime(group); env.run(groupController);
  const results = env.query('.gpc-results');
  const sections = results.children.filter(node => node.tagName !== '#text');
  const copyIndex = sections.indexOf(env.query('.gpc-copy-panel'));
  const appIndex = sections.indexOf(env.query('.gpc-app-cta'));
  assert.ok(copyIndex >= 0 && appIndex === copyIndex + 1);
  assert.match(sections[appIndex + 1].textContent, /booked yet/);
  assert.equal(env.document.querySelectorAll('[data-copy-output]').length, 5);
  let calc = await checkOutputs(env);
  assert.equal(calc.stillOpenCents, 15000);
  const sam = calc.rows.find(row => row.name === 'Sam');
  env.edit('[data-reminder-select]', sam.id, 'change');
  await checkOutputs(env);
  assert.match(env.query('[data-output="individualReminder"]').textContent, /Sam/);
  env.edit(`[data-person-id="${sam.id}"] [data-person-paid-back]`, '20');
  calc = await checkOutputs(env);
  assert.equal(calc.stillOpenCents, 13000);
  for (const row of calc.rows.filter(row => !row.isPayer)) env.edit(`[data-person-id="${row.id}"] [data-person-paid-back]`, '60');
  calc = await checkOutputs(env);
  assert.equal(calc.stillOpenCents, 0);
  assert.match(env.query('[data-output="closingMessage"]').textContent, /settled/i);
  await env.click('[data-action="start-blank"]');
  calc = await checkOutputs(env);
  assert.equal(calc.totalCents, 0);
  assert.equal(calc.rows.length, 2);
  await env.click('[data-action="load-example"]');
  calc = await checkOutputs(env);
  assert.equal(calc.stillOpenCents, 15000);
  assert.equal(results.children.filter(node => node.tagName !== '#text')[copyIndex], env.query('.gpc-copy-panel'));
});

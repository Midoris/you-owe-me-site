import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { pageRuntime } from '../tests/helpers/additional-page-runtime.mjs';

const page = await readFile(new URL('../blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html', import.meta.url), 'utf8');
const controller = await readFile(new URL('./friend-borrow-post-copy.js', import.meta.url), 'utf8');
const engine = await readFile(new URL('./friend-borrow-money-answer.js', import.meta.url), 'utf8');
const eventName = 'youoweme:friend-borrow-money-copy';
const variants = [
  ['template', 'reply-after-yes', 'Reply copied', 'Keep track of your promise'],
  ['record', 'friend-borrow-example-record', 'Record copied', 'See what you have left to repay'],
  ['template', 'need-more-time-update', 'Update copied', 'Keep the revised plan clear'],
];
function fixture(options) {
  const env = pageRuntime(page, options);
  env.prompt = env.query('[data-friend-borrow-post-copy]');
  env.home = env.query('[data-friend-borrow-tracking-home]');
  env.anchor = env.query('[data-app-language-support-anchor]');
  return env;
}
function state(env) {
  return [env.prompt.parentNode, env.query('[data-friend-borrow-post-copy-eyebrow]').textContent,
    env.query('#friend-borrow-post-copy-title').textContent, env.query('.friend-borrow-post-copy__message').textContent];
}
function invariant(env) {
  assert.equal(env.document.querySelectorAll('[data-friend-borrow-post-copy]').length, 1);
  assert.equal(env.document.querySelectorAll('[data-app-language-support-anchor]').length, 1);
  assert.ok(env.prompt.contains(env.anchor));
  assert.equal(env.prompt.hidden, false);
  assert.equal(env.query('.friend-borrow-post-copy__boundary').textContent.trim(), 'Start a new record in the app; copied text is not imported.');
}
function eligible(env, variant) {
  const [copy_type, id, eyebrow, heading] = variant;
  env.emit({ copy_type, id });
  const button = env.query(`[data-copy-${copy_type === 'template' ? 'template' : 'text-target'}="${id}"]`);
  const card = button.closest('.template-card, .friend-borrow-card');
  assert.equal(env.prompt.parentNode, card.parentNode);
  assert.equal(card.parentNode.children[card.parentNode.children.indexOf(card) + 1], env.prompt);
  assert.equal(state(env)[1], eyebrow);
  assert.equal(state(env)[2], heading);
  assert.equal(state(env)[3], {
    'reply-after-yes': 'Record what you borrowed and the repayment date you agreed on. As you pay it back, You Owe Me keeps the payments and remaining balance together, so your next update starts with the right amount.',
    'friend-borrow-example-record': 'Create your loan record in You Owe Me, then add each repayment as you make it. Keep the original amount, payments, and remaining balance together.',
    'need-more-time-update': 'If you and your friend agree on new timing, keep that update with the loan record. Record repayments as you make them and set a reminder for your next check-in.',
  }[id]);
  invariant(env);
}

test('authored prompt is visible after the whole grid with ordinary attributed actions and one language slot', () => {
  const env = fixture();
  assert.equal(env.prompt.parentNode, env.home);
  assert.ok(page.indexOf('data-friend-borrow-tracking-home') > page.indexOf('data-copy-template="reply-after-yes"'));
  assert.ok(page.indexOf('data-friend-borrow-tracking-home') < page.indexOf('Do not send a long emotional message'));
  assert.equal(state(env)[1], 'After they agree');
  assert.equal(state(env)[2], 'Keep track of your promise');
  assert.match(state(env)[3], /any repayment date you agreed on/);
  const app = env.prompt.querySelector('[data-track-location="friend_borrow_post_copy_app_store_cta"]');
  assert.equal(app.getAttribute('href'), 'https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049&pt=117888502&ct=website_cta&mt=8');
  assert.equal(app.getAttribute('data-source-cluster'), 'temporary-support');
  assert.equal(app.getAttribute('aria-label'), 'Download You Owe Me on the App Store for keeping a friend loan and repayment updates clear');
  assert.equal(app.hasAttribute('data-iphone-handoff'), false);
  assert.ok(env.prompt.querySelector('[data-track-location="friend_borrow_post_copy_solution_cta"]'));
  assert.equal(env.anchor.hidden, true);
  invariant(env);
  assert.ok(page.indexOf('/scripts/friend-borrow-post-copy.js?v=additional-opportunities-20261025-1') > page.indexOf('/scripts/friend-borrow-money-answer.js'));
  assert.match(page, /dateModified": "2026-10-25"/);
  assert.match(page, /Updated <time datetime="2026-10-25">October 25, 2026/);
  assert.doesNotMatch(controller, /innerHTML|cloneNode|scrollIntoView|\.focus\(|navigator|localStorage|CustomEvent/);
});

for (const readyState of ['complete', 'loading']) test(`initialization is idempotent in a ${readyState} document`, () => {
  const env = fixture();
  const initial = state(env);
  env.document.readyState = readyState;
  env.run(controller); env.run(controller);
  if (readyState === 'loading') env.document.dispatchEvent({ type: 'DOMContentLoaded' });
  assert.deepEqual(state(env), initial);
  assert.equal(env.listeners.get(eventName).length, 1);
  eligible(env, variants[1]);
  const moved = state(env);
  env.run(controller);
  env.document.dispatchEvent({ type: 'DOMContentLoaded' });
  assert.equal(env.listeners.get(eventName).length, 1);
  assert.deepEqual(state(env), moved);
});

test('each eligible copy moves the same prompt; every real other template returns it home', () => {
  const env = fixture(); env.run(controller);
  const initial = state(env);
  for (const variant of variants) {
    eligible(env, variant); eligible(env, variant);
    for (const other of variants) eligible(env, other);
    for (const button of env.document.querySelectorAll('[data-copy-template]')) {
      if (button.hasAttribute('data-friend-borrow-post-copy-eligible')) continue;
      eligible(env, variant);
      env.emit({ copy_type: 'template', id: button.getAttribute('data-copy-template') });
      assert.deepEqual(state(env), initial); invariant(env);
    }
  }
  assert.equal(env.document.activeElement, undefined);
  assert.deepEqual(env.scrolls, []);
});

test('unknown, malformed, mismatched and cardless events preserve the current state', () => {
  const env = fixture(); env.run(controller); eligible(env, variants[2]);
  const initial = state(env);
  for (const detail of [undefined, null, {}, { id: 1, copy_type: 'template' }, { id: 'unknown', copy_type: 'template' },
    { id: 'reply-after-yes', copy_type: 'record' }, { id: 'friend-borrow-example-record', copy_type: 'template' }, { id: 'reply-after-yes', copy_type: 'other' }]) {
    env.emit(detail); assert.deepEqual(state(env), initial);
  }
  const button = env.query('[data-copy-template="reply-after-yes"]');
  env.document.body.appendChild(button);
  env.emit({ id: 'reply-after-yes', copy_type: 'template' });
  assert.deepEqual(state(env), initial); invariant(env);
  const recordCard = env.query('[data-copy-text-target="friend-borrow-example-record"]').closest('.friend-borrow-card');
  recordCard.parentNode.removeChild(recordCard);
  env.emit({ id: 'friend-borrow-example-record', copy_type: 'record' });
  assert.deepEqual(state(env), initial); invariant(env);
});

test('missing required nodes fail open without partially binding the controller', () => {
  for (const selector of ['[data-friend-borrow-tracking-home]', '[data-friend-borrow-post-copy-eyebrow]', '#friend-borrow-post-copy-title', '.friend-borrow-post-copy__message', '.friend-borrow-post-copy__boundary']) {
    const env = fixture();
    const node = env.query(selector);
    if (node === env.home) env.document.body.appendChild(env.prompt);
    node.parentNode.removeChild(node);
    env.run(controller);
    assert.equal(env.listeners.has(eventName), false);
    assert.equal(env.prompt.hidden, false);
    assert.ok(env.prompt.querySelector('a[href]'));
    assert.equal(env.prompt.__friendBorrowTrackingInitialized, undefined);
  }
});

test('real shared copy success moves the prompt while failed clipboard and fallback never do', async () => {
  for (const options of [{}, { clipboardFails: true }, { clipboardFails: true, fallbackFails: true }]) {
    const env = fixture(options); env.run(engine); env.run(controller);
    const initial = state(env);
    await env.click('[data-copy-template="reply-after-yes"]');
    if (options.fallbackFails) {
      assert.deepEqual(state(env), initial);
      assert.equal(env.events.length, 0);
      assert.equal(env.copied.length, 0);
      assert.equal(env.selections.length, 1);
      // The unchanged copy engine selects and scrolls text on failure; the continuation does neither.
      assert.equal(env.scrolls.length, 1);
    } else {
      assert.equal(env.copied[0], env.query('[data-template-id="reply-after-yes"] .template-card__message').textContent.trim());
      assert.deepEqual(env.events[0], { type: eventName, detail: { copy_type: 'template', id: 'reply-after-yes' } });
      assert.equal(state(env)[1], 'Reply copied'); invariant(env);
      if (!options.clipboardFails) { assert.equal(env.document.activeElement, undefined); assert.deepEqual(env.scrolls, []); }
    }
  }
});

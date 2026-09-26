import assert from 'node:assert/strict';
import test from 'node:test';
import { homepageStory } from '../assets/js/money-story-data.mjs';

test('homepage story balances reconcile, and the share and settlement keep their distinct histories', () => {
  const { chapters } = homepageStory;

  assert.deepEqual(chapters.map(chapter => chapter.id), [
    'begin', 'repay', 'change', 'remind', 'again', 'share', 'settle'
  ]);
  assert.deepEqual(chapters.map(chapter => chapter.balance), [300, 200, 240, 240, 160, 160, 0]);

  for (const chapter of chapters) {
    const rowBalance = chapter.rows.reduce((balance, row) => balance + row.amount, 0);
    assert.equal(rowBalance, chapter.balance, `${chapter.id}: row history should sum to the displayed balance`);
    assert.equal(chapter.covered - chapter.repaid, chapter.balance, `${chapter.id}: totals should reconcile`);
  }

  const share = chapters.find(chapter => chapter.id === 'share');
  const settled = chapters.find(chapter => chapter.id === 'settle');
  assert.deepEqual(share.rows.map(row => row.date), ['May 4', 'May 9', 'May 10', 'May 22']);
  assert.equal(share.covered, 340);
  assert.equal(share.repaid, 180);
  assert.equal(settled.rows.length, 5);
  assert.equal(settled.repaid, 340);
  assert.equal(settled.balance, 0);
});

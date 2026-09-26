import assert from 'node:assert/strict';
import test from 'node:test';
import { borrowerStory, homepageStory, roommateStory } from '../assets/js/money-story-data.mjs';

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
  assert.equal(share.title, 'Alex asks, “What do I still owe?”');
  assert.equal(share.description, 'You share a PDF with every entry and the $160 balance.');
  assert.deepEqual(share.rows.map(row => row.date), ['May 4', 'May 9', 'May 10', 'May 22']);
  assert.equal(share.covered, 340);
  assert.equal(share.repaid, 180);
  assert.equal(settled.rows.length, 5);
  assert.equal(settled.repaid, 340);
  assert.equal(settled.balance, 0);
});

test('borrower story preserves the borrower perspective and reconciles every payment', () => {
  const { chapters } = borrowerStory;

  assert.equal(borrowerStory.balanceLabel, 'You owe Maya');
  assert.deepEqual(chapters.map(chapter => chapter.id), [
    'agree', 'record', 'first', 'update', 'second', 'share', 'settle', 'app'
  ]);
  assert.deepEqual(chapters.map(chapter => chapter.balance), [120, 120, 80, 80, 30, 30, 0, 0]);

  for (const chapter of chapters) {
    const rowBalance = chapter.rows.reduce((balance, row) => balance + row.amount, 0);
    assert.equal(rowBalance, chapter.balance, `${chapter.id}: row history should sum to the displayed balance`);
    assert.equal(chapter.covered - chapter.repaid, chapter.balance, `${chapter.id}: totals should reconcile`);
  }

  assert.equal(chapters[0].message.response, 'Yes — I can help.');
  const update = chapters.find(chapter => chapter.id === 'update');
  assert.equal(update.description, 'You Owe Me drafts the update. You decide when to send it.');
  assert.equal(update.reminder, 'Update Maya · July 18');
  assert.equal(chapters.find(chapter => chapter.id === 'share').description, 'Share one current record: $30.');
  assert.equal(chapters.find(chapter => chapter.id === 'settle').settled, true);
  assert.equal(chapters.at(-1).repaid, 120);
  assert.equal(chapters.at(-1).cta, true);
  assert.equal(chapters.at(-1).title, 'Next time, keep it this clear.');
});

test('roommate story changes direction only after the second agreed bill, then settles', () => {
  const { chapters } = roommateStory;
  assert.deepEqual(chapters.map(chapter => chapter.id), [
    'bill', 'partial', 'new-bill', 'reverse', 'settle', 'app'
  ]);
  assert.deepEqual(chapters.map(chapter => chapter.balance), [60, 30, 30, -10, 0, 0]);
  for (const chapter of chapters) {
    assert.equal(
      chapter.rows.reduce((balance, row) => balance + row.amount, 0),
      chapter.balance,
      `${chapter.id}: the signed roommate history should reconcile`
    );
  }
  assert.equal(chapters[2].bill.amount, '$80');
  assert.equal(chapters[2].bill.detail, 'Alex paid · Your agreed half is $40');
  assert.equal(chapters[3].balance, -10);
  assert.equal(roommateStory.negativeBalanceLabel, 'You owe Alex');
  assert.equal(chapters[4].settled, true);
  assert.equal(chapters[5].cta, true);
});

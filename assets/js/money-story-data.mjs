const entries = [
  { label: 'Electricity bill', date: 'May 4', amount: 300 },
  { label: 'Repayment', date: 'May 9', amount: -100 },
  { label: 'Groceries', date: 'May 10', amount: 40 },
  { label: 'Repayment', date: 'May 22', amount: -80 },
  { label: 'Final repayment', date: 'May 30', amount: -160 }
];

export const homepageStory = {
  person: 'Alex',
  chapters: [
    { id: 'begin', title: 'You cover Alex’s bill.', description: 'Record the $300 Alex will pay back.', date: 'May 4', balance: 300, covered: 300, repaid: 0, rows: entries.slice(0, 1), step: 'Help' },
    { id: 'repay', title: 'The first $100 comes back.', description: 'You record the payment. The balance updates.', date: 'May 9', balance: 200, covered: 300, repaid: 100, rows: entries.slice(0, 2), step: 'Repay' },
    { id: 'change', title: 'Then you cover groceries.', description: 'Add $40 to Alex’s record. Keep every change together.', date: 'May 10', balance: 240, covered: 340, repaid: 100, rows: entries.slice(0, 3), step: 'Add' },
    { id: 'remind', title: 'A reminder for you.', description: 'Choose a day to check in with Alex.', date: 'May 14', balance: 240, covered: 340, repaid: 100, rows: entries.slice(0, 3), reminder: 'Check in with Alex · May 22', step: 'Remind' },
    { id: 'again', title: 'Another $80 paid back.', description: 'Record it. The balance changes; the history stays.', date: 'May 22', balance: 160, covered: 340, repaid: 180, rows: entries.slice(0, 4), step: 'Update' },
    { id: 'share', title: 'Alex asks, “What do I still owe?”', description: 'You share a PDF with every entry and the $160 balance.', date: 'May 22', balance: 160, covered: 340, repaid: 180, rows: entries.slice(0, 4), step: 'Share' },
    { id: 'settle', title: 'Alex pays back the rest.', description: 'Record the last $160. Keep the full history.', date: 'May 30', balance: 0, covered: 340, repaid: 340, rows: entries.slice(), step: 'Settled', settled: true }
  ]
};

const borrowerEntries = [
  { label: 'Phone bill', date: 'July 8', amount: 120 },
  { label: 'Repayment', date: 'July 18', amount: -40 },
  { label: 'Repayment', date: 'July 25', amount: -50 },
  { label: 'Final repayment', date: 'July 30', amount: -30 }
];

export const borrowerStory = {
  person: 'Maya',
  balanceLabel: 'You owe Maya',
  reminderPrefix: 'Repayment update',
  statement: {
    title: ['A clear record', 'for Maya.'],
    dateLabel: 'Current record',
    totalLabel: 'Remaining balance',
    summary: [
      { label: 'Borrowed', key: 'covered' },
      { label: 'Repaid', key: 'repaid' }
    ],
    foot: 'Ready to share with Maya'
  },
  chapters: [
    {
      id: 'agree',
      title: 'Maya says yes.',
      description: 'You borrow $120 for your phone bill and plan to repay it July 18.',
      date: 'July 8',
      balance: 120,
      covered: 120,
      repaid: 0,
      rows: borrowerEntries.slice(0, 1),
      step: 'Yes',
      message: {
        request: 'Could I borrow $120 for my phone bill? I can pay you back July 18.',
        response: 'Yes — I can help.'
      }
    },
    { id: 'record', title: 'Keep the promise clear.', description: 'Amount, reason, and date stay together.', date: 'July 8', balance: 120, covered: 120, repaid: 0, rows: borrowerEntries.slice(0, 1), step: 'Record' },
    { id: 'first', title: 'You repay $40.', description: 'Record it. $80 remains.', date: 'July 18', balance: 80, covered: 120, repaid: 40, rows: borrowerEntries.slice(0, 2), step: 'Pay' },
    { id: 'update', title: 'Your payday moves.', description: 'You Owe Me drafts the update. You decide when to send it.', date: 'July 18', balance: 80, covered: 120, repaid: 40, rows: borrowerEntries.slice(0, 2), reminder: 'Update Maya · July 18', step: 'Update' },
    { id: 'second', title: 'You repay $50 more.', description: 'The history stays. $30 remains.', date: 'July 25', balance: 30, covered: 120, repaid: 90, rows: borrowerEntries.slice(0, 3), step: 'More' },
    { id: 'share', title: 'Maya asks, “What’s left?”', description: 'Share one current record: $30.', date: 'July 25', balance: 30, covered: 120, repaid: 90, rows: borrowerEntries.slice(0, 3), step: 'Share' },
    { id: 'settle', title: 'You repay the final $30.', description: 'The balance closes. The history stays.', date: 'July 30', balance: 0, covered: 120, repaid: 120, rows: borrowerEntries.slice(), step: 'Settled', settled: true },
    { id: 'app', title: 'Next time, keep it this clear.', description: 'You Owe Me keeps the plan, repayments, and balance in one private record.', date: 'July 30', balance: 0, covered: 120, repaid: 120, rows: borrowerEntries.slice(), step: 'App', cta: true }
  ]
};

const roommateEntries = [
  { label: 'Electricity · Alex’s half', date: 'May 4', amount: 60, displayAmount: '$60 owed', kind: 'expense' },
  { label: 'Alex paid you', date: 'May 16', amount: -30, displayAmount: '$30 paid', kind: 'payment' },
  { label: 'Internet · your half', date: 'June 3', amount: -40, displayAmount: '$40 owed', kind: 'expense' },
  { label: 'You paid Alex', date: 'June 6', amount: 10, displayAmount: '$10 paid', kind: 'payment' }
];

export const roommateStory = {
  person: 'Alex',
  balanceLabel: 'Alex owes you',
  negativeBalanceLabel: 'You owe Alex',
  chapters: [
    { id: 'bill', title: 'You cover the electricity bill.', description: 'Alex’s agreed half of $120 is $60.', date: 'May 4', balance: 60, rows: roommateEntries.slice(0, 1), step: 'Bill' },
    { id: 'partial', title: 'Alex pays you $30.', description: 'Record it. $30 remains.', date: 'May 16', balance: 30, rows: roommateEntries.slice(0, 2), step: 'Part' },
    { id: 'new-bill', title: 'Then Alex covers June’s internet bill.', description: 'It’s $80; your agreed half is $40.', date: 'June 3', balance: 30, rows: roommateEntries.slice(0, 2), step: 'June', bill: { title: 'June · Internet', amount: '$80', detail: 'Alex paid · Your agreed half is $40' } },
    { id: 'reverse', title: 'Now you owe Alex $10.', description: 'The balance changes sides. Every entry stays.', date: 'June 3', balance: -10, rows: roommateEntries.slice(0, 3), step: 'Flip' },
    { id: 'settle', title: 'You settle the $10.', description: 'Record the payment. Paid in full.', date: 'June 6', balance: 0, rows: roommateEntries.slice(), step: 'Settled', settled: true },
    { id: 'app', title: 'Keep the next bill clear.', description: 'Track agreed shares and repayments in one current record.', date: 'June 6', balance: 0, rows: roommateEntries.slice(), step: 'App', cta: true }
  ]
};

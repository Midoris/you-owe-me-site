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

import { borrowerStory, homepageStory, roommateStory } from './money-story-data.mjs?v=20260926-11';

const money = amount => '$' + Math.round(amount).toLocaleString('en-US');
const make = (tag, className, value) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
};

function renderHistory(rows) {
  return rows.map(row => {
    const entry = make('div', 'money-story__entry ' + ((row.kind || (row.amount < 0 ? 'payment' : 'expense')) === 'payment' ? 'money-story__entry--payment' : 'money-story__entry--expense'));
    entry.append(
      make('small', '', row.date),
      make('strong', '', row.label),
      make('b', '', row.displayAmount || (row.amount < 0 ? '−' : '+') + money(Math.abs(row.amount)))
    );
    return entry;
  });
}

function renderStatement(chapter, data) {
  const person = String(data.person || 'Alex');
  const statement = data.statement || {};
  const sheet = make('div', 'money-story__statement');
  const mast = make('div', 'money-story__statement-mast');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.6');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M14 3H6v18h12V7zM14 3v5h4M9 12h6M9 16h6');
  icon.append(path);
  mast.append(make('span', '', 'You Owe Me'), icon);

  const title = make('div', 'money-story__statement-title');
  const titleLines = Array.isArray(statement.title) && statement.title.length
    ? statement.title
    : ['A clear record', 'for ' + person + '.'];
  titleLines.forEach((line, index) => {
    if (index) title.append(document.createElement('br'));
    title.append(document.createTextNode(line));
  });
  const total = make('div', 'money-story__statement-total');
  const totalValue = make('strong', '', money(chapter.balance));
  totalValue.append(make('span', '', '.00'));
  total.append(make('span', '', statement.totalLabel || 'Remaining balance'), totalValue);

  const summary = make('div', 'money-story__statement-summary');
  const summaryItems = Array.isArray(statement.summary) && statement.summary.length
    ? statement.summary.map(item => [item.label, chapter[item.key]])
    : [['Total covered', chapter.covered], ['Total repaid', chapter.repaid]];
  for (const [label, value] of summaryItems) {
    const item = make('div');
    item.append(make('small', '', label), make('b', '', money(value)));
    summary.append(item);
  }

  const ledger = make('div', 'money-story__statement-ledger');
  for (const row of chapter.rows) {
    const item = make('div', 'money-story__statement-row');
    const detail = make('span', 'money-story__statement-detail');
    detail.append(make('strong', '', row.label), make('small', '', row.date));
    item.append(detail, make('span', 'money-story__statement-amount', (row.amount < 0 ? '−' : '+') + money(Math.abs(row.amount))));
    ledger.append(item);
  }

  sheet.append(
    mast,
    title,
    make('div', 'money-story__statement-date', (statement.dateLabel || 'Statement') + ' · ' + chapter.date),
    total,
    summary,
    ledger,
    make('div', 'money-story__statement-foot', statement.foot || 'Prepared by you · Ready to share')
  );
  return sheet;
}

export function initMoneyStory(root, data = homepageStory) {
  if (!root || root.dataset.storyInitialized === 'true') return null;
  const chapters = data.chapters;
  if (!Array.isArray(chapters) || !chapters.length) return null;
  const query = name => root.querySelector('[data-story-' + name + ']');
  const track = query('track');
  const stage = query('stage');
  const title = query('title');
  const description = query('description');
  const kicker = query('kicker');
  const chapterMeter = query('chapter-meter');
  const amount = query('amount');
  const history = query('history');
  const account = query('account');
  const person = query('person');
  const avatar = query('avatar');
  const personName = query('person-name');
  const balanceDisplay = query('balance-display');
  const balanceLabel = query('balance-label');
  const documentView = query('document');
  const bill = query('bill');
  const billTitle = query('bill-title');
  const billAmount = query('bill-amount');
  const billDetail = query('bill-detail');
  const reminder = query('reminder');
  const reminderTitle = query('reminder-title');
  const reminderDate = query('reminder-date');
  const message = query('message');
  const messageRequest = query('message-request');
  const messageResponse = query('message-response');
  const success = query('success');
  const cta = query('cta');
  const steps = query('steps');
  const progress = query('progress');
  const begin = query('begin');
  if ([track, stage, title, description, kicker, chapterMeter, amount, history, account, person, avatar, personName, balanceDisplay, balanceLabel, documentView, reminder, reminderTitle, reminderDate, success, steps, progress, begin].some(item => !item)) return null;

  const shareChapter = chapters.find(chapter => chapter.id === 'share');
  const friend = String(data.person || 'Alex');
  avatar.textContent = friend.charAt(0).toUpperCase();
  personName.textContent = friend;
  balanceLabel.textContent = data.balanceLabel || friend + ' owes you';
  stage.setAttribute('role', 'region');
  if (shareChapter) documentView.replaceChildren(renderStatement(shareChapter, data));
  steps.replaceChildren(...chapters.map((chapter, index) => {
    const button = make('button');
    button.type = 'button';
    button.dataset.storyStep = String(index);
    button.setAttribute('aria-label', 'Step ' + (index + 1) + ' of ' + chapters.length + ': ' + chapter.step);
    button.append(make('span', '', String(index + 1).padStart(2, '0')), make('b', '', chapter.step));
    return button;
  }));

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let start = 0;
  let distance = 1;
  let target = 0;
  let position = 0;
  let frame = 0;
  let measureFrame = 0;
  let numberFrame = 0;
  let numberRun = 0;
  let displayed = chapters[0].balance;
  let previous = -1;
  let wasReduced = motion.matches;
  let destroyed = false;
  let measuredViewportHeight = 0;
  const viewportHeight = () => window.visualViewport?.height || window.innerHeight;

  function cancelNumber() {
    cancelAnimationFrame(numberFrame);
    numberFrame = 0;
    numberRun++;
    title.getAnimations?.().forEach(animation => animation.cancel());
  }

  function revealSuccess(revealed) {
    track.classList.toggle('is-settled', revealed);
    success.setAttribute('aria-hidden', String(!revealed));
    person.setAttribute('aria-hidden', String(revealed));
    balanceDisplay.setAttribute('aria-hidden', String(revealed));
  }

  function displayAmount(value, chapter) {
    amount.textContent = money(Math.abs(value));
    if (!data.negativeBalanceLabel) return;
    if (Math.abs(value) < .001 && chapter.settled) return;
    balanceLabel.textContent = value < 0 ? data.negativeBalanceLabel : data.balanceLabel;
  }

  function animateAmount(next, chapter, onComplete) {
    const from = displayed;
    const started = performance.now();
    const run = numberRun;
    const tick = now => {
      if (run !== numberRun || destroyed) return;
      const fraction = Math.min(1, (now - started) / 600);
      displayed = from + (next - from) * (1 - (1 - fraction) ** 3);
      displayAmount(displayed, chapter);
      if (fraction < 1) numberFrame = requestAnimationFrame(tick);
      else {
        numberFrame = 0;
        displayed = next;
        displayAmount(next, chapter);
        onComplete?.();
      }
    };
    numberFrame = requestAnimationFrame(tick);
  }

  function update(index, chapter) {
    if (motion.matches && !wasReduced) {
      cancelNumber();
      displayed = chapter.balance;
      displayAmount(displayed, chapter);
      if (chapter.settled) revealSuccess(true);
    }
    wasReduced = motion.matches;
    if (index === previous) return;

    cancelNumber();
    const alreadySettled = Boolean(chapter.settled && Math.abs(displayed - chapter.balance) < .001);
    revealSuccess(alreadySettled);
    kicker.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0');
    title.textContent = chapter.title;
    stage.setAttribute('aria-label', chapter.title);
    description.textContent = chapter.description;
    history.replaceChildren(...renderHistory(chapter.rows));
    if (chapter.reminder) {
      const [label, ...date] = chapter.reminder.split(' · ');
      reminderTitle.textContent = label;
      reminderDate.textContent = (data.reminderPrefix || 'Personal reminder') + (date.length ? ' · ' + date.join(' · ') : '');
    }
    const hasBill = Boolean(chapter.bill && bill && billTitle && billAmount && billDetail);
    if (hasBill) {
      billTitle.textContent = chapter.bill.title;
      billAmount.textContent = chapter.bill.amount;
      billDetail.textContent = chapter.bill.detail;
    }
    if (message && messageRequest && messageResponse && chapter.message) {
      messageRequest.textContent = chapter.message.request;
      messageResponse.textContent = chapter.message.response;
    }

    if (motion.matches) {
      displayed = chapter.balance;
      displayAmount(displayed, chapter);
      if (chapter.settled) revealSuccess(true);
    } else {
      if (alreadySettled) {
        displayed = chapter.balance;
        displayAmount(displayed, chapter);
      } else {
        animateAmount(chapter.balance, chapter, chapter.settled ? () => revealSuccess(true) : undefined);
      }
      title.animate?.([{ opacity: .25, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
    }

    const isShare = chapter.id === 'share';
    const isCta = Boolean(chapter.cta && cta);
    const hasMessage = Boolean(chapter.message && message);
    track.dataset.chapter = chapter.id;
    track.classList.toggle('has-reminder', Boolean(chapter.reminder));
    track.classList.toggle('has-message', hasMessage);
    track.classList.toggle('has-bill', hasBill);
    track.classList.toggle('is-cta', isCta);
    if (cta) {
      cta.hidden = !isCta;
      cta.toggleAttribute('inert', !isCta);
      cta.setAttribute('aria-hidden', String(!isCta));
    }
    account.setAttribute('aria-hidden', String(isShare || hasMessage || hasBill || isCta));
    documentView.setAttribute('aria-hidden', String(!isShare));
    bill?.setAttribute('aria-hidden', String(!hasBill));
    reminder.setAttribute('aria-hidden', String(!chapter.reminder || isShare));
    message?.setAttribute('aria-hidden', String(!hasMessage));
    for (const button of steps.querySelectorAll('button')) {
      const active = Number(button.dataset.storyStep) === index;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    }
    previous = index;
  }

  function render() {
    frame = 0;
    if (destroyed) return;
    // Keep chapter boundaries tied to fixed scroll positions. Easing the story
    // position made a fast swipe change chapters later than a slow drag.
    position = target;
    const scaled = position * chapters.length;
    const index = Math.min(chapters.length - 1, Math.floor(scaled));
    const chapterProgress = clamp(scaled - index);
    track.dataset.active = String(index);
    chapterMeter.style.setProperty('--story-chapter-progress', chapterProgress.toFixed(4));
    progress.style.transform = 'scaleX(' + position + ')';
    update(index, chapters[index]);
  }

  function read() {
    if (destroyed) return;
    if (Math.abs(viewportHeight() - measuredViewportHeight) > .5) {
      scheduleMeasure();
      return;
    }
    target = clamp((window.scrollY - start) / distance);
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    if (destroyed) return;
    measuredViewportHeight = viewportHeight();
    const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
    root.style.setProperty('--story-viewport-height', measuredViewportHeight.toFixed(2) + 'px');
    const isMobile = window.innerWidth <= 700;
    root.classList.toggle('is-compact-height', isMobile && measuredViewportHeight <= 750);
    root.classList.toggle('is-tight-height', isMobile && measuredViewportHeight <= 650);
    root.classList.toggle('is-extra-compact-height', isMobile && measuredViewportHeight <= 620);
    start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
    distance = Math.max(1, track.offsetHeight - measuredViewportHeight + stickyTop);
    read();
  }

  function scheduleMeasure() {
    if (destroyed || measureFrame) return;
    measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      measure();
    });
  }

  function go(index) {
    const step = Math.max(0, Math.min(chapters.length - 1, index));
    window.scrollTo({ top: start + distance * ((step + .28) / chapters.length), behavior: motion.matches ? 'auto' : 'smooth' });
  }

  function onBegin(event) {
    event.preventDefault();
    stage.focus({ preventScroll: true });
    go(0);
  }
  function onStep(event) {
    const button = event.target.closest('button[data-story-step]');
    if (button && steps.contains(button)) go(Number(button.dataset.storyStep));
  }

  begin.addEventListener('click', onBegin);
  steps.addEventListener('click', onStep);
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', scheduleMeasure);
  window.visualViewport?.addEventListener('resize', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure, { once: true });
  motion.addEventListener('change', read);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleMeasure) : null;
  observer?.observe(document.documentElement);
  observer?.observe(root);
  observer?.observe(track);
  document.fonts?.ready.then(scheduleMeasure);

  root.dataset.storyInitialized = 'true';
  root.classList.add('is-ready');
  measure();
  return {
    go,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      cancelNumber();
      observer?.disconnect();
      begin.removeEventListener('click', onBegin);
      steps.removeEventListener('click', onStep);
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('load', scheduleMeasure);
      motion.removeEventListener('change', read);
      root.classList.remove('is-ready');
      root.classList.remove('is-compact-height', 'is-tight-height', 'is-extra-compact-height');
      root.style.removeProperty('--story-viewport-height');
      delete root.dataset.storyInitialized;
    }
  };
}

const stories = { homepage: homepageStory, borrower: borrowerStory, roommate: roommateStory };
document.querySelectorAll('[data-money-story]').forEach(root => {
  const data = stories[root.dataset.moneyStory];
  if (data) initMoneyStory(root, data);
});

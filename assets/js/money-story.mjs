import { homepageStory } from './money-story-data.mjs';

const money = amount => '$' + Math.round(amount).toLocaleString('en-US');
const make = (tag, className, value) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
};

function renderHistory(rows) {
  return rows.map(row => {
    const entry = make('div', 'money-story__entry ' + (row.amount < 0 ? 'money-story__entry--payment' : 'money-story__entry--expense'));
    entry.append(
      make('small', '', row.date),
      make('strong', '', row.label),
      make('b', '', (row.amount < 0 ? '−' : '+') + money(Math.abs(row.amount)))
    );
    return entry;
  });
}

function renderStatement(chapter, person) {
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
  title.append(document.createTextNode('A clear record'), document.createElement('br'), document.createTextNode('for ' + person + '.'));
  const total = make('div', 'money-story__statement-total');
  const totalValue = make('strong', '', money(chapter.balance));
  totalValue.append(make('span', '', '.00'));
  total.append(make('span', '', 'Remaining balance'), totalValue);

  const summary = make('div', 'money-story__statement-summary');
  for (const [label, value] of [['Total covered', chapter.covered], ['Total repaid', chapter.repaid]]) {
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

  sheet.append(mast, title, make('div', 'money-story__statement-date', 'Statement · ' + chapter.date), total, summary, ledger, make('div', 'money-story__statement-foot', 'Prepared by you · Ready to share'));
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
  const amount = query('amount');
  const history = query('history');
  const account = query('account');
  const person = query('person');
  const avatar = query('avatar');
  const personName = query('person-name');
  const balanceDisplay = query('balance-display');
  const balanceLabel = query('balance-label');
  const documentView = query('document');
  const reminder = query('reminder');
  const reminderTitle = query('reminder-title');
  const reminderDate = query('reminder-date');
  const success = query('success');
  const steps = query('steps');
  const progress = query('progress');
  const begin = query('begin');
  if ([track, stage, title, description, kicker, amount, history, account, person, avatar, personName, balanceDisplay, balanceLabel, documentView, reminder, reminderTitle, reminderDate, success, steps, progress, begin].some(item => !item)) return null;

  const shareChapter = chapters.find(chapter => chapter.id === 'share');
  if (!shareChapter) return null;
  const friend = String(data.person || 'Alex');
  avatar.textContent = friend.charAt(0).toUpperCase();
  personName.textContent = friend;
  balanceLabel.textContent = friend + ' owes you';
  stage.setAttribute('role', 'region');
  documentView.replaceChildren(renderStatement(shareChapter, friend));
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
  let numberFrame = 0;
  let numberRun = 0;
  let displayed = chapters[0].balance;
  let previous = -1;
  let wasReduced = motion.matches;
  let firstRender = true;
  let destroyed = false;

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

  function animateAmount(next, onComplete) {
    const from = displayed;
    const started = performance.now();
    const run = numberRun;
    const tick = now => {
      if (run !== numberRun || destroyed) return;
      const fraction = Math.min(1, (now - started) / 600);
      displayed = from + (next - from) * (1 - (1 - fraction) ** 3);
      amount.textContent = money(displayed);
      if (fraction < 1) numberFrame = requestAnimationFrame(tick);
      else {
        numberFrame = 0;
        displayed = next;
        amount.textContent = money(next);
        onComplete?.();
      }
    };
    numberFrame = requestAnimationFrame(tick);
  }

  function update(index, chapter) {
    if (motion.matches && !wasReduced) {
      cancelNumber();
      displayed = chapter.balance;
      amount.textContent = money(displayed);
      if (chapter.settled) revealSuccess(true);
    }
    wasReduced = motion.matches;
    if (index === previous) return;

    cancelNumber();
    revealSuccess(false);
    kicker.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0');
    title.textContent = chapter.title;
    stage.setAttribute('aria-label', chapter.title);
    description.textContent = chapter.description;
    history.replaceChildren(...renderHistory(chapter.rows));
    if (chapter.reminder) {
      const [label, ...date] = chapter.reminder.split(' · ');
      reminderTitle.textContent = label;
      reminderDate.textContent = 'Personal reminder' + (date.length ? ' · ' + date.join(' · ') : '');
    }

    if (motion.matches) {
      displayed = chapter.balance;
      amount.textContent = money(displayed);
      if (chapter.settled) revealSuccess(true);
    } else {
      animateAmount(chapter.balance, chapter.settled ? () => revealSuccess(true) : undefined);
      title.animate?.([{ opacity: .25, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
    }

    const isShare = chapter.id === 'share';
    track.dataset.chapter = chapter.id;
    track.classList.toggle('has-reminder', Boolean(chapter.reminder));
    account.setAttribute('aria-hidden', String(isShare));
    documentView.setAttribute('aria-hidden', String(!isShare));
    reminder.setAttribute('aria-hidden', String(!chapter.reminder || isShare));
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
    position = firstRender || motion.matches ? target : position + (target - position) * .2;
    firstRender = false;
    if (Math.abs(target - position) < .00002) position = target;
    const scaled = position * chapters.length;
    const index = Math.min(chapters.length - 1, Math.floor(scaled));
    track.dataset.active = String(index);
    progress.style.transform = 'scaleX(' + position + ')';
    update(index, chapters[index]);
    if (position !== target) frame = requestAnimationFrame(render);
  }

  function read() {
    if (destroyed) return;
    target = clamp((window.scrollY - start) / distance);
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    if (destroyed) return;
    start = track.getBoundingClientRect().top + window.scrollY - 52;
    distance = Math.max(1, track.offsetHeight - window.innerHeight + 52);
    read();
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
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure, { once: true });
  motion.addEventListener('change', read);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
  observer?.observe(document.documentElement);
  observer?.observe(root);
  observer?.observe(track);
  document.fonts?.ready.then(measure);

  root.dataset.storyInitialized = 'true';
  root.classList.add('is-ready');
  measure();
  return {
    go,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelNumber();
      observer?.disconnect();
      begin.removeEventListener('click', onBegin);
      steps.removeEventListener('click', onStep);
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      motion.removeEventListener('change', read);
      root.classList.remove('is-ready');
      delete root.dataset.storyInitialized;
    }
  };
}

document.querySelectorAll('[data-money-story="homepage"]').forEach(root => initMoneyStory(root));

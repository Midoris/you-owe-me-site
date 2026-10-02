/* Local, prewritten examples only. This page never captures or interprets input. */
(function () {
  'use strict';
  // Name the inherited icon-only menu control and provide a keyboard dismissal.
  const navClose = document.querySelector('#navPanel .close');
  if (navClose) {
    navClose.setAttribute('aria-label', 'Close navigation');
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !document.body.classList.contains('is-navPanel-visible')) return;
      event.preventDefault();
      navClose.click();
      const toggle = document.querySelector('#navPanelToggle');
      if (toggle) toggle.focus();
    });
  }
  const tabs = document.querySelector('[data-voice-tabs]');
  const buttons = tabs ? Array.from(tabs.querySelectorAll('[data-voice-tab]')) : [];
  const panels = Array.from(document.querySelectorAll('[data-voice-panel]'));
  if (!tabs || !buttons.length || buttons.length !== panels.length) return;
  if (buttons.some(button => !panels.some(panel => panel.dataset.voicePanel === button.dataset.voiceTab))) return;

  function select(index, focus) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.voicePanel !== buttons[index].dataset.voiceTab;
    });
    if (focus) buttons[index].focus();
  }

  tabs.setAttribute('role', 'tablist');
  buttons.forEach((button, index) => {
    const panel = panels.find(item => item.dataset.voicePanel === button.dataset.voiceTab);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    button.addEventListener('click', () => select(index, false));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  select(0, false);
  tabs.hidden = false;
})();

(() => {
  'use strict';
  const countdown = document.querySelector('[data-wedding-countdown]');
  if (!countdown) return;
  // Pevné pásmo českého letního času: stejný okamžik pro hosty kdekoli na světě.
  const deadline = Date.parse(countdown.dataset.countdownTo);
  if (!Number.isFinite(deadline)) return;
  const heading = countdown.querySelector('[data-countdown-heading]');
  const names = ['days', 'hours', 'minutes', 'seconds'];
  const numbers = names.map(name => countdown.querySelector(`[data-countdown-part="${name}"]`));
  const labels = names.map(name => countdown.querySelector(`[data-countdown-label="${name}"]`));
  const units = [
    { one: 'den', few: 'dny', other: 'dní' },
    { one: 'hodina', few: 'hodiny', other: 'hodin' },
    { one: 'minuta', few: 'minuty', other: 'minut' },
    { one: 'sekunda', few: 'sekundy', other: 'sekund' },
  ];
  const plurals = new Intl.PluralRules('cs-CZ');
  let interval;

  function update() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const values = [
      Math.floor(remaining / 86400),
      Math.floor(remaining / 3600) % 24,
      Math.floor(remaining / 60) % 60,
      remaining % 60,
    ];
    values.forEach((value, index) => {
      const text = String(value).padStart(2, '0');
      if (numbers[index].textContent !== text) numbers[index].textContent = text;
      const label = units[index][plurals.select(value)] || units[index].other;
      if (labels[index].textContent !== label) labels[index].textContent = label;
    });
    if (remaining === 0) {
      heading.textContent = 'Náš velký den je tady!';
      clearInterval(interval);
    }
  }

  update();
  if (Date.now() < deadline) interval = setInterval(update, 1000);
  // Po návratu na kartu se čas srovná podle hodin, nikoli podle počtu tiků.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('pageshow', update);
})();

(() => {
  'use strict';
  const config = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);
  const date = new Date(`${config.date}T12:00:00`);
  const longDate = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const numericDate = [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join(' / ');
  const couple = config.names.join(' & ');
  $$('[data-name]').forEach(el => el.textContent = config.names[Number(el.dataset.name)]);
  $$('[data-date-long]').forEach(el => el.textContent = longDate);
  $$('[data-date-numeric]').forEach(el => el.textContent = numericDate);
  $$('[data-venue]').forEach(el => el.textContent = config.venue);
  $$('[data-address]').forEach(el => el.textContent = config.address);
  $$('[data-monogram]').forEach(el => {
    el.replaceChildren();
    [config.names[0][0], '&', config.names[1][0]].forEach((value, index) => {
      const part = document.createElement(index === 1 ? 'span' : 'b');
      part.textContent = value;
      if (index === 1) part.className = 'ampersand';
      el.append(part);
    });
  });
  $$('[data-photo]').forEach(slot => {
    const photo = config.photos?.[slot.dataset.photo];
    if (!photo?.src) return;
    const image = document.createElement('img');
    image.alt = photo.alt; image.loading = 'lazy'; image.decoding = 'async';
    image.style.cssText = 'position:absolute;inset:0;opacity:0';
    image.addEventListener('load', () => { image.style.opacity = '1'; slot.querySelector('.photo-placeholder').hidden = true; });
    image.addEventListener('error', () => image.remove());
    image.src = photo.src;
    slot.append(image);
  });
  document.title = `${couple} — naše ano`;
  $('#demo-badge').hidden = !config.demo;
  const menu = $('.menu-toggle');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otevřít menu'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  });
  $$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  $$('[data-calendar-download]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const escape = value => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
    const formatDay = value => `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, '0')}${String(value.getDate()).padStart(2, '0')}`;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alena a Dan//Wedding//CS', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${config.date}-alena-dan@nase-ano.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART;VALUE=DATE:${formatDay(date)}`, `DTEND;VALUE=DATE:${formatDay(nextDay)}`,
      `SUMMARY:${escape('Svatba — ' + couple)}`, `LOCATION:${escape(config.venue + ', ' + config.address)}`,
      `DESCRIPTION:${escape('Příjezd podle pozvánky: 10:00 na dopolední část, nebo 15:00 na odpolední oslavu. Obřad v 11:00. Parkování přímo na místě.')}`,
      'END:VEVENT', 'END:VCALENDAR'];
    // RFC 5545: fold lines by UTF-8 bytes, keeping each character intact.
    const encoder = new TextEncoder();
    const fold = line => { let result = '', chunk = ''; for (const character of line) { if (encoder.encode(chunk + character).length > 74) { result += chunk + '\r\n'; chunk = ' '; } chunk += character; } return result + chunk; };
    const url = URL.createObjectURL(new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'alena-a-dan-17-7-2027.ics'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }));

  function sendToAppsScript(payload) {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.appsScriptUrl || '')) {
      return Promise.reject(new Error('Potvrzení účasti zatím není spuštěné. Ozvěte se nám prosím telefonicky nebo e-mailem.'));
    }
    return new Promise((resolve, reject) => {
      const nonce = crypto.randomUUID();
      const iframe = document.createElement('iframe'); iframe.name = `rsvp-${nonce}`; iframe.className = 'submission-frame'; iframe.setAttribute('aria-hidden', 'true'); iframe.tabIndex = -1;
      const transfer = document.createElement('form'); transfer.method = 'POST'; transfer.action = config.appsScriptUrl; transfer.target = iframe.name; transfer.hidden = true;
      for (const [name, value] of Object.entries({ payload: JSON.stringify(payload), nonce, replyOrigin: location.origin })) {
        const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; transfer.append(input);
      }
      const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', listener); transfer.remove(); iframe.remove(); };
      const listener = event => {
        if (!/^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+-)?script\.googleusercontent\.com)$/.test(event.origin)) return;
        const result = event.data;
        if (!result || result.type !== 'wedding-rsvp-result' || result.nonce !== nonce || result.id !== payload.submissionId) return;
        cleanup();
        if (result.saved === true) resolve(result); else reject(new Error(result.error || 'Odpověď se nepodařilo uložit. Zkuste to prosím znovu.'));
      };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Potvrzení o uložení zatím nedorazilo. Zkuste odpověď odeslat znovu; opakované odeslání nevytvoří duplicitu.')); }, 35000);
      window.addEventListener('message', listener);
      document.body.append(iframe, transfer);
      // Ordinary form POST works across origins. Success requires a server receipt
      // after the durable write; an iframe load or opaque fetch is not success.
      transfer.submit();
    });
  }

  const form = $('#rsvp-form'); const message = $('#form-message');
  let submissionId = crypto.randomUUID();
  const selected = name => form.elements.namedItem(name).value;
  const updateVisibility = () => {
    const attending = selected('attending') === 'yes';
    $('#attendance-details').hidden = !attending; $('.note-label').hidden = !attending;
    form.querySelectorAll('[name=guest], [name=song]').forEach(input => input.disabled = !attending);
  };
  form.addEventListener('change', updateVisibility);
  $('#add-guest').addEventListener('click', () => {
    const count = $$('#guest-list .guest-row').length; if (count >= 10) return;
    const row = document.createElement('div'); row.className = 'guest-row';
    const input = document.createElement('input'); input.name = 'guest'; input.placeholder = 'Jméno a příjmení partnera nebo dítěte'; input.setAttribute('aria-label', 'Jméno a příjmení doprovodu'); input.maxLength = 120; input.required = true;
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '×'; button.setAttribute('aria-label', 'Odebrat tento doprovod');
    button.addEventListener('click', () => { row.remove(); $('#add-guest').hidden = false; $('#add-guest').focus(); });
    row.append(input, button); $('#guest-list').append(row); input.focus(); if (count + 1 >= 10) $('#add-guest').hidden = true;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    message.textContent = ''; message.className = '';
    if (location.protocol === 'file:') { message.textContent = 'Odesílání funguje na zveřejněném webu. Pro potvrzení účasti se nám zatím můžete ozvat telefonicky nebo e-mailem.'; message.className = 'form-error'; message.focus(); return; }
    const button = form.querySelector('[type=submit]'); button.disabled = true; button.firstElementChild.textContent = 'Odesíláme…'; form.setAttribute('aria-busy', 'true');
    try {
      const attending = selected('attending') === 'yes';
      const payload = { submissionId, name: selected('name').trim(), email: selected('email').trim(), attending,
        guests: attending ? Array.from(form.querySelectorAll('[name=guest]')).map(input => input.value.trim()) : [],
        stay: attending ? selected('stay') : 'home', song: attending ? selected('song').trim() : '', website: selected('website') };
      let result;
      if (config.formTransport === 'apps-script') result = await sendToAppsScript(payload);
      else {
        const response = await fetch(`${config.apiBase}/api/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
        result = await response.json().catch(() => null);
        if (!response.ok || !result?.saved || !result?.id) throw new Error(result?.error || 'Odpověď se nepodařilo uložit. Zkuste to prosím znovu.');
      }
      $('#success-copy').textContent = attending ? 'Máme vás zapsané. Už teď se na společnou oslavu těšíme.' : 'Děkujeme, že jste nám dali vědět. I tak na vás budeme myslet.';
      $('#receipt').textContent = `Číslo odpovědi: ${result.id.slice(0, 8).toUpperCase()}`;
      form.hidden = true; const success = $('#rsvp-success'); success.hidden = false; success.setAttribute('tabindex', '-1'); success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    } catch (error) {
      message.textContent = error.name === 'TimeoutError' ? 'Spojení trvalo příliš dlouho. Zkuste odeslat odpověď znovu; opakované odeslání nevytvoří duplicitu.' : error.message === 'Failed to fetch' ? 'Odpověď se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu.' : error.message;
      message.className = 'form-error'; message.focus();
    } finally { button.disabled = false; button.firstElementChild.textContent = 'Odeslat naši odpověď'; form.removeAttribute('aria-busy'); }
  });
  $('#another-response').addEventListener('click', () => {
    form.reset(); $('#guest-list').replaceChildren(); $('#add-guest').hidden = false; submissionId = crypto.randomUUID(); message.textContent = '';
    $('#rsvp-success').hidden = true; form.hidden = false; updateVisibility(); form.elements.namedItem('name').focus();
  });
  updateVisibility();
})();

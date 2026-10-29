/**
 * RSVP endpoint for the static GitHub Pages website.
 * Spreadsheet access stays private; visitors can only submit a new response.
 * Add the exact GitHub origin below, then deploy as a Web app running as you.
 */
const RSVP_CONFIG = {
  spreadsheetId: '',
  sheetName: 'Odpovědi',
  allowedOrigins: ['https://kormaister.github.io'], // Origin bez cesty repozitáře.
};
const RSVP_HEADERS = ['ID odpovědi', 'Přijato (UTC)', 'Jméno a příjmení', 'E-mail', 'Účast', 'Doprovod', 'Počet osob', 'Přespání', 'Písnička'];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function setup() {
  if (!RSVP_CONFIG.spreadsheetId) throw new Error('Doplňte spreadsheetId identifikátorem soukromé Google tabulky.');
  if (!RSVP_CONFIG.allowedOrigins.length) throw new Error('Doplňte allowedOrigins přesnou adresou GitHub Pages bez cesty repozitáře.');
  RSVP_CONFIG.allowedOrigins.forEach(function (origin) {
    if (!/^https:\/\/[^/]+$/.test(origin)) throw new Error('Povolená adresa musí být HTTPS origin bez koncového lomítka a bez cesty.');
  });
  const sheet = SpreadsheetApp.openById(RSVP_CONFIG.spreadsheetId).getSheetByName(RSVP_CONFIG.sheetName);
  if (!sheet) throw new Error('List Odpovědi nebyl nalezen.');
  const actual = sheet.getRange(1, 1, 1, RSVP_HEADERS.length).getValues()[0];
  if (actual.join('|') !== RSVP_HEADERS.join('|')) throw new Error('Záhlaví tabulky neodpovídá očekávané struktuře.');
  console.log('Tabulka je připravená. Nasazení webové aplikace a její URL jsou dalším krokem.');
}

function doGet() {
  // Never list guests, contacts, or rows in an anonymous endpoint.
  return ContentService.createTextOutput('Formulář přijímá pouze odpovědi odeslané ze svatebního webu.');
}

function doPost(event) {
  const origin = String(event && event.parameter && event.parameter.replyOrigin || '');
  if (RSVP_CONFIG.allowedOrigins.indexOf(origin) === -1) {
    return HtmlService.createHtmlOutput('Odeslání z této stránky není povoleno.');
  }
  const nonce = String(event.parameter.nonce || '');
  let id = '';
  let lock;
  try {
    if (!UUID_PATTERN.test(nonce)) throw new Error('Neplatný identifikátor odeslání.');
    const raw = String(event.parameter.payload || '');
    if (raw.length > 16000 || (event.postData && event.postData.length > 22000)) throw new Error('Odpověď je příliš dlouhá.');
    let data;
    try { data = JSON.parse(raw); } catch (_) { throw new Error('Odpověď má neplatný formát.'); }
    id = typeof data.submissionId === 'string' ? data.submissionId : '';
    const normalized = normalizeResponse_(data);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('Právě přichází více odpovědí. Zkuste to prosím za chvíli znovu.');
    const sheet = SpreadsheetApp.openById(RSVP_CONFIG.spreadsheetId).getSheetByName(RSVP_CONFIG.sheetName);
    if (!sheet) throw new Error('Ukládání odpovědí není dostupné. Ozvěte se nám prosím přímo.');
    const actual = sheet.getRange(1, 1, 1, RSVP_HEADERS.length).getValues()[0];
    if (actual.join('|') !== RSVP_HEADERS.join('|')) throw new Error('Ukládání odpovědí teď není dostupné. Ozvěte se nám prosím přímo.');
    const lastRow = sheet.getLastRow();
    const duplicate = lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1).getValues().some(function (row) { return row[0] === normalized.id; });
    if (!duplicate) {
      const stayLabels = { tent: 'Stan na místě', nearby: 'Vlastní ubytování v okolí', home: 'Odjezd domů', undecided: 'Ještě nevíme' };
      sheet.appendRow([
        normalized.id, new Date().toISOString(), cellText_(normalized.name), cellText_(normalized.email),
        normalized.attending ? 'Ano' : 'Ne', cellText_(normalized.guests.join('; ')),
        normalized.attending ? 1 + normalized.guests.length : 0,
        stayLabels[normalized.stay], cellText_(normalized.song)
      ]);
      SpreadsheetApp.flush();
    }
    return receipt_({ id: id, nonce: nonce, saved: true }, origin);
  } catch (error) {
    return receipt_({ id: id, nonce: nonce, saved: false, error: error instanceof Error ? error.message : 'Odpověď se nepodařilo uložit.' }, origin);
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function normalizeResponse_(data) {
  function text(value, min, max) {
    if (typeof value !== 'string') throw new Error('Zkontrolujte prosím vyplněné údaje.');
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) throw new Error('Zkontrolujte prosím délku vyplněných údajů.');
    return trimmed;
  }
  if (!data || typeof data !== 'object' || !UUID_PATTERN.test(data.submissionId)) throw new Error('Neplatný identifikátor odpovědi.');
  if (typeof data.attending !== 'boolean' || data.website !== '') throw new Error('Odpověď nelze přijmout.');
  const name = text(data.name, 2, 120);
  const email = text(data.email, 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Zkontrolujte prosím e-mail.');
  if (!Array.isArray(data.guests) || data.guests.length > 10) throw new Error('Zkontrolujte prosím doprovod.');
  const guests = data.guests.map(function (guest) { return text(guest, 1, 120); });
  if (['tent', 'nearby', 'home', 'undecided'].indexOf(data.stay) === -1) throw new Error('Vyberte prosím možnost přespání.');
  const song = text(data.song || '', 0, 200);
  return { id: data.submissionId, name: name, email: email, attending: data.attending,
    guests: data.attending ? guests : [], stay: data.attending ? data.stay : 'home', song: data.attending ? song : '' };
}

function cellText_(value) {
  // Keep user-entered text literal when Google Sheets or Excel reads it.
  return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
}

function receipt_(result, origin) {
  const message = Object.assign({ type: 'wedding-rsvp-result' }, result);
  const escapeScript = function (value) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); };
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.top.postMessage(' + escapeScript(message) + ',' + escapeScript(origin) + ');</script></body></html>';
  // The returned page contains only a receipt, never spreadsheet data or controls.
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

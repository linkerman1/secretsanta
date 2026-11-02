/* Secret Santa: client-side encrypted group lottery, no server/database. */
export const MAX_PARTICIPANTS = 24;
export const PIN_LENGTH = 16;
const ITERATIONS = 310000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export function base64url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function unbase64url(text) {
  if (typeof text !== 'string' || !/^[A-Za-z0-9_-]+$/.test(text) || text.length > 100000) throw new Error('Nieprawidłowe dane.');
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function secureIndex(max) {
  if (!Number.isInteger(max) || max <= 0) throw new Error('Zły zakres losowania.');
  const limit = Math.floor(4294967296 / max) * max;
  const array = new Uint32Array(1);
  do { crypto.getRandomValues(array); } while (array[0] >= limit);
  return array[0] % max;
}

export function normalizeNames(names) {
  if (!Array.isArray(names) || names.length < 2 || names.length > MAX_PARTICIPANTS) {
    throw new Error('Dodaj od 2 do ' + MAX_PARTICIPANTS + ' osób.');
  }
  const clean = names.map(name => {
    if (typeof name !== 'string') throw new Error('Nieprawidłowe imię.');
    const value = name.trim().replace(/\s+/g, ' ');
    if (!value || value.length > 40) throw new Error('Imię powinno mieć 1–40 znaków.');
    return value;
  });
  if (new Set(clean.map(n => n.toLocaleLowerCase('pl'))).size !== clean.length) {
    throw new Error('Imiona nie mogą się powtarzać.');
  }
  return clean;
}

// Genitive (dopełniacz) for the phrase "prezent dla…"; exceptions can be edited.
const GENITIVE = Object.freeze({
  ada:'Ady', adam:'Adama', agnieszka:'Agnieszki', ala:'Ali', alicja:'Alicji',
  amelia:'Amelii', ania:'Ani', anna:'Anny', asia:'Asi', basia:'Basi',
  bartek:'Bartka', bartosz:'Bartosza', celina:'Celiny', daniel:'Daniela',
  dawid:'Dawida', dominika:'Dominiki', ewa:'Ewy', filip:'Filipa',
  gosia:'Gosi', grzegorz:'Grzegorza', iga:'Igi', igor:'Igora',
  jakub:'Jakuba', jan:'Jana', julia:'Julii', kacper:'Kacpra',
  kamil:'Kamila', karol:'Karola', karolina:'Karoliny', kasia:'Kasi',
  katarzyna:'Katarzyny', krzysztof:'Krzysztofa', kuba:'Kuby',
  łukasz:'Łukasza', maciej:'Macieja', magda:'Magdy', maja:'Mai',
  marcin:'Marcina', marek:'Marka', maria:'Marii', marta:'Marty',
  mateusz:'Mateusza', michał:'Michała', mikołaj:'Mikołaja',
  milena:'Mileny', monika:'Moniki', natalia:'Natalii', ola:'Oli',
  olga:'Olgi', oliwia:'Oliwii', oskar:'Oskara', patrycja:'Patrycji',
  paweł:'Pawła', piotr:'Piotra', rafał:'Rafała', robert:'Roberta',
  szymon:'Szymona', tomek:'Tomka', tomasz:'Tomasza', wojciech:'Wojciecha',
  wojtek:'Wojtka', zosia:'Zosi', zuzia:'Zuzi', zuzana:'Zuzany'
});
export function polishGenitive(fullName) {
  if (typeof fullName !== 'string') return '';
  const name = fullName.trim();
  if (!name) return '';
  const [first, ...rest] = name.split(/\s+/);
  const lookup = first.toLocaleLowerCase('pl');
  let declined = GENITIVE[lookup];
  if (!declined) {
    if (/ek$/i.test(first)) declined = first.slice(0,-2) + 'ka';
    else if (/(k|g)a$/i.test(first)) declined = first.slice(0,-1) + 'i';
    else if (/ia$/i.test(first)) declined = first.slice(0,-1) + 'i';
    else if (/a$/i.test(first)) declined = first.slice(0,-1) + 'y';
    else if (/[bcćdfghjklłmnńprsśtwzźż]$/i.test(first)) declined = first + 'a';
    else declined = first;
  }
  if (first[0] === first[0].toLocaleLowerCase('pl')) declined = declined[0].toLocaleLowerCase('pl') + declined.slice(1);
  return [declined, ...rest].join(' ');
}

export function drawRecipients(names) {
  const n = normalizeNames(names).length;
  // A random single cycle is a derangement: no one draws themselves.
  const shuffled = Array.from({length: n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = secureIndex(i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const destinations = new Array(n);
  for (let i = 0; i < n; i++) destinations[shuffled[i]] = shuffled[(i + 1) % n];
  return destinations.map(i => names[i]);
}

export function newPin() {
  let result = '';
  const one = new Uint8Array(1);
  while (result.length < PIN_LENGTH) {
    crypto.getRandomValues(one);
    // Rejection sampling eliminates modulo bias.
    if (one[0] < 250) result += String(one[0] % 10);
  }
  return result;
}

async function keyForPin(pin, salt) {
  const raw = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256'},
    raw, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']
  );
}

export async function createRoom(names, options = {}) {
  const people = normalizeNames(names);
  const genitives = options.genitives || {};
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
  if (!crypto?.subtle) throw new Error('Otwórz stronę przez HTTPS.');
  const recipients = drawRecipients(people);
  const entries = [];
  const pins = [];
  for (let i = 0; i < people.length; i++) {
    const pin = newPin();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await keyForPin(pin, salt);
    const custom = genitives[recipients[i]];
    const forName = typeof custom === 'string' && custom.trim().length && custom.trim().length <= 70
      ? custom.trim() : polishGenitive(recipients[i]);
    const payload = enc.encode(JSON.stringify({to: recipients[i], forName}));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, payload));
    pins.push(pin);
    entries.push({name: people[i], salt: base64url(salt), iv: base64url(iv), cipher: base64url(encrypted)});
    if (onProgress) onProgress(i + 1, people.length);
  }
  return {room: {v: 1, entries}, pins, recipients, names: people};
}

export function encodeRoom(room) {
  validateRoom(room);
  return base64url(enc.encode(JSON.stringify(room)));
}

export function decodeRoom(token) {
  if (typeof token !== 'string' || token.length > 35000) throw new Error('Link jest zbyt długi lub uszkodzony.');
  let room;
  try { room = JSON.parse(dec.decode(unbase64url(token))); }
  catch (_) { throw new Error('Ten link jest nieprawidłowy.'); }
  return validateRoom(room);
}

export function validateRoom(room) {
  if (!room || room.v !== 1 || !Array.isArray(room.entries)) throw new Error('Nieznana wersja losowania.');
  normalizeNames(room.entries.map(e => e?.name));
  for (const entry of room.entries) {
    if (typeof entry.salt !== 'string' || typeof entry.iv !== 'string' || typeof entry.cipher !== 'string') {
      throw new Error('Nieprawidłowy link.');
    }
    if (entry.salt.length !== 22 || entry.iv.length !== 16 || entry.cipher.length < 24 || entry.cipher.length > 500) {
      throw new Error('Nieprawidłowe dane losowania.');
    }
  }
  return room;
}

export async function unlockDetails(room, name, pin) {
  validateRoom(room);
  const code = typeof pin === 'string' ? pin.replace(/[\s-]/g, '') : '';
  if (!new RegExp('^[0-9]{' + PIN_LENGTH + '}
  const entry = room.entries.find(e => e.name === name);
  if (!entry) throw new Error('Nie ma takiego uczestnika.');
  try {
    const key = await keyForPin(code, unbase64url(entry.salt));
    const data = await crypto.subtle.decrypt(
      {name: 'AES-GCM', iv: unbase64url(entry.iv)},
      key, unbase64url(entry.cipher)
    );
    const payload = JSON.parse(dec.decode(data));
    if (typeof payload.to !== 'string' || !room.entries.some(e => e.name === payload.to) || payload.to === name) {
      throw new Error('Nieprawidłowy przydział.');
    }
    return {recipient: payload.to,
      forName: typeof payload.forName === 'string' && payload.forName.trim().length > 0 && payload.forName.length <= 70
        ? payload.forName : polishGenitive(payload.to)};
  } catch (_) {
    throw new Error('Błędny PIN lub uszkodzony link.');
  }
}

export async function unlock(room, name, pin) {
  return (await unlockDetails(room, name, pin)).recipient;
}

export function backupIsValid(backup) {
  if (!backup || backup.v !== 1 || !Array.isArray(backup.names) || !Array.isArray(backup.pins) ||
    !Array.isArray(backup.recipients) || !backup.room) return false;
  try { normalizeNames(backup.names); validateRoom(backup.room); }
  catch (_) { return false; }
  return backup.names.length === backup.pins.length &&
    backup.names.length === backup.recipients.length &&
    backup.names.length === backup.room.entries.length &&
    backup.names.every((name,i) =>
      backup.room.entries[i].name === name &&
      typeof backup.pins[i] === 'string' &&
      new RegExp('^[0-9]{' + PIN_LENGTH + '}$').test(backup.pins[i]) &&
      typeof backup.recipients[i] === 'string' &&
      backup.recipients[i] !== name &&
      backup.names.includes(backup.recipients[i])
    ) &&
    new Set(backup.recipients).size === backup.names.length;
}
).test(code)) {
    throw new Error('Wpisz ' + PIN_LENGTH + '-cyfrowy PIN.');
  }
  const entry = room.entries.find(e => e.name === name);
  if (!entry) throw new Error('Nie ma takiego uczestnika.');
  try {
    const key = await keyForPin(pin, unbase64url(entry.salt));
    const data = await crypto.subtle.decrypt(
      {name: 'AES-GCM', iv: unbase64url(entry.iv)},
      key, unbase64url(entry.cipher)
    );
    const payload = JSON.parse(dec.decode(data));
    if (typeof payload.to !== 'string' || !room.entries.some(e => e.name === payload.to) || payload.to === name) {
      throw new Error('Nieprawidłowy przydział.');
    }
    return payload.to;
  } catch (_) {
    throw new Error('Błędny PIN lub uszkodzony link.');
  }
}

export function backupIsValid(backup) {
  if (!backup || backup.v !== 1 || !Array.isArray(backup.names) || !Array.isArray(backup.pins) ||
    !Array.isArray(backup.recipients) || !backup.room) return false;
  try { normalizeNames(backup.names); validateRoom(backup.room); }
  catch (_) { return false; }
  return backup.names.length === backup.pins.length &&
    backup.names.length === backup.recipients.length &&
    backup.names.length === backup.room.entries.length &&
    backup.names.every((name,i) =>
      backup.room.entries[i].name === name &&
      typeof backup.pins[i] === 'string' &&
      new RegExp('^[0-9]{' + PIN_LENGTH + '}$').test(backup.pins[i]) &&
      typeof backup.recipients[i] === 'string' &&
      backup.recipients[i] !== name &&
      backup.names.includes(backup.recipients[i])
    ) &&
    new Set(backup.recipients).size === backup.names.length;
}

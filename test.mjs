import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
globalThis.crypto = webcrypto;

import {MAX_PARTICIPANTS, PIN_LENGTH, normalizeNames, drawRecipients, newPin, createRoom, encodeRoom, decodeRoom, unlock, backupIsValid} from './santa-core.mjs';

assert.equal(PIN_LENGTH,16);
assert.equal(MAX_PARTICIPANTS,24);
assert.throws(()=>normalizeNames(['Anna']),/2/);
assert.throws(()=>normalizeNames(['Anna','anna']),/powtarzać/);
assert.deepEqual(normalizeNames([' Anna  Nowak ',' Piotr ']),['Anna Nowak','Piotr']);

for(let n of [2,3,5,12]) {
  const people=Array.from({length:n},(_,i)=>'Osoba '+i);
  for(let attempt=0;attempt<80;attempt++){
    const matches=drawRecipients(people);
    assert.equal(new Set(matches).size,n);
    matches.forEach((name,i)=>assert.notEqual(name,people[i]));
  }
}
assert.match(newPin(),/^\d{16}$/);

const names=['Anna','Piotr','Kasia','Ola'];
const group=await createRoom(names);
assert.equal(group.room.entries.length,4);
assert.equal(new Set(group.recipients).size,4);
assert.equal(group.pins.length,4);
assert.equal(new Set(group.pins).size,4);
assert.ok(group.pins.every(pin=>/^\d{16}$/.test(pin)));
const encoded=encodeRoom(group.room);
assert.match(encoded,/^[A-Za-z0-9_-]+$/);
const publicRoom=decodeRoom(encoded);
assert.deepEqual(publicRoom,group.room);

for(let i=0;i<names.length;i++){
  const output=await unlock(publicRoom,names[i],group.pins[i]);
  assert.equal(output,group.recipients[i]);
  await assert.rejects(unlock(publicRoom,names[i],'0000000000000000'),/Błędny PIN/);
  await assert.rejects(unlock(publicRoom,names[i],group.pins[(i+1)%names.length]),/Błędny PIN/);
}
assert.throws(()=>decodeRoom('junk'),/nieprawidłowy/);
const backup={v:1,...group};
assert.equal(backupIsValid(backup),true);
assert.equal(backupIsValid({...backup,pins:['x']}),false);
assert.equal(backupIsValid({...backup,recipients:[...group.recipients.slice(0,3),group.recipients[2]]}),false);
const html=await readFile('index.html','utf8');
assert.ok(html.includes("from './santa-core.mjs'"));
assert.ok(html.includes('id="guest-name"'));
assert.ok(html.includes('id="guest-pin"'));
assert.ok(html.includes('id="room-url"'));
assert.ok(html.includes('id="backup-json"'));
console.log('PASS: unique derangements, encrypted single-link data, correct PIN, wrong PIN, backups and HTML assets.');

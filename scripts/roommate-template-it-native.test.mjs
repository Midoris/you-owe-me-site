import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseStaticPage} from '../tests/helpers/static-dom.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const route='/it/strumenti/modello-spese-coinquilini/';
const page=read(route.slice(1)+'index.html');
const approved=JSON.parse(read('tests/fixtures/italian-roommate-copy.json'));
test('Italian native assembly binds the verified Google master and genuine1536×1024hero with no publication placeholders',()=>{
 assert.ok(fs.existsSync(new URL('../tests/fixtures/italian-roommate-native.json',import.meta.url)),'Native assembly pending: main must supply the verified Google copy URL and genuine hero before full acceptance');
 const native=JSON.parse(read('tests/fixtures/italian-roommate-native.json')),d=parseStaticPage(page);assert.equal(native.status,'verified');assert.match(native.copyUrl,/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+\/copy$/);const google=d.querySelectorAll('a').filter(n=>n.getAttribute('href')?.includes('docs.google.com/spreadsheets/'));assert.equal(google.length,3);assert.ok(google.every(n=>n.getAttribute('href')===native.copyUrl));assert.doesNotMatch(page,/loc33-native-master-pending|local-only development pending|actual rounded KB|DRAFT-NOT-FOR-RELEASE/);
 const image=d.querySelector('.roommate-template-hero-visual img');assert.equal(image.getAttribute('src'),'/images/it/tools/modello-spese-coinquilini/modello-spese-coinquilini-hero.webp');assert.equal(image.getAttribute('alt'),approved.hero.imageAlt);assert.equal(image.getAttribute('width'),'1536');assert.equal(image.getAttribute('height'),'1024');const bytes=fs.readFileSync(new URL('..'+image.getAttribute('src'),import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),native.heroSha256);assert.equal(native.width,1536);assert.equal(native.height,1024);
});

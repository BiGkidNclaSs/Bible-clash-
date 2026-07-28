#!/usr/bin/env node
/**
 * Regression tests for qr.js. No dependencies — run with `node .claude/scripts/qr.test.js`.
 *
 * The expected matrices were cross-checked module-for-module against two
 * independent reference implementations (the `qrcode` npm package and Nayuki's
 * qr-code-generator) across versions 1-40 at every error correction level, so
 * these fixtures pin known-good output.
 */

'use strict';

const crypto = require('crypto');
const { makeQr, renderQr } = require('./qr.js');

const FIXTURES = [
    { text: 'https://bigkidnclass.github.io/Bible-clash-/', ecl: 'M', version: 4, mask: 3, sha: '58b79fe2fa4afb43' },
    { text: 'http://192.168.1.24:8000/', ecl: 'M', version: 2, mask: 1, sha: '9cbe9466b14e5497' },
    { text: 'Bible Clash', ecl: 'L', version: 1, mask: 2, sha: '987c2ade7dd84e71' },
    { text: 'does jesus love everybody', ecl: 'Q', version: 3, mask: 4, sha: '2149185b2d13a775' },
    { text: 'z'.repeat(400), ecl: 'H', version: 21, mask: 1, sha: 'f195aceab20967e7' },
];

let failures = 0;

function check(name, actual, expected) {
    if (actual !== expected) {
        console.error(`FAIL ${name}: expected ${expected}, got ${actual}`);
        failures++;
    }
}

function matrixHash(qr) {
    const bits = qr.modules.map((row) => row.map((cell) => (cell ? 1 : 0)).join('')).join('');
    return crypto.createHash('sha256').update(bits).digest('hex').slice(0, 16);
}

for (const fixture of FIXTURES) {
    const label = `${JSON.stringify(fixture.text.slice(0, 20))} @${fixture.ecl}`;
    const qr = makeQr(fixture.text, fixture.ecl);
    check(`${label} version`, qr.version, fixture.version);
    check(`${label} size`, qr.size, fixture.version * 4 + 17);
    check(`${label} mask`, qr.mask, fixture.mask);
    check(`${label} matrix`, matrixHash(qr), fixture.sha);
}

// The compact rendering must stay inside 80 columns, since a wrapped QR code
// cannot be scanned.
const compact = renderQr(makeQr('https://bigkidnclass.github.io/Bible-clash-/', 'M'));
const width = Math.max(...compact.split('\n').map((line) => line.length));
check('compact rendering width <= 80', width <= 80, true);

// Both renderings must carry the full four-module quiet zone.
const qr = makeQr('Bible Clash', 'L');
const compactLines = renderQr(qr).split('\n');
check('compact quiet zone rows', compactLines.slice(0, 2).every((l) => /^ +$/.test(l)), true);
const bigLines = renderQr(qr, { style: 'big' }).split('\n');
check('big quiet zone rows', bigLines.slice(0, 4).every((l) => /^ +$/.test(l)), true);
check('big rendering is two chars per module', bigLines[0].length, (qr.size + 8) * 2);

// Inverting must flip every cell of the rendering.
const normal = renderQr(qr, { style: 'big' });
const inverted = renderQr(qr, { style: 'big', invert: true });
check('invert flips the rendering', normal.replace(/█/g, '.').replace(/ /g, '█').replace(/\./g, ' '), inverted);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log(`All checks passed (${FIXTURES.length} fixtures).`);

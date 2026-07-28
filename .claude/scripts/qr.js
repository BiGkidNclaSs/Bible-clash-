#!/usr/bin/env node
/**
 * Dependency-free QR code generator for the terminal.
 *
 * Used by the /mobile, /ios and /android slash commands to print a scannable
 * QR code for Bible Clash. Byte mode only, versions 1-40, all four ECC levels.
 *
 *   node .claude/scripts/qr.js                       # QR for the live site
 *   node .claude/scripts/qr.js --local               # QR for http://<lan-ip>:8000
 *   node .claude/scripts/qr.js --local 3000          # ...on another port
 *   node .claude/scripts/qr.js https://example.com   # QR for arbitrary text
 *   node .claude/scripts/qr.js --invert <text>       # flip polarity (dark terminals)
 */

'use strict';

const os = require('os');

const LIVE_URL = 'https://bigkidnclass.github.io/Bible-clash-/';

// --- Galois field arithmetic (GF(256), primitive polynomial 0x11D) ---------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
}

/** Generator polynomial for `degree` error correction codewords. */
function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], EXP[i]);
        }
        poly = next;
    }
    return poly;
}

/** Reed-Solomon remainder of `data` for the given number of EC codewords. */
function rsEncode(data, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const remainder = new Uint8Array(ecLen);
    for (const byte of data) {
        const factor = byte ^ remainder[0];
        remainder.copyWithin(0, 1);
        remainder[ecLen - 1] = 0;
        for (let i = 0; i < ecLen; i++) {
            remainder[i] ^= gfMul(gen[i + 1], factor);
        }
    }
    return remainder;
}

// --- Version / error correction tables ------------------------------------

const ECC_LEVELS = { L: 0, M: 1, Q: 2, H: 3 };

// Format-info bit patterns, indexed by ECC level.
const ECC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

// Error correction codewords per block, indexed [level][version].
const ECC_CODEWORDS_PER_BLOCK = [
    // Version: 0 is unused padding so the index matches the version number.
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // L
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // M
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Q
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // H
];

// Number of error correction blocks, indexed [level][version].
const NUM_ECC_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], // L
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], // M
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], // Q
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // H
];

/** Total number of data + error correction modules available in a version. */
function numRawDataModules(version) {
    let result = (16 * version + 128) * version + 64;
    if (version >= 2) {
        const numAlign = Math.floor(version / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (version >= 7) result -= 36;
    }
    return result;
}

/** Number of usable data codewords (i.e. excluding EC) for a version/level. */
function numDataCodewords(version, ecl) {
    return (
        Math.floor(numRawDataModules(version) / 8) -
        ECC_CODEWORDS_PER_BLOCK[ECC_LEVELS[ecl]][version] * NUM_ECC_BLOCKS[ECC_LEVELS[ecl]][version]
    );
}

/** Row/column centres of the alignment patterns for a version. */
function alignmentPatternPositions(version) {
    if (version === 1) return [];
    const numAlign = Math.floor(version / 7) + 2;
    const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const positions = [6];
    for (let pos = version * 4 + 17 - 7; positions.length < numAlign; pos -= step) {
        positions.splice(1, 0, pos);
    }
    return positions;
}

// --- Data encoding ---------------------------------------------------------

/** Encode text as byte-mode codewords, padded to the version's capacity. */
function encodeData(bytes, version, ecl) {
    const bits = [];
    const push = (value, length) => {
        for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    };

    push(0b0100, 4); // byte mode
    push(bytes.length, version <= 9 ? 8 : 16);
    for (const byte of bytes) push(byte, 8);

    const capacityBits = numDataCodewords(version, ecl) * 8;
    push(0, Math.min(4, capacityBits - bits.length)); // terminator
    while (bits.length % 8 !== 0) bits.push(0);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
        codewords.push(byte);
    }
    for (let pad = 0xec; codewords.length < capacityBits / 8; pad ^= 0xec ^ 0x11) {
        codewords.push(pad);
    }
    return codewords;
}

/** Split into blocks, add error correction, and interleave into the final stream. */
function addEccAndInterleave(data, version, ecl) {
    const numBlocks = NUM_ECC_BLOCKS[ECC_LEVELS[ecl]][version];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ECC_LEVELS[ecl]][version];
    const rawCodewords = Math.floor(numRawDataModules(version) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks = [];
    for (let i = 0, k = 0; i < numBlocks; i++) {
        const dataLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
        const dat = data.slice(k, k + dataLen);
        k += dataLen;
        blocks.push({ dat, ecc: rsEncode(dat, blockEccLen) });
    }

    const result = [];
    for (let i = 0; i < shortBlockLen - blockEccLen + 1; i++) {
        for (let j = 0; j < numBlocks; j++) {
            // The extra data codeword of the long blocks comes last.
            if (i < shortBlockLen - blockEccLen || j >= numShortBlocks) {
                result.push(blocks[j].dat[i]);
            }
        }
    }
    for (let i = 0; i < blockEccLen; i++) {
        for (let j = 0; j < numBlocks; j++) result.push(blocks[j].ecc[i]);
    }
    return result;
}

// --- Matrix construction ---------------------------------------------------

function createMatrix(version) {
    const size = version * 4 + 17;
    const modules = [];
    const reserved = [];
    for (let i = 0; i < size; i++) {
        modules.push(new Array(size).fill(false));
        reserved.push(new Array(size).fill(false));
    }
    return { size, modules, reserved };
}

function drawFunctionPatterns(m, version) {
    const { size, modules, reserved } = m;

    const setFunction = (x, y, dark) => {
        if (x < 0 || y < 0 || x >= size || y >= size) return;
        modules[y][x] = dark;
        reserved[y][x] = true;
    };

    // Timing patterns. Drawn first: the finder patterns and their separators
    // legitimately overwrite the ends of both timing lines.
    for (let i = 0; i < size; i++) {
        setFunction(6, i, i % 2 === 0);
        setFunction(i, 6, i % 2 === 0);
    }

    // Finder patterns plus their separators.
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                setFunction(cx + dx, cy + dy, dist !== 2 && dist !== 4);
            }
        }
    }

    // Alignment patterns, skipping the three finder corners.
    const positions = alignmentPatternPositions(version);
    for (let i = 0; i < positions.length; i++) {
        for (let j = 0; j < positions.length; j++) {
            const corner =
                (i === 0 && j === 0) ||
                (i === 0 && j === positions.length - 1) ||
                (i === positions.length - 1 && j === 0);
            if (corner) continue;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    setFunction(positions[j] + dx, positions[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
                }
            }
        }
    }

    // Reserve the format information areas (contents written later). Index 6
    // is skipped in both directions because it belongs to the timing patterns.
    for (let i = 0; i < 9; i++) {
        if (i === 6) continue;
        setFunction(i, 8, false);
        setFunction(8, i, false);
    }
    for (let i = 0; i < 8; i++) {
        setFunction(size - 1 - i, 8, false);
        setFunction(8, size - 1 - i, false);
    }
    setFunction(8, size - 8, true); // the always-dark module

    // Version information for version 7 and above.
    if (version >= 7) {
        let rem = version;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
        const bits = (version << 12) | rem;
        for (let i = 0; i < 18; i++) {
            const dark = ((bits >>> i) & 1) !== 0;
            const a = size - 11 + (i % 3);
            const b = Math.floor(i / 3);
            setFunction(a, b, dark);
            setFunction(b, a, dark);
        }
    }
}

function drawFormatBits(m, ecl, mask) {
    const { size, modules, reserved } = m;
    const data = (ECC_FORMAT_BITS[ecl] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    const set = (x, y, dark) => {
        modules[y][x] = dark;
        reserved[y][x] = true;
    };

    // Copy 1: around the top-left finder.
    for (let i = 0; i <= 5; i++) set(8, i, ((bits >>> i) & 1) !== 0);
    set(8, 7, ((bits >>> 6) & 1) !== 0);
    set(8, 8, ((bits >>> 7) & 1) !== 0);
    set(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) set(14 - i, 8, ((bits >>> i) & 1) !== 0);

    // Copy 2: split between the other two finders.
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, ((bits >>> i) & 1) !== 0);
    set(8, size - 8, true);
}

/** Lay the codeword stream out in the zigzag pattern, applying the mask. */
function drawCodewords(m, codewords, mask) {
    const { size, modules, reserved } = m;
    let bitIndex = 0;

    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5; // the vertical timing pattern is skipped
        for (let vert = 0; vert < size; vert++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const upward = ((right + 1) & 2) === 0;
                const y = upward ? size - 1 - vert : vert;
                if (reserved[y][x]) continue;
                let dark = false;
                if (bitIndex < codewords.length * 8) {
                    dark = ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0;
                    bitIndex++;
                }
                modules[y][x] = dark !== maskBit(mask, x, y);
            }
        }
    }
}

function maskBit(mask, x, y) {
    switch (mask) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
        case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
        case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
        default: throw new Error(`unknown mask ${mask}`);
    }
}

/** Score a masked matrix using the four penalty rules from the spec. */
function penaltyScore(m) {
    const { size, modules } = m;
    let score = 0;

    // Rules 1 and 3: runs of five or more, and finder-like 1:1:3:1:1 patterns.
    for (let i = 0; i < size; i++) {
        for (const horizontal of [true, false]) {
            const at = (j) => (horizontal ? modules[i][j] : modules[j][i]);
            const history = [0, 0, 0, 0, 0, 0, 0];
            let runColor = false;
            let runLength = 0;

            for (let j = 0; j < size; j++) {
                if (at(j) === runColor) {
                    runLength++;
                    if (runLength === 5) score += 3;
                    else if (runLength > 5) score += 1;
                } else {
                    addRunToHistory(runLength, history, size);
                    if (!runColor) score += countFinderLikePatterns(history) * 40;
                    runColor = at(j);
                    runLength = 1;
                }
            }

            // Terminate the final run, padding it with the surrounding quiet zone.
            if (runColor) {
                addRunToHistory(runLength, history, size);
                runLength = 0;
            }
            addRunToHistory(runLength + size, history, size);
            score += countFinderLikePatterns(history) * 40;
        }
    }

    // Rule 2: 2x2 blocks of the same colour.
    for (let y = 0; y < size - 1; y++) {
        for (let x = 0; x < size - 1; x++) {
            const c = modules[y][x];
            if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) {
                score += 3;
            }
        }
    }

    // Rule 4: deviation of the dark module ratio from 50%.
    let dark = 0;
    for (const row of modules) for (const cell of row) if (cell) dark++;
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    score += k * 10;

    return score;
}

/** Shift a run length into the history, padding the very first run with the quiet zone. */
function addRunToHistory(runLength, history, size) {
    if (history[0] === 0) runLength += size; // the run touches the light border
    history.pop();
    history.unshift(runLength);
}

/** Count 1:1:3:1:1 finder-like ratios that have a wide light run on one side. */
function countFinderLikePatterns(history) {
    const n = history[1];
    const core =
        n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
    return (
        (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) +
        (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0)
    );
}

// --- Public API ------------------------------------------------------------

/** Build the module matrix for `text` at the smallest fitting version. */
function makeQr(text, ecl = 'M') {
    const bytes = Array.from(Buffer.from(text, 'utf8'));

    let version = 0;
    for (let v = 1; v <= 40; v++) {
        const headerBits = 4 + (v <= 9 ? 8 : 16);
        if (headerBits + bytes.length * 8 <= numDataCodewords(v, ecl) * 8) {
            version = v;
            break;
        }
    }
    if (version === 0) throw new Error('text is too long to encode in a QR code');

    const codewords = addEccAndInterleave(encodeData(bytes, version, ecl), version, ecl);

    let best = null;
    for (let mask = 0; mask < 8; mask++) {
        const m = createMatrix(version);
        drawFunctionPatterns(m, version);
        drawFormatBits(m, ecl, mask);
        drawCodewords(m, codewords, mask);
        const score = penaltyScore(m);
        if (best === null || score < best.score) best = { score, matrix: m, mask };
    }

    return { size: best.matrix.size, modules: best.matrix.modules, version, mask: best.mask, ecl };
}

/** Surround the module grid with the mandatory light quiet zone. */
function withQuietZone(qr, quietZone) {
    const width = qr.size + quietZone * 2;
    const grid = [];
    for (let i = 0; i < quietZone; i++) grid.push(new Array(width).fill(false));
    for (const row of qr.modules) {
        grid.push([
            ...new Array(quietZone).fill(false),
            ...row,
            ...new Array(quietZone).fill(false),
        ]);
    }
    for (let i = 0; i < quietZone; i++) grid.push(new Array(width).fill(false));
    return grid;
}

/**
 * Render a matrix as text.
 *
 * "compact" (the default) packs two module rows into each line using half
 * blocks, so a module is one character wide and half a line tall — roughly
 * square, and narrow enough to avoid wrapping in an 80-column terminal.
 * Wrapping would make the code unscannable, so the wider "big" style is
 * opt-in.
 */
function renderQr(qr, { invert = false, quietZone = 4, style = 'compact' } = {}) {
    const grid = withQuietZone(qr, quietZone);
    const isDark = (y, x) => (y < grid.length ? grid[y][x] : false) !== invert;

    if (style === 'big') {
        return grid
            .map((row, y) => row.map((_, x) => (isDark(y, x) ? '██' : '  ')).join(''))
            .join('\n');
    }

    const lines = [];
    for (let y = 0; y < grid.length; y += 2) {
        let line = '';
        for (let x = 0; x < grid[y].length; x++) {
            const top = isDark(y, x);
            const bottom = isDark(y + 1, x);
            if (top && bottom) line += '█';
            else if (top) line += '▀';
            else if (bottom) line += '▄';
            else line += ' ';
        }
        lines.push(line);
    }
    return lines.join('\n');
}

// --- CLI -------------------------------------------------------------------

/** First non-internal IPv4 address, so a phone on the same Wi-Fi can connect. */
function lanAddress() {
    for (const addresses of Object.values(os.networkInterfaces())) {
        for (const address of addresses || []) {
            if (address.family === 'IPv4' && !address.internal) return address.address;
        }
    }
    return null;
}

function main(argv) {
    const args = argv.slice(2);
    let invert = false;
    let local = false;
    let style = 'compact';
    let ecl = 'M';
    const rest = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--invert') invert = true;
        else if (arg === '--local') local = true;
        else if (arg === '--big') style = 'big';
        else if (arg === '--ecc') ecl = (args[++i] || 'M').toUpperCase();
        else if (arg === '--help' || arg === '-h') {
            console.log(
                'Usage: node .claude/scripts/qr.js [--local [port]] [--big] [--invert] [--ecc L|M|Q|H] [text]'
            );
            return 0;
        } else rest.push(arg);
    }

    if (!ECC_LEVELS.hasOwnProperty(ecl)) {
        console.error(`Unknown ECC level "${ecl}" (expected L, M, Q or H)`);
        return 1;
    }

    let target;
    let label;
    if (local) {
        const port = rest[0] && /^\d+$/.test(rest[0]) ? rest[0] : '8000';
        const host = lanAddress();
        if (!host) {
            console.error('No non-loopback IPv4 address found — cannot build a LAN URL.');
            console.error('Start a server and pass the URL explicitly instead.');
            return 1;
        }
        target = `http://${host}:${port}/`;
        label = `Local server (serve this directory on port ${port} first)`;
    } else if (rest.length > 0) {
        target = rest.join(' ');
        label = 'Custom target';
    } else {
        target = LIVE_URL;
        label = 'Bible Clash';
    }

    const qr = makeQr(target, ecl);
    console.log(renderQr(qr, { invert, style }));
    console.log(`${label}: ${target}`);
    console.log(`QR version ${qr.version}, ECC level ${qr.ecl}, mask ${qr.mask}`);
    return 0;
}

if (require.main === module) {
    try {
        process.exit(main(process.argv));
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { makeQr, renderQr, penaltyScore, LIVE_URL };

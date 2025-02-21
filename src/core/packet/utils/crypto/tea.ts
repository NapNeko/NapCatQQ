// love from https://github.com/LagrangeDev/lagrangejs/blob/main/src/core/tea.ts & https://github.com/takayama-lily/oicq/blob/main/lib/core/tea.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 
const BUF7 = Buffer.alloc(7);
const deltas = [
    0x9e3779b9, 0x3c6ef372, 0xdaa66d2b, 0x78dde6e4, 0x1715609d, 0xb54cda56, 0x5384540f, 0xf1bbcdc8, 0x8ff34781,
    0x2e2ac13a, 0xcc623af3, 0x6a99b4ac, 0x08d12e65, 0xa708a81e, 0x454021d7, 0xe3779b90,
];

function _toUInt32(num: number) {
    return num >>> 0;
}

function _encrypt(x: number, y: number, k0: number, k1: number, k2: number, k3: number): [number, number]  {
    for (let i = 0; i < 16; ++i) {
        let aa = ((_toUInt32(((y << 4) >>> 0) + k0) ^ _toUInt32(y + deltas[i])) >>> 0) ^ _toUInt32(~~(y / 32) + k1);
        aa >>>= 0;
        x = _toUInt32(x + aa);
        let bb = ((_toUInt32(((x << 4) >>> 0) + k2) ^ _toUInt32(x + deltas[i])) >>> 0) ^ _toUInt32(~~(x / 32) + k3);
        bb >>>= 0;
        y = _toUInt32(y + bb);
    }
    return [x, y];
}

export function encrypt(data: Buffer, key: Buffer) {
    let n = (6 - data.length) >>> 0;
    n = (n % 8) + 2;
    const v = Buffer.concat([Buffer.from([(n - 2) | 0xf8]), Buffer.allocUnsafe(n), data, BUF7]);
    const k0 = key.readUInt32BE(0);
    const k1 = key.readUInt32BE(4);
    const k2 = key.readUInt32BE(8);
    const k3 = key.readUInt32BE(12);
    let r1 = 0, r2 = 0, t1 = 0, t2 = 0;
    for (let i = 0; i < v.length; i += 8) {
        const a1 = v.readUInt32BE(i);
        const a2 = v.readUInt32BE(i + 4);
        const b1 = a1 ^ r1;
        const b2 = a2 ^ r2;
        const [x, y] = _encrypt(b1 >>> 0, b2 >>> 0, k0, k1, k2, k3);
        r1 = x ^ t1;
        r2 = y ^ t2;
        t1 = b1;
        t2 = b2;
        v.writeInt32BE(r1, i);
        v.writeInt32BE(r2, i + 4);
    }
    return v;
}

function _decrypt(x: number, y: number, k0: number, k1: number, k2: number, k3: number) {
    for (let i = 15; i >= 0; --i) {
        const aa = ((_toUInt32(((x << 4) >>> 0) + k2) ^ _toUInt32(x + deltas[i])) >>> 0) ^ _toUInt32(~~(x / 32) + k3);
        y = (y - aa) >>> 0;
        const bb = ((_toUInt32(((y << 4) >>> 0) + k0) ^ _toUInt32(y + deltas[i])) >>> 0) ^ _toUInt32(~~(y / 32) + k1);
        x = (x - bb) >>> 0;
    }
    return [x, y];
}

export function decrypt(encrypted: Buffer, key: Buffer) {
    if (encrypted.length % 8) throw ERROR_ENCRYPTED_LENGTH;
    const k0 = key.readUInt32BE(0);
    const k1 = key.readUInt32BE(4);
    const k2 = key.readUInt32BE(8);
    const k3 = key.readUInt32BE(12);
    let r1 = 0, r2 = 0, t1 = 0, t2 = 0, x = 0, y = 0;
    for (let i = 0; i < encrypted.length; i += 8) {
        const a1 = encrypted.readUInt32BE(i);
        const a2 = encrypted.readUInt32BE(i + 4);
        const b1 = a1 ^ x;
        const b2 = a2 ^ y;
        [x, y] = _decrypt(b1 >>> 0, b2 >>> 0, k0, k1, k2, k3);
        r1 = x ^ t1;
        r2 = y ^ t2;
        t1 = a1;
        t2 = a2;
        encrypted.writeInt32BE(r1, i);
        encrypted.writeInt32BE(r2, i + 4);
    }
    if (Buffer.compare(encrypted.subarray(encrypted.length - 7), BUF7) !== 0) throw ERROR_ENCRYPTED_ILLEGAL;
    // if (Buffer.compare(encrypted.slice(encrypted.length - 7), BUF7) !== 0) throw ERROR_ENCRYPTED_ILLEGAL;
    return encrypted.subarray((encrypted[0] & 0x07) + 3, encrypted.length - 7);
    // return encrypted.slice((encrypted[0] & 0x07) + 3, encrypted.length - 7);
}

const ERROR_ENCRYPTED_LENGTH = new Error('length of encrypted data must be a multiple of 8');
const ERROR_ENCRYPTED_ILLEGAL = new Error('encrypted data is illegal');

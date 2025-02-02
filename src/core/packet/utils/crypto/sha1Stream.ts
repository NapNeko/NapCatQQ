// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 
export class Sha1Stream {
    readonly Sha1BlockSize = 64;
    readonly Sha1DigestSize = 20;
    private readonly _padding = Buffer.concat([Buffer.from([0x80]), Buffer.alloc(63)]);
    private readonly _state = new Uint32Array(5);
    private readonly _count = new Uint32Array(2);
    private readonly _buffer = Buffer.allocUnsafe(this.Sha1BlockSize);
    private readonly _w = new Uint32Array(80);

    constructor() {
        this.reset();
    }

    private reset(): void {
        this._state[0] = 0x67452301;
        this._state[1] = 0xEFCDAB89;
        this._state[2] = 0x98BADCFE;
        this._state[3] = 0x10325476;
        this._state[4] = 0xC3D2E1F0;
        this._count[0] = 0;
        this._count[1] = 0;
        this._buffer.fill(0);
    }

    private rotateLeft(v: number, o: number): number {
        return ((v << o) | (v >>> (32 - o))) >>> 0;
    }

    private transform(chunk: Buffer, offset: number): void {
        const w = this._w;
        const view = new DataView(chunk.buffer, chunk.byteOffset + offset, 64);

        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(i * 4, false);
        }

        for (let i = 16; i < 80; i++) {
            w[i] = this.rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1) >>> 0;
        }

        let a = this._state[0];
        let b = this._state[1];
        let c = this._state[2];
        let d = this._state[3];
        let e = this._state[4];

        for (let i = 0; i < 80; i++) {
            let temp;
            if (i < 20) {
                temp = ((b & c) | (~b & d)) + 0x5A827999;
            } else if (i < 40) {
                temp = (b ^ c ^ d) + 0x6ED9EBA1;
            } else if (i < 60) {
                temp = ((b & c) | (b & d) | (c & d)) + 0x8F1BBCDC;
            } else {
                temp = (b ^ c ^ d) + 0xCA62C1D6;
            }
            temp += ((this.rotateLeft(a, 5) + e + w[i]) >>> 0);
            e = d;
            d = c;
            c = this.rotateLeft(b, 30) >>> 0;
            b = a;
            a = temp;
        }

        this._state[0] = (this._state[0] + a) >>> 0;
        this._state[1] = (this._state[1] + b) >>> 0;
        this._state[2] = (this._state[2] + c) >>> 0;
        this._state[3] = (this._state[3] + d) >>> 0;
        this._state[4] = (this._state[4] + e) >>> 0;
    }

    public update(data: Buffer, len?: number): void {
        let index = ((this._count[0] >>> 3) & 0x3F) >>> 0;
        const dataLen = len ?? data.length;
        this._count[0] = (this._count[0] + (dataLen << 3)) >>> 0;

        if (this._count[0] < (dataLen << 3)) this._count[1] = (this._count[1] + 1) >>> 0;

        this._count[1] = (this._count[1] + (dataLen >>> 29)) >>> 0;

        const partLen = (this.Sha1BlockSize - index) >>> 0;
        let i = 0;

        if (dataLen >= partLen) {
            data.copy(this._buffer, index, 0, partLen);
            this.transform(this._buffer, 0);
            for (i = partLen; (i + this.Sha1BlockSize) <= dataLen; i = (i + this.Sha1BlockSize) >>> 0) {
                this.transform(data, i);
            }
            index = 0;
        }

        data.copy(this._buffer, index, i, dataLen);
    }

    public hash(bigEndian: boolean = true): Buffer {
        const digest = Buffer.allocUnsafe(this.Sha1DigestSize);
        if (bigEndian) {
            for (let i = 0; i < 5; i++) digest.writeUInt32BE(this._state[i], i * 4);
        } else {
            for (let i = 0; i < 5; i++) digest.writeUInt32LE(this._state[i], i * 4);
        }
        return digest;
    }

    public final(): Buffer {
        const digest = Buffer.allocUnsafe(this.Sha1DigestSize);
        const bits = Buffer.allocUnsafe(8);
        bits.writeUInt32BE(this._count[1], 0);
        bits.writeUInt32BE(this._count[0], 4);

        const index = ((this._count[0] >>> 3) & 0x3F) >>> 0;
        const padLen = ((index < 56) ? (56 - index) : (120 - index)) >>> 0;
        this.update(this._padding, padLen);
        this.update(bits);

        for (let i = 0; i < 5; i++) {
            digest.writeUInt32BE(this._state[i], i * 4);
        }

        return digest;
    }
}

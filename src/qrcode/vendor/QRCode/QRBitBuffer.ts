class QRBitBuffer {
    buffer: number[];
    length: number;

    constructor() {
        this.buffer = [];
        this.length = 0;
    }

    get(index: number): boolean {
        const bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex]! >>> (7 - index % 8)) & 1) === 1;
    }

    put(num: number, length: number): void {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
    }

    getLengthInBits(): number {
        return this.length;
    }

    putBit(bit: boolean): void {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }

        if (bit) {
            this.buffer[bufIndex]! |= (0x80 >>> (this.length % 8));
        }

        this.length++;
    }
}

export default QRBitBuffer;
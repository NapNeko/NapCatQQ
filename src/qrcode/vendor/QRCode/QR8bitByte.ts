import { MODE_8BIT_BYTE } from './QRMode';

class QR8bitByte {
    mode: number;
    data: string;

    constructor(data: string) {
        this.mode = MODE_8BIT_BYTE;
        this.data = data;
    }

    getLength(): number {
        return this.data.length;
    }

    write(buffer: { put: (arg0: number, arg1: number) => void }): void {
        for (let i = 0; i < this.data.length; i++) {
            // not JIS ...
            buffer.put(this.data.charCodeAt(i), 8);
        }
    }
}

export default QR8bitByte;
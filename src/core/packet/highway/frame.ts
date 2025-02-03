import assert from 'node:assert';

export class Frame{
    static pack(head: Buffer, body: Buffer): Buffer {
        const totalLength = 9 + head.length + body.length + 1;
        const buffer = Buffer.allocUnsafe(totalLength);
        buffer[0] = 0x28;
        buffer.writeUInt32BE(head.length, 1);
        buffer.writeUInt32BE(body.length, 5);
        head.copy(buffer, 9);
        body.copy(buffer, 9 + head.length);
        buffer[totalLength - 1] = 0x29;
        return buffer;
    }

    static unpack(frame: Buffer): [Buffer, Buffer] {
        assert(frame[0] === 0x28 && frame[frame.length - 1] === 0x29, 'Invalid frame!');
        const headLen = frame.readUInt32BE(1);
        const bodyLen = frame.readUInt32BE(5);
        // assert(frame.length === 9 + headLen + bodyLen + 1, `Frame ${frame.toString('hex')} length does not match head and body lengths!`);
        return [frame.subarray(9, 9 + headLen), frame.subarray(9 + headLen, 9 + headLen + bodyLen)];
    }
}

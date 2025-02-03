import * as stream from 'node:stream';
import { Sha1Stream } from '@/core/packet/utils/crypto/sha1Stream';

export class CalculateStreamBytesTransform extends stream.Transform {
    private readonly blockSize = 1024 * 1024;
    private readonly sha1: Sha1Stream;
    private buffer: Buffer;
    private bytesRead: number;
    private readonly byteArrayList: Buffer[];

    constructor() {
        super();
        this.sha1 = new Sha1Stream();
        this.buffer = Buffer.alloc(0);
        this.bytesRead = 0;
        this.byteArrayList = [];
    }

    // eslint-disable-next-line no-undef
    override _transform(chunk: Buffer, _: BufferEncoding, callback: stream.TransformCallback): void {
        try {
            this.buffer = Buffer.concat([this.buffer, chunk]);
            let offset = 0;
            while (this.buffer.length - offset >= this.sha1.Sha1BlockSize) {
                const block = this.buffer.subarray(offset, offset + this.sha1.Sha1BlockSize);
                this.sha1.update(block);
                offset += this.sha1.Sha1BlockSize;
                this.bytesRead += this.sha1.Sha1BlockSize;
                if (this.bytesRead % this.blockSize === 0) {
                    const digest = this.sha1.hash(false);
                    this.byteArrayList.push(Buffer.from(digest));
                }
            }
            this.buffer = this.buffer.subarray(offset);
            callback(null);
        } catch (err) {
            callback(err as Error);
        }
    }

    override _flush(callback: stream.TransformCallback): void {
        try {
            if (this.buffer.length > 0) this.sha1.update(this.buffer);
            const finalDigest = this.sha1.final();
            this.byteArrayList.push(Buffer.from(finalDigest));
            for (const digest of this.byteArrayList) {
                this.push(digest);
            }
            callback(null);
        } catch (err) {
            callback(err as Error);
        }
    }
}

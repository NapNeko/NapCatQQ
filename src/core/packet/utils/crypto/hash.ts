// love from https://github.com/LagrangeDev/lagrangejs & https://github.com/takayama-lily/oicq
import * as crypto from 'crypto';
import * as stream from 'stream';
import * as fs from 'fs';

function sha1Stream(readable: stream.Readable) {
    return new Promise((resolve, reject) => {
        readable.on('error', reject);
        readable.pipe(crypto.createHash('sha1').on('error', reject).on('data', resolve));
    }) as Promise<Buffer>;
}

export function calculateSha1(filePath: string): Promise<Buffer> {
    const readable = fs.createReadStream(filePath);
    return sha1Stream(readable);
}

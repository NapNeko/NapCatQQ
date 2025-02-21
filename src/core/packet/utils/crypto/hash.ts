// love from https://github.com/LagrangeDev/lagrangejs & https://github.com/takayama-lily/oicq
import * as crypto from 'crypto';
import * as stream from 'stream';
import * as fs from 'fs';
import { CalculateStreamBytesTransform } from '@/core/packet/utils/crypto/sha1StreamBytesTransform';

function sha1Stream(readable: stream.Readable) {
    return new Promise<Buffer>((resolve, reject) => {
        readable.on('error', reject);
        readable.pipe(crypto.createHash('sha1').on('error', reject).on('data', resolve));
    });
}

function md5Stream(readable: stream.Readable) {
    return new Promise<Buffer>((resolve, reject) => {
        readable.on('error', reject);
        readable.pipe(crypto.createHash('md5').on('error', reject).on('data', resolve));
    });
}

export function calculateSha1(filePath: string): Promise<Buffer> {
    const readable = fs.createReadStream(filePath);
    return sha1Stream(readable);
}

export function computeMd5AndLengthWithLimit(filePath: string, limit?: number): Promise<Buffer> {
    const readStream = fs.createReadStream(filePath, limit ? { start: 0, end: limit - 1 } : {});
    return md5Stream(readStream);
}

export function calculateSha1StreamBytes(filePath: string): Promise<Buffer[]> {
    return new Promise((resolve, reject) => {
        const readable = fs.createReadStream(filePath);
        const calculateStreamBytes = new CalculateStreamBytesTransform();
        const byteArrayList: Buffer[] = [];
        calculateStreamBytes.on('data', (chunk: Buffer) => {
            byteArrayList.push(chunk);
        });
        calculateStreamBytes.on('end', () => {
            resolve(byteArrayList);
        });
        calculateStreamBytes.on('error', (err: Error) => {
            reject(err);
        });
        readable.pipe(calculateStreamBytes);
    });
}

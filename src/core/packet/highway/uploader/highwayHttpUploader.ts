import crypto from 'node:crypto';
import http from 'node:http';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { IHighwayUploader } from '@/core/packet/highway/uploader/highwayUploader';
import { Frame } from '@/core/packet/highway/frame';
import * as proto from '@/core/packet/transformer/proto';

export class HighwayHttpUploader extends IHighwayUploader {
    async upload(): Promise<void> {
        const controller = new AbortController();
        const { signal } = controller;
        const upload = (async () => {
            let offset = 0;
            for await (const chunk of this.trans.data) {
                if (signal.aborted) {
                    throw new Error('Upload aborted due to timeout');
                }
                const block = chunk as Buffer;
                try {
                    await this.uploadBlock(block, offset);
                } catch (err) {
                    throw new Error(`[Highway] httpUpload Error uploading block at offset ${offset}: ${err}`);
                }
                offset += block.length;
            }
        })();
        const timeout = this.timeout().catch((err) => {
            controller.abort();
            throw new Error(err.message);
        });
        await Promise.race([upload, timeout]);
    }

    private async uploadBlock(block: Buffer, offset: number): Promise<void> {
        const chunkMD5 = crypto.createHash('md5').update(block).digest();
        const payload = this.buildPicUpHead(offset, block.length, chunkMD5);
        const frame = Frame.pack(Buffer.from(payload), block);
        const resp = await this.httpPostHighwayContent(frame, `http://${this.trans.server}:${this.trans.port}/cgi-bin/httpconn?htcmd=0x6FF0087&uin=${this.trans.uin}`);
        const [head, body] = Frame.unpack(resp);
        const headData = new NapProtoMsg(proto.RespDataHighwayHead).decode(head);
        this.logger.debug(`[Highway] httpUploadBlock: ${headData.errorCode} | ${headData.msgSegHead?.retCode} | ${headData.bytesRspExtendInfo} | ${head.toString('hex')} | ${body.toString('hex')}`);
        if (headData.errorCode !== 0) throw new Error(`[Highway] httpUploadBlock failed (code=${headData.errorCode})`);
    }

    private async httpPostHighwayContent(frame: Buffer, serverURL: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const options: http.RequestOptions = {
                    method: 'POST',
                    headers: {
                        'Connection': 'keep-alive',
                        'Accept-Encoding': 'identity',
                        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)',
                        'Content-Length': frame.length.toString(),
                    },
                };
                const req = http.request(serverURL, options, (res) => {
                    const data: Buffer[] = [];
                    res.on('data', (chunk) => {
                        data.push(chunk);
                    });
                    res.on('end', () => {
                        resolve(Buffer.concat(data));
                    });
                });
                req.write(frame);
                req.on('error', (error: Error) => {
                    reject(error);
                });
            } catch (error: unknown) {
                reject(new Error((error as Error).message));
            }
        });
    }
}

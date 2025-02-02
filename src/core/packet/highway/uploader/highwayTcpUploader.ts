import net from 'node:net';
import stream from 'node:stream';
import crypto from 'node:crypto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { BlockSize } from '@/core/packet/highway/highwayContext';
import { Frame } from '@/core/packet/highway/frame';
import { IHighwayUploader } from '@/core/packet/highway/uploader/highwayUploader';
import * as proto from '@/core/packet/transformer/proto';

class HighwayTcpUploaderTransform extends stream.Transform {
    uploader: HighwayTcpUploader;
    offset: number;

    constructor(uploader: HighwayTcpUploader) {
        super();
        this.uploader = uploader;
        this.offset = 0;
    }

    // eslint-disable-next-line no-undef
    override _transform(data: Buffer, _: BufferEncoding, callback: stream.TransformCallback) {
        let chunkOffset = 0;
        while (chunkOffset < data.length) {
            const chunkSize = Math.min(BlockSize, data.length - chunkOffset);
            const chunk = data.subarray(chunkOffset, chunkOffset + chunkSize);
            const chunkMd5 = crypto.createHash('md5').update(chunk).digest();
            const head = this.uploader.buildPicUpHead(this.offset, chunk.length, chunkMd5);
            chunkOffset += chunk.length;
            this.offset += chunk.length;
            this.push(Frame.pack(Buffer.from(head), chunk));
        }
        callback(null);
    }
}

export class HighwayTcpUploader extends IHighwayUploader {
    async upload(): Promise<void> {
        const controller = new AbortController();
        const { signal } = controller;
        const upload = new Promise<void>((resolve, reject) => {
            const highwayTransForm = new HighwayTcpUploaderTransform(this);
            const socket = net.connect(this.trans.port, this.trans.server, () => {
                this.trans.data.pipe(highwayTransForm).pipe(socket, { end: false });
            });
            const handleRspHeader = (header: Buffer) => {
                const rsp = new NapProtoMsg(proto.RespDataHighwayHead).decode(header);
                if (rsp.errorCode !== 0) {
                    socket.end();
                    reject(new Error(`[Highway] tcpUpload failed (code=${rsp.errorCode})`));
                }
                const percent = ((Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength)) / Number(rsp.msgSegHead?.filesize)).toFixed(2);
                this.logger.debug(`[Highway] tcpUpload ${rsp.errorCode} | ${percent} | ${Buffer.from(header).toString('hex')}`);
                if (Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength) >= Number(rsp.msgSegHead?.filesize)) {
                    this.logger.debug('[Highway] tcpUpload finished.');
                    socket.end();
                    resolve();
                }
            };
            socket.on('data', (chunk: Buffer) => {
                if (signal.aborted) {
                    socket.end();
                    reject(new Error('Upload aborted due to timeout'));
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [head, _] = Frame.unpack(chunk);
                handleRspHeader(head);
            });
            socket.on('close', () => {
                this.logger.debug('[Highway] tcpUpload socket closed.');
                resolve();
            });
            socket.on('error', (err) => {
                socket.end();
                reject(new Error(`[Highway] tcpUpload socket.on error: ${err}`));
            });
            this.trans.data.on('error', (err) => {
                socket.end();
                reject(new Error(`[Highway] tcpUpload readable error: ${err}`));
            });
        });
        const timeout = this.timeout().catch((err) => {
            controller.abort();
            throw new Error(err.message);
        });
        await Promise.race([upload, timeout]);
    }
}

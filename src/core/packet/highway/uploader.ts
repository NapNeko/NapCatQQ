import * as net from "node:net";
import * as crypto from "node:crypto";
import * as http from "node:http";
import * as stream from "node:stream";
import { LogWrapper } from "@/common/log";
import * as tea from "@/core/packet/utils/crypto/tea";
import { NapProtoMsg } from "@/core/packet/proto/NapProto";
import { ReqDataHighwayHead, RespDataHighwayHead } from "@/core/packet/proto/highway/highway";
import { BlockSize } from "@/core/packet/highway/session";
import { PacketHighwayTrans } from "@/core/packet/highway/client";
import { Frame } from "@/core/packet/highway/frame";

abstract class HighwayUploader {
    readonly trans: PacketHighwayTrans;
    readonly logger: LogWrapper;

    constructor(trans: PacketHighwayTrans, logger: LogWrapper) {
        this.trans = trans;
        this.logger = logger;
    }

    private encryptTransExt(key: Uint8Array) {
        if (!this.trans.encrypt) return;
        this.trans.ext = tea.encrypt(Buffer.from(this.trans.ext), Buffer.from(key));
    }

    protected timeout(): Promise<void> {
        return new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`[Highway] timeout after ${this.trans.timeout}s`));
            }, (this.trans.timeout ?? Infinity) * 1000
            );
        })
    }

    buildPicUpHead(offset: number, bodyLength: number, bodyMd5: Uint8Array): Uint8Array {
        return new NapProtoMsg(ReqDataHighwayHead).encode({
            msgBaseHead: {
                version: 1,
                uin: this.trans.uin,
                command: "PicUp.DataUp",
                seq: 0,
                retryTimes: 0,
                appId: 1600001604,
                dataFlag: 16,
                commandId: this.trans.cmd,
            },
            msgSegHead: {
                serviceId: 0,
                filesize: BigInt(this.trans.size),
                dataOffset: BigInt(offset),
                dataLength: bodyLength,
                serviceTicket: this.trans.ticket,
                md5: bodyMd5,
                fileMd5: this.trans.sum,
                cacheAddr: 0,
                cachePort: 0,
            },
            bytesReqExtendInfo: this.trans.ext,
            timestamp: BigInt(0),
            msgLoginSigHead: {
                uint32LoginSigType: 8,
                appId: 1600001604,
            }
        });
    }

    abstract upload(): Promise<void>;
}

class HighwayTcpUploaderTransform extends stream.Transform {
    uploader: HighwayTcpUploader;
    offset: number;

    constructor(uploader: HighwayTcpUploader) {
        super();
        this.uploader = uploader;
        this.offset = 0;
    }

    _transform(data: Buffer, _: BufferEncoding, callback: stream.TransformCallback) {
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

export class HighwayTcpUploader extends HighwayUploader {
    async upload(): Promise<void> {
        const controller = new AbortController();
        const { signal } = controller;
        const upload = new Promise<void>((resolve, reject) => {
            const highwayTransForm = new HighwayTcpUploaderTransform(this);
            const socket = net.connect(this.trans.port, this.trans.server, () => {
                this.trans.data.pipe(highwayTransForm).pipe(socket, {end: false});
            });
            const handleRspHeader = (header: Buffer) => {
                const rsp = new NapProtoMsg(RespDataHighwayHead).decode(header);
                if (rsp.errorCode !== 0) {
                    socket.end();
                    reject(new Error(`[Highway] tcpUpload failed (code=${rsp.errorCode})`));
                }
                const percent = ((Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength)) / Number(rsp.msgSegHead?.filesize)).toFixed(2);
                this.logger.logDebug(`[Highway] tcpUpload ${rsp.errorCode} | ${percent} | ${Buffer.from(header).toString('hex')}`);
                if (Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength) >= Number(rsp.msgSegHead?.filesize)) {
                    this.logger.logDebug('[Highway] tcpUpload finished.');
                    socket.end();
                    resolve();
                }
            };
            socket.on('data', (chunk: Buffer) => {
                if (signal.aborted) {
                    socket.end();
                    reject(new Error('Upload aborted due to timeout'));
                }
                const [head, _] = Frame.unpack(chunk);
                handleRspHeader(head);
            });
            socket.on('close', () => {
                this.logger.logDebug('[Highway] tcpUpload socket closed.');
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

export class HighwayHttpUploader extends HighwayUploader {
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
                    throw new Error(`[Highway] httpUpload Error uploading block at offset ${offset}: ${err}`)
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
        const headData = new NapProtoMsg(RespDataHighwayHead).decode(head);
        this.logger.logDebug(`[Highway] httpUploadBlock: ${headData.errorCode} | ${headData.msgSegHead?.retCode} | ${headData.bytesRspExtendInfo} | ${head.toString('hex')} | ${body.toString('hex')}`);
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
                req.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

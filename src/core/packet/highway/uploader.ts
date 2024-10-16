import * as net from "node:net";
import * as crypto from "node:crypto";
import * as http from "node:http";
import * as stream from "node:stream";
import {LogWrapper} from "@/common/log";
import * as tea from "@/core/packet/utils/crypto/tea";
import {NapProtoMsg} from "@/core/packet/proto/NapProto";
import {ReqDataHighwayHead, RespDataHighwayHead} from "@/core/packet/proto/highway/highway";
import {BlockSize} from "@/core/packet/highway/session";
import {PacketHighwayTrans} from "@/core/packet/highway/client";
import {Frame} from "@/core/packet/highway/frame";

abstract class HighwayUploader {
    readonly trans: PacketHighwayTrans;
    readonly logger: LogWrapper;

    constructor(trans: PacketHighwayTrans, logger: LogWrapper) {
        this.trans = trans;
        this.logger = logger;
    }

    encryptTransExt(key: Uint8Array) {
        if (!this.trans.encrypt) return;
        this.trans.ext = tea.encrypt(Buffer.from(this.trans.ext), Buffer.from(key));
    }

    buildHead(offset: number, bodyLength: number, bodyMd5: Uint8Array): Uint8Array {
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
        })
    }

    abstract upload(): Promise<void>;
}

class HighwayTcpUploaderTransform extends stream.Transform {
    uploader: HighwayTcpUploader

    constructor(uploader: HighwayTcpUploader) {
        super();
        this.uploader = uploader;
    }

    _transform(data: Buffer, _: BufferEncoding, callback: stream.TransformCallback) {
        let offset = 0;
        this.uploader.logger.log(`[Highway] CALLED!!! _transform data.length = ${data.length}`);
        while (offset < data.length) {
            this.uploader.logger.log(`[Highway] _transform offset = ${offset}, data.length = ${data.length}`);
            const chunkSize = data.length > BlockSize ? BlockSize : data.length;
            this.uploader.logger.log(`[Highway] _transform calced chunkSize = ${chunkSize}`);
            const chunk = data.subarray(offset, offset + chunkSize);
            const chunkMd5 = crypto.createHash('md5').update(chunk).digest();
            const head = this.uploader.buildHead(offset, chunk.length, chunkMd5);
            this.uploader.logger.log(`[Highway] _transform: ${offset} | ${data.length} | ${chunkMd5.toString('hex')}`);
            offset += chunk.length;
            this.push(Frame.pack(Buffer.from(head), chunk));
        }
        callback(null);
    }
}

export class HighwayTcpUploader extends HighwayUploader {
    async upload(): Promise<void> {
        const highwayTransForm = new HighwayTcpUploaderTransform(this);
        const upload = new Promise<void>((resolve, reject) => {
            const socket = net.connect(this.trans.port, this.trans.ip, () => {
                this.trans.data.pipe(highwayTransForm).pipe(socket, {end: false});
            })
            const handleRspHeader = (header: Buffer) => {
                const rsp = new NapProtoMsg(RespDataHighwayHead).decode(header);
                if (rsp.errorCode !== 0) {
                    this.logger.logWarn(`highway upload failed (code: ${rsp.errorCode})`);
                }
                const percent = ((Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength)) / Number(rsp.msgSegHead?.filesize)).toFixed(2);
                this.logger.log(`[Highway] ${rsp.errorCode} | ${percent} | ${Buffer.from(header).toString('hex')}`);
                if (Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength) >= Number(rsp.msgSegHead?.filesize)) {
                    this.logger.log('[Highway] tcpUpload finished.');
                    socket.end();
                    resolve();
                }
            };
            socket.on('data', (chunk: Buffer) => {
                try {
                    const [head, _] = Frame.unpack(chunk);
                    handleRspHeader(head);
                } catch (e) {
                    this.logger.logError(`[Highway] upload parse response error: ${e}`);
                }
            })
            socket.on('close', () => {
                this.logger.log('[Highway] socket closed.');
                resolve();
            })
            socket.on('error', (err) => {
                this.logger.logError('[Highway] socket.on tcpUpload error:', err);
            })
            this.trans.data.on('error', (err) => {
                this.logger.logError('[Highway] readable tcpUpload error:', err);
                socket.end();
            })
        })
        const timeout = new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`[Highway] Upload timeout after ${this.trans.timeout}s`))
            }, (this.trans.timeout ?? Infinity) * 1000
            )
        })
        await Promise.race([upload, timeout]);
    }
}

export class HighwayHttpUploader extends HighwayUploader {
    async upload(): Promise<void> {
        let offset = 0;
        this.logger.logDebug(`[Highway] httpUpload trans=${JSON.stringify(this.trans)}`);
        for await (const chunk of this.trans.data) {
            let block = chunk as Buffer;
            this.logger.logDebug(`[Highway] httpUpload chunk!!! buffer.length = ${block.length}`);
            try {
                await this.uploadBlock(block, offset);
            } catch (err) {
                this.logger.logError(`Error uploading block at offset ${offset}: ${err}`);
                throw err;
            }
            offset += block.length;
        }
    }

    private async uploadBlock(block: Buffer, offset: number): Promise<void> {
        const isEnd = offset + block.length === this.trans.size;
        const chunkMD5 = crypto.createHash('md5').update(block).digest();
        const payload = this.buildHead(offset, block.length, chunkMD5);
        // this.logger.log(`[Highway] httpUploadBlock: payload = ${Buffer.from(payload).toString('hex')}`);
        const frame = Frame.pack(Buffer.from(payload), block)
        this.logger.log(`[Highway] httpUploadBlock: ${offset} | ${block.length} | ${Buffer.from(chunkMD5).toString('hex')}`);
        const resp = await this.httpPostHighwayContent(frame, `http://${this.trans.ip}:${this.trans.port}/cgi-bin/httpconn?htcmd=0x6FF0087&uin=${this.trans.uin}`, isEnd);
        const [head, body] = Frame.unpack(resp);
        const headData = new NapProtoMsg(RespDataHighwayHead).decode(head);
        this.logger.log(`[Highway] httpUploadBlock: ${headData.errorCode} | ${headData.msgSegHead?.retCode} | ${headData.bytesRspExtendInfo} | ${head.toString('hex')} | ${body.toString('hex')}`);
        if (headData.errorCode !== 0) {
            this.logger.logError(`[Highway] httpUploadBlock failed (code=${headData.errorCode})`);
        }
    }

    private async httpPostHighwayContent(frame: Buffer, serverURL: string, end: boolean): Promise<Buffer> {
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
                    let data = Buffer.alloc(0);
                    res.on('data', (chunk) => {
                        data = Buffer.concat([data, chunk]);
                    });
                    res.on('end', () => {
                        // console.log(`[Highway] postHighwayContent: ${data.toString('hex')}`);
                        resolve(data);
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

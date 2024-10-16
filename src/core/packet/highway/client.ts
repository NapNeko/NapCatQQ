import * as net from "node:net";
import * as stream from 'node:stream';
import * as crypto from 'node:crypto';
import * as tea from '@/core/packet/utils/crypto/tea';
import {BlockSize, PacketHighwaySig} from "@/core/packet/highway/session";
import {NapProtoMsg} from "@/core/packet/proto/NapProto";
import {ReqDataHighwayHead, RespDataHighwayHead} from "@/core/packet/proto/highway/highway";
import {LogWrapper} from "@/common/log";
import {createHash} from "crypto";
import {toHexString} from "image-size/dist/types/utils";

interface PacketHighwayTrans {
    uin: string;
    cmd: number;
    data: stream.Readable;
    sum: Uint8Array;
    size: number;
    ticket: Uint8Array;
    loginSig?: Uint8Array;
    ext: Uint8Array;
    encrypt: boolean;
    timeout?: number;
}

class PacketHighwayTransform extends stream.Transform {
    private seq: number = 0;
    private readonly trans: PacketHighwayTrans;
    private offset: number = 0;

    constructor(trans: PacketHighwayTrans) {
        super();
        this.trans = trans;
    }

    private nextSeq() {
        console.log(`[Highway] nextSeq: ${this.seq}`);
        this.seq += 2;
        return this.seq;
    }

    private encryptTrans(trans: PacketHighwayTrans, key: Uint8Array) {
        if (!trans.encrypt) return;
        trans.ext = tea.encrypt(Buffer.from(trans.ext), Buffer.from(key));
    }

    buildHead(trans: PacketHighwayTrans, offset: number, length: number, md5Hash: Uint8Array): Uint8Array {
        return new NapProtoMsg(ReqDataHighwayHead).encode({
            msgBaseHead: {
                version: 1,
                uin: trans.uin,  // TODO:
                command: "PicUp.DataUp",
                seq: this.nextSeq(),
                retryTimes: 0,
                appId: 537234773,
                dataFlag: 16,
                commandId: trans.cmd,
            },
            msgSegHead: {
                filesize: BigInt(trans.size),
                dataOffset: BigInt(offset),
                dataLength: length,
                serviceTicket: trans.ticket,
                md5: md5Hash,
                fileMd5: trans.sum,
            },
            bytesReqExtendInfo: trans.ext,
            timestamp: BigInt(Date.now()),
            msgLoginSigHead: {
                uint32LoginSigType: 8,
                appId: 1600001615,
            }
        })
    }

    _transform(data: Buffer, encoding: BufferEncoding, callback: stream.TransformCallback) {
        let offset = 0; // Offset within the current chunk
        console.log(`[Highway] CALLED!!! _transform data.length = ${data.length}`);
        while (offset < data.length) {
            console.log(`[Highway] _transform offset = ${offset}, data.length = ${data.length}`);
            const chunkSize = data.length > BlockSize ? BlockSize : data.length;
            console.log(`[Highway] _transform calced chunkSize = ${chunkSize}`);
            const chunk = data.slice(offset, offset + chunkSize);
            const chunkMd5 = createHash('md5').update(chunk).digest();
            const head = this.buildHead(this.trans, this.offset, chunk.length, chunkMd5);
            console.log(`[Highway] _transform: ${this.offset} | ${data.length} | ${chunkMd5.toString('hex')}`);
            this.offset += chunk.length;
            offset += chunk.length;
            const headerBuffer = Buffer.allocUnsafe(9);
            headerBuffer.writeUInt8(40);
            headerBuffer.writeUInt32BE(head.length, 1);
            headerBuffer.writeUInt32BE(chunk.length, 5);
            this.push(headerBuffer);
            this.push(head);
            this.push(chunk);
            this.push(Buffer.from([41]));
        }
        callback(null);
    }
}

export class PacketHighwayClient {
    sig: PacketHighwaySig;
    ip: string = 'htdata3.qq.com';
    port: number = 80;
    logger: LogWrapper;

    constructor(sig: PacketHighwaySig, logger: LogWrapper) {
        this.sig = sig;
        this.logger = logger;
    }

    changeServer(server: string, port: number) {
        this.ip = server;
        this.port = port;
    }

    framePack(head: Buffer, body: Buffer): Buffer[] {
        const buffers: Buffer[] = [];
        const buffer0 = Buffer.alloc(9);
        buffer0[0] = 0x28;
        buffer0.writeUInt32BE(head.length, 1);
        buffer0.writeUInt32BE(body.length, 5);
        buffers.push(buffer0);
        buffers.push(head);
        buffers.push(body);
        buffers.push(Buffer.from([0x29]));
        return buffers;
    }

    frameUnpack(frame: Buffer): [Buffer, Buffer] {
        const headLen = frame.readUInt32BE(1);
        const bodyLen = frame.readUInt32BE(5);
        return [frame.slice(9, 9 + headLen), frame.slice(9 + headLen, 9 + headLen + bodyLen)];
    }

    async postHighwayContent(frame: Buffer[], serverURL: string, end: boolean): Promise<Buffer> {
        try {
            const combinedBuffer = Buffer.concat(frame);
            const response: Response = await fetch(serverURL, {
                method: 'POST',
                headers: new Headers({
                    'Connection': end ? 'close' : 'keep-alive',
                    'Accept-Encoding': 'identity',
                    'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)',
                }),
                body: combinedBuffer,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            throw error;
        }
    }

    private async httpUploadBlock(trans: PacketHighwayTrans, offset: number, block: Buffer): Promise<void> {
        const highwayTransForm = new PacketHighwayTransform(trans);
        const isEnd = offset + block.length === trans.size;
        const md5 = crypto.createHash('md5').update(block).digest();
        const payload = highwayTransForm.buildHead(trans, offset, block.length, md5);
        this.logger.log(`[Highway] httpUploadBlock: payload = ${toHexString(payload)}`);
        const frame = this.framePack(Buffer.from(payload), block);
        const addr = this.sig.serverAddr[0];
        this.logger.log(`[Highway] httpUploadBlock: ${offset} | ${block.length} | ${toHexString(md5)}`);
        const resp = await this.postHighwayContent(frame, `http://${addr.ip}:${addr.port}/cgi-bin/httpconn?htcmd=0x6FF0087&uin=3767830885`, isEnd);
        const [head, body] = this.frameUnpack(resp);
        const headData = new NapProtoMsg(RespDataHighwayHead).decode(head);
        this.logger.log(`[Highway] ${headData.errorCode} | ${headData.msgSegHead?.retCode} | ${headData.bytesRspExtendInfo} | ${head.toString('hex')} | ${body.toString('hex')}`);
        if (headData.errorCode !== 0) {
            throw new Error(`[Highway] upload failed (code: ${headData.errorCode})`);
        }
    }

    async httpUpload(cmd: number, data: stream.Readable, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array): Promise<void> {
        const trans: PacketHighwayTrans = {
            uin: this.sig.uin,
            cmd: cmd,
            data: data,
            sum: md5,
            size: fileSize,
            ticket: this.sig.sigSession!,
            ext: extendInfo,
            encrypt: false,
            timeout: 360,  // TODO:
        };
        let offset = 0;
        console.log(`[Highway] httpUpload trans=${JSON.stringify(trans)}`);
        for await (const chunk of data) {
            let buffer = chunk as Buffer;
            try {
                await this.httpUploadBlock(trans, offset, buffer);
            } catch (err) {
                console.error(`Error uploading block at offset ${offset}: ${err}`);
                throw err;
            }
            offset += buffer.length;
        }
    }

    async tcpUpload(cmd: number, data: stream.Readable, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array): Promise<void> {
        const trans: PacketHighwayTrans = {
            uin: this.sig.uin,
            cmd: cmd,
            data: data,
            sum: md5,
            size: fileSize,
            ticket: this.sig.sigSession!,
            ext: extendInfo,
            encrypt: false,
            timeout: 360,  // TODO:
        };
        const highwayTransForm = new PacketHighwayTransform(trans);
        return new Promise((resolve, reject) => {
            const socket = net.connect(this.port, this.ip, () => {
                trans.data.pipe(highwayTransForm).pipe(socket, {end: false});
            })
            const handleRspHeader = (header: Buffer) => {
                console.log(`[Highway] handleRspHeader: ${header.toString('hex')}`);
                const rsp = new NapProtoMsg(RespDataHighwayHead).decode(header);
                if (rsp.errorCode !== 0) {
                    this.logger.logWarn(`highway upload failed (code: ${rsp.errorCode})`);
                    trans.data.unpipe(highwayTransForm).destroy();
                    highwayTransForm.unpipe(socket).destroy();
                    socket.end();
                    reject(new Error(`highway upload failed (code: ${rsp.errorCode})`));
                } else {
                    const percent = ((Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength)) / Number(rsp.msgSegHead?.filesize)).toFixed(2);
                    this.logger.log(`[Highway] ${rsp.errorCode} | ${percent} | ${Buffer.from(header).toString('hex')}`);
                    if (rsp.msgSegHead?.flag === 1) {
                        this.logger.log('[Highway] tcpUpload finished.');
                        socket.end();
                        resolve();
                    }
                    // if (Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength) > Number(rsp.msgSegHead?.filesize)) {
                    //     this.logger.log('[Highway] tcpUpload finished.');
                    //     socket.end();
                    //     resolve();
                    // }
                }
            };
            let buf = Buffer.alloc(0);
            socket.on('data', (chunk: Buffer) => {
                try {
                    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
                    while (buf.length >= 5) {
                        const len = buf.readInt32BE(1);
                        if (buf.length >= len + 10) {
                            handleRspHeader(buf.slice(9, len + 9));
                            buf = buf.slice(len + 10);
                        } else {
                            break;
                        }
                    }
                } catch (e) {
                    this.logger.logError(`[Highway] upload error: ${e}`);
                }
            })
            socket.on('close', () => {
                this.logger.log('[Highway] socket closed.');
                resolve();
            })
            socket.on('error', (err) => {
                this.logger.logError('[Highway] socket.on tcpUpload error:', err);
            })
            trans.data.on('error', (err) => {
                this.logger.logError('[Highway] readable tcpUpload error:', err);
                socket.end();
            })
            if (trans.timeout) {
                setTimeout(() => {
                    this.logger.logError('[Highway] tcpUpload timeout!');
                    socket.end();
                }, trans.timeout * 1000);
            }
        })
    }
}

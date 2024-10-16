import * as stream from 'node:stream';
import {ReadStream} from "node:fs";
import {PacketHighwaySig} from "@/core/packet/highway/session";
import {HighwayHttpUploader} from "@/core/packet/highway/uploader";
import {LogWrapper} from "@/common/log";

export interface PacketHighwayTrans {
    uin: string;
    cmd: number;
    command: string;
    data: stream.Readable;
    sum: Uint8Array;
    size: number;
    ticket: Uint8Array;
    loginSig?: Uint8Array;
    ext: Uint8Array;
    encrypt: boolean;
    timeout?: number;
    ip: string;
    port: number;
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

    private buildTrans(cmd: number, data: ReadStream, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array, timeout: number = 3600): PacketHighwayTrans {
        return {
            uin: this.sig.uin,
            cmd: cmd,
            command: 'PicUp.DataUp',
            data: data,
            sum: md5,
            size: fileSize,
            ticket: this.sig.sigSession!,
            ext: extendInfo,
            encrypt: false,
            timeout: timeout,
            ip: this.ip,
            port: this.port,
        } as PacketHighwayTrans;
    }

    async upload(cmd: number, data: ReadStream, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array): Promise<void> {
        const trans = this.buildTrans(cmd, data, fileSize, md5, extendInfo);
        const httpUploader = new HighwayHttpUploader(trans, this.logger);
        await httpUploader.upload();
    }
}

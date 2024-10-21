import * as stream from 'node:stream';
import { ReadStream } from "node:fs";
import { PacketHighwaySig } from "@/core/packet/highway/session";
import { HighwayHttpUploader, HighwayTcpUploader } from "@/core/packet/highway/uploader";
import { LogWrapper } from "@/common/log";

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
    server: string;
    port: number;
}

export class PacketHighwayClient {
    sig: PacketHighwaySig;
    server: string = 'htdata3.qq.com';
    port: number = 80;
    logger: LogWrapper;

    constructor(sig: PacketHighwaySig, logger: LogWrapper, server: string = 'htdata3.qq.com', port: number = 80) {
        this.sig = sig;
        this.logger = logger;
    }

    changeServer(server: string, port: number) {
        this.server = server;
        this.port = port;
    }

    private buildDataUpTrans(cmd: number, data: ReadStream, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array, timeout: number = 3600): PacketHighwayTrans {
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
            server: this.server,
            port: this.port,
        } as PacketHighwayTrans;
    }

    async upload(cmd: number, data: ReadStream, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array): Promise<void> {
        const trans = this.buildDataUpTrans(cmd, data, fileSize, md5, extendInfo);
        try {
            const tcpUploader = new HighwayTcpUploader(trans, this.logger);
            await tcpUploader.upload();
        } catch (e) {
            this.logger.logError(`[Highway] upload failed: ${e}, fallback to http upload`);
            try {
                const httpUploader = new HighwayHttpUploader(trans, this.logger);
                await httpUploader.upload();
            } catch (e) {
                this.logger.logError(`[Highway] http upload failed: ${e}`);
                throw e;
            }
        }
    }
}

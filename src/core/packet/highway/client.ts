import * as stream from 'node:stream';
import { ReadStream } from 'node:fs';
import { HighwayTcpUploader } from '@/core/packet/highway/uploader/highwayTcpUploader';
import { HighwayHttpUploader } from '@/core/packet/highway/uploader/highwayHttpUploader';
import { PacketHighwaySig } from '@/core/packet/highway/highwayContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';

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
    logger: PacketLogger;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(sig: PacketHighwaySig, logger: PacketLogger, _server: string = 'htdata3.qq.com', _port: number = 80) {
        this.sig = sig;
        this.logger = logger;
    }

    changeServer(server: string, port: number) {
        this.server = server;
        this.port = port;
    }

    private buildDataUpTrans(cmd: number, data: ReadStream, fileSize: number, md5: Uint8Array, extendInfo: Uint8Array, timeout: number = 1200): PacketHighwayTrans {
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
            this.logger.error(`[Highway] upload failed: ${e}, fallback to http upload`);
            try {
                const httpUploader = new HighwayHttpUploader(trans, this.logger);
                await httpUploader.upload();
            } catch (e) {
                this.logger.error(`[Highway] http upload failed: ${e}`);
                throw e;
            }
        }
    }
}

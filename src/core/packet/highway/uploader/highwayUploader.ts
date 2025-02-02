import * as tea from '@/core/packet/utils/crypto/tea';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { PacketHighwayTrans } from '@/core/packet/highway/client';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import * as proto from '@/core/packet/transformer/proto';

export abstract class IHighwayUploader {
    readonly trans: PacketHighwayTrans;
    readonly logger: PacketLogger;

    constructor(trans: PacketHighwayTrans, logger: PacketLogger) {
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
        });
    }

    buildPicUpHead(offset: number, bodyLength: number, bodyMd5: Uint8Array): Uint8Array {
        return new NapProtoMsg(proto.ReqDataHighwayHead).encode({
            msgBaseHead: {
                version: 1,
                uin: this.trans.uin,
                command: 'PicUp.DataUp',
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

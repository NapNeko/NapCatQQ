import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';
import { PacketMsgBuilder } from '@/core/packet/message/builder';

export type PacketHexStr = string & { readonly hexNya: unique symbol };

export const PacketHexStrBuilder = (str: Uint8Array): PacketHexStr => {
    return Buffer.from(str).toString('hex') as PacketHexStr;
};

export interface OidbPacket {
    cmd: string;
    data: PacketHexStr
}

export abstract class PacketTransformer<T> {
    protected msgBuilder: PacketMsgBuilder;

    protected constructor() {
        this.msgBuilder = new PacketMsgBuilder();
    }

    abstract build(...args: any[]): OidbPacket | Promise<OidbPacket>;

    abstract parse(data: Buffer): NapProtoDecodeStructType<T>;
}

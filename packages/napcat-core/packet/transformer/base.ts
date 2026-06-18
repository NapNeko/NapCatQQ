import { NapProtoDecodeStructType } from 'napcat-protobuf';
import { PacketMsgBuilder } from '@/napcat-core/packet/message/builder';

export type PacketBuf = Buffer & { readonly hexNya: unique symbol; };

export const PacketBufBuilder = (str: Uint8Array): PacketBuf => {
  return Buffer.from(str) as PacketBuf;
};

export interface OidbPacket {
  cmd: string;
  data: PacketBuf;
}

export abstract class PacketTransformer<T> {
  protected msgBuilder: PacketMsgBuilder;

  constructor () {
    this.msgBuilder = new PacketMsgBuilder();
  }

  abstract build (...args: any[]): OidbPacket | Promise<OidbPacket>;

  abstract parse (data: Buffer): NapProtoDecodeStructType<T>;
}

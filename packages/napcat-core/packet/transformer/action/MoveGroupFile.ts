import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';

class MoveGroupFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0x6D6Response> {
  build (groupUin: number, fileUUID: string, currentParentDirectory: string, targetParentDirectory: string): OidbPacket {
    const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6).encode({
      move: {
        groupUin,
        appId: 5,
        busId: 102,
        fileId: fileUUID,
        parentDirectory: currentParentDirectory,
        targetDirectory: targetParentDirectory,
      },
    });
    return OidbBase.build(0x6D6, 5, body, true, false);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    const res = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6Response).decode(oidbBody);
    if (res.move.retCode !== 0) {
      throw new Error(`sendGroupFileMoveReq error: ${res.move.clientWording} (code=${res.move.retCode})`);
    }
    return res;
  }
}

export default new MoveGroupFile();

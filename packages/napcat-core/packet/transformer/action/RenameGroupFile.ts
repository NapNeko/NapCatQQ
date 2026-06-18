import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';

class RenameGroupFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0x6D6Response> {
  build (groupUin: number, fileUUID: string, currentParentDirectory: string, newName: string): OidbPacket {
    const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6).encode({
      rename: {
        groupUin,
        busId: 102,
        fileId: fileUUID,
        parentFolder: currentParentDirectory,
        newFileName: newName,
      },
    });
    return OidbBase.build(0x6D6, 4, body, true, false);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    const res = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6Response).decode(oidbBody);
    if (res.rename.retCode !== 0) {
      throw new Error(`sendGroupFileRenameReq error: ${res.rename.clientWording} (code=${res.rename.retCode})`);
    }
    return res;
  }
}

export default new RenameGroupFile();

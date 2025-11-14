import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';

class SendPoke extends PacketTransformer<typeof proto.OidbSvcTrpcTcpBase> {
  build (is_group: boolean, peer: number, target: number): OidbPacket {
    const payload = {
      uin: target,
      ext: 0,
      ...(is_group ? { groupUin: peer } : { friendUin: peer }),
    };
    const data = new NapProtoMsg(proto.OidbSvcTrpcTcp0XED3_1).encode(payload);
    return OidbBase.build(0xED3, 1, data);
  }

  parse (data: Buffer) {
    return OidbBase.parse(data);
  }
}

export default new SendPoke();

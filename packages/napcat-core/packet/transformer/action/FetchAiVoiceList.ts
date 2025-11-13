import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';
import { AIVoiceChatType } from '@/napcat-core/packet/entities/aiChat';

class FetchAiVoiceList extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0X929D_0Resp> {
  build (groupUin: number, chatType: AIVoiceChatType): OidbPacket {
    const data = new NapProtoMsg(proto.OidbSvcTrpcTcp0X929D_0).encode({
      groupUin,
      chatType,
    });
    return OidbBase.build(0x929D, 0, data);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    return new NapProtoMsg(proto.OidbSvcTrpcTcp0X929D_0Resp).decode(oidbBody);
  }
}

export default new FetchAiVoiceList();

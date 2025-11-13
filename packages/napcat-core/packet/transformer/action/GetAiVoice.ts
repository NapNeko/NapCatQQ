import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';
import { AIVoiceChatType } from '@/napcat-core/packet/entities/aiChat';

class GetAiVoice extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0X929B_0Resp> {
  build (groupUin: number, voiceId: string, text: string, sessionId: number, chatType: AIVoiceChatType): OidbPacket {
    const data = new NapProtoMsg(proto.OidbSvcTrpcTcp0X929B_0).encode({
      groupUin,
      voiceId,
      text,
      chatType,
      session: {
        sessionId,
      },
    });
    return OidbBase.build(0x929B, 0, data);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    return new NapProtoMsg(proto.OidbSvcTrpcTcp0X929B_0Resp).decode(oidbBody);
  }
}

export default new GetAiVoice();

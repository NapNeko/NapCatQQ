import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketBufBuilder, PacketTransformer } from '@/napcat-core/packet/transformer/base';

class FetchGroupMessage extends PacketTransformer<typeof proto.SsoGetGroupMsgResponse> {
  build (groupUin: number, startSeq: number, endSeq: number): OidbPacket {
    const req = new NapProtoMsg(proto.SsoGetGroupMsg).encode({
      info: {
        groupUin,
        startSequence: startSeq,
        endSequence: endSeq,
      },
      direction: true,
    });
    return {
      cmd: 'trpc.msg.register_proxy.RegisterProxy.SsoGetGroupMsg',
      data: PacketBufBuilder(req),
    };
  }

  parse (data: Buffer) {
    return new NapProtoMsg(proto.SsoGetGroupMsgResponse).decode(data);
  }
}

export default new FetchGroupMessage();

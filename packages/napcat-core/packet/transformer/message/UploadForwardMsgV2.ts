import zlib from 'node:zlib';
import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketBufBuilder, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import { PacketMsg } from '@/napcat-core/packet/message/message';

export interface UploadForwardMsgParams {
  actionCommand: string;
  actionMsg: PacketMsg[];
}
class UploadForwardMsgV2 extends PacketTransformer<typeof proto.SendLongMsgResp> {
  build (selfUid: string, msg: UploadForwardMsgParams[], groupUin: number = 0): OidbPacket {
    const reqdata = msg.map((item) => ({
      actionCommand: item.actionCommand,
      actionData: {
        msgBody: this.msgBuilder.buildFakeMsg(selfUid, item.actionMsg),
      },
    }));
    const longMsgResultData = new NapProtoMsg(proto.LongMsgResult).encode(
      {
        action: reqdata,
      }
    );
    const payload = zlib.gzipSync(Buffer.from(longMsgResultData));
    const req = new NapProtoMsg(proto.SendLongMsgReq).encode(
      {
        info: {
          type: groupUin === 0 ? 1 : 3,
          uid: {
            uid: groupUin === 0 ? selfUid : groupUin.toString(),
          },
          groupUin,
          payload,
        },
        settings: {
          field1: 4, field2: 1, field3: 7, field4: 0,
        },
      }
    );
    return {
      cmd: 'trpc.group.long_msg_interface.MsgService.SsoSendLongMsg',
      data: PacketBufBuilder(req),
    };
  }

  parse (data: Buffer) {
    return new NapProtoMsg(proto.SendLongMsgResp).decode(data);
  }
}

export default new UploadForwardMsgV2();

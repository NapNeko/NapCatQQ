import zlib from 'node:zlib';
import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketHexStrBuilder, PacketTransformer } from '@/core/packet/transformer/base';
import { PacketMsg } from '@/core/packet/message/message';

class UploadForwardMsg extends PacketTransformer<typeof proto.SendLongMsgResp> {
    constructor() {
        super();
    }

    build(selfUid: string, msg: PacketMsg[], groupUin: number = 0): OidbPacket {
        const msgBody = this.msgBuilder.buildFakeMsg(selfUid, msg);
        const longMsgResultData = new NapProtoMsg(proto.LongMsgResult).encode(
            {
                action: [{
                    actionCommand: 'MultiMsg',
                    actionData: {
                        msgBody: msgBody
                    }
                }]
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
                    groupUin: groupUin,
                    payload: payload
                },
                settings: {
                    field1: 4, field2: 1, field3: 7, field4: 0
                }
            }
        );
        return {
            cmd: 'trpc.group.long_msg_interface.MsgService.SsoSendLongMsg',
            data: PacketHexStrBuilder(req)
        };
    }

    parse(data: Buffer) {
        return new NapProtoMsg(proto.SendLongMsgResp).decode(data);
    }
}

export default new UploadForwardMsg();

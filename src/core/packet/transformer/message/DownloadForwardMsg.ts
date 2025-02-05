import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketHexStrBuilder, PacketTransformer } from '@/core/packet/transformer/base';

class DownloadForwardMsg extends PacketTransformer<typeof proto.RecvLongMsgResp> {
    constructor() {
        super();
    }

    build(uid: string, resId: string): OidbPacket {
        const req = new NapProtoMsg(proto.RecvLongMsgReq).encode({
            info: {
                uid: {
                    uid: uid
                },
                resId: resId,
                acquire: true
            },
            settings: {
                field1: 2,
                field2: 0,
                field3: 0,
                field4: 0
            }
        });
        return {
            cmd: 'trpc.group.long_msg_interface.MsgService.SsoRecvLongMsg',
            data: PacketHexStrBuilder(req)
        };
    }

    parse(data: Buffer) {
        return new NapProtoMsg(proto.RecvLongMsgResp).decode(data);
    }
}

export default new DownloadForwardMsg();

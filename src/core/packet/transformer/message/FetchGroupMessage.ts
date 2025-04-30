import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketHexStrBuilder, PacketTransformer } from '@/core/packet/transformer/base';

class FetchGroupMessage extends PacketTransformer<typeof proto.SsoGetGroupMsgResponse> {
    constructor() {
        super();
    }

    build(groupUin: number, startSeq: number, endSeq: number): OidbPacket {
        const req = new NapProtoMsg(proto.SsoGetGroupMsg).encode({
            info: {
                groupUin: groupUin,
                startSequence: startSeq,
                endSequence: endSeq
            },
            direction: true
        });
        return {
            cmd: 'trpc.msg.register_proxy.RegisterProxy.SsoGetGroupMsg',
            data: PacketHexStrBuilder(req)
        };
    }

    parse(data: Buffer) {
        return new NapProtoMsg(proto.SsoGetGroupMsgResponse).decode(data);
    }
}

export default new FetchGroupMessage();

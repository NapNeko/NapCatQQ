import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class SetGroupTodo extends PacketTransformer<typeof proto.OidbSvcTrpcTcpBase> {
    constructor() {
        super();
    }

    build(peer: number, msgSeq: string): OidbPacket {
        const data = new NapProtoMsg(proto.OidbSvcTrpcTcp0XF90_1).encode({
            groupUin: peer,
            msgSeq: BigInt(msgSeq)
        });
        return OidbBase.build(0xF90, 1, data);
    }

    parse(data: Buffer) {
        return OidbBase.parse(data);
    }
}

export default new SetGroupTodo();
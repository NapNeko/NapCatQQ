import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class GetStrangerInfo extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0XFE1_2RSP> {
    constructor() {
        super();
    }

    build(uin: number): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0XFE1_2).encode({
            uin: uin,
            key: [{ key: 27372 }]
        });
        return OidbBase.build(0XFE1, 2, body);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0XFE1_2RSP).decode(oidbBody);
    }
}

export default new GetStrangerInfo();

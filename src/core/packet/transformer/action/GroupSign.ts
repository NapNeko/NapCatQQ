import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class GroupSign extends PacketTransformer<typeof proto.OidbSvcTrpcTcpBase> {
    constructor() {
        super();
    }

    build(uin: number, groupCode: number): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0XEB7).encode(
            {
                body: {
                    uin: String(uin),
                    groupUin: String(groupCode),
                    version: '9.0.90'
                }
            }
        );
        return OidbBase.build(0XEB7, 1, body, false, false);
    }

    parse(data: Buffer) {
        return OidbBase.parse(data);
    }
}

export default new GroupSign();

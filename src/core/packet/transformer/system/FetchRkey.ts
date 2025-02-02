import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class FetchRkey extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0X9067_202_Rsp_Body> {
    constructor() {
        super();
    }

    build(): OidbPacket {
        const data = new NapProtoMsg(proto.OidbSvcTrpcTcp0X9067_202).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 202
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 0
                },
                client: {
                    agentType: 2
                }
            },
            downloadRKeyReq: {
                key: [10, 20, 2]
            },
        });
        return OidbBase.build(0x9067, 202, data);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0X9067_202_Rsp_Body).decode(oidbBody);
    }
}

export default new FetchRkey();

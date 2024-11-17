import * as proto from "@/core/packet/transformer/proto";
import { NapProtoMsg } from "@napneko/nap-proto-core";
import { OidbPacket, PacketTransformer } from "@/core/packet/transformer/base";
import OidbBase from "@/core/packet/transformer/oidb/oidbBase";

class SetSpecialTitle extends PacketTransformer<typeof proto.OidbSvcTrpcTcpBase> {
    constructor() {
        super();
    }

    build(groupCode: number, uid: string, tittle: string): OidbPacket {
        const oidb_0x8FC_2_body = new NapProtoMsg(proto.OidbSvcTrpcTcp0X8FC_2_Body).encode({
            targetUid: uid,
            specialTitle: tittle,
            expiredTime: -1,
            uinName: tittle
        });
        const oidb_0x8FC_2 = new NapProtoMsg(proto.OidbSvcTrpcTcp0X8FC_2).encode({
            groupUin: +groupCode,
            body: oidb_0x8FC_2_body
        });
        return OidbBase.build(0x8FC, 2, oidb_0x8FC_2, false, false);
    }

    parse(data: Buffer) {
        return OidbBase.parse(data);
    }
}

export default new SetSpecialTitle();

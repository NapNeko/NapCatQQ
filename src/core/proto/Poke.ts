import { MessageType, ScalarType, BinaryWriter } from '@protobuf-ts/runtime';

export const OidbSvcTrpcTcpBase = new MessageType("oidb_svc_trpctcp_base", [
    { no: 1, name: "command", kind: "scalar", T: ScalarType.UINT32 },
    { no: 2, name: "subcommand", kind: "scalar", T: ScalarType.UINT32, opt: true },
    { no: 4, name: "body", kind: "scalar", T: ScalarType.BYTES, opt: true },
    { no: 12, name: "isreserved", kind: "scalar", T: ScalarType.INT32, opt: true }
]);

export const OidbSvcTrpcTcp0XED3_1 = new MessageType("oidb_svc_trpctcp_0xed3_1", [
    { no: 1, name: "uin", kind: "scalar", T: ScalarType.UINT32 },
    { no: 2, name: "groupuin", kind: "scalar", T: ScalarType.UINT32, opt: true },
    { no: 5, name: "frienduin", kind: "scalar", T: ScalarType.UINT32, opt: true },
    { no: 6, name: "ext", kind: "scalar", T: ScalarType.UINT32 }
]);

export function encodeGroupPoke(groupUin: number, PeerUin: number) {
    let Body = OidbSvcTrpcTcp0XED3_1.toBinary
        ({
            uin: PeerUin,
            groupuin: groupUin,
            ext: 0
        });
    //console.log(Body)
    return OidbSvcTrpcTcpBase.toBinary
        ({
            command: 0xed3,
            subcommand: 1,
            body: Body
        });
}
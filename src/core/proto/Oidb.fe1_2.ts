import { MessageType, ScalarType } from "@protobuf-ts/runtime";
import { OidbSvcTrpcTcpBase } from "./Poke";

export const OidbSvcTrpcTcp0XFE1_2 = new MessageType("oidb_svc_trpctcp_0xfe1_2", [
    { no: 1, name: "uin", kind: "scalar", T: ScalarType.UINT32 },
    { no: 3, name: "key", kind: "scalar", T: ScalarType.BYTES, opt: true }
]);
export function encode_packet_0xfe1_2(PeerUin: string) {
    let Body = OidbSvcTrpcTcp0XFE1_2.toBinary
        ({
            uin: parseInt(PeerUin),
            key: new Uint8Array([0x00, 0x00, 0x00, 0x00])
        });
    return OidbSvcTrpcTcpBase.toBinary
        ({
            command: 0xfe1,
            subcommand: 2,
            body: Body,
            isreserved: 1
        });
}
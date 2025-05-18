import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketHexStrBuilder, PacketTransformer } from '@/core/packet/transformer/base';

class OidbBase extends PacketTransformer<typeof proto.OidbSvcTrpcTcpBase> {
    constructor() {
        super();
    }

    build(cmd: number, subCmd: number, body: Uint8Array, isUid: boolean = true, _isLafter: boolean = false): OidbPacket {
        const data = new NapProtoMsg(proto.OidbSvcTrpcTcpBase).encode({
            command: cmd,
            subCommand: subCmd,
            body: body,
            isReserved: isUid ? 1 : 0
        });
        return {
            cmd: `OidbSvcTrpcTcp.0x${cmd.toString(16).toUpperCase()}_${subCmd}`,
            data: PacketHexStrBuilder(data),
        };
    }

    parse(data: Buffer) {
        const res = new NapProtoMsg(proto.OidbSvcTrpcTcpBase).decode(data);
        if (res.errorCode !== 0) {
            throw new Error(`OidbSvcTrpcTcpBase parse error: ${res.errorMsg} (code=${res.errorCode})`);
        }
        return res;
    }
}

export default new OidbBase();

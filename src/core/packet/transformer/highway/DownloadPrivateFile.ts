import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class DownloadPrivateFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0XE37_1200Response> {
    constructor() {
        super();
    }

    build(selfUid: string, fileUUID: string, fileHash: string): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37_1200).encode({
            subCommand: 1200,
            field2: 1,
            body: {
                receiverUid: selfUid,
                fileUuid: fileUUID,
                type: 2,
                fileHash: fileHash,
                t2: 0
            },
            field101: 3,
            field102: 103,
            field200: 1,
            field99999: Buffer.from([0xc0, 0x85, 0x2c, 0x01])
        });
        return OidbBase.build(0xE37, 1200, body, false, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37_1200Response).decode(oidbBody);
    }
}

export default new DownloadPrivateFile();

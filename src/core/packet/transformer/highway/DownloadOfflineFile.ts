import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class DownloadOfflineFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0XE37Response> {
    constructor() {
        super();
    }

    build(fileUUID: string, fileHash: string, senderUid: string, receiverUid: string): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37_800).encode({
            subCommand: 800,
            field2: 0,
            body: {
                senderUid: senderUid,
                receiverUid: receiverUid,
                fileUuid: fileUUID,
                fileHash: fileHash,
            },
            field101: 3,
            field102: 1,
            field200: 1,
        });
        return OidbBase.build(0xE37, 800, body, false, false);
    }

    // TODO:check
    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37Response).decode(oidbBody);
    }
}

export default new DownloadOfflineFile();

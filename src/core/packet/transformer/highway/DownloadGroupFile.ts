import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class DownloadGroupFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0x6D6Response> {
    constructor() {
        super();
    }

    build(groupUin: number, fileUUID: string): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6).encode({
            download: {
                groupUin: groupUin,
                appId: 7,
                busId: 102,
                fileId: fileUUID
            }
        });
        return OidbBase.build(0x6D6, 2, body, true, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        const res = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6Response).decode(oidbBody);
        if (res.download.retCode !== 0) {
            throw new Error(`sendGroupFileDownloadReq error: ${res.download.clientWording} (code=${res.download.retCode})`);
        }
        return res;
    }
}

export default new DownloadGroupFile();

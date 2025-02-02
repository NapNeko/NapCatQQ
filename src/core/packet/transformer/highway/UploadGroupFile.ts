import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';
import { PacketMsgFileElement } from '@/core/packet/message/element';

class UploadGroupFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0x6D6Response> {
    constructor() {
        super();
    }

    build(groupUin: number, file: PacketMsgFileElement): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6).encode({
            file: {
                groupUin: groupUin,
                appId: 4,
                busId: 102,
                entrance: 6,
                targetDirectory: '/',  // TODO:
                fileName: file.fileName,
                localDirectory: `/${file.fileName}`,
                fileSize: BigInt(file.fileSize),
                fileMd5: file.fileMd5,
                fileSha1: file.fileSha1,
                fileSha3: Buffer.alloc(0),
                field15: true
            }
        });
        return OidbBase.build(0x6D6, 0, body, true, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0x6D6Response).decode(oidbBody);
    }
}

export default new UploadGroupFile();

import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';
import { PacketMsgFileElement } from '@/core/packet/message/element';
import { computeMd5AndLengthWithLimit } from '@/core/packet/utils/crypto/hash';

class UploadPrivateFile extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0XE37Response> {
    constructor() {
        super();
    }

    async build(selfUid: string, peerUid: string, file: PacketMsgFileElement): Promise<OidbPacket> {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37_1700).encode({
            command: 1700,
            seq: 0,
            upload: {
                senderUid: selfUid,
                receiverUid: peerUid,
                fileSize: file.fileSize,
                fileName: file.fileName,
                md510MCheckSum: await computeMd5AndLengthWithLimit(file.filePath, 10 * 1024 * 1024),
                sha1CheckSum: file.fileSha1,
                localPath: '/',
                md5CheckSum: file.fileMd5,
                sha3CheckSum: Buffer.alloc(0)
            },
            businessId: 3,
            clientType: 1,
            flagSupportMediaPlatform: 1
        });
        return OidbBase.build(0xE37, 1700, body, false, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0XE37Response).decode(oidbBody);
    }
}

export default new UploadPrivateFile();

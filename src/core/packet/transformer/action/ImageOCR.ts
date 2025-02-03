import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';

class ImageOCR extends PacketTransformer<typeof proto.OidbSvcTrpcTcp0xE07_0_Response> {
    constructor() {
        super();
    }

    build(url: string): OidbPacket {
        const body = new NapProtoMsg(proto.OidbSvcTrpcTcp0xE07_0).encode(
            {
                version: 1,
                client: 0,
                entrance: 1,
                ocrReqBody: {
                    imageUrl: url,
                    originMd5: '',
                    afterCompressMd5: '',
                    afterCompressFileSize: '',
                    afterCompressWeight: '',
                    afterCompressHeight: '',
                    isCut: false,
                }
            }
        );
        return OidbBase.build(0XEB7, 1, body, false, false);
    }

    parse(data: Buffer) {
        const base = OidbBase.parse(data);
        return new NapProtoMsg(proto.OidbSvcTrpcTcp0xE07_0_Response).decode(base.body);
    }
}

export default new ImageOCR();

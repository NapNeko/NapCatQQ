import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketHexStrBuilder, PacketTransformer } from '@/core/packet/transformer/base';

class FetchSessionKey extends PacketTransformer<typeof proto.HttpConn0x6ff_501Response> {
    constructor() {
        super();
    }

    build(): OidbPacket {
        const req = new NapProtoMsg(proto.HttpConn0x6ff_501).encode({
            httpConn: {
                field1: 0,
                field2: 0,
                field3: 16,
                field4: 1,
                field6: 3,
                serviceTypes: [1, 5, 10, 21],
                // tgt: "",  // TODO: do we really need tgt? seems not
                field9: 2,
                field10: 9,
                field11: 8,
                ver: '1.0.1'
            }
        });
        return {
            cmd: 'HttpConn.0x6ff_501',
            data: PacketHexStrBuilder(req)
        };
    }

    parse(data: Buffer) {
        return new NapProtoMsg(proto.HttpConn0x6ff_501Response).decode(data);
    }
}

export default new FetchSessionKey();

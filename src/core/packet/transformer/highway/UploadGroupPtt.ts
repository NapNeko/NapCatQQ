import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';
import crypto from 'node:crypto';
import { PacketMsgPttElement } from '@/core/packet/message/element';

class UploadGroupPtt extends PacketTransformer<typeof proto.NTV2RichMediaResp> {
    constructor() {
        super();
    }

    build(groupUin: number, ptt: PacketMsgPttElement): OidbPacket {
        const data = new NapProtoMsg(proto.NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 3,
                    sceneType: 2,
                    group: {
                        groupUin: groupUin
                    }
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: ptt.fileSize,
                            fileHash: ptt.fileMd5,
                            fileSha1: ptt.fileSha1,
                            fileName: `${ptt.fileMd5}.amr`,
                            type: {
                                type: 3,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 1
                            },
                            height: 0,
                            width: 0,
                            time: ptt.fileDuration,
                            original: 0
                        },
                        subFileType: 0
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        textSummary: 'Nya~',
                    },
                    video: {
                        bytesPbReserve: Buffer.alloc(0),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.from([0x08, 0x00, 0x38, 0x00]),
                        bytesGeneralFlags: Buffer.from([0x9a, 0x01, 0x07, 0xaa, 0x03, 0x04, 0x08, 0x08, 0x12, 0x00]),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return OidbBase.build(0x126E, 100, data, true, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.NTV2RichMediaResp).decode(oidbBody);
    }
}

export default new UploadGroupPtt();

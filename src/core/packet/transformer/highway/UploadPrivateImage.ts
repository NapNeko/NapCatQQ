import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';
import crypto from 'node:crypto';
import { PacketMsgPicElement } from '@/core/packet/message/element';

class UploadPrivateImage extends PacketTransformer<typeof proto.NTV2RichMediaResp> {
    constructor() {
        super();
    }

    build(peerUin: string, img: PacketMsgPicElement): OidbPacket {
        const data = new NapProtoMsg(proto.NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 1,
                    c2C: {
                        accountType: 2,
                        targetUid: peerUin
                    },
                },
                client: {
                    agentType: 2,
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: +img.size,
                            fileHash: img.md5,
                            fileSha1: img.sha1!,
                            fileName: img.name,
                            type: {
                                type: 1,
                                picFormat: img.picType,  //TODO: extend NapCat imgType /cc @MliKiowa
                                videoFormat: 0,
                                voiceFormat: 0,
                            },
                            width: img.width,
                            height: img.height,
                            time: 0,
                            original: 1
                        },
                        subFileType: 0,
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 1,
                extBizInfo: {
                    pic: {
                        bizType: img.picSubType,
                        bytesPbReserveC2C: {
                            subType: img.picSubType,
                        },
                        textSummary: img.summary,
                    },
                    video: {
                        bytesPbReserve: Buffer.alloc(0),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.alloc(0),
                        bytesGeneralFlags: Buffer.alloc(0),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false,
            }
        }
        );
        return OidbBase.build(0x11C5, 100, data,true, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.NTV2RichMediaResp).decode(oidbBody);
    }
}

export default new UploadPrivateImage();

import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketTransformer } from '@/core/packet/transformer/base';
import OidbBase from '@/core/packet/transformer/oidb/oidbBase';
import crypto from 'node:crypto';
import { PacketMsgVideoElement } from '@/core/packet/message/element';

class UploadGroupVideo extends PacketTransformer<typeof proto.NTV2RichMediaResp> {
    constructor() {
        super();
    }

    build(groupUin: number, video: PacketMsgVideoElement): OidbPacket {
        if (!video.fileSize || !video.thumbSize) throw new Error('video.fileSize or video.thumbSize is empty');
        const data = new NapProtoMsg(proto.NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 3,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 2,
                    sceneType: 2,
                    group: {
                        groupUin: groupUin
                    },
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: +video.fileSize,
                            fileHash: video.fileMd5,
                            fileSha1: video.fileSha1,
                            fileName: 'nya.mp4',
                            type: {
                                type: 2,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: 0,
                            width: 0,
                            time: 0,
                            original: 0
                        },
                        subFileType: 0
                    }, {
                        fileInfo: {
                            fileSize: +video.thumbSize,
                            fileHash: video.thumbMd5,
                            fileSha1: video.thumbSha1,
                            fileName: 'nya.jpg',
                            type: {
                                type: 1,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: video.thumbHeight,
                            width: video.thumbWidth,
                            time: 0,
                            original: 0
                        },
                        subFileType: 100
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        bizType: 0,
                        textSummary: 'Nya~',
                    },
                    video: {
                        bytesPbReserve: Buffer.from([0x80, 0x01, 0x00]),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.alloc(0),
                        bytesGeneralFlags: Buffer.alloc(0),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return OidbBase.build(0x11EA, 100, data, true, false);
    }

    parse(data: Buffer) {
        const oidbBody = OidbBase.parse(data).body;
        return new NapProtoMsg(proto.NTV2RichMediaResp).decode(oidbBody);
    }
}

export default new UploadGroupVideo();

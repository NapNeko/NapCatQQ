import * as crypto from "crypto";
import { PushMsgBody } from "@/core/packet/proto/message/message";
import { NapProtoEncodeStructType } from "@/core/packet/proto/NapProto";
import { LogWrapper } from "@/common/log";
import { PacketMsg } from "@/core/packet/msg/message";

export class PacketMsgBuilder {
    private logger: LogWrapper;

    constructor(logger: LogWrapper) {
        this.logger = logger;
    }

    buildFakeMsg(selfUid: string, element: PacketMsg[]): NapProtoEncodeStructType<typeof PushMsgBody>[] {
        return element.map((node): NapProtoEncodeStructType<typeof PushMsgBody> => {
            const avatar = `https://q.qlogo.cn/headimg_dl?dst_uin=${node.senderUin}&spec=640&img_type=jpg`;
            const msgElement = node.msg.flatMap(msg => msg.buildElement() ?? []);
            return {
                responseHead: {
                    fromUid: "",
                    fromUin: node.senderUin,
                    toUid: node.groupId ? undefined : selfUid,
                    forward: node.groupId ? undefined : {
                        friendName: node.senderName,
                    },
                    grp: node.groupId ? {
                        groupUin: node.groupId,
                        memberName: node.senderName,
                        unknown5: 2
                    } : undefined,
                },
                contentHead: {
                    type: node.groupId ? 82 : 9,
                    subType: node.groupId ? undefined : 4,
                    divSeq: node.groupId ? undefined : 4,
                    msgId: crypto.randomBytes(4).readUInt32LE(0),
                    sequence: crypto.randomBytes(4).readUInt32LE(0),
                    timeStamp: Math.floor(Date.now() / 1000),
                    field7: BigInt(1),
                    field8: 0,
                    field9: 0,
                    forward: {
                        field1: 0,
                        field2: 0,
                        field3: node.groupId ? 0 : 2,
                        unknownBase64: avatar,
                        avatar: avatar
                    }
                },
                body: {
                    richText: {
                        elems: msgElement
                    }
                }
            };
        });
    }
}

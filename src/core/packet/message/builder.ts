import * as crypto from "crypto";
import { PushMsgBody } from "@/core/packet/transformer/proto";
import { NapProtoEncodeStructType } from "@napneko/nap-proto-core";
import { PacketMsg, PacketSendMsgElement } from "@/core/packet/message/message";
import { IPacketMsgElement, PacketMsgTextElement } from "@/core/packet/message/element";
import { SendTextElement } from "@/core";

export class PacketMsgBuilder {
    protected static failBackText = new PacketMsgTextElement(
        {
            textElement: { content: "[该消息类型暂不支持查看]" }
        } as SendTextElement
    );

    buildFakeMsg(selfUid: string, element: PacketMsg[]): NapProtoEncodeStructType<typeof PushMsgBody>[] {
        return element.map((node): NapProtoEncodeStructType<typeof PushMsgBody> => {
            const avatar = `https://q.qlogo.cn/headimg_dl?dst_uin=${node.senderUin}&spec=640&img_type=jpg`;
            const msgContent = node.msg.reduceRight((acc: undefined | Uint8Array, msg: IPacketMsgElement<PacketSendMsgElement>) => {
                return acc !== undefined ? acc : msg.buildContent();
            }, undefined);
            const msgElement = node.msg.flatMap(msg => msg.buildElement() ?? []);
            if (!msgContent && !msgElement.length) {
                msgElement.push(PacketMsgBuilder.failBackText.buildElement());
            }
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
                    timeStamp: +node.time.toString().substring(0, 10),
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
                    },
                    msgContent: msgContent,
                }
            };
        });
    }
}

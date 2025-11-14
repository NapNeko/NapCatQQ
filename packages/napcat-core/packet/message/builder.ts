import * as crypto from 'crypto';
import { PushMsgBody } from '@/napcat-core/packet/transformer/proto';
import { NapProtoEncodeStructType } from 'napcat-protobuf';
import { PacketMsg, PacketSendMsgElement } from '@/napcat-core/packet/message/message';
import { IPacketMsgElement, PacketMsgTextElement } from '@/napcat-core/packet/message/element';
import { SendTextElement } from '@/napcat-core/index';

export class PacketMsgBuilder {
  protected static failBackText = new PacketMsgTextElement(
    {
      textElement: { content: '[该消息类型暂不支持查看]' },
    } as SendTextElement
  );

  buildFakeMsg (selfUid: string, element: PacketMsg[]): NapProtoEncodeStructType<typeof PushMsgBody>[] {
    return element.map((node): NapProtoEncodeStructType<typeof PushMsgBody> => {
      const avatar = `https://q.qlogo.cn/headimg_dl?dst_uin=${node.senderUin}&spec=640&img_type=jpg`;
      const msgContent = node.msg.reduceRight((acc: undefined | Uint8Array, msg: IPacketMsgElement<PacketSendMsgElement>) => {
        return acc ?? msg.buildContent();
      }, undefined);
      const msgElement = node.msg.flatMap(msg => msg.buildElement() ?? []);
      if (!msgContent && !msgElement.length) {
        msgElement.push(PacketMsgBuilder.failBackText.buildElement());
      }
      return {
        responseHead: {
          fromUin: node.senderUin,
          type: 0,
          sigMap: 0,
          toUin: 0,
          fromUid: '',
          forward: node.groupId
            ? undefined
            : {
              friendName: node.senderName,
            },
          toUid: node.groupId ? undefined : selfUid,
          grp: node.groupId
            ? {
              groupUin: node.groupId,
              memberName: node.senderName,
              unknown5: 2,
            }
            : undefined,
        },
        contentHead: {
          type: node.groupId ? 82 : 9,
          subType: node.groupId ? undefined : 4,
          divSeq: node.groupId ? undefined : 4,
          autoReply: 0,
          sequence: crypto.randomBytes(4).readUInt32LE(0),
          timeStamp: +node.time.toString().substring(0, 10),
          forward: {
            field1: 0,
            field2: 0,
            field3: node.groupId ? 1 : 2,
            unknownBase64: avatar,
            avatar,
          },
        },
        body: {
          richText: {
            elems: msgElement,
          },
          msgContent,
        },
      };
    });
  }
}

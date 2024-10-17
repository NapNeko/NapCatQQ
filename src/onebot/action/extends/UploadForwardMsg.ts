import BaseAction from '../BaseAction';
import {ActionName} from '../types';
import {FromSchema, JSONSchema} from 'json-schema-to-ts';
import {ChatType, SendTextElement} from "@/core";
import {PacketMsgPicElement, PacketMsgTextElement} from "@/core/packet/msg/element";

const SchemaData = {
    type: 'object',
    properties: {
        group_id: {type: ['number', 'string']},
        pic: {type: 'string'},
    },
    required: ['group_id', 'pic'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class UploadForwardMsg extends BaseAction<Payload, any> {
    actionName = ActionName.UploadForwardMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.available) {
            throw new Error('PacketClient is not init');
        }
        // throw new Error('Not implemented');
        const peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: "10001", // TODO: must be a valid group id
        }
        const img = await this.core.apis.FileApi.createValidSendPicElement(
            {
                deleteAfterSentFiles: [],
                peer: peer
            },
            "",  // TODO:
            "www",
            0,
        )
        const sendImg = new PacketMsgPicElement(img);
        console.log(JSON.stringify(img));
        await this.core.apis.PacketApi.packetSession?.highwaySession.uploadImage(
            peer, sendImg
        )
        return await this.core.apis.PacketApi.sendUploadForwardMsg([
            {
                groupId: 10001,
                senderId: 10001,
                senderName: "qwq",
                time: Math.floor(Date.now() / 1000),
                msg: [new PacketMsgTextElement({
                    textElement: {
                        content: "Love from Napcat.Packet~"
                    }
                } as SendTextElement)]
            },
            {
                groupId: 10001,
                senderId: 10001,
                senderName: "qwq",
                time: Math.floor(Date.now() / 1000),
                msg: [new PacketMsgTextElement({
                    textElement: {
                        content: "Nya~"
                    }
                } as SendTextElement), sendImg]
            }], 10001); // TODO: must be a valid group id
    }
}

import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import {PacketMsgTextElement} from "@/core/helper/packet/msg/element";
import {SendTextElement} from "@/core";


const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
    },
    required: ['group_id'],
}as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class UploadForwardMsg extends BaseAction<Payload, any> {
    actionName = ActionName.UploadForwardMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.packetClient?.isConnected) {
            throw new Error('PacketClient is not init');
        }
        throw new Error('Not implemented');
        // return await this.core.apis.PacketApi.sendUploadForwardMsg([{
        //     groupId: 0,
        //     senderId: 0,
        //     senderName: "NapCat",
        //     time: Math.floor(Date.now() / 1000),
        //     msg: [new PacketMsgTextElement({
        //         textElement: {
        //             content: "Nya~"
        //         }
        //     } as SendTextElement)]
        // }], 0);
    }
}

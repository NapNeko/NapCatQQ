import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { AIVoiceChatType } from "@/core/packet/entities/aiChat";
import { uri2local } from "@/common/file";
import { ChatType, Peer } from "@/core";

const SchemaData = {
    type: 'object',
    properties: {
        character: { type: ['string'] },
        group_id: { type: ['number', 'string'] },
        text: { type: 'string' },
    },
    required: ['character', 'group_id', 'text'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SendGroupAiRecord extends GetPacketStatusDepends<Payload, {
    message_id: number
}> {
    actionName = ActionName.SendGroupAiRecord;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const rawRsp = await this.core.apis.PacketApi.sendAiVoiceChatReq(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
        const url = await this.core.apis.PacketApi.sendGroupPttFileDownloadReq(+payload.group_id, rawRsp.msgInfoBody[0].index);
        const { path, fileName, errMsg, success } = (await uri2local(this.core.NapCatTempPath, url));
        if (!success) {
            throw new Error(errMsg);
        }
        const peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() } as Peer;
        const element = await this.core.apis.FileApi.createValidSendPttElement(path);
        const sendRes = await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, [element], [path]);
        return { message_id: sendRes.id ?? -1 };
    }
}

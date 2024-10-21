import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { FileNapCatOneBotUUID } from "@/common/helper";
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        file_id: { type: ['string'] },
    },
    required: ['group_id', 'file_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

interface GetGroupFileUrlResponse {
    url?: string;
}

export class GetGroupFileUrl extends GetPacketStatusDepends<Payload, GetGroupFileUrlResponse> {
    actionName = ActionName.GOCQHTTP_GetGroupFileUrl;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (contextMsgFile?.fileUUID) {
            return {
                url: await this.core.apis.PacketApi.sendGroupFileDownloadReq(+payload.group_id, contextMsgFile.fileUUID)
            };
        }
        throw new Error('real fileUUID not found!');
    }
}

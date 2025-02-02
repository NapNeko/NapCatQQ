import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

interface GetGroupFileUrlResponse {
    url?: string;
}

export class GetGroupFileUrl extends GetPacketStatusDepends<Payload, GetGroupFileUrlResponse> {
    override actionName = ActionName.GOCQHTTP_GetGroupFileUrl;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (contextMsgFile?.fileUUID) {
            return {
                url: await this.core.apis.PacketApi.pkt.operation.GetGroupFileUrl(+payload.group_id, contextMsgFile.fileUUID)
            };
        }
        throw new Error('real fileUUID not found!');
    }
}

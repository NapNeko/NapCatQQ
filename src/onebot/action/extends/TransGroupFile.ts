import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

interface TransGroupFileResponse {
    ok: boolean;
}

export class TransGroupFile extends GetPacketStatusDepends<Payload, TransGroupFileResponse> {
    override actionName = ActionName.TransGroupFile;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (contextMsgFile?.fileUUID) {
            const result = await this.core.apis.GroupApi.transGroupFile(payload.group_id.toString(), contextMsgFile.fileUUID);
            if (result.transGroupFileResult.result.retCode === 0) {
                return {
                    ok: true
                };
            }
            throw new Error(result.transGroupFileResult.result.retMsg);
        }
        throw new Error('real fileUUID not found!');
    }
}

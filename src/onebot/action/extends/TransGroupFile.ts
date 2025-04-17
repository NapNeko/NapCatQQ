import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { z } from 'zod';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    group_id: actionType.string(),
    file_id: actionType.string(),
});

type Payload = z.infer<typeof SchemaData>;

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

import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { z } from 'zod';
import { actionType } from '../type';
const SchemaData = z.object({
    group_id: actionType.string(),
    file_id: actionType.string(),
    current_parent_directory: actionType.string(),
    target_parent_directory: actionType.string(),
});

type Payload = z.infer<typeof SchemaData>;

interface MoveGroupFileResponse {
    ok: boolean;
}

export class MoveGroupFile extends GetPacketStatusDepends<Payload, MoveGroupFileResponse> {
    override actionName = ActionName.MoveGroupFile;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (contextMsgFile?.fileUUID) {
            await this.core.apis.PacketApi.pkt.operation.MoveGroupFile(+payload.group_id, contextMsgFile.fileUUID, payload.current_parent_directory, payload.target_parent_directory);
            return {
                ok: true,
            };
        }
        throw new Error('real fileUUID not found!');
    }
}

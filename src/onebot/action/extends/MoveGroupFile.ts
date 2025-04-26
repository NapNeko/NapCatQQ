import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
    current_parent_directory: Type.String(),
    target_parent_directory: Type.String(),
});

type Payload = Static<typeof SchemaData>;

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

import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
    current_parent_directory: Type.String(),
    new_name: Type.String(),
});

type Payload = Static<typeof SchemaData>;

interface RenameGroupFileResponse {
    ok: boolean;
}

export class RenameGroupFile extends GetPacketStatusDepends<Payload, RenameGroupFileResponse> {
    override actionName = ActionName.RenameGroupFile;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (contextMsgFile?.fileUUID) {
            await this.core.apis.PacketApi.pkt.operation.RenameGroupFile(+payload.group_id, contextMsgFile.fileUUID, payload.current_parent_directory, payload.new_name);
            return {
                ok: true,
            };
        }
        throw new Error('real fileUUID not found!');
    }
}


import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { Static, Type } from '@sinclair/typebox';
import { NTQQGroupApi } from '@/core/apis';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class DeleteGroupFile extends OneBotAction<Payload, Awaited<ReturnType<NTQQGroupApi['delGroupFile']>>> {
    override actionName = ActionName.GOCQHTTP_DeleteGroupFile;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const data = FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (!data || !data.fileId) throw new Error('Invalid file_id');
        return await this.core.apis.GroupApi.delGroupFile(payload.group_id.toString(), [data.fileId]);
    }
}

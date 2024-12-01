
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/helper';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class DeleteGroupFile extends OneBotAction<Payload, any> {
    actionName = ActionName.GOCQHTTP_DeleteGroupFile;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const data = FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (!data) throw new Error('Invalid file_id');
        return await this.core.apis.GroupApi.DelGroupFile(payload.group_id.toString(), [data.fileId]);
    }
}

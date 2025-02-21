import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NTQQGroupApi } from '@/core/apis';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    folder_id: Type.Optional(Type.String()),
    folder: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class DeleteGroupFileFolder extends OneBotAction<Payload, Awaited<ReturnType<NTQQGroupApi['delGroupFileFolder']>>['groupFileCommonResult']> {
    override actionName = ActionName.GoCQHTTP_DeleteGroupFileFolder;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.delGroupFileFolder(
            payload.group_id.toString(), payload.folder ?? payload.folder_id ?? '')).groupFileCommonResult;
    }
}

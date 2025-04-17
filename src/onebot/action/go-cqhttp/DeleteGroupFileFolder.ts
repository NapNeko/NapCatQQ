import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { z } from 'zod';
import { NTQQGroupApi } from '@/core/apis';
import { coerce } from '@/common/coerce';
const SchemaData = z.object({
    group_id: coerce.string(),
    folder_id: coerce.string().optional(),
    folder: coerce.string().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export class DeleteGroupFileFolder extends OneBotAction<Payload, Awaited<ReturnType<NTQQGroupApi['delGroupFileFolder']>>['groupFileCommonResult']> {
    override actionName = ActionName.GoCQHTTP_DeleteGroupFileFolder;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.delGroupFileFolder(
            payload.group_id.toString(), payload.folder ?? payload.folder_id ?? '')).groupFileCommonResult;
    }
}

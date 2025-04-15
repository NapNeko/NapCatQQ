import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { z } from 'zod';
import { NTQQGroupApi } from '@/core/apis';

const SchemaData = z.object({
    group_id: z.union([z.coerce.number(), z.coerce.string()]),
    folder_id: z.coerce.string().optional(),
    folder: z.coerce.string().optional(),
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

import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.coerce.number(), z.coerce.string()]),
    folder_name: z.coerce.string(),
});

type Payload = z.infer<typeof SchemaData>;
interface ResponseType{
    result:unknown;
    groupItem:unknown;
}
export class CreateGroupFileFolder extends  OneBotAction<Payload, ResponseType>  {
    override actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.creatGroupFileFolder(payload.group_id.toString(), payload.folder_name)).resultWithGroupItem;
    }
}

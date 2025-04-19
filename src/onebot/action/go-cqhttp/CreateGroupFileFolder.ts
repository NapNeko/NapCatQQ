import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    group_id: actionType.string(),
    folder_name: actionType.string(),
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

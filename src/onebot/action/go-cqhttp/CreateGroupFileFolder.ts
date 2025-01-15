import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    folder_name: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class CreateGroupFileFolder extends  OneBotAction<Payload, any>  {
    actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.creatGroupFileFolder(payload.group_id.toString(), payload.folder_name)).resultWithGroupItem;
    }
}

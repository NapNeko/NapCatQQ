import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    // 兼容gocq 与name二选一
    folder_name: Type.Optional(Type.String()),
    // 兼容gocq 与folder_name二选一
    name: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;
interface ResponseType{
    result:unknown;
    groupItem:unknown;
}
export class CreateGroupFileFolder extends  OneBotAction<Payload, ResponseType>  {
    override actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const folderName = payload.folder_name || payload.name;
        return (await this.core.apis.GroupApi.creatGroupFileFolder(payload.group_id.toString(), folderName!)).resultWithGroupItem;
    }
}

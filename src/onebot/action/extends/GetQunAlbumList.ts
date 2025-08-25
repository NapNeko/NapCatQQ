
import { NTQQWebApi } from '@/core/apis';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
const SchemaData = Type.Object({
    group_id: Type.String()
});

type Payload = Static<typeof SchemaData>;

export class GetQunAlbumList extends OneBotAction<Payload,Awaited<ReturnType<NTQQWebApi['getAlbumListByNTQQ']>>['response']['album_list']> {
    override actionName = ActionName.GetQunAlbumList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return (await this.core.apis.WebApi.getAlbumListByNTQQ(payload.group_id)).response.album_list;
    }
}

import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    album_id: Type.String(),
    attach_info: Type.String({ default: "" }),
});

type Payload = Static<typeof SchemaData>;

export class GetGroupAlbumMediaList extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetGroupAlbumMediaList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.WebApi.getAlbumMediaListByNTQQ(
            payload.group_id,
            payload.album_id,
            payload.attach_info
        );
    }
}

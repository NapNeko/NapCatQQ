import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    album_id: Type.String(),
    lloc: Type.String()
});

type Payload = Static<typeof SchemaData>;

export class DelGroupAlbumMedia extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.DelGroupAlbumMedia;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.WebApi.deleteAlbumMediaByNTQQ(
            payload.group_id,
            payload.album_id,
            payload.lloc
        );
    }
}

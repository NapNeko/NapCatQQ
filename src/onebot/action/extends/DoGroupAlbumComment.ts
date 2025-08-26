import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    album_id: Type.String(),
    lloc: Type.String(),
    content: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class DoGroupAlbumComment extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.DoGroupAlbumComment;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.WebApi.doAlbumMediaPlainCommentByNTQQ(
            payload.group_id,
            payload.album_id,
            payload.lloc,
            payload.content
        );
    }
}

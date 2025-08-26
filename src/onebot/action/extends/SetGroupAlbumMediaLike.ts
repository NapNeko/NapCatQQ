import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    album_id: Type.String(),
    lloc: Type.String(),
    id: Type.String(),//421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|V5bCgAxMDEyOTU5MjU3.PyqaPndPxg!^||^421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|17560363448^||^1
    set: Type.Boolean({default: true})//true=点赞 false=取消点赞 未实现
});

type Payload = Static<typeof SchemaData>;

export class SetGroupAlbumMediaLike extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.SetGroupAlbumMediaLike;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.WebApi.doAlbumMediaLikeByNTQQ(
            payload.group_id,
            payload.album_id,
            payload.lloc,
            payload.id
        );
    }
}

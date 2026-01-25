import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  lloc: Type.String({ description: '媒体ID (lloc)' }),
  id: Type.String({ description: '点赞ID' }), // 421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|V5bCgAxMDEyOTU5MjU3.PyqaPndPxg!^||^421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|17560363448^||^1
  set: Type.Boolean({ default: true, description: '是否点赞' }), // true=点赞 false=取消点赞 未实现
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetGroupAlbumMediaLike extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupAlbumMediaLike;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.WebApi.doAlbumMediaLikeByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.lloc,
      payload.id
    );
  }
}

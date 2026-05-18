import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  batch_id: Type.String({ description: 'batch_id' }),
  lloc: Type.Optional(Type.String({ description: 'lloc，若对整个上传操作则不填' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetGroupAlbumMediaLike extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupAlbumMediaLike;
  override actionSummary = '点赞群相册媒体';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id_123',
    batch_id: '112233',
    lloc: 'aabbcc12213123',
  };

  override returnExample = {
    result: {},
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.WebApi.doAlbumMediaLikeByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.batch_id,
      payload.lloc,
      true // isLike = true
    );
  }
}

export class CancelGroupAlbumMediaLike extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.CancelGroupAlbumMediaLike; // 注意：需要在 router/index.ts 的 ActionName 枚举中补充该定义
  override actionSummary = '取消点赞群相册媒体';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id',
    batch_id: '112233',
    lloc: 'aabbcc',
  };

  override returnExample = {
    result: {},
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.WebApi.doAlbumMediaLikeByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.batch_id,
      payload.lloc,
      false
    );
  }
}

import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  lloc: Type.String({ description: '媒体ID (lloc)' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '删除结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class DelGroupAlbumMedia extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.DelGroupAlbumMedia;
  override actionSummary = '删除群相册媒体';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id_1',
    lloc: 'media_id_1',
  };
  override returnExample = {
    result: {}
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.WebApi.deleteAlbumMediaByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.lloc
    );
  }
}

import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  attach_info: Type.String({ default: '', description: '附加信息（用于分页）' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '相册媒体列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupAlbumMediaList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupAlbumMediaList;
  override actionSummary = '获取群相册媒体列表';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_code: 123456,
    album_id: 'album_id_1'
  };
  override returnExample = {
    media_list: [
      { media_id: 'media_id_1', url: 'http://example.com/1.jpg' }
    ]
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.WebApi.getAlbumMediaListByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.attach_info
    );
  }
}

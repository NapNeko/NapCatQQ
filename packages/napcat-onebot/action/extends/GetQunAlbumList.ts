import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  attach_info: Type.Optional(Type.String({ default: '', description: '附加信息（用于分页，从上一次返回结果中获取）' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  album_list: Type.Array(Type.Any(), { description: '群相册列表' }),
  attach_info: Type.String({ description: '分页附加信息，传入下一次请求以获取更多数据' }),
  has_more: Type.Boolean({ description: '是否有更多数据' }),
}, { description: '群相册列表响应' });

type GetQunAlbumListReturn = Static<typeof ReturnSchema>;

export class GetQunAlbumList extends OneBotAction<PayloadType, GetQunAlbumListReturn> {
  override actionName = ActionName.GetQunAlbumList;
  override actionSummary = '获取群相册列表';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    attach_info: '',
  };

  override returnExample = {
    album_list: [
      {
        album_id: 'album_1',
        album_name: '测试相册',
        cover_url: 'http://example.com/cover.jpg',
        create_time: 1734567890,
      },
    ],
    attach_info: '',
    has_more: false,
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<GetQunAlbumListReturn> {
    const resp = (await this.core.apis.WebApi.getAlbumListByNTQQ(payload.group_id, payload.attach_info)).response;
    return {
      album_list: resp.album_list,
      attach_info: resp.attach_info,
      has_more: resp.has_more,
    };
  }
}

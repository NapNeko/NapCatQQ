import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  attach_info: Type.Optional(Type.String({ default: '', description: '附加信息（用于分页）' })),
});

type PayloadType = Static<typeof PayloadSchema>;

/** 相册媒体项（OneBot 标准格式） */
const MediaItemSchema = Type.Object({
  media_id: Type.String({ description: '媒体项ID' }),
  url: Type.String({ description: '媒体文件 URL' }),
  time: Type.Optional(Type.String({ description: '上传时间' })),
  uin: Type.Optional(Type.String({ description: '上传者 QQ 号' })),
}, { description: '相册媒体项' });

const ReturnSchema = Type.Object({
  media_list: Type.Array(MediaItemSchema, { description: '相册媒体列表' }),
  attach_info: Type.String({ description: '分页附加信息，传入下一次请求以获取更多数据' }),
  has_more: Type.Boolean({ description: '是否有更多数据' }),
}, { description: '群相册媒体列表响应' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupAlbumMediaList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupAlbumMediaList;
  override actionSummary = '获取群相册媒体列表';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id_1',
  };

  override returnExample = {
    media_list: [
      { media_id: 'media_id_1', url: 'https://example.com/photo.jpg', time: '1734567890', uin: '123456' },
    ],
    attach_info: '',
    has_more: false,
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const resp = (await this.core.apis.WebApi.getAlbumMediaListByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.attach_info
    )) as any;

    // 标准化响应格式，与 GetQunAlbumList 保持一致
    const feedList = (resp as any).feed_list || [];
    const mediaList = feedList.map((feed: any) => {
      const mediaItems = feed.cell_media?.media_items || [];
      // 取第一张图片的 URL，实际媒体 ID 逻辑需根据 QQ 服务端协议补充
      const firstItem = mediaItems[0];
      return {
        media_id: firstItem?.image?.lloc || '',
        url: firstItem?.image?.url || (firstItem?.image?.lloc ? `https://qun.qq.com/album/item?lloc=${firstItem.image.lloc}` : ''),
        time: feed.cell_common?.time || '',
        uin: feed.cell_user_info?.user?.uin || '',
      };
    });

    return {
      media_list: mediaList,
      attach_info: (resp as any).attach_info || '',
      has_more: (resp as any).has_more ?? false,
    };
  }
}

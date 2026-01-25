import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { NTQQWebApi } from 'napcat-core/apis';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Any(), { description: '群相册列表' });

type GetQunAlbumListReturn = Awaited<globalThis.ReturnType<NTQQWebApi['getAlbumListByNTQQ']>>['response']['album_list'];

export class GetQunAlbumList extends OneBotAction<PayloadType, GetQunAlbumListReturn> {
  override actionName = ActionName.GetQunAlbumList;
  override actionSummary = '获取群相册列表';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_code: 123456
  };
  override returnExample = {
    album_list: [
      { album_id: 'album_id_1', album_name: '相册1' }
    ]
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<GetQunAlbumListReturn> {
    return (await this.core.apis.WebApi.getAlbumListByNTQQ(payload.group_id)).response.album_list;
  }
}

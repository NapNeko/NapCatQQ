import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const DoGroupAlbumCommentPayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册 ID' }),
  lloc: Type.String({ description: '图片 ID' }),
  content: Type.String({ description: '评论内容' }),
});

export type DoGroupAlbumCommentPayload = Static<typeof DoGroupAlbumCommentPayloadSchema>;

export class DoGroupAlbumComment extends OneBotAction<DoGroupAlbumCommentPayload, any> {
  override actionName = ActionName.DoGroupAlbumComment;
  override actionSummary = '发表群相册评论';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_code: 123456,
    media_id: 'media_id_1',
    content: '很有意思'
  };
  override returnExample = {
    result: true
  };
  override payloadSchema = DoGroupAlbumCommentPayloadSchema;
  override returnSchema = Type.Any({ description: '评论结果' });

  async _handle (payload: DoGroupAlbumCommentPayload) {
    return await this.core.apis.WebApi.doAlbumMediaPlainCommentByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.lloc,
      payload.content
    );
  }
}

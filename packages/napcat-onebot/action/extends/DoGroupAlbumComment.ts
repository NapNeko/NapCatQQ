import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const DoGroupAlbumCommentPayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册 ID' }),
  lloc: Type.Optional(Type.String({ description: '图片 ID；不传或为空时评论整个上传批次，此时必须提供 batch_id' })),
  batch_id: Type.Optional(Type.String({ description: '上传批次 ID，可取自 get_group_album_media_list 返回的 batch.link_id 或 media[].batch_id' })),
  content: Type.String({ description: '评论内容' }),
});

export type DoGroupAlbumCommentPayload = Static<typeof DoGroupAlbumCommentPayloadSchema>;

export class DoGroupAlbumComment extends OneBotAction<DoGroupAlbumCommentPayload, any> {
  override actionName = ActionName.DoGroupAlbumComment;
  override actionSummary = '发表群相册评论';
  override actionDescription = 'lloc 与 batch_id 至少提供一项。传入 lloc 时评论单张图片；仅传 batch_id 时评论整个上传批次。';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id_1',
    batch_id: '2147483658',
    content: '很有意思',
  };

  override returnExample = {
    result: {},
  };

  override payloadSchema = DoGroupAlbumCommentPayloadSchema;
  override returnSchema = Type.Any({ description: '评论结果' });

  protected override async check (payload: DoGroupAlbumCommentPayload): Promise<BaseCheckResult> {
    const result = await super.check(payload);
    if (!result.valid) return result;
    if (!payload.lloc && !payload.batch_id) {
      return { valid: false, message: 'lloc 或 batch_id 至少需要提供一个' };
    }
    return { valid: true };
  }

  async _handle (payload: DoGroupAlbumCommentPayload) {
    return await this.core.apis.WebApi.doAlbumMediaPlainCommentByNTQQ(
      payload.group_id,
      payload.album_id,
      payload.lloc,
      payload.content,
      payload.batch_id
    );
  }
}

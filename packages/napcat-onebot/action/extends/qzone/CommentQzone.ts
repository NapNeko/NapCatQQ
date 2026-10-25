import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneComment } from '@/napcat-core/data/qzone-rpc';
import type { SlQzoneCommentOptions, SlQzoneCommentResult } from '@/napcat-core/data/qzone-snowluma';
import { uriToLocalFile } from 'napcat-common/src/file';
import { readFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { QzoneCommentSchema, QzoneFeedReferenceSchema, QzoneParentCommentSchema, QzoneUserSchema } from './common';
import { normalizeQzoneCommentPayload, SlQzoneCommentReturnSchema, SlQzoneIdentitySchema, SlQzoneImagesSchema, SlQzoneTextSchema, SlQzoneUinSchema } from './common-snowluma';

export const CommentQzonePayloadSchema = Type.Object({
  feed_ref: Type.Optional(QzoneFeedReferenceSchema),
  tid: Type.Optional(SlQzoneIdentitySchema),
  target_uin: Type.Optional(SlQzoneUinSchema),
  content: SlQzoneTextSchema,
  comment: Type.Optional(QzoneParentCommentSchema),
  reply_user: Type.Optional(QzoneUserSchema),
  comment_id: Type.Optional(SlQzoneIdentitySchema),
  comment_uin: Type.Optional(SlQzoneUinSchema),
  reply_uin: Type.Optional(SlQzoneUinSchema),
  reply_name: Type.Optional(SlQzoneTextSchema),
  images: SlQzoneImagesSchema,
}, { additionalProperties: Type.Unknown() });
export type CommentQzonePayload = Static<typeof CommentQzonePayloadSchema>;

const NativeReturnSchema = Type.Object({
  comment_id: Type.String({ description: '新评论或回复 ID' }),
  comment: QzoneCommentSchema,
});

type ReturnType = { comment_id: string; comment: QzoneComment; } | SlQzoneCommentResult;

export class CommentQzone extends OneBotAction<CommentQzonePayload, ReturnType> {
  override actionName = ActionName.CommentQzone;
  override actionSummary = '评论QQ空间说说';
  override actionDescription = '传 tid 使用 SnowLuma 参数，一级评论支持 images；回复须成对提供 comment_id/comment_uin，指定接收者时还需 reply_uin/reply_name，楼中楼仅文字。传 feed_ref 则保留原 comment/reply_user 方式及原始结果；两种参数不能混用。';
  override actionTags = ['扩展接口'];
  override payloadExample = { tid: 'sample-post', target_uin: '10002', content: '很有意思' };
  override returnExample = { comment_id: 'sample-comment' };

  override payloadSchema = CommentQzonePayloadSchema;
  override returnSchema = Type.Union([SlQzoneCommentReturnSchema, NativeReturnSchema]);

  protected override async check (payload: CommentQzonePayload): Promise<BaseCheckResult> {
    try { normalizeQzoneCommentPayload(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: CommentQzonePayload): Promise<ReturnType> {
    const normalized = normalizeQzoneCommentPayload(payload);
    if (normalized.format === 'native') {
      return await this.core.apis.QzoneApi.comment(normalized.reference, normalized.content, normalized.comment, normalized.replyUser);
    }
    const originalAccount = normalized.images?.length
      ? { uin: this.core.selfInfo?.uin, uid: this.core.selfInfo?.uid }
      : undefined;
    if (originalAccount && (!originalAccount.uin || !originalAccount.uid)) throw new Error('QQ空间图片评论需要已登录的当前账号');
    const assertAccount = () => {
      if (originalAccount && (this.core.selfInfo?.uin !== originalAccount.uin || this.core.selfInfo?.uid !== originalAccount.uid)) {
        throw new Error('QQ账号已切换，图片评论已停止，请重新确认后操作');
      }
    };
    const cleanupPaths: string[] = [];
    const urls: string[] = [];
    try {
      for (const [index, source] of (normalized.images ?? []).entries()) {
        const image = await uriToLocalFile(this.core.NapCatTempPath, source);
        if (!image.success) throw new Error(`第${index + 1}张图片处理失败，${image.errMsg}`);
        if (!image.isLocal) cleanupPaths.push(image.path);
        assertAccount();
        const upload = await this.core.apis.QzoneApi.uploadCommentImage(readFileSync(image.path).toString('base64'));
        assertAccount();
        let url: URL;
        try { url = new URL(upload.url); } catch { throw new Error(`第${index + 1}张图片上传未返回有效地址`); }
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || upload.url.length > 8192 || upload.url.trim() !== upload.url || /[\t\r\n]/.test(upload.url)) {
          throw new Error(`第${index + 1}张图片上传未返回有效地址`);
        }
        urls.push(upload.url);
      }
      const options: SlQzoneCommentOptions | undefined = urls.length
        ? { ...normalized.options, imageUrls: urls }
        : normalized.options;
      assertAccount();
      return await this.core.apis.QzoneApi.commentSnowluma(normalized.tid, normalized.content, normalized.targetUin, options);
    } finally {
      for (const path of cleanupPaths) await unlink(path).catch(() => { });
    }
  }
}

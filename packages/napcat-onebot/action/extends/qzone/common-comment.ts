import { Type } from '@sinclair/typebox';
import { Buffer } from 'node:buffer';
import { QZONE_REFERENCE_MAX_BYTES, validateQzoneFeedReference } from '@/napcat-core/data/qzone-rpc';
import { QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';

const NullableString = Type.Union([Type.String(), Type.Null()]);
const NullableNumber = Type.Union([Type.Number(), Type.Null()]);
const NullableBoolean = Type.Union([Type.Boolean(), Type.Null()]);
const RawObject = Type.Record(Type.String(), Type.Unknown());

export const QzoneReadParentCommentSchema = Type.Object({
  id: Type.Union([
    Type.String({ minLength: 1, maxLength: 8192 }),
    Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }),
  ], { description: '原始父评论 ID，字符串或安全整数，0 是有效 ID' }),
  user: Type.Optional(RawObject),
}, { additionalProperties: Type.Unknown(), description: '原样传回读取结果中的完整 comment 对象；整体不得超过64KiB' });

export const QzoneReplyItemSchema = Type.Object({
  reply_id: NullableString,
  user_id: NullableString,
  uid: NullableString,
  nickname: NullableString,
  time: NullableNumber,
  content: NullableString,
  images: Type.Union([Type.Array(Type.String()), Type.Null()]),
  like_count: NullableNumber,
  liked: NullableBoolean,
  target_user_id: NullableString,
  target_uid: NullableString,
  target_nickname: NullableString,
  reply: RawObject,
}, { description: '楼中楼回复；未知字段为 null，完整原始对象保留在 reply' });

export const QzoneCommentItemSchema = Type.Object({
  comment_id: NullableString,
  user_id: NullableString,
  uid: NullableString,
  nickname: NullableString,
  time: NullableNumber,
  content: NullableString,
  images: Type.Union([Type.Array(Type.String()), Type.Null()]),
  like_count: NullableNumber,
  liked: NullableBoolean,
  reply_num: NullableNumber,
  has_more_replies: NullableBoolean,
  replies: Type.Array(QzoneReplyItemSchema),
  comment: RawObject,
}, { description: '评论及其内联回复；replies 为空不代表没有尚未读取的历史回复' });

export const QzoneCommentPageSchema = Type.Object({
  feed_ref: QzoneFeedReferenceSchema,
  comment_num: NullableNumber,
  comments: Type.Array(QzoneCommentItemSchema),
  has_more: Type.Boolean(),
  next_cursor: NullableString,
  raw: RawObject,
}, { description: '一页评论；续页时原样传回本页 feed_ref 和 next_cursor' });

export const QzoneReplyPageSchema = Type.Object({
  feed_ref: QzoneFeedReferenceSchema,
  comment_id: Type.String(),
  replies: Type.Array(QzoneReplyItemSchema),
  reply_num: NullableNumber,
  has_more: Type.Boolean(),
  next_cursor: NullableString,
  raw: RawObject,
}, { description: '一页追加楼中楼回复；与父评论内联 replys 按 ID 合并，不代表完整历史' });

function record (value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function validateQzoneCommentReadPayload (payload: unknown, withParent: boolean): void {
  const allowed = withParent ? ['feed_ref', 'comment', 'cursor'] : ['feed_ref', 'cursor'];
  if (!record(payload) || Object.keys(payload).some(key => !allowed.includes(key))) throw new Error('QQ空间评论读取参数无效');
  validateQzoneFeedReference(payload['feed_ref']);
  const cursor = payload['cursor'];
  if (cursor !== undefined && (typeof cursor !== 'string' || !cursor || cursor.length > 16384)) throw new Error('QQ空间评论游标无效');
  if (!withParent) return;
  const comment = payload['comment'];
  if (!record(comment)) throw new Error('请提供读取结果中的完整父评论 comment');
  const id = comment['id'];
  if ((typeof id !== 'string' || !id.trim() || id.length > 8192) &&
    (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 0)) {
    throw new Error('父评论 ID 必须为非空字符串或安全的非负整数');
  }
  if (comment['user'] !== undefined && !record(comment['user'])) throw new Error('父评论 user 必须为原始JSON对象');
  let serialized: string;
  try {
    serialized = JSON.stringify(comment);
  } catch {
    throw new Error('父评论必须为可序列化的JSON对象');
  }
  if (Buffer.byteLength(serialized) > QZONE_REFERENCE_MAX_BYTES) throw new Error('父评论不能超过64KiB');
}

export const QzoneReadParentCommentExample = {
  id: 0,
  user: { uid: 'u_commenter', uin: '', nick: '评论作者', portrait: 'https://example.com/avatar.png' },
  time: 1792926000,
  content: [{ type: 0, content: '很有意思' }],
  media_items: [],
  like: { id: 'comment-like-key', count: 2, status: 1 },
  reply_num: 1,
  has_more_reply: true,
  replys: [],
  reply_attach_info: 'server-reply-pointer',
};

export const QzoneCommentPageExample = {
  feed_ref: QzoneFeedReferenceExample,
  comment_num: 1,
  comments: [{
    comment_id: '0',
    user_id: null,
    uid: 'u_commenter',
    nickname: '评论作者',
    time: 1792926000,
    content: '很有意思',
    images: [],
    like_count: 2,
    liked: true,
    reply_num: 1,
    has_more_replies: true,
    replies: [],
    comment: QzoneReadParentCommentExample,
  }],
  has_more: false,
  next_cursor: null,
  raw: { cell_comment: { num: 1, comments: [QzoneReadParentCommentExample] }, has_more: false },
};

const ReplyExample = {
  id: 'reply-1',
  user: { uid: 'u_commenter', nick: '回复作者' },
  target_user: { uin: '10001', uid: 'u_self', nick: 'Qiao' },
  time: 1792926001,
  content: [{ type: 0, content: '谢谢' }],
};

export const QzoneReplyPageExample = {
  feed_ref: QzoneFeedReferenceExample,
  comment_id: '0',
  replies: [{
    reply_id: 'reply-1',
    user_id: null,
    uid: 'u_commenter',
    nickname: '回复作者',
    time: 1792926001,
    content: '谢谢',
    images: null,
    like_count: null,
    liked: null,
    target_user_id: '10001',
    target_uid: 'u_self',
    target_nickname: 'Qiao',
    reply: ReplyExample,
  }],
  reply_num: 1,
  has_more: false,
  next_cursor: null,
  raw: { replys: [ReplyExample], has_more: false, reply_attach_info: '' },
};

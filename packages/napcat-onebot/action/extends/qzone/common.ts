import { Type } from '@sinclair/typebox';

const NullableString = Type.Union([Type.String(), Type.Null()]);
const NullableNumber = Type.Union([Type.Number(), Type.Null()]);
const RawObject = Type.Record(Type.String(), Type.Unknown());

export const QzoneCursorSchema = Type.Optional(Type.String({
  minLength: 1,
  maxLength: 16384,
  description: '上一页返回的 next_cursor；不传时读取第一页，游标不能跨账号或查询使用',
}));

export const QzoneUserSchema = Type.Object({
  uin: Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20, description: 'QQ 号' }),
  uid: Type.Optional(Type.String({ maxLength: 256, description: 'QQ UID；部分空间用户返回空字符串' })),
  nick: Type.Optional(Type.String({ maxLength: 256, description: '昵称' })),
}, { additionalProperties: Type.Unknown() });

export const QzoneUnionIdSchema = Type.Object({
  uf_key: Type.Optional(Type.String({ maxLength: 8192 })),
  ugc_id: Type.Optional(Type.String({ maxLength: 8192 })),
  feed_id: Type.Optional(Type.String({ maxLength: 8192 })),
  ext_ids: Type.Optional(Type.Array(RawObject)),
  serialized_data: Type.Optional(Type.String({ maxLength: 8192 })),
}, { minProperties: 1, additionalProperties: Type.Unknown(), description: '读取结果中的完整动态身份，不要由 tid 拼造' });

export const QzoneFeedReferenceSchema = Type.Object({
  union_id: QzoneUnionIdSchema,
  cell_feed_transfer: Type.Optional(Type.Unknown()),
  feed_action_domain_type: Type.Optional(Type.Integer({ minimum: 1, maximum: 3 })),
  like_key: Type.Optional(Type.String({ minLength: 1, maxLength: 8192 })),
}, {
  additionalProperties: false,
  description: '原样传回列表或详情返回的 feed_ref；整体不得超过 64 KiB',
});

export const QzoneCommentSchema = Type.Object({
  id: Type.Optional(Type.String()),
  user: Type.Optional(QzoneUserSchema),
  content: Type.Optional(Type.Array(RawObject)),
}, { additionalProperties: Type.Unknown(), description: '空间返回的完整评论或回复对象，保留未知字段' });

export const QzoneParentCommentSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 8192, description: '父评论 ID' }),
  user: QzoneUserSchema,
}, { additionalProperties: Type.Unknown(), description: '从详情 comments 中取得的完整父评论对象' });

export const QzoneFeedItemSchema = Type.Object({
  tid: NullableString,
  user_id: NullableString,
  content: NullableString,
  time: NullableNumber,
  comment_num: NullableNumber,
  like_num: NullableNumber,
  images: Type.Union([Type.Array(Type.String()), Type.Null()]),
  feed_ref: Type.Union([QzoneFeedReferenceSchema, Type.Null()]),
  feed: RawObject,
}, { description: '空间动态；无法确定的字段为 null，完整原始数据保留在 feed' });

export const QzoneFeedsReturnSchema = Type.Object({
  feeds: Type.Array(QzoneFeedItemSchema),
  has_more: Type.Boolean(),
  next_cursor: NullableString,
});

export const QzoneMsgListReturnSchema = Type.Object({
  msglist: Type.Array(QzoneFeedItemSchema),
  has_more: Type.Boolean(),
  next_cursor: NullableString,
  seal_off_memory: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: '空间返回的封存状态，按原始字段保留' })),
});

export const QzoneDetailReturnSchema = Type.Composite([
  QzoneFeedItemSchema,
  Type.Object({ comments: Type.Array(QzoneCommentSchema) }),
]);

export const QzoneFeedReferenceExample = {
  union_id: { uf_key: 'feed-key', ugc_id: 'shuoshuo-tid', feed_id: 'feed-id' },
  feed_action_domain_type: 1,
  like_key: 'like-key',
};

export const QzoneFeedItemExample = {
  tid: 'shuoshuo-tid',
  user_id: '10001',
  content: '今天天气不错',
  time: 1792926000,
  comment_num: 0,
  like_num: 0,
  images: null,
  feed_ref: QzoneFeedReferenceExample,
  feed: {
    cell_common: { union_id: QzoneFeedReferenceExample.union_id, time: 1792926000, feed_type: 1, feed_sub_type: 1, cur_like_key: 'like-key' },
    cell_user_info: { user: { uin: '10001' } },
    cell_summary: { summary: [{ type: 0, content: '今天天气不错' }] },
  },
};

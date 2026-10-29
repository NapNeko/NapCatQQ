import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import {
  validateQzoneFeedReference,
  type QzoneComment,
  type QzoneFeedReference,
  type QzoneUser,
} from '@/napcat-core/data/qzone-rpc';
import type { SlQzoneCommentOptions } from '@/napcat-core/data/qzone-snowluma';
import { QzoneParentCommentSchema, QzoneUserSchema } from './common';

export const QzoneFormatSchema = Type.Optional(Type.Union([Type.Literal('snowluma'), Type.Literal('native')], {
  description: '默认 snowluma；native 保留原来的 H5 列表格式',
}));
export const SlQzoneUinSchema = Type.Union([
  Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20 }),
  Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
]);
export const SlQzoneIdentitySchema = Type.Union([
  Type.String({ minLength: 1, maxLength: 8192 }),
  Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }),
]);
export const SlQzoneIntegerSchema = Type.Union([Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }), Type.String({ minLength: 1, maxLength: 128 })]);
export const SlQzoneTextSchema = Type.Union([Type.String(), Type.Number(), Type.Boolean()]);
export const SlQzoneCursorSchema = Type.Optional(Type.String({ minLength: 1, maxLength: 65536 }));
export const SlQzoneImagesSchema = Type.Optional(Type.Array(Type.String({ minLength: 1 }), {
  description: '图片来源数组，支持 file://、HTTP(S)、base64://；仅一级评论支持图片',
}));

export const SlQzoneEmotionSchema = Type.Object({
  tid: Type.String(), content: Type.String(), time: Type.Integer(), comment_num: Type.Integer(), is_private: Type.Boolean(), images: Type.Array(Type.String()),
});
export const SlQzoneMsgListReturnSchema = Type.Object({
  total: Type.Integer(), msglist: Type.Array(SlQzoneEmotionSchema), total_known: Type.Optional(Type.Boolean()),
});

const SlCommentFields = {
  uin: Type.Integer(), name: Type.String(), time: Type.Integer(), content: Type.String(), comment_id: Type.String(),
};
export const SlQzoneReplySchema = Type.Object({
  ...SlCommentFields, parent_comment_id: Type.String(), parent_comment_uin: Type.Integer(),
});
export const SlQzoneCommentSchema = Type.Object({ ...SlCommentFields, replies: Type.Array(SlQzoneReplySchema) });
export const SlQzoneMsgDetailReturnSchema = Type.Object({
  tid: Type.String(), content: Type.String(), comment_num: Type.Integer(), comments: Type.Array(SlQzoneCommentSchema),
});
const NullableString = Type.Union([Type.String(), Type.Null()]);
const NullableNumber = Type.Union([Type.Integer(), Type.Null()]);
export const SlQzoneFeedSchema = Type.Object({
  uin: Type.Integer(),
  nickname: Type.String(),
  time: Type.Integer(),
  appid: Type.Integer(),
  key: Type.String(),
  html: Type.String(),
  tid: NullableString,
  content: NullableString,
  content_complete: Type.Union([Type.Boolean(), Type.Null()]),
  images: Type.Union([Type.Array(Type.String()), Type.Null()]),
  like_count: NullableNumber,
  comment_count: NullableNumber,
});
export const SlQzoneFeedsReturnSchema = Type.Object({
  feeds: Type.Array(SlQzoneFeedSchema), has_more: Type.Boolean(), next_cursor: NullableString,
});
export const SlQzoneCommentReturnSchema = Type.Object({
  comment_id: Type.String(), parent_comment_id: Type.Optional(Type.String()), parent_comment_uin: Type.Optional(Type.Integer()),
});

const KNOWN_FIELDS = new Set([
  'format', 'feed_ref', 'tid', 'target_uin', 'pos', 'num', 'page_num', 'count', 'cursor', 'abstime',
  'comment', 'reply_user', 'comment_id', 'comment_uin', 'reply_uin', 'reply_name', 'images', 'content',
  'ugc_right', 'target_uins', 'user_id', 'enable', 'name', 'description',
]);

export function qzonePayload (value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('QQ空间参数必须为对象');
  return value as Record<string, unknown>;
}

export function checkQzoneFields (payload: Record<string, unknown>, allowed: string[], native: boolean): void {
  for (const key of Object.keys(payload)) {
    if (allowed.includes(key) || payload[key] === undefined) continue;
    if (native || KNOWN_FIELDS.has(key)) throw new Error(`当前QQ空间调用不支持 ${key} 参数`);
  }
}

export function qzoneInteger (value: unknown, name: string, fallback: number, minimum: number, maximum = Number.MAX_SAFE_INTEGER): number {
  if (value === undefined) return fallback;
  if ((typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && (!value.trim() || value.length > 128))) throw new Error(`${name} 必须为整数`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) throw new Error(`${name} 超出允许范围`);
  return number;
}

export function qzoneUin (value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number' && (!Number.isSafeInteger(value) || value <= 0)) throw new Error(`${name} 必须为有效QQ号`);
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9][0-9]{0,19}$/.test(String(value))) throw new Error(`${name} 必须为有效QQ号`);
  return String(value);
}

export function qzoneIdentity (value: unknown, name: string): string {
  if (typeof value === 'number' && (!Number.isSafeInteger(value) || value < 0)) throw new Error(`${name} 必须为有效标识`);
  if ((typeof value !== 'string' && typeof value !== 'number') || !String(value).trim() || String(value).length > 8192) throw new Error(`${name} 必须为有效标识`);
  for (const character of String(value)) {
    if (character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) throw new Error(`${name} 必须为有效标识`);
  }
  return String(value);
}

export function qzoneText (value: unknown, name: string): string {
  if ((typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') || (typeof value === 'number' && !Number.isFinite(value))) {
    throw new Error(`${name} 必须为文本或有限标量`);
  }
  const text = String(value);
  if (!text.length) throw new Error(`${name} 不能为空`);
  return text;
}

export function qzoneImages (value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) throw new Error('images 必须为非空图片来源字符串数组');
  return value as string[];
}

export function qzoneBoolean (value: unknown, fallback = true): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === 0) return value === 1;
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(text)) return true;
    if (['false', '0', 'no', 'off'].includes(text)) return false;
  }
  throw new Error('enable 必须为有效布尔值');
}

function format (value: unknown): 'native' | 'snowluma' | undefined {
  if (value === undefined) return undefined;
  if (value !== 'native' && value !== 'snowluma') throw new Error('format 仅支持 snowluma 或 native');
  return value;
}

function cursor (value: unknown, maximum: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value || value.length > maximum) throw new Error('QQ空间游标无效');
  return value;
}

export function normalizeQzoneFeedsPayload (value: unknown) {
  const payload = qzonePayload(value);
  const pointer = cursor(payload['cursor'], 65536);
  const explicit = format(payload['format']);
  const selected = explicit ?? (pointer !== undefined && !pointer.startsWith('slqf:') ? 'native' : 'snowluma');
  if (selected === 'native') {
    checkQzoneFields(payload, ['format', 'cursor'], true);
    if (pointer?.startsWith('slqf:')) throw new Error('SnowLuma游标不能用于 native 格式');
    return { format: selected, cursor: cursor(pointer, 16384) } as const;
  }
  checkQzoneFields(payload, ['format', 'page_num', 'count', 'cursor'], false);
  if (pointer !== undefined && !pointer.startsWith('slqf:')) throw new Error('native 游标不能用于 SnowLuma 格式');
  return {
    format: selected,
    pageNum: qzoneInteger(payload['page_num'], 'page_num', 1, 1),
    count: qzoneInteger(payload['count'], 'count', 10, 1, 50),
    cursor: pointer,
  } as const;
}

export function normalizeQzoneListPayload (value: unknown) {
  const payload = qzonePayload(value);
  const pointer = cursor(payload['cursor'], 16384);
  const selected = format(payload['format']) ?? (pointer !== undefined ? 'native' : 'snowluma');
  const targetUin = qzoneUin(payload['target_uin'], 'target_uin');
  if (selected === 'native') {
    checkQzoneFields(payload, ['format', 'target_uin', 'cursor'], true);
    if (pointer?.startsWith('slqf:')) throw new Error('好友动态游标不能用于说说列表');
    return { format: selected, targetUin, cursor: pointer } as const;
  }
  checkQzoneFields(payload, ['format', 'target_uin', 'pos', 'num'], false);
  return {
    format: selected,
    targetUin,
    pos: qzoneInteger(payload['pos'], 'pos', 0, 0),
    num: qzoneInteger(payload['num'], 'num', 20, 1, 100),
  } as const;
}

export function normalizeQzoneDetailPayload (value: unknown) {
  const payload = qzonePayload(value);
  if (payload['feed_ref'] !== undefined) {
    checkQzoneFields(payload, ['feed_ref'], true);
    return { format: 'native', reference: validateQzoneFeedReference(payload['feed_ref']) } as const;
  }
  checkQzoneFields(payload, ['tid', 'target_uin', 'pos', 'num'], false);
  return {
    format: 'snowluma',
    tid: qzoneIdentity(payload['tid'], 'tid'),
    targetUin: qzoneUin(payload['target_uin'], 'target_uin'),
    pos: qzoneInteger(payload['pos'], 'pos', 0, 0),
    num: qzoneInteger(payload['num'], 'num', 20, 1, 100),
  } as const;
}

export function normalizeQzoneLikePayload (value: unknown) {
  const payload = qzonePayload(value);
  if (payload['feed_ref'] !== undefined) {
    checkQzoneFields(payload, ['feed_ref'], true);
    return { format: 'native', reference: validateQzoneFeedReference(payload['feed_ref']) } as const;
  }
  checkQzoneFields(payload, ['tid', 'target_uin', 'abstime'], false);
  return {
    format: 'snowluma',
    tid: qzoneIdentity(payload['tid'], 'tid'),
    targetUin: qzoneUin(payload['target_uin'], 'target_uin'),
    abstime: qzoneInteger(payload['abstime'], 'abstime', 0, 0),
  } as const;
}

function nativeComment (payload: Record<string, unknown>): { format: 'native'; reference: QzoneFeedReference; content: string; comment?: QzoneComment; replyUser?: QzoneUser; } {
  checkQzoneFields(payload, ['feed_ref', 'content', 'comment', 'reply_user'], true);
  const reference = validateQzoneFeedReference(payload['feed_ref']);
  if (typeof payload['content'] !== 'string' || !payload['content'].trim() || payload['content'].length > 2000) throw new Error('native 评论正文必须为2000字以内的非空文本');
  const parent = payload['comment'];
  const target = payload['reply_user'];
  if (parent !== undefined) {
    if (!Value.Check(QzoneParentCommentSchema, parent)) throw new Error('请提供符合写接口约束的完整父评论');
    let size: number;
    try { size = Buffer.byteLength(JSON.stringify(parent)); } catch { throw new Error('父评论必须为JSON对象'); }
    if (size > 64 * 1024) throw new Error('父评论不能超过64KiB');
  }
  if (target !== undefined && (!Value.Check(QzoneUserSchema, target) || parent === undefined)) throw new Error('reply_user 必须与有效父评论一起提供');
  return { format: 'native', reference, content: payload['content'], comment: parent as QzoneComment | undefined, replyUser: target as QzoneUser | undefined };
}

export function normalizeQzoneCommentPayload (value: unknown) {
  const payload = qzonePayload(value);
  if (payload['feed_ref'] !== undefined) return nativeComment(payload);
  checkQzoneFields(payload, ['tid', 'target_uin', 'content', 'images', 'comment_id', 'comment_uin', 'reply_uin', 'reply_name'], false);
  const tid = qzoneIdentity(payload['tid'], 'tid');
  const content = qzoneText(payload['content'], 'content');
  const targetUin = qzoneUin(payload['target_uin'], 'target_uin');
  const images = qzoneImages(payload['images']);
  const hasParent = payload['comment_id'] !== undefined;
  const hasParentUin = payload['comment_uin'] !== undefined;
  const hasRecipient = payload['reply_uin'] !== undefined;
  const hasRecipientName = payload['reply_name'] !== undefined;
  if (hasParent !== hasParentUin) throw new Error('comment_id 和 comment_uin 必须同时提供');
  if (hasRecipient !== hasRecipientName) throw new Error('reply_uin 和 reply_name 必须同时提供');
  if (hasRecipient && !hasParent) throw new Error('指定回复目标时必须提供父评论');
  if (hasParent && images?.length) throw new Error('楼中楼回复不支持图片');
  const options: SlQzoneCommentOptions = {};
  if (hasParent) {
    options.comment_id = qzoneIdentity(payload['comment_id'], 'comment_id');
    options.comment_uin = qzoneUin(payload['comment_uin'], 'comment_uin');
    if (!Number.isSafeInteger(Number(options.comment_uin))) throw new Error('comment_uin 超出回复结果可安全表示的范围');
    if (!content.trim()) throw new Error('回复正文不能为空白');
  }
  if (hasRecipient) {
    options.reply_uin = qzoneUin(payload['reply_uin'], 'reply_uin');
    if (!Number.isSafeInteger(Number(options.reply_uin))) throw new Error('reply_uin 超出回复结果可安全表示的范围');
    options.reply_name = qzoneText(payload['reply_name'], 'reply_name');
    if (!options.reply_name.trim() || options.reply_name.length > 8192) throw new Error('reply_name 必须为8192字以内的非空昵称');
  }
  return { format: 'snowluma', tid, content, targetUin, images, options: Object.keys(options).length ? options : undefined } as const;
}

export const SlQzoneMsgListExample = {
  total: 1,
  total_known: true,
  msglist: [{ tid: 'sample-post', content: '今天拍到了晚霞', time: 1700000000, comment_num: 0, is_private: false, images: [] }],
};
export const SlQzoneMsgDetailExample = { tid: 'sample-post', content: '今天拍到了晚霞', comment_num: 0, comments: [] };
export const SlQzoneFeedsExample = {
  feeds: [{ uin: 10002, nickname: '好友', time: 1700000000, appid: 311, key: 'sample-feed', html: '<div>今天拍到了晚霞</div>', tid: 'sample-post', content: '今天拍到了晚霞', content_complete: true, images: [], like_count: 0, comment_count: 0 }],
  has_more: false,
  next_cursor: null,
};

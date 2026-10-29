import {
  normalizeQzoneMediaImages,
  normalizeQzoneRichContent,
  type QzoneComment,
  type QzoneFeedReference,
} from './qzone-rpc';

export interface QzoneReplyItem {
  reply_id: string | null;
  user_id: string | null;
  uid: string | null;
  nickname: string | null;
  time: number | null;
  content: string | null;
  images: string[] | null;
  like_count: number | null;
  liked: boolean | null;
  target_user_id: string | null;
  target_uid: string | null;
  target_nickname: string | null;
  reply: QzoneComment;
}

export interface QzoneCommentItem {
  comment_id: string | null;
  user_id: string | null;
  uid: string | null;
  nickname: string | null;
  time: number | null;
  content: string | null;
  images: string[] | null;
  like_count: number | null;
  liked: boolean | null;
  reply_num: number | null;
  has_more_replies: boolean | null;
  replies: QzoneReplyItem[];
  comment: QzoneComment;
}

export interface QzoneCommentPage {
  feed_ref: QzoneFeedReference;
  comment_num: number | null;
  comments: QzoneCommentItem[];
  has_more: boolean;
  next_cursor: string | null;
  raw: Record<string, unknown>;
}

export interface QzoneReplyPage {
  feed_ref: QzoneFeedReference;
  comment_id: string;
  replies: QzoneReplyItem[];
  reply_num: number | null;
  has_more: boolean;
  next_cursor: string | null;
  raw: Record<string, unknown>;
}

function object (value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : undefined;
}

function identifier (value: unknown): string | null {
  if (typeof value === 'string') return value.trim().length > 0 && value.length <= 8192 ? value : null;
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
}

function userId (value: unknown): string | null {
  if (typeof value === 'string' && /^\d+$/.test(value) && /[1-9]/.test(value)) return value;
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? String(value) : null;
}

function count (value: unknown): number | null {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
  const result = Number(value);
  return Number.isSafeInteger(result) && result >= 0 ? result : null;
}

function nickname (value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function likeState (value: unknown): boolean | null {
  return value === 1 ? true : value === 0 ? false : null;
}

function author (value: unknown): { user_id: string | null; uid: string | null; nickname: string | null; } {
  const user = object(value);
  const uid = user?.['uid'];
  return {
    user_id: userId(user?.['uin']),
    uid: typeof uid === 'string' ? identifier(uid) : null,
    nickname: nickname(user?.['nick']),
  };
}

export function normalizeQzoneReply (value: QzoneComment): QzoneReplyItem {
  const reply = object(value);
  if (!reply) throw new Error('QQ空间回复数据格式异常');
  const user = author(reply['user']);
  const target = author(reply['target_user']);
  const like = object(reply['like']);
  return {
    reply_id: identifier(reply['id']),
    ...user,
    // The renderer uses time in Unix seconds. create_time is not this wire field.
    time: count(reply['time']),
    content: normalizeQzoneRichContent(reply['content']),
    images: normalizeQzoneMediaImages(reply['media_items']),
    like_count: count(like?.['count']),
    liked: likeState(like?.['status']),
    target_user_id: target.user_id,
    target_uid: target.uid,
    target_nickname: target.nickname,
    reply: value,
  };
}

export function normalizeQzoneComment (value: QzoneComment): QzoneCommentItem {
  const comment = object(value);
  if (!comment) throw new Error('QQ空间评论数据格式异常');
  const user = author(comment['user']);
  const like = object(comment['like']);
  const inline = comment['replys'];
  if (inline !== undefined && inline !== null && !Array.isArray(inline)) throw new Error('QQ空间内联回复列表格式异常');
  const replies = (inline ?? []) as unknown[];
  return {
    comment_id: identifier(comment['id']),
    ...user,
    time: count(comment['time']),
    content: normalizeQzoneRichContent(comment['content']),
    images: normalizeQzoneMediaImages(comment['media_items']),
    like_count: count(like?.['count']),
    liked: likeState(like?.['status']),
    reply_num: count(comment['reply_num']),
    has_more_replies: typeof comment['has_more_reply'] === 'boolean' ? comment['has_more_reply'] : null,
    // These are only the inline replies returned on this page, not an exhaustiveness claim.
    replies: replies.map((reply) => {
      if (!object(reply)) throw new Error('QQ空间内联回复数据格式异常');
      return normalizeQzoneReply(reply as QzoneComment);
    }),
    comment: value,
  };
}

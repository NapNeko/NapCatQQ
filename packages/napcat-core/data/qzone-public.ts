export type QzonePublicObject = Record<string, unknown>;
export type QzonePublicContent = string | QzonePublicObject[];
export type QzonePublicOperation =
  | 'capabilities' | 'feeds' | 'detail' | 'comments' | 'replies'
  | 'upvote' | 'downvote' | 'like' | 'unlike' | 'follow' | 'unfollow'
  | 'commentLike' | 'commentUnlike' | 'addComment' | 'addReply'
  | 'deleteComment' | 'deleteReply' | 'forward';

export interface QzonePublicFeedsPage extends QzonePublicObject {
  feeds: QzonePublicObject[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface QzonePublicRequestOptions extends QzonePublicObject {
  feed?: QzonePublicObject;
  comment?: QzonePublicObject;
  reply?: QzonePublicObject;
  content?: QzonePublicContent;
  cursor?: string;
  pageSize?: number;
  reason?: string;
  selfUin?: string;
  user?: QzonePublicObject;
  refreshId?: string;
  lastUnionId?: QzonePublicObject;
}

export interface QzonePublicRoute {
  service: string;
  method: string;
  oidb: string;
}

const READER = 'trpc.qzone.feeds_reader.FeedsReader';
const WRITER = 'trpc.qzone.feeds_writer.FeedsWriter';
const INTERACTION = 'trpc.qzone.interaction_writer.InteractionWriter';
const RELATION = 'trpc.public_qzone.relation.RelationService';
const UPVOTE = 'trpc.public_qzone.interaction.UFOComment';
const MAX_OBJECT_BYTES = 8 * 1024 * 1024;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_IDENTITY_LENGTH = 8192;

function route (service: string, method: string, oidb: string): QzonePublicRoute {
  return Object.freeze({ service, method, oidb });
}

export const QZONE_PUBLIC_ROUTES: Record<QzonePublicOperation, QzonePublicRoute> = Object.freeze({
  capabilities: route('trpc.public_qzone.entrance_ctrl.EntranceCtrl', 'BatchEntranceWhitelist', '0x9741_0'),
  feeds: route(READER, 'GetPublicRecomFeeds', '0x9a38_0'),
  detail: route(READER, 'GetFeedDetail', '0x97b1_1'),
  comments: route(READER, 'GetComment', '0x9bfd_1'),
  replies: route(READER, 'GetReplies', '0x9bfe_1'),
  upvote: route(UPVOTE, 'Upvote', '0x9d18_1'),
  downvote: route(UPVOTE, 'Downvote', '0x9d19_1'),
  like: route(INTERACTION, 'DoLike', '0x9699_1'),
  unlike: route(INTERACTION, 'UnLike', '0x969c_1'),
  follow: route(RELATION, 'Follow', '0x9d1a_1'),
  unfollow: route(RELATION, 'Unfollow', '0x9d1b_1'),
  commentLike: route(INTERACTION, 'DoLike', '0x9699_1'),
  commentUnlike: route(INTERACTION, 'UnLike', '0x969c_1'),
  addComment: route(INTERACTION, 'AddComment', '0x9676_1'),
  addReply: route(INTERACTION, 'AddReply', '0x9677_1'),
  deleteComment: route(INTERACTION, 'DeleteComment', '0x9989_0'),
  deleteReply: route(INTERACTION, 'DeleteReply', '0x998a_0'),
  forward: route(WRITER, 'ForwardFeed', '0x969a_1'),
});

function object (value: unknown): value is QzonePublicObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertOperation (operation: QzonePublicOperation): void {
  if (!Object.prototype.hasOwnProperty.call(QZONE_PUBLIC_ROUTES, operation)) throw new Error('QQ空间公开接口操作无效');
}

/** Clone JSON without calling toJSON or assigning prototype setters. */
function snapshot<T> (value: T, name: string, maxBytes = MAX_OBJECT_BYTES): T {
  const seen = new Set<object>();
  let nodes = 0;
  const maxNodes = 200000;
  const maxDepth = 64;
  function copy (input: unknown, depth: number): unknown {
    if (++nodes > maxNodes || depth > maxDepth) throw new Error(`${name}结构超出限制`);
    if (input === null || typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      if (Buffer.byteLength(input, 'utf8') > maxBytes) throw new Error(`${name}超过大小限制`);
      return input;
    }
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    if (!Array.isArray(input) && !object(input)) throw new Error(`${name}必须为JSON数据`);
    if (seen.has(input)) throw new Error(`${name}不能包含循环引用`);
    seen.add(input);
    let output: unknown;
    if (Array.isArray(input)) {
      const items: unknown[] = [];
      for (let index = 0; index < input.length; index++) items.push(copy(input[index], depth + 1));
      output = items;
    } else {
      const result: QzonePublicObject = {};
      for (const key of Object.keys(input)) {
        const item = input[key];
        if (item === undefined) continue;
        Object.defineProperty(result, key, { value: copy(item, depth + 1), enumerable: true, configurable: true, writable: true });
      }
      output = result;
    }
    seen.delete(input);
    return output;
  }
  const result = copy(value, 0) as T;
  if (Buffer.byteLength(JSON.stringify(result), 'utf8') > maxBytes) throw new Error(`${name}超过大小限制`);
  return result;
}

function jsonObject (value: unknown, name: string): QzonePublicObject {
  if (!object(value)) throw new Error(`${name}必须为JSON对象`);
  return snapshot(value, name);
}

function identity (value: unknown, name: string, allowEmpty = false): string {
  if (typeof value !== 'string' || value.length > MAX_IDENTITY_LENGTH || (!allowEmpty && !value.trim())) {
    throw new Error(`${name}无效`);
  }
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) throw new Error(`${name}无效`);
  }
  return value;
}

function uin (value: unknown, name: string): string {
  if (typeof value !== 'string' || !/^[1-9]\d{0,19}$/.test(value)) throw new Error(`${name}无效`);
  return value;
}

function pageToken (value: unknown, name: string, allowEmpty = false, maxLength = MAX_OBJECT_BYTES): string {
  if (typeof value !== 'string' || value.length > maxLength || (!allowEmpty && value.length === 0)) throw new Error(`${name}无效`);
  return value;
}

function unionId (value: unknown): QzonePublicObject {
  const union = jsonObject(value, 'QQ空间完整动态标识');
  let identified = false;
  for (const key of ['uf_key', 'ugc_id', 'feed_id', 'serialized_data']) {
    if (union[key] === undefined) continue;
    const field = identity(union[key], 'QQ空间动态身份字段', true);
    if (field.trim()) identified = true;
  }
  if (!identified) throw new Error('QQ空间动态缺少完整有效身份');
  if (union['ext_ids'] !== undefined && (!Array.isArray(union['ext_ids']) || union['ext_ids'].some(item => !object(item)))) {
    throw new Error('QQ空间动态扩展身份无效');
  }
  return union;
}

function readComment (value: unknown, name: string): QzonePublicObject {
  const comment = jsonObject(value, name);
  const id = comment['id'];
  if (typeof id === 'string') identity(id, `${name}标识`);
  else if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 0) throw new Error(`${name}标识无效`);
  if (comment['user'] !== undefined && !object(comment['user'])) throw new Error(`${name}用户必须为JSON对象`);
  return comment;
}

function user (value: unknown, name: string): QzonePublicObject {
  const result = jsonObject(value, name);
  const userUin = result['uin'];
  const userUid = result['uid'];
  const absentUin = userUin === undefined || userUin === null || userUin === '' || userUin === '0' || userUin === 0;
  if (!absentUin) uin(userUin, `${name}QQ号`);
  if (userUid !== undefined && userUid !== null && userUid !== '') identity(userUid, `${name}UID`);
  if (absentUin && !userUid) throw new Error(`${name}缺少QQ号或UID`);
  return result;
}

function content (value: unknown): QzonePublicObject[] {
  if (typeof value === 'string') {
    if (!value.length) throw new Error('QQ空间评论正文不能为空');
    return snapshot([{ type: 0, content: value }], 'QQ空间评论正文');
  }
  if (!Array.isArray(value) || !value.length) throw new Error('QQ空间评论正文必须为非空文本或RichMsg数组');
  const items = snapshot(value, 'QQ空间评论正文');
  for (const item of items) {
    if (!object(item)) throw new Error('QQ空间RichMsg条目必须为JSON对象');
  }
  return items as QzonePublicObject[];
}

export function buildQzonePublicRequest (operation: QzonePublicOperation, options: QzonePublicRequestOptions): QzonePublicObject {
  assertOperation(operation);
  if (!object(options)) throw new Error('QQ空间公开接口参数必须为对象');
  if (operation === 'capabilities') return { uins: [uin(options.selfUin, '当前QQ号')], entrance_types: [1, 15] };
  if (operation === 'feeds') {
    const body: QzonePublicObject = { refresh_id: identity(options.refreshId, 'QQ空间刷新标识') };
    if (options.cursor !== undefined) body['attach_info'] = pageToken(options.cursor, 'QQ空间分页标识', true, 65536);
    if (options.lastUnionId !== undefined) body['last_client_feed_union_id'] = unionId(options.lastUnionId);
    return body;
  }

  const feed = jsonObject(options.feed, 'QQ空间原始Feed');
  const common = feed['cell_common'];
  if (!object(common)) throw new Error('QQ空间原始Feed缺少cell_common');
  const union = unionId(common['union_id']);
  const body: QzonePublicObject = { union_id: union };
  if (feed['cell_feed_transfer'] !== undefined) body['cell_feed_transfer'] = snapshot(feed['cell_feed_transfer'], 'QQ空间动态上下文');

  if (operation === 'detail') return { ...body, feed_action_domain_type: 3, from_page: 1 };
  if (operation === 'comments') return { ...body, attach_info: pageToken(options.cursor, 'QQ空间评论分页标识') };
  if (operation === 'replies') {
    const parent = readComment(options.comment, 'QQ空间父评论');
    const size = options.pageSize === undefined ? 20 : options.pageSize;
    if (typeof size !== 'number' || !Number.isFinite(size) || size < 1) throw new Error('QQ空间回复page_size必须为不小于1的有限数值');
    const pointer = options.cursor || parent['reply_attach_info'] || '';
    return { ...body, cur_comment: parent, comment_attach_info: '', reply_attach_info: pageToken(pointer, 'QQ空间回复分页标识', true), page_size: Math.trunc(size) };
  }
  if (operation === 'upvote' || operation === 'downvote') return body;
  if (operation === 'like' || operation === 'unlike') {
    return { ...body, like_key: identity(common['cur_like_key'], 'QQ空间动态点赞标识'), like_type: 1 };
  }
  if (operation === 'follow' || operation === 'unfollow') {
    const userInfo = feed['cell_user_info'];
    const author = user(object(userInfo) ? userInfo['user'] : undefined, 'QQ空间动态作者');
    const authorUin = typeof author['uin'] === 'string' && /^[1-9]\d{0,19}$/.test(author['uin']) ? author['uin'] : '';
    const authorUid = typeof author['uid'] === 'string' ? author['uid'].trim() : '';
    const useUid = (common['domain_type'] === 3 && !!authorUid) || !authorUin;
    const request: QzonePublicObject = { follow_from_type: 1, ...(useUid ? { target_uid: authorUid } : { target_uin: authorUin }) };
    if ((useUid && !authorUid) || (!useUid && !authorUin)) throw new Error('QQ空间动态缺少可蹲的作者身份');
    if (typeof union['uf_key'] === 'string' && union['uf_key']) request['follow_feed_id'] = union['uf_key'];
    if (feed['cell_feed_transfer']) request['cell_feed_transfer'] = body['cell_feed_transfer'];
    return request;
  }
  if (operation === 'commentLike' || operation === 'commentUnlike') {
    const parent = readComment(options.comment, 'QQ空间父评论');
    const target = options.reply === undefined ? parent : readComment(options.reply, 'QQ空间回复');
    const like = target['like'];
    return { ...body, like_key: identity(object(like) ? like['id'] : undefined, 'QQ空间评论点赞标识'), like_type: options.reply === undefined ? 2 : 3 };
  }
  if (operation === 'addComment') return { ...body, comment: { user: user(options.user, '当前用户'), content: content(options.content) } };
  if (operation === 'addReply') {
    const parent = readComment(options.comment, 'QQ空间父评论');
    const target = options.reply === undefined ? parent : readComment(options.reply, 'QQ空间回复');
    return { ...body, comment: parent, reply: { content: content(options.content), target_user: user(target['user'], 'QQ空间回复目标'), user: user(options.user, '当前用户') } };
  }
  if (operation === 'deleteComment') return { ...body, comment: readComment(options.comment, 'QQ空间父评论') };
  if (operation === 'deleteReply') return { ...body, comment: readComment(options.comment, 'QQ空间父评论'), reply: readComment(options.reply, 'QQ空间回复') };
  if (operation === 'forward') {
    const reason = options.reason ?? '';
    if (typeof reason !== 'string') throw new Error('QQ空间转发理由必须为文本');
    return { ...body, reason: snapshot(reason, 'QQ空间转发理由') };
  }
  throw new Error('QQ空间公开接口操作无效');
}

/** Return the business data, preserving unknown fields while checking the observed acknowledgements. */
export function parseQzonePublicResponse (value: unknown, operation: QzonePublicOperation): QzonePublicObject {
  assertOperation(operation);
  if (!object(value) || value['retcode'] !== 0 || !object(value['data'])) throw new Error('QQ空间公开接口未返回明确成功响应');
  const data = snapshot(value['data'], 'QQ空间公开接口响应', MAX_RESPONSE_BYTES);
  if (operation === 'follow' || operation === 'unfollow') {
    const code = data['ret_code'];
    if (code !== undefined && code !== null && code !== 0 && code !== '0') throw new Error('QQ空间蹲操作未确认成功');
  }
  const resultFields: Partial<Record<QzonePublicOperation, string>> = {
    upvote: 'upvote',
    downvote: 'upvote',
    like: 'like',
    unlike: 'like',
    commentLike: 'like',
    commentUnlike: 'like',
    addComment: 'comment',
    addReply: 'reply',
  };
  const field = resultFields[operation];
  if (field && !data[field]) throw new Error('QQ空间公开互动未返回业务成功结果');
  return data;
}

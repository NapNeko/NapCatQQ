import type { InstanceContext, NapCatCore } from '@/napcat-core';
import { randomUUID } from 'node:crypto';
import {
  buildQzonePublishRequest,
  buildQzoneText,
  getQzoneGtk,
  getQzoneTid,
  normalizeQzoneFeed,
  parseQzoneRpcResponse,
  validateQzoneFeedReference,
  type QzoneComment,
  type QzoneDetail,
  type QzoneFeed,
  type QzoneFeedPage,
  type QzoneFeedReference,
  type QzoneMsgPage,
  type QzoneUnionId,
  type QzoneUser,
} from '../data/qzone-rpc';

const RPC_ROOT = 'https://h5.qzone.qq.com/http2rpc/gotrpc/v1/';
const READER = 'trpc.qzone.feeds_reader.FeedsReader';
const WRITER = 'trpc.qzone.feeds_writer.FeedsWriter';
const INTERACTION = 'trpc.qzone.interaction_writer.InteractionWriter';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_REFERENCE_BYTES = 64 * 1024;
const MAX_CURSOR_LENGTH = 16384;
const MAX_ATTACH_LENGTH = 8192;
const CURSOR_TTL_MS = 10 * 60 * 1000;
const MAX_CURSORS = 128;

// 固定路由，不向调用方暴露任意 RPC、URL 或取票能力。
const RPC_METHODS = {
  GetFriendFeeds: { service: READER, command: '0x97e5', type: '0', write: false },
  GetShuoshuoList: { service: READER, command: '0x9a97', type: '1', write: false },
  GetFeedDetail: { service: READER, command: '0x97b1', type: '1', write: false },
  PublishFeed: { service: WRITER, command: '0x9775', type: '1', write: true },
  DoLike: { service: INTERACTION, command: '0x9699', type: '1', write: true },
  UnLike: { service: INTERACTION, command: '0x969c', type: '1', write: true },
  AddComment: { service: INTERACTION, command: '0x9676', type: '1', write: true },
  AddReply: { service: INTERACTION, command: '0x9677', type: '1', write: true },
} as const;

interface PageCursor {
  account: string;
  kind: 'friends' | 'moods';
  target: string;
  issuedAt: number;
  attachInfo: string;
  refreshId?: string;
  lastUnionId?: QzoneUnionId;
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validUin (value: unknown): value is string {
  return typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value);
}

function validIdentity (value: unknown, maxLength = 4096): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function validateUser (value: unknown): QzoneUser {
  if (!isRecord(value) || !validUin(value['uin']) ||
    (value['uid'] !== undefined && value['uid'] !== '' && !validIdentity(value['uid'])) ||
    (value['nick'] !== undefined && (typeof value['nick'] !== 'string' || value['nick'].length > 4096))) {
    throw new Error('QQ空间用户信息无效');
  }
  return value as QzoneUser;
}

function validateComment (value: unknown): QzoneComment {
  if (!isRecord(value) || !validIdentity(value['id'], 8192)) {
    throw new Error('QQ空间评论缺少有效标识');
  }
  validateUser(value['user']);
  let size: number;
  try {
    size = Buffer.byteLength(JSON.stringify(value));
  } catch {
    throw new Error('QQ空间评论格式无效');
  }
  if (size > MAX_REFERENCE_BYTES) {
    throw new Error('QQ空间评论对象过大');
  }
  return value as QzoneComment;
}

async function withTimeout<T> (work: () => Promise<T>, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(work),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export class NTQQQzoneApi {
  context: InstanceContext;
  core: NapCatCore;
  private readonly cursors = new Map<string, PageCursor>();

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }

  private currentUser (): QzoneUser {
    const info = this.core.selfInfo;
    if (!info || !validUin(info.uin) || !validIdentity(info.uid)) {
      throw new Error('QQ空间需要已登录的当前账号');
    }
    return validateUser({ uin: info.uin, uid: info.uid, nick: info.nick ?? '' });
  }

  private accountKey (user: QzoneUser): string {
    return `${user.uin}:${user.uid ?? ''}`;
  }

  private assertAccount (user: QzoneUser): void {
    if (this.accountKey(this.currentUser()) !== this.accountKey(user)) {
      throw new Error('QQ账号已切换，请重新获取QQ空间数据');
    }
  }

  private readCursor (token: string | undefined, user: QzoneUser, kind: PageCursor['kind'], target: string): PageCursor | undefined {
    if (token === undefined) return undefined;
    if (typeof token !== 'string' || token.length === 0 || token.length > MAX_CURSOR_LENGTH) {
      throw new Error('QQ空间游标无效，请重新获取第一页');
    }
    const cursor = this.cursors.get(token);
    const now = Date.now();
    if (!cursor || cursor.issuedAt > now || now - cursor.issuedAt >= CURSOR_TTL_MS ||
      cursor.account !== this.accountKey(user) || cursor.kind !== kind || cursor.target !== target) {
      throw new Error('QQ空间游标无效或已过期，请重新获取第一页');
    }
    return cursor;
  }

  private saveCursor (cursor: Omit<PageCursor, 'issuedAt'>): string {
    const now = Date.now();
    for (const [token, entry] of this.cursors) {
      if (entry.issuedAt > now || now - entry.issuedAt >= CURSOR_TTL_MS) this.cursors.delete(token);
    }
    while (this.cursors.size >= MAX_CURSORS) {
      const oldest = this.cursors.keys().next().value;
      if (oldest === undefined) break;
      this.cursors.delete(oldest);
    }
    const token = randomUUID();
    this.cursors.set(token, {
      ...cursor,
      ...(cursor.lastUnionId ? { lastUnionId: structuredClone(cursor.lastUnionId) } : {}),
      issuedAt: now,
    });
    return token;
  }

  private parsePage (data: Record<string, unknown>): { feeds: QzoneFeed[]; hasMore: boolean; attachInfo: string; } {
    if (!Array.isArray(data['feeds']) ||
      (data['has_more'] !== undefined && typeof data['has_more'] !== 'boolean')) {
      throw new Error('QQ空间列表响应格式异常');
    }
    const feeds = data['feeds'].map((item: unknown) => {
      if (!isRecord(item) || !isRecord(item['feed'])) throw new Error('QQ空间动态响应格式异常');
      return item['feed'] as QzoneFeed;
    });
    const hasMore = data['has_more'] === true;
    const attachInfo = data['attach_info'];
    if (hasMore && (typeof attachInfo !== 'string' || attachInfo.length === 0 || attachInfo.length > MAX_ATTACH_LENGTH)) {
      throw new Error('QQ空间续页信息无效，请重新获取第一页');
    }
    return { feeds, hasMore, attachInfo: typeof attachInfo === 'string' ? attachInfo : '' };
  }

  private async authHeaders (user: QzoneUser): Promise<{ cookie: string; gtk: number; }> {
    const results = await withTimeout(() => Promise.allSettled([
      this.core.apis.UserApi.getSKey(),
      this.core.apis.UserApi.getPSkey(['qzone.qq.com']),
    ]), 'QQ空间取票超时，请稍后重试');
    this.assertAccount(user);
    const skey = results[0].status === 'fulfilled' ? results[0].value : undefined;
    const ticket = results[1].status === 'fulfilled' ? results[1].value : undefined;
    const pskey = ticket?.result === 0 ? ticket.domainPskeyMap?.get('qzone.qq.com') : undefined;
    const validKey = (key: unknown): key is string => typeof key === 'string' && key.length > 0 && key.length <= 4096 &&
      [...key].every(char => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127 && char !== ';' && char !== ',');
    const sk = validKey(skey) ? skey : '';
    const pk = validKey(pskey) ? pskey : '';
    if (!sk && !pk) throw new Error('QQ空间取票失败，请确认当前账号登录状态');
    const cookies = [`uin=o${user.uin}`, `p_uin=o${user.uin}`];
    if (sk) cookies.push(`skey=${sk}`);
    if (pk) cookies.push(`p_skey=${pk}`);
    return { cookie: cookies.join('; '), gtk: getQzoneGtk(pk || sk) };
  }

  private async rpc (method: keyof typeof RPC_METHODS, request: Record<string, unknown>, user: QzoneUser): Promise<Record<string, unknown>> {
    const route = RPC_METHODS[method];
    const auth = await this.authHeaders(user);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let text: string;
    try {
      this.assertAccount(user);
      const response = await fetch(`${RPC_ROOT}${route.service}/${method}?g_tk=${auth.gtk}`, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Cookie: auth.cookie,
          Origin: 'https://h5.qzone.qq.com',
          Referer: 'https://h5.qzone.qq.com/pc-qzone/index.html',
          'x-oidb': JSON.stringify({ uint32_command: route.command, uint32_service_type: route.type }),
          'x-web-qua': 'V1_HT5_QZ_9.9.32_001_IDC_B',
        },
        body: JSON.stringify(request),
      });
      if (response.status !== 200 || !response.body) {
        await response.body?.cancel();
        throw new Error('Invalid response');
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error('Response too large');
          }
          chunks.push(chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
      text = Buffer.concat(chunks, size).toString('utf8');
    } catch {
      throw new Error(route.write
        ? 'QQ空间请求未能确认结果，请先查询状态，勿自动重试'
        : 'QQ空间请求失败或超时，请稍后重试');
    } finally {
      clearTimeout(timer);
    }
    this.assertAccount(user);
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(route.write
        ? 'QQ空间响应无法解析，操作结果未知，请先查询状态，勿自动重试'
        : 'QQ空间响应格式异常');
    }
    return parseQzoneRpcResponse(value);
  }

  async getFriendFeeds (cursor?: string): Promise<QzoneFeedPage> {
    const user = this.currentUser();
    const previous = this.readCursor(cursor, user, 'friends', '');
    const refreshId = previous?.refreshId ?? `${user.uin}_${Date.now()}`;
    const request: Record<string, unknown> = { refresh_id: refreshId };
    if (previous) {
      request['attach_info'] = previous.attachInfo;
      if (previous.lastUnionId) request['last_client_feed_union_id'] = previous.lastUnionId;
    }
    const page = this.parsePage(await this.rpc('GetFriendFeeds', request, user));
    let lastUnionId = previous?.lastUnionId;
    if (page.hasMore) {
      for (let index = page.feeds.length - 1; index >= 0; index--) {
        const feed = page.feeds[index];
        if (!feed || feed.cell_common?.feed_type === 3 || !feed.cell_common?.union_id) continue;
        try {
          lastUnionId = validateQzoneFeedReference({ union_id: feed.cell_common.union_id }).union_id;
          break;
        } catch {
          // 未知动态仍保留在返回页；只有可用身份才能作为后续分页锚点。
        }
      }
    }
    const nextCursor = page.hasMore
      ? this.saveCursor({
        account: this.accountKey(user), kind: 'friends', target: '', attachInfo: page.attachInfo, refreshId, lastUnionId,
      })
      : null;
    return { feeds: page.feeds.map(normalizeQzoneFeed), has_more: page.hasMore, next_cursor: nextCursor };
  }

  async getMsgList (targetUin?: string, cursor?: string): Promise<QzoneMsgPage> {
    const user = this.currentUser();
    const target = targetUin ?? user.uin;
    if (!validUin(target)) throw new Error('target_uin 必须是有效QQ号');
    const previous = this.readCursor(cursor, user, 'moods', target);
    let uid = user.uid;
    if (target !== user.uin) {
      try {
        uid = await withTimeout(() => this.core.apis.UserApi.getUidByUinV2(target), 'QQ空间账号解析超时');
      } catch {
        throw new Error('无法解析目标QQ号，请确认账号可访问');
      }
    }
    if (!validIdentity(uid) || uid.includes('*')) throw new Error('无法解析目标QQ号，请确认账号可访问');
    this.assertAccount(user);
    const data = await this.rpc('GetShuoshuoList', {
      host_uid: uid, host_uin: target, attach_info: previous?.attachInfo ?? '', feed_action_domain_type: 1,
    }, user);
    const page = this.parsePage(data);
    if (data['seal_off_memory'] !== undefined && data['seal_off_memory'] !== null && !isRecord(data['seal_off_memory'])) {
      throw new Error('QQ空间封存状态响应格式异常');
    }
    const nextCursor = page.hasMore
      ? this.saveCursor({
        account: this.accountKey(user), kind: 'moods', target, attachInfo: page.attachInfo,
      })
      : null;
    return {
      msglist: page.feeds.map(normalizeQzoneFeed),
      has_more: page.hasMore,
      next_cursor: nextCursor,
      ...(isRecord(data['seal_off_memory']) ? { seal_off_memory: data['seal_off_memory'] } : {}),
    };
  }

  async getMsgDetail (reference: QzoneFeedReference): Promise<QzoneDetail> {
    const ref = validateQzoneFeedReference(reference);
    const user = this.currentUser();
    const data = await this.rpc('GetFeedDetail', {
      union_id: ref.union_id,
      cell_feed_transfer: ref.cell_feed_transfer,
      feed_action_domain_type: ref.feed_action_domain_type ?? 1,
      from_page: 1,
    }, user);
    if (!isRecord(data['feed']) || !isRecord(data['feed']['feed'])) {
      throw new Error('QQ空间未返回说说详情，内容可能不可访问或已删除');
    }
    const feed = data['feed']['feed'] as QzoneFeed;
    if (feed.cell_comment !== undefined && !isRecord(feed.cell_comment)) {
      throw new Error('QQ空间评论响应格式异常');
    }
    const comments = feed.cell_comment?.comments;
    if (comments !== undefined && (!Array.isArray(comments) || comments.some(comment => !isRecord(comment)))) {
      throw new Error('QQ空间评论响应格式异常');
    }
    return { ...normalizeQzoneFeed(feed), comments: comments ?? [] };
  }

  async publishMsg (content: string, ugcRight = 1, targetUins?: string[]): Promise<{ tid: string; }> {
    const user = this.currentUser();
    const request = buildQzonePublishRequest(user, content, ugcRight, targetUins);
    const data = await this.rpc('PublishFeed', request, user);
    const tid = isRecord(data['feed']) ? getQzoneTid(data['feed'] as QzoneFeed) : null;
    if (!tid) throw new Error('QQ空间发表响应缺少说说标识，结果未知，请先查询列表确认，勿自动重试');
    return { tid };
  }

  async setLike (reference: QzoneFeedReference, enable: boolean): Promise<void> {
    const ref = validateQzoneFeedReference(reference);
    if (typeof ref.like_key !== 'string' || !ref.like_key.trim() || ref.like_key.length > 8192) {
      throw new Error('缺少QQ空间点赞标识，请先重新获取说说详情');
    }
    if (typeof enable !== 'boolean') throw new Error('QQ空间点赞状态必须是布尔值');
    const user = this.currentUser();
    const data = await this.rpc(enable ? 'DoLike' : 'UnLike', {
      like_key: ref.like_key, union_id: ref.union_id, like_type: 1, cell_feed_transfer: ref.cell_feed_transfer,
    }, user);
    if (!isRecord(data['like'])) throw new Error('QQ空间未返回点赞结果，请先查询状态，勿自动重试');
  }

  async comment (reference: QzoneFeedReference, content: string, parentComment?: QzoneComment, replyUser?: QzoneUser): Promise<{ comment_id: string; comment: QzoneComment; }> {
    const ref = validateQzoneFeedReference(reference);
    const segments = buildQzoneText(content);
    if (replyUser !== undefined && parentComment === undefined) throw new Error('reply_user 必须与父评论一同提供');
    const parent = parentComment === undefined ? undefined : validateComment(parentComment);
    const target = parent ? validateUser(replyUser ?? parent.user) : undefined;
    const user = this.currentUser();
    const data = await this.rpc(parent ? 'AddReply' : 'AddComment', {
      union_id: ref.union_id,
      cell_feed_transfer: ref.cell_feed_transfer,
      ...(parent ? { comment: parent, reply: { content: segments, target_user: target, user } } : { comment: { user, content: segments } }),
    }, user);
    const result = data[parent ? 'reply' : 'comment'];
    if (!isRecord(result) || !validIdentity(result['id'], 8192)) {
      throw new Error('QQ空间未返回有效评论标识，结果未知，请先查询详情确认，勿自动重试');
    }
    return { comment_id: result['id'], comment: result as QzoneComment };
  }
}

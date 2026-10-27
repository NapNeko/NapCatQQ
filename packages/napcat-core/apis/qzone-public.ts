import type { InstanceContext, NapCatCore } from '@/napcat-core';
import { randomUUID } from 'node:crypto';
import {
  buildQzonePublicRequest,
  parseQzonePublicResponse,
  QZONE_PUBLIC_ROUTES,
  type QzonePublicContent,
  type QzonePublicFeedsPage,
  type QzonePublicObject,
  type QzonePublicOperation,
} from '../data/qzone-public';

const RPC_ROOT = 'https://h5.qzone.qq.com/http2rpc/gotrpc/v1/';
const TIMEOUT_MS = 15000;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_CURSOR_COUNT = 128;
const CURSOR_TTL_MS = 10 * 60 * 1000;
const READ_OPERATIONS = new Set<QzonePublicOperation>(['capabilities', 'feeds', 'detail', 'comments', 'replies']);

interface CurrentUser extends QzonePublicObject { uin: string; uid: string; nick: string; }
interface PublicCursor {
  account: string;
  issuedAt: number;
  refreshId: string;
  attachInfo: string;
  lastUnionId?: QzonePublicObject;
}

function object (value: unknown): value is QzonePublicObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function withTimeout<T> (work: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(work),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('空间登录态读取超时')), TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** Public recommendation uses its own feed identities, interaction routes and cursor chain. */
export class NTQQQzonePublicApi {
  private readonly cursors = new Map<string, PublicCursor>();

  constructor (readonly context: InstanceContext, readonly core: NapCatCore) {}

  private currentUser (): CurrentUser {
    const info = this.core.selfInfo;
    if (!info || !/^[1-9]\d{0,19}$/.test(info.uin) || typeof info.uid !== 'string' || !info.uid.trim()) {
      throw new Error('空友爱看需要已登录的当前账号');
    }
    return { uin: info.uin, uid: info.uid, nick: info.nick ?? '' };
  }

  private assertAccount (user: CurrentUser): void {
    const current = this.currentUser();
    if (current.uin !== user.uin || current.uid !== user.uid) throw new Error('QQ账号已切换，请重新获取空友动态');
  }

  private async auth (user: CurrentUser): Promise<{ cookie: string; gtk: number; }> {
    this.assertAccount(user);
    const [skey, pskey] = await withTimeout(() => Promise.allSettled([
      this.core.apis.UserApi.getSKey(),
      this.core.apis.UserApi.getPSkey(['qzone.qq.com']),
    ]));
    this.assertAccount(user);
    const sk = skey.status === 'fulfilled' && typeof skey.value === 'string' ? skey.value : '';
    const pk = pskey.status === 'fulfilled' ? pskey.value.domainPskeyMap.get('qzone.qq.com') ?? '' : '';
    if (!sk && !pk) throw new Error('无法取得当前账号的空间登录态');
    let hash = 5381;
    const key = pk || sk;
    for (let index = 0; index < key.length; index++) hash += (hash << 5) + key.charCodeAt(index);
    const cookies = [`uin=o${user.uin}`, `p_uin=o${user.uin}`];
    if (sk) cookies.push(`skey=${sk}`);
    if (pk) cookies.push(`p_skey=${pk}`);
    return { cookie: cookies.join('; '), gtk: hash & 0x7fffffff };
  }

  private async rpc (
    operation: QzonePublicOperation,
    options: Parameters<typeof buildQzonePublicRequest>[1] = {},
    user = this.currentUser()
  ): Promise<QzonePublicObject> {
    // Validate complete caller data before acquiring tickets or starting any request.
    const body = buildQzonePublicRequest(operation, { ...options, selfUin: user.uin, user });
    const encoded = JSON.stringify(body);
    if (Buffer.byteLength(encoded) > MAX_RESPONSE_BYTES) throw new Error('空友爱看请求超过大小限制');
    const auth = await this.auth(user);
    const route = QZONE_PUBLIC_ROUTES[operation];
    const [command, serviceType] = route.oidb.split('_');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let text: string;
    try {
      this.assertAccount(user);
      const response = await fetch(`${RPC_ROOT}${route.service}/${route.method}?g_tk=${auth.gtk}`, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Cookie: auth.cookie,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: 'https://h5.qzone.qq.com',
          Referer: 'https://h5.qzone.qq.com/pc-qzone/index.html',
          'x-web-qua': 'V1_HT5_QZ_9.9.32_001_IDC_B',
          'x-oidb': JSON.stringify({ uint32_command: command, uint32_service_type: serviceType }),
        },
        body: encoded,
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('HTTP请求失败');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('响应为空');
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error('响应超过大小限制');
          }
          chunks.push(chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
      text = Buffer.concat(chunks, bytes).toString('utf8');
    } catch {
      throw new Error(READ_OPERATIONS.has(operation)
        ? '空友爱看请求失败或超时'
        : '空友爱看写入结果未确认，请查询状态，勿自动重试');
    } finally {
      clearTimeout(timer);
    }
    this.assertAccount(user);
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(READ_OPERATIONS.has(operation)
        ? '空友爱看响应不是有效JSON'
        : '空友爱看写入回执无效，请查询状态，勿自动重试');
    }
    return parseQzonePublicResponse(value, operation);
  }

  private readCursor (token: string | undefined, user: CurrentUser): PublicCursor | undefined {
    if (token === undefined) return undefined;
    const state = typeof token === 'string' && token.length <= 128 ? this.cursors.get(token) : undefined;
    if (!state || state.account !== `${user.uin}:${user.uid}` || Date.now() - state.issuedAt > CURSOR_TTL_MS) {
      throw new Error('空友爱看游标无效或已过期，请重新获取第一页');
    }
    return state;
  }

  private issueCursor (state: PublicCursor): string {
    const now = Date.now();
    for (const [key, value] of this.cursors) {
      if (now - value.issuedAt > CURSOR_TTL_MS) this.cursors.delete(key);
    }
    while (this.cursors.size >= MAX_CURSOR_COUNT) this.cursors.delete(this.cursors.keys().next().value!);
    const token = `qzone-public:${randomUUID()}`;
    this.cursors.set(token, state);
    return token;
  }

  getCapabilities (): Promise<QzonePublicObject> {
    return this.rpc('capabilities');
  }

  async getFeeds (cursor?: string): Promise<QzonePublicFeedsPage> {
    const user = this.currentUser();
    const state = this.readCursor(cursor, user);
    const refreshId = state?.refreshId ?? `${user.uin}_${Date.now()}`;
    const page = await this.rpc('feeds', {
      refreshId,
      cursor: state?.attachInfo,
      lastUnionId: state?.lastUnionId,
    }, user);
    if (!Array.isArray(page['feeds']) || typeof page['has_more'] !== 'boolean') throw new Error('空友动态分页响应不完整');
    const feeds: QzonePublicObject[] = page['feeds'].map((entry: unknown) => {
      if (!object(entry)) throw new Error('空友动态条目格式无效');
      const feed = Object.prototype.hasOwnProperty.call(entry, 'feed') ? entry['feed'] : entry;
      if (!object(feed)) throw new Error('空友动态条目缺少完整内容');
      return feed;
    });
    let lastUnionId = state?.lastUnionId;
    for (let index = feeds.length - 1; index >= 0; index--) {
      const common = feeds[index]!['cell_common'];
      if (object(common) && common['feed_type'] !== 3 && object(common['union_id'])) {
        lastUnionId = common['union_id'];
        break;
      }
    }
    const hasMore = page['has_more'];
    let nextCursor: string | null = null;
    if (hasMore) {
      const attachInfo = page['attach_info'];
      if (typeof attachInfo !== 'string' || !attachInfo || attachInfo.length > 65536) throw new Error('空友动态缺少有效续页信息');
      nextCursor = this.issueCursor({
        account: `${user.uin}:${user.uid}`,
        issuedAt: Date.now(),
        refreshId,
        attachInfo,
        lastUnionId: lastUnionId === undefined ? undefined : structuredClone(lastUnionId),
      });
    }
    return { ...page, feeds, has_more: hasMore, next_cursor: nextCursor };
  }

  getFeedDetail (feed: QzonePublicObject): Promise<QzonePublicObject> {
    return this.rpc('detail', { feed });
  }

  getComments (feed: QzonePublicObject, cursor: string): Promise<QzonePublicObject> {
    return this.rpc('comments', { feed, cursor });
  }

  getReplies (feed: QzonePublicObject, comment: QzonePublicObject, cursor?: string, pageSize = 20): Promise<QzonePublicObject> {
    return this.rpc('replies', { feed, comment, cursor, pageSize });
  }

  setUpvote (feed: QzonePublicObject, enable = true): Promise<QzonePublicObject> {
    if (typeof enable !== 'boolean') throw new Error('enable必须为布尔值');
    return this.rpc(enable ? 'upvote' : 'downvote', { feed });
  }

  setLike (feed: QzonePublicObject, enable = true): Promise<QzonePublicObject> {
    if (typeof enable !== 'boolean') throw new Error('enable必须为布尔值');
    return this.rpc(enable ? 'like' : 'unlike', { feed });
  }

  setFollow (feed: QzonePublicObject, enable = true): Promise<QzonePublicObject> {
    if (typeof enable !== 'boolean') throw new Error('enable必须为布尔值');
    return this.rpc(enable ? 'follow' : 'unfollow', { feed });
  }

  setCommentLike (feed: QzonePublicObject, comment: QzonePublicObject, enable = true, reply?: QzonePublicObject): Promise<QzonePublicObject> {
    if (typeof enable !== 'boolean') throw new Error('enable必须为布尔值');
    return this.rpc(enable ? 'commentLike' : 'commentUnlike', { feed, comment, reply });
  }

  addComment (feed: QzonePublicObject, content: QzonePublicContent): Promise<QzonePublicObject> {
    return this.rpc('addComment', { feed, content });
  }

  addReply (feed: QzonePublicObject, comment: QzonePublicObject, content: QzonePublicContent, reply?: QzonePublicObject): Promise<QzonePublicObject> {
    return this.rpc('addReply', { feed, comment, content, reply });
  }

  deleteComment (feed: QzonePublicObject, comment: QzonePublicObject): Promise<QzonePublicObject> {
    return this.rpc('deleteComment', { feed, comment });
  }

  deleteReply (feed: QzonePublicObject, comment: QzonePublicObject, reply: QzonePublicObject): Promise<QzonePublicObject> {
    return this.rpc('deleteReply', { feed, comment, reply });
  }

  forwardFeed (feed: QzonePublicObject, reason = ''): Promise<QzonePublicObject> {
    return this.rpc('forward', { feed, reason });
  }
}

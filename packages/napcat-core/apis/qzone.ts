import type { InstanceContext, NapCatCore } from '@/napcat-core';
import { createHash, randomUUID } from 'node:crypto';
import { TextDecoder } from 'node:util';
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
import {
  buildQzoneBanBody,
  buildQzoneProfileBody,
  buildQzoneRightBody,
  normalizeQzoneRight,
  parseQzoneProfile,
  parseQzoneWebResponse,
  QzoneWebError,
  type QzoneProfile,
  type QzoneProfileUpdate,
} from '../data/qzone-web';
import {
  normalizeQzoneComment,
  normalizeQzoneReply,
  type QzoneCommentPage,
  type QzoneReplyPage,
} from '../data/qzone-comments';
import { buildQzoneUploadImageBody, parseQzonePublishTime } from '../data/qzone';
import {
  buildSlQzoneCommentBody,
  buildSlQzoneLikeBody,
  parseSlQzoneComment,
  parseSlQzoneMsgDetail,
  parseSlQzoneMsgList,
  type SlQzoneCommentOptions,
  type SlQzoneCommentResult,
  type SlQzoneMsgDetail,
  type SlQzoneMsgList,
} from '../data/qzone-snowluma';
import {
  advanceSlQzoneFeedState,
  initialSlQzoneFeedState,
  parseSlQzoneFeeds,
  slQzoneFeedPosition,
  type SlQzoneFeedPage,
  type SlQzoneFeedState,
} from '../data/qzone-snowluma-feeds';

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
const WEB_ROOT = 'https://h5.qzone.qq.com/proxy/domain/';
const SL_FEED_SKIP_LIMIT = 20;
const SL_FEED_DEADLINE_MS = 45000;

const WEB_METHODS = {
  GetProfile: { path: 'base.qzone.qq.com/cgi-bin/user/cgi_userinfo_get_all', method: 'GET', requireCode: true },
  SetProfile: { path: 'w.qzone.qq.com/cgi-bin/user/cgi_apply_updateuserinfo_new', method: 'POST', requireCode: true },
  GetOwnMsgDetail: { path: 'taotao.qq.com/cgi-bin/emotion_cgi_msgdetail_v6', method: 'GET', requireCode: false },
  SetMsgRight: { path: 'taotao.qzone.qq.com/cgi-bin/emotion_cgi_update', method: 'POST', requireCode: false },
  SetBan: { path: 'w.qzone.qq.com/cgi-bin/right/cgi_black_action_new', method: 'POST', requireCode: false },
  GetSlMsgList: { path: 'taotao.qzone.qq.com/cgi-bin/emotion_cgi_msglist_v6', method: 'GET', requireCode: false },
  GetSlMsgListFallback: { path: 'taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6', method: 'GET', requireCode: false, root: 'https://user.qzone.qq.com/proxy/domain/', ownerReferer: true },
  LikeSlMsg: { path: 'w.qzone.qq.com/cgi-bin/likes/internal_dolike_app', method: 'POST', requireCode: false },
  UnlikeSlMsg: { path: 'w.qzone.qq.com/cgi-bin/likes/internal_unlike_app', method: 'POST', requireCode: false },
  CommentSlMsg: { path: 'taotao.qzone.qq.com/cgi-bin/emotion_cgi_re_feeds', method: 'POST', requireCode: false },
  ReplySlMsg: { path: 'taotao.qzone.qq.com/cgi-bin/emotion_cgi_addreply_ugc', method: 'POST', requireCode: true },
} as const;

interface QzoneHttpRequest {
  url: string;
  method: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
}

// 固定路由，不向调用方暴露任意 RPC、URL 或取票能力。
const RPC_METHODS = {
  GetFriendFeeds: { service: READER, command: '0x97e5', type: '0', write: false },
  GetShuoshuoList: { service: READER, command: '0x9a97', type: '1', write: false },
  GetFeedDetail: { service: READER, command: '0x97b1', type: '1', write: false },
  GetComment: { service: READER, command: '0x9bfd', type: '1', write: false },
  GetReplies: { service: READER, command: '0x9bfe', type: '1', write: false },
  PublishFeed: { service: WRITER, command: '0x9775', type: '1', write: true },
  DoLike: { service: INTERACTION, command: '0x9699', type: '1', write: true },
  UnLike: { service: INTERACTION, command: '0x969c', type: '1', write: true },
  AddComment: { service: INTERACTION, command: '0x9676', type: '1', write: true },
  AddReply: { service: INTERACTION, command: '0x9677', type: '1', write: true },
} as const;

interface PageCursor {
  account: string;
  kind: 'friends' | 'moods' | 'comments' | 'replies' | 'sl-feeds';
  target: string;
  issuedAt: number;
  attachInfo: string;
  refreshId?: string;
  lastUnionId?: QzoneUnionId;
  feedReference?: QzoneFeedReference;
  parentComment?: QzoneComment;
  slFeedState?: SlQzoneFeedState;
  slFeedPage?: number;
  slFeedPositions?: string[];
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
    (value['uid'] !== undefined && value['uid'] !== null && value['uid'] !== '' && !validIdentity(value['uid'])) ||
    (value['nick'] !== undefined && (typeof value['nick'] !== 'string' || value['nick'].length > 4096))) {
    throw new Error('QQ空间用户信息无效');
  }
  // A raw parent may carry uid:null; keep the parent intact and omit only this target's absent UID.
  const user = { ...value };
  if (user['uid'] === null) delete user['uid'];
  return user as unknown as QzoneUser;
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

function assertReadJson (value: unknown, depth = 0): void {
  if (depth > 32) throw new Error('QQ空间父评论嵌套过深');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    for (const item of value) assertReadJson(item, depth + 1);
    return;
  }
  if (!isRecord(value) || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new Error('QQ空间父评论必须为JSON数据');
  }
  for (const item of Object.values(value)) {
    if (item !== undefined) assertReadJson(item, depth + 1);
  }
}

function readParentSnapshot (value: unknown): QzoneComment {
  if (!isRecord(value) || !(validIdentity(value['id'], 8192) ||
    (typeof value['id'] === 'number' && Number.isSafeInteger(value['id']) && value['id'] >= 0))) {
    throw new Error('QQ空间父评论缺少有效标识');
  }
  if (value['user'] !== undefined && !isRecord(value['user'])) throw new Error('QQ空间父评论用户信息无效');
  assertReadJson(value);
  if (Buffer.byteLength(JSON.stringify(value)) > MAX_REFERENCE_BYTES) throw new Error('QQ空间父评论不能超过64KiB');
  return structuredClone(value) as QzoneComment;
}

function referenceSnapshot (value: unknown): QzoneFeedReference {
  return structuredClone(validateQzoneFeedReference(value));
}

function canonicalJson (value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error('QQ空间分页上下文格式无效');
  return json;
}

function commentScope (reference: QzoneFeedReference, parent?: QzoneComment): string {
  return createHash('sha256').update(canonicalJson(parent === undefined
    ? reference
    : { reference, parent: { id: parent.id, user: parent.user } })).digest('hex');
}

function observedCount (value: unknown): number | null {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
  const count = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

async function withTimeout<T> (work: () => Promise<T>, message: string, duration = REQUEST_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(work),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), duration);
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
  private readonly rightUpdates = new Set<string>();

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

  private saveCursor (cursor: Omit<PageCursor, 'issuedAt'>, prefix = ''): string {
    const now = Date.now();
    for (const [token, entry] of this.cursors) {
      if (entry.issuedAt > now || now - entry.issuedAt >= CURSOR_TTL_MS) this.cursors.delete(token);
    }
    while (this.cursors.size >= MAX_CURSORS) {
      const oldest = this.cursors.keys().next().value;
      if (oldest === undefined) break;
      this.cursors.delete(oldest);
    }
    const token = `${prefix}${randomUUID()}`;
    this.cursors.set(token, { ...structuredClone(cursor), issuedAt: now });
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

  private async authHeaders (user: QzoneUser, deadline?: number): Promise<{ cookie: string; gtk: number; skey: string; pskey: string; }> {
    const remaining = deadline === undefined ? REQUEST_TIMEOUT_MS : Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now());
    if (remaining <= 0) throw new Error('QQ空间读取超过时间预算，请使用游标分页');
    const results = await withTimeout(() => Promise.allSettled([
      this.core.apis.UserApi.getSKey(),
      this.core.apis.UserApi.getPSkey(['qzone.qq.com']),
    ]), 'QQ空间取票超时，请稍后重试', remaining);
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
    return { cookie: cookies.join('; '), gtk: getQzoneGtk(pk || sk), skey: sk, pskey: pk };
  }

  private async requestText (user: QzoneUser, build: (gtk: number, auth: { skey: string; pskey: string; }) => QzoneHttpRequest, write: boolean, deadline?: number): Promise<string> {
    const auth = await this.authHeaders(user, deadline);
    const request = build(auth.gtk, auth);
    const remaining = deadline === undefined ? REQUEST_TIMEOUT_MS : Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now());
    if (remaining <= 0) throw new Error('QQ空间读取超过时间预算，请使用游标分页');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remaining);
    let text: string;
    try {
      this.assertAccount(user);
      const response = await fetch(request.url, {
        method: request.method,
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Cookie: auth.cookie,
          Origin: 'https://h5.qzone.qq.com',
          Referer: 'https://h5.qzone.qq.com/pc-qzone/index.html',
          ...request.headers,
        },
        ...(request.body !== undefined ? { body: request.body } : {}),
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
      text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, size));
    } catch {
      throw new Error(write
        ? 'QQ空间请求未能确认结果，请先查询状态，勿自动重试'
        : 'QQ空间请求失败或超时，请稍后重试');
    } finally {
      clearTimeout(timer);
    }
    this.assertAccount(user);
    return text;
  }

  private async rpc (method: keyof typeof RPC_METHODS, request: Record<string, unknown>, user: QzoneUser): Promise<Record<string, unknown>> {
    const route = RPC_METHODS[method];
    const text = await this.requestText(user, gtk => ({
      url: `${RPC_ROOT}${route.service}/${method}?g_tk=${gtk}`,
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
        'x-oidb': JSON.stringify({ uint32_command: route.command, uint32_service_type: route.type }),
        'x-web-qua': 'V1_HT5_QZ_9.9.32_001_IDC_B',
      },
    }), route.write);
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

  private async web (method: keyof typeof WEB_METHODS, params: URLSearchParams, user: QzoneUser): Promise<Record<string, unknown>> {
    const route = WEB_METHODS[method];
    const write = route.method === 'POST';
    const text = await this.requestText(user, gtk => {
      const url = new URL(`${'root' in route ? route.root : WEB_ROOT}${route.path}`);
      url.searchParams.set('g_tk', String(gtk));
      if (!write) {
        for (const [key, value] of params) url.searchParams.set(key, value);
      }
      const headers: Record<string, string> = {};
      if ('ownerReferer' in route) headers['Referer'] = `https://user.qzone.qq.com/${params.get('uin')}`;
      if (write) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return {
        url: url.href,
        method: route.method,
        headers,
        ...(write ? { body: params.toString() } : {}),
      };
    }, write);
    try {
      return parseQzoneWebResponse(text, route.requireCode);
    } catch (error) {
      if (!write) throw error;
      // Parser errors contain only local descriptions and numeric status codes.
      throw new Error(`${(error as Error).message}；未确认成功，请先查询状态，勿自动重试`);
    }
  }

  async getProfile (targetUin?: string): Promise<QzoneProfile> {
    const user = this.currentUser();
    const target = targetUin ?? user.uin;
    if (!validUin(target)) throw new Error('target_uin 必须是有效QQ号');
    const response = await this.web('GetProfile', new URLSearchParams({
      uin: target, vuin: user.uin, fupdate: '1', rd: String(Math.random()),
    }), user);
    return parseQzoneProfile(response);
  }

  private slTarget (user: QzoneUser, targetUin?: string): string {
    const target = targetUin ?? user.uin;
    if (!validUin(target)) throw new Error('target_uin 必须是有效QQ号');
    return target;
  }

  private slPagination (pos: number, num: number): void {
    if (!Number.isSafeInteger(pos) || pos < 0 || !Number.isSafeInteger(num) || num < 1 || num > 100) {
      throw new Error('pos 必须为非负安全整数，num 必须在1到100之间');
    }
  }

  async getSnowlumaMsgList (targetUin?: string, pos = 0, num = 20): Promise<SlQzoneMsgList> {
    this.slPagination(pos, num);
    const user = this.currentUser();
    const target = this.slTarget(user, targetUin);
    const params = new URLSearchParams({
      uin: target,
      ftype: '0',
      sort: '0',
      pos: String(pos),
      num: String(num),
      replynum: '100',
      callback: '_preloadCallback',
      code_version: '1',
      format: 'jsonp',
      need_private_comment: '1',
    });
    let response: Record<string, unknown>;
    try {
      response = await this.web('GetSlMsgList', params, user);
    } catch (error) {
      // 仅对已明确拒绝的只读请求切换已知代理域，不跟随重定向、不重放写操作。
      if (!(error instanceof QzoneWebError) || error.field !== 'code' || error.code !== -10000) throw error;
      response = await this.web('GetSlMsgListFallback', new URLSearchParams({
        uin: target, ftype: '0', sort: '0', pos: String(pos), num: String(num), code_version: '1', format: 'json',
      }), user);
    }
    return parseSlQzoneMsgList(response);
  }

  async getSnowlumaMsgDetail (tid: string, targetUin?: string, pos = 0, num = 20): Promise<SlQzoneMsgDetail> {
    if (!validIdentity(tid, 8192)) throw new Error('tid 必须是有效的说说标识');
    this.slPagination(pos, num);
    const user = this.currentUser();
    const target = this.slTarget(user, targetUin);
    const response = await this.web('GetOwnMsgDetail', new URLSearchParams({
      tid,
      uin: target,
      t1_source: '1',
      not_trunc_con: '1',
      need_right: '1',
      not_adapt_outpic: '1',
      pos: String(pos),
      num: String(num),
    }), user);
    return parseSlQzoneMsgDetail(response, tid);
  }

  async setSnowlumaLike (tid: string, targetUin: string | undefined, enable: boolean, abstime = 0): Promise<void> {
    const user = this.currentUser();
    const target = this.slTarget(user, targetUin);
    const body = buildSlQzoneLikeBody(user.uin, target, tid, enable, abstime);
    await this.web(enable ? 'LikeSlMsg' : 'UnlikeSlMsg', new URLSearchParams(body), user);
  }

  async commentSnowluma (tid: string, content: string, targetUin?: string, options?: SlQzoneCommentOptions): Promise<SlQzoneCommentResult> {
    const user = this.currentUser();
    const target = this.slTarget(user, targetUin);
    const body = buildSlQzoneCommentBody(user.uin, target, tid, content, options);
    const response = await this.web(options?.comment_id !== undefined ? 'ReplySlMsg' : 'CommentSlMsg', new URLSearchParams(body), user);
    return parseSlQzoneComment(response, options);
  }

  async uploadCommentImage (base64: string): Promise<{ url: string; }> {
    if (typeof base64 !== 'string' || !base64 || base64.length > 32 * 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      throw new Error('QQ空间评论图片数据无效或超过限制');
    }
    const user = this.currentUser();
    const text = await this.requestText(user, (gtk, auth) => ({
      url: `https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=${gtk}`,
      method: 'POST',
      body: buildQzoneUploadImageBody({ uin: user.uin, skey: auth.skey, pskey: auth.pskey, g_tk: String(gtk), base64 }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }), true);
    let response: Record<string, unknown>;
    try {
      // The upload CGI acknowledges with ret:0 rather than code:0.
      response = parseQzoneWebResponse(text);
    } catch (error) {
      throw new Error(`${(error as Error).message}；图片上传结果未确认，请先查询状态，勿自动重试`);
    }
    const data = response['data'];
    if (!isRecord(data) || typeof data['url'] !== 'string' || data['url'].trim() !== data['url'] ||
      [...data['url']].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
      throw new Error('QQ空间上传未返回可用图片地址');
    }
    let url: URL;
    try {
      url = new URL(data['url']);
    } catch {
      throw new Error('QQ空间上传图片地址无效');
    }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('QQ空间上传图片地址无效');
    return { url: url.href };
  }

  async getSnowlumaFeeds (pageNum = 1, count = 10, cursor?: string): Promise<SlQzoneFeedPage> {
    if (!Number.isSafeInteger(pageNum) || pageNum < 1 || !Number.isSafeInteger(count) || count < 1 || count > 50) {
      throw new Error('page_num 必须为正安全整数，count 必须在1到50之间');
    }
    const user = this.currentUser();
    const previous = this.readCursor(cursor, user, 'sl-feeds', '');
    if (previous && (!previous.slFeedState || !previous.slFeedPage)) throw new Error('QQ空间动态游标无效');
    const requestedPage = previous?.slFeedPage ?? pageNum;
    if (previous && pageNum !== 1 && pageNum !== requestedPage) throw new Error('page_num 与动态游标不匹配');
    if (!previous && pageNum > SL_FEED_SKIP_LIMIT) throw new Error('跳页超过20页读取预算，请从首页使用游标续页');
    let state = previous?.slFeedState ? structuredClone(previous.slFeedState) : initialSlQzoneFeedState();
    const position = (value: SlQzoneFeedState): string => createHash('sha256').update(slQzoneFeedPosition(value)).digest('hex');
    const visited = new Set(previous?.slFeedPositions ?? [position(state)]);
    const deadline = Date.now() + SL_FEED_DEADLINE_MS;
    for (let page = previous?.slFeedPage ?? 1; page <= requestedPage; page++) {
      const text = await this.requestText(user, gtk => {
        const params = new URLSearchParams({
          uin: user.uin,
          scope: '0',
          view: '1',
          gid: '',
          flag: '1',
          filter: 'all',
          applist: 'all',
          refresh: '0',
          firstGetGroup: '0',
          mixnocache: '0',
          scene: '0',
          sidomain: 'qzonestyle.gtimg.cn',
          callback: '_preloadCallback',
          format: 'jsonp',
          useutf8: '1',
          outputhtmlfeed: '1',
          count: String(count),
          usertime: String(Math.floor(Date.now() / 1000)),
          rd: String(Math.random()),
          windowId: String(Math.random()),
          g_tk: String(gtk),
        });
        for (const [key, value] of Object.entries(state)) params.set(key === 'aisortNextTime' ? 'getAisort' : key, value);
        return { url: `${WEB_ROOT}ic2.qzone.qq.com/cgi-bin/feeds/feeds3_html_more?${params}`, method: 'GET' };
      }, false, deadline);
      const data = parseSlQzoneFeeds(text);
      if (!data.has_more) return page < requestedPage ? { feeds: [], has_more: false, next_cursor: null } : { feeds: data.feeds, has_more: false, next_cursor: null };
      if (!data.main) throw new Error('QQ空间动态缺少续页状态');
      const next = advanceSlQzoneFeedState(state, data.main);
      const nextPosition = position(next);
      if (visited.has(nextPosition)) throw new Error('QQ空间动态续页位置未推进，请重新读取');
      visited.add(nextPosition);
      if (page === requestedPage) {
        const token = this.saveCursor({
          account: this.accountKey(user),
          kind: 'sl-feeds',
          target: '',
          attachInfo: '',
          slFeedState: next,
          slFeedPage: page + 1,
          slFeedPositions: [...visited].slice(-32),
        }, 'slqf:');
        return { feeds: data.feeds, has_more: true, next_cursor: token };
      }
      state = next;
    }
    throw new Error('QQ空间动态页码无效');
  }

  async setProfile (profile: QzoneProfileUpdate): Promise<void> {
    const user = this.currentUser();
    const body = buildQzoneProfileBody(user.uin, profile);
    await this.web('SetProfile', new URLSearchParams(body), user);
  }

  async setMsgRight (tid: string, ugcRight: number, targetUins?: string[]): Promise<{ ugc_right: number; }> {
    if (!validIdentity(tid, 8192)) throw new Error('tid 必须是有效的说说标识');
    const normalized = normalizeQzoneRight(ugcRight, targetUins);
    const user = this.currentUser();
    const lockKey = `${this.accountKey(user)}:${tid}`;
    if (this.rightUpdates.has(lockKey)) throw new Error('该说说正在修改权限，请稍后重试');
    this.rightUpdates.add(lockKey);
    try {
      const detail = await this.web('GetOwnMsgDetail', new URLSearchParams({
        tid, uin: user.uin, t1_source: '1', not_trunc_con: '1', need_right: '1', not_adapt_outpic: '1',
      }), user);
      const body = buildQzoneRightBody(detail, user.uin, tid, normalized.right, normalized.targetUins);
      const result = await this.web('SetMsgRight', new URLSearchParams(body), user);
      if (result['ugc_right'] === undefined) return { ugc_right: normalized.right };
      const returnedRight = typeof result['ugc_right'] === 'string' && /^\d+$/.test(result['ugc_right'])
        ? Number(result['ugc_right'])
        : result['ugc_right'];
      if (typeof returnedRight !== 'number' || ![1, 4, 16, 64, 128].includes(returnedRight)) {
        throw new Error('QQ空间返回的权限无效，请回读说说确认，勿自动重试');
      }
      if (returnedRight !== normalized.right) throw new Error('QQ空间返回权限与请求不一致，请回读说说确认，勿自动重试');
      return { ugc_right: returnedRight };
    } finally {
      this.rightUpdates.delete(lockKey);
    }
  }

  async setBan (targetUin: string, enable = true): Promise<void> {
    const user = this.currentUser();
    const body = buildQzoneBanBody(user.uin, targetUin, enable);
    await this.web('SetBan', new URLSearchParams(body), user);
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

  private async detailResponse (ref: QzoneFeedReference, user: QzoneUser): Promise<Record<string, unknown>> {
    return await this.rpc('GetFeedDetail', {
      union_id: ref.union_id,
      cell_feed_transfer: ref.cell_feed_transfer,
      feed_action_domain_type: ref.feed_action_domain_type ?? 1,
      from_page: 1,
    }, user);
  }

  private detailFeed (data: Record<string, unknown>): QzoneFeed {
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
    return feed;
  }

  private currentReference (ref: QzoneFeedReference, feed: QzoneFeed): QzoneFeedReference {
    const current = referenceSnapshot(ref);
    const common = feed.cell_common;
    if (isRecord(common)) {
      if (common['union_id'] !== undefined && common['union_id'] !== null) current.union_id = common['union_id'] as QzoneUnionId;
      if (typeof common['domain_type'] === 'number' && Number.isInteger(common['domain_type']) && common['domain_type'] >= 1 && common['domain_type'] <= 3) {
        current.feed_action_domain_type = common['domain_type'];
      }
      if (validIdentity(common['cur_like_key'], 8192)) current.like_key = common['cur_like_key'];
    }
    if (feed.cell_feed_transfer !== undefined && feed.cell_feed_transfer !== null) current.cell_feed_transfer = feed.cell_feed_transfer;
    return referenceSnapshot(current);
  }

  private commentCell (value: unknown): { comments: QzoneComment[]; count: number | null; } {
    if (value === undefined) return { comments: [], count: null };
    if (!isRecord(value) || (value['comments'] !== undefined && (!Array.isArray(value['comments']) || value['comments'].some(item => !isRecord(item))))) {
      throw new Error('QQ空间评论响应格式异常');
    }
    return { comments: (value['comments'] ?? []) as QzoneComment[], count: observedCount(value['num']) };
  }

  private commentPageState (data: Record<string, unknown>, field: 'attach_info' | 'reply_attach_info', previous?: string): { hasMore: boolean; attachInfo: string; } {
    if (data['has_more'] !== undefined && typeof data['has_more'] !== 'boolean') throw new Error('QQ空间评论分页状态无效');
    const hasMore = data['has_more'] === true;
    const attachInfo = data[field];
    if (hasMore && (typeof attachInfo !== 'string' || !attachInfo.length || attachInfo.length > MAX_ATTACH_LENGTH || attachInfo === previous)) {
      throw new Error('QQ空间评论续页信息缺失或未推进，请重新读取');
    }
    return { hasMore, attachInfo: typeof attachInfo === 'string' ? attachInfo : '' };
  }

  private saveCommentCursor (user: QzoneUser, boundRef: QzoneFeedReference, requestRef: QzoneFeedReference, attachInfo: string): string {
    return this.saveCursor({
      account: this.accountKey(user), kind: 'comments', target: commentScope(boundRef), attachInfo, feedReference: requestRef,
    });
  }

  async getMsgDetail (reference: QzoneFeedReference): Promise<QzoneDetail> {
    const ref = referenceSnapshot(reference);
    const user = this.currentUser();
    const data = await this.detailResponse(ref, user);
    const feed = this.detailFeed(data);
    const item = normalizeQzoneFeed(feed);
    const state = this.commentPageState(data, 'attach_info');
    // 旧详情仍返回原来的规范化引用；分页请求在内部保留 H5 返回的完整新上下文。
    const nextCursor = state.hasMore && item.feed_ref
      ? this.saveCommentCursor(user, item.feed_ref, this.currentReference(ref, feed), state.attachInfo)
      : null;
    return {
      ...item,
      comments: feed.cell_comment?.comments ?? [],
      comment_has_more: state.hasMore,
      comment_next_cursor: nextCursor,
    };
  }

  async getComments (reference: QzoneFeedReference, cursor?: string): Promise<QzoneCommentPage> {
    const ref = referenceSnapshot(reference);
    const user = this.currentUser();
    const previous = this.readCursor(cursor, user, 'comments', commentScope(ref));
    let current = ref;
    let data: Record<string, unknown>;
    let cell: { comments: QzoneComment[]; count: number | null; };
    if (previous) {
      if (!previous.feedReference) throw new Error('QQ空间评论游标无效，请重新读取');
      current = referenceSnapshot(previous.feedReference);
      data = await this.rpc('GetComment', {
        union_id: current.union_id, attach_info: previous.attachInfo, cell_feed_transfer: current.cell_feed_transfer,
      }, user);
      const commentCell = data['cell_comment'];
      // 空末页可能省略 repeated 字段，只有明确结束时才接受，避免把畸形响应当作读完。
      if (commentCell === undefined && data['has_more'] === false) {
        cell = { comments: [], count: null };
      } else {
        if (!isRecord(commentCell) || (commentCell['comments'] === undefined && data['has_more'] !== false)) {
          throw new Error('QQ空间评论响应缺少有效cell_comment对象或评论列表');
        }
        cell = this.commentCell(commentCell);
      }
    } else {
      data = await this.detailResponse(ref, user);
      const feed = this.detailFeed(data);
      current = this.currentReference(ref, feed);
      cell = this.commentCell(feed.cell_comment);
    }
    const comments = cell.comments.map(normalizeQzoneComment);
    const state = this.commentPageState(data, 'attach_info', previous?.attachInfo);
    const nextCursor = state.hasMore ? this.saveCommentCursor(user, current, current, state.attachInfo) : null;
    return {
      feed_ref: current,
      comment_num: cell.count,
      comments,
      has_more: state.hasMore,
      next_cursor: nextCursor,
      raw: data,
    };
  }

  async getCommentReplies (reference: QzoneFeedReference, parent: QzoneComment, cursor?: string): Promise<QzoneReplyPage> {
    const ref = referenceSnapshot(reference);
    const parentSnapshot = readParentSnapshot(parent);
    const user = this.currentUser();
    const scope = commentScope(ref, parentSnapshot);
    const previous = this.readCursor(cursor, user, 'replies', scope);
    let current = ref;
    let requestParent = parentSnapshot;
    if (previous) {
      if (!previous.feedReference || !previous.parentComment) throw new Error('QQ空间回复游标无效，请重新读取');
      current = referenceSnapshot(previous.feedReference);
      requestParent = readParentSnapshot(previous.parentComment);
    }
    const initialAttach = requestParent['reply_attach_info'];
    if (initialAttach !== undefined && initialAttach !== null && (typeof initialAttach !== 'string' || initialAttach.length > MAX_ATTACH_LENGTH)) {
      throw new Error('QQ空间父评论的回复续页信息无效');
    }
    const attachInfo = previous?.attachInfo ?? (typeof initialAttach === 'string' ? initialAttach : '');
    const data = await this.rpc('GetReplies', {
      union_id: current.union_id,
      cur_comment: requestParent,
      comment_attach_info: '',
      reply_attach_info: attachInfo,
      page_size: 20,
      cell_feed_transfer: current.cell_feed_transfer,
    }, user);
    const replyList = data['replys'];
    if ((replyList === undefined && data['has_more'] !== false) ||
      (replyList !== undefined && (!Array.isArray(replyList) || replyList.some(item => !isRecord(item))))) {
      throw new Error('QQ空间回复响应格式异常');
    }
    const replies = ((replyList ?? []) as QzoneComment[]).map(normalizeQzoneReply);
    const state = this.commentPageState(data, 'reply_attach_info', attachInfo);
    const nextParent = state.hasMore
      ? readParentSnapshot({
        ...requestParent, reply_attach_info: state.attachInfo, has_more_reply: state.hasMore,
      })
      : undefined;
    const nextCursor = state.hasMore
      ? this.saveCursor({
        account: this.accountKey(user),
        kind: 'replies',
        target: scope,
        attachInfo: state.attachInfo,
        feedReference: current,
        // 保留首次完整父对象和内联回复，只推进分页元数据，不累计整段历史到请求中。
        parentComment: nextParent,
      })
      : null;
    return {
      feed_ref: current,
      comment_id: String(requestParent.id),
      replies,
      reply_num: data['reply_num'] === undefined ? observedCount(requestParent['reply_num']) : observedCount(data['reply_num']),
      has_more: state.hasMore,
      next_cursor: nextCursor,
      raw: data,
    };
  }

  async publishMsg (content: string, ugcRight = 1, targetUins?: string[]): Promise<{ tid: string; time: number; }> {
    const user = this.currentUser();
    const request = buildQzonePublishRequest(user, content, ugcRight, targetUins);
    const data = await this.rpc('PublishFeed', request, user);
    const tid = isRecord(data['feed']) ? getQzoneTid(data['feed'] as QzoneFeed) : null;
    if (!tid) throw new Error('QQ空间发表响应缺少说说标识，结果未知，请先查询列表确认，勿自动重试');
    return { tid, time: parseQzonePublishTime((data['feed'] as QzoneFeed).cell_common?.time) };
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

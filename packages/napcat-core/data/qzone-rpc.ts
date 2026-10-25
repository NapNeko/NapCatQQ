import { Buffer } from 'node:buffer';

export const QZONE_REFERENCE_MAX_BYTES = 64 * 1024;
const MAX_IDENTITY_LENGTH = 8192;
const MAX_TEXT_LENGTH = 2000;

export interface QzoneUnionExtension {
  ext_id_type?: number;
  numeric?: number | string;
  str?: string;
  unsigned_numeric?: number | string;
  [key: string]: unknown;
}

export interface QzoneUnionId {
  uf_key?: string;
  ugc_id?: string;
  feed_id?: string;
  ext_ids?: QzoneUnionExtension[];
  serialized_data?: string;
  [key: string]: unknown;
}

export interface QzoneUser {
  uin: string;
  uid?: string;
  nick?: string;
  [key: string]: unknown;
}

export interface QzoneRichMsg {
  type: number;
  content?: string;
  media_items?: unknown[];
  name?: string;
  uid?: string;
  uin?: string;
  url?: string;
  who?: number;
  [key: string]: unknown;
}

export interface QzoneComment {
  id?: string | number;
  user?: Partial<QzoneUser>;
  content?: QzoneRichMsg[];
  replys?: QzoneComment[];
  [key: string]: unknown;
}

export interface QzoneFeed {
  cell_common?: {
    union_id?: QzoneUnionId;
    time?: number | string;
    app_id?: number;
    feed_type?: number;
    feed_sub_type?: number;
    feed_biz_type?: number;
    client_key?: string;
    cur_like_key?: string;
    domain_type?: number;
    operate_mask?: number;
    [key: string]: unknown;
  };
  cell_user_info?: { user?: QzoneUser; [key: string]: unknown; };
  cell_summary?: { summary?: QzoneRichMsg[]; [key: string]: unknown; };
  cell_media?: { media_items?: unknown[]; [key: string]: unknown; };
  cell_comment?: { num?: number | string; comments?: QzoneComment[]; [key: string]: unknown; };
  cell_like?: { num?: number | string; liked?: boolean; [key: string]: unknown; };
  cell_feed_transfer?: unknown;
  [key: string]: unknown;
}

export interface QzoneFeedReference {
  union_id: QzoneUnionId;
  cell_feed_transfer?: unknown;
  feed_action_domain_type?: number;
  like_key?: string;
  [key: string]: unknown;
}

export interface QzoneFeedItem {
  tid: string | null;
  user_id: string | null;
  content: string | null;
  time: number | null;
  comment_num: number | null;
  like_num: number | null;
  images: string[] | null;
  feed_ref: QzoneFeedReference | null;
  feed: QzoneFeed;
}

export interface QzoneFeedPage {
  feeds: QzoneFeedItem[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface QzoneMsgPage {
  msglist: QzoneFeedItem[];
  has_more: boolean;
  next_cursor: string | null;
  seal_off_memory?: Record<string, unknown>;
}

export interface QzoneDetail extends QzoneFeedItem {
  comments: QzoneComment[];
  comment_has_more?: boolean;
  comment_next_cursor?: string | null;
}

function record (value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : undefined;
}

function identity (value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_IDENTITY_LENGTH ? value : null;
}

function nonnegativeInteger (value: unknown): number | null {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function numericIdentifier (value: unknown): string | null {
  if (typeof value === 'string' && /^\d+$/.test(value) && /[1-9]/.test(value)) return value;
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? String(value) : null;
}

export function getQzoneGtk (key: string): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) hash += (hash << 5) + key.charCodeAt(i);
  return hash & 0x7fffffff;
}

export function getQzoneTid (feed: QzoneFeed): string | null {
  const common = record(feed?.cell_common);
  const union = record(common?.['union_id']);
  if (!union) return null;
  const extensions = union['ext_ids'];
  if (Array.isArray(extensions)) {
    const extension = extensions.map(record).find(item => item?.['ext_id_type'] === 5);
    if (extension) {
      const tid = identity(extension['str']) ?? numericIdentifier(extension['unsigned_numeric']) ?? numericIdentifier(extension['numeric']);
      if (tid !== null) return tid;
    }
  }
  // Other feed kinds also have ugc_id; an album ID is not a mood tid.
  if (common?.['feed_sub_type'] !== 1 && common?.['app_id'] !== 311) return null;
  return identity(union['ugc_id']);
}

export function normalizeQzoneRichContent (value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const parts: string[] = [];
  for (const item of value) {
    const segment = record(item);
    if (!segment) return null;
    switch (segment['type']) {
      case 0:
      case 2:
      case 4:
        if (typeof segment['content'] !== 'string') return null;
        parts.push(segment['content']);
        break;
      case 1:
      case 5:
        if (typeof segment['name'] !== 'string') return null;
        parts.push(segment['type'] === 1 ? `@${segment['name']}` : segment['name']);
        break;
      case 3:
        break;
      default:
        return null;
    }
  }
  return parts.join('');
}

function imageUrl (value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const url = value.startsWith('//') ? `https:${value}` : value;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !parsed.username && !parsed.password ? url : null;
  } catch {
    return null;
  }
}

export function normalizeQzoneMediaImages (value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const images: string[] = [];
  for (const item of value) {
    const media = record(item);
    if (!media) return null;
    if (media['type'] === 1) continue; // Video covers are not post images.
    if (media['type'] !== 0) return null;
    const image = record(media['image']);
    if (!image) return null;
    const variants = Array.isArray(image['photo_url']) ? image['photo_url'].map(record) : [];
    let selected: string | null = null;
    // Same original-image preference as the H5 client: download, origin, big, current.
    for (const spec of [6, 0, 1, 5]) {
      const variant = variants.find(candidate => candidate?.['spec'] === spec);
      selected = imageUrl(record(variant?.['url'])?.['url']);
      if (selected !== null) break;
    }
    selected ??= imageUrl(record(image['default_url'])?.['url']);
    if (selected === null) return null;
    images.push(selected);
  }
  return images;
}

function assertJson (value: unknown, depth = 0): void {
  if (depth > 32) throw new Error('QQ空间动态引用嵌套过深');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    for (const item of value) assertJson(item, depth + 1);
    return;
  }
  const object = record(value);
  if (!object) throw new Error('QQ空间动态引用必须为JSON数据');
  for (const item of Object.values(object)) {
    if (item !== undefined) assertJson(item, depth + 1);
  }
}

export function validateQzoneFeedReference (value: unknown): QzoneFeedReference {
  const reference = record(value);
  const union = record(reference?.['union_id']);
  if (!reference || !union) throw new Error('QQ空间动态引用缺少union_id');
  const keys = ['uf_key', 'ugc_id', 'feed_id', 'serialized_data'];
  let hasIdentity = false;
  for (const key of keys) {
    if (union[key] === undefined) continue;
    const field = union[key];
    if (typeof field !== 'string' || field.length > MAX_IDENTITY_LENGTH) throw new Error('QQ空间动态标识无效');
    // Protobuf JSON may include empty defaults alongside an issued identity.
    if (field.trim().length > 0) hasIdentity = true;
  }
  if (!hasIdentity) throw new Error('QQ空间动态引用缺少有效标识');
  if (union['ext_ids'] !== undefined && (!Array.isArray(union['ext_ids']) || union['ext_ids'].some(item => !record(item)))) {
    throw new Error('QQ空间动态扩展标识无效');
  }
  const domain = reference['feed_action_domain_type'];
  if (domain !== undefined && (typeof domain !== 'number' || !Number.isInteger(domain) || domain < 1 || domain > 3)) {
    throw new Error('QQ空间动态所属域无效');
  }
  if (reference['like_key'] !== undefined && identity(reference['like_key']) === null) throw new Error('QQ空间点赞标识无效');
  assertJson(reference);
  let serialized: string;
  try {
    const encoded = JSON.stringify(reference);
    if (typeof encoded !== 'string') throw new Error('Invalid JSON');
    serialized = encoded;
  } catch {
    throw new Error('QQ空间动态引用无法序列化');
  }
  if (Buffer.byteLength(serialized, 'utf8') > QZONE_REFERENCE_MAX_BYTES) throw new Error('QQ空间动态引用不能超过64KiB');
  return reference as unknown as QzoneFeedReference;
}

export function normalizeQzoneFeed (feed: QzoneFeed): QzoneFeedItem {
  if (!record(feed)) throw new Error('QQ空间动态数据格式无效');
  const common = record(feed.cell_common);
  const user = record(record(feed.cell_user_info)?.['user']);
  let reference: QzoneFeedReference | null = null;
  if (record(common?.['union_id'])) {
    const candidate: Record<string, unknown> = { union_id: common?.['union_id'] };
    if (feed.cell_feed_transfer !== undefined) candidate['cell_feed_transfer'] = feed.cell_feed_transfer;
    const domain = common?.['domain_type'];
    if (typeof domain === 'number' && Number.isInteger(domain) && domain >= 1 && domain <= 3) candidate['feed_action_domain_type'] = domain;
    if (identity(common?.['cur_like_key']) !== null) candidate['like_key'] = common?.['cur_like_key'];
    try {
      reference = validateQzoneFeedReference(candidate);
    } catch {
      // Preserve the raw feed while declining to issue an unusable action handle.
    }
  }
  return {
    tid: getQzoneTid(feed),
    user_id: numericIdentifier(user?.['uin']),
    content: normalizeQzoneRichContent(record(feed.cell_summary)?.['summary']),
    time: nonnegativeInteger(common?.['time']),
    comment_num: nonnegativeInteger(record(feed.cell_comment)?.['num']),
    like_num: nonnegativeInteger(record(feed.cell_like)?.['num']),
    images: normalizeQzoneMediaImages(record(feed.cell_media)?.['media_items']),
    feed_ref: reference,
    feed,
  };
}

export function buildQzoneText (content: string): QzoneRichMsg[] {
  if (typeof content !== 'string' || !content.trim()) throw new Error('QQ空间正文不能为空');
  if (content.length > MAX_TEXT_LENGTH) throw new Error('QQ空间正文不能超过2000字');
  return [{ content, media_items: [], name: '', type: 0, uid: '', uin: '', url: '', who: 0 }];
}

export function buildQzonePublishRequest (
  user: QzoneUser,
  content: string,
  ugcRight: number,
  targetUins?: string[],
  now = Math.floor(Date.now() / 1000),
  key?: string
): { feed: QzoneFeed; from: number; } {
  if (!user || typeof user.uin !== 'string' || numericIdentifier(user.uin) === null) throw new Error('QQ空间当前账号无效');
  if (user.uid !== undefined && typeof user.uid !== 'string') throw new Error('QQ空间当前账号UID无效');
  if (user.nick !== undefined && typeof user.nick !== 'string') throw new Error('QQ空间当前账号昵称无效');
  const permissions = new Map([[1, 1], [4, 2], [16, 3], [128, 4], [64, 5]]);
  const flag = permissions.get(ugcRight);
  if (flag === undefined) throw new Error('ugc_right仅支持1、4、16、64、128');
  if (targetUins !== undefined && (!Array.isArray(targetUins) || targetUins.some(uin => typeof uin !== 'string' || numericIdentifier(uin) === null))) {
    throw new Error('target_uins必须为有效QQ号数组');
  }
  if ((ugcRight === 16 || ugcRight === 128) && !targetUins?.length) throw new Error('ugc_right为16或128时target_uins不能为空');
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('QQ空间发表时间无效');
  const clientKey = key ?? `${user.uin}_${now}_${Math.floor(Math.random() * 1e10)}`;
  if (identity(clientKey) === null) throw new Error('QQ空间发表请求标识无效');
  const right: Record<string, unknown> = { flag: [flag] };
  if (ugcRight === 16) right['white_uins'] = [...targetUins!];
  if (ugcRight === 128) right['black_uins'] = [...targetUins!];
  return {
    feed: {
      cell_common: {
        time: now,
        client_key: clientKey,
        feed_type: 1,
        feed_sub_type: 1,
        union_id: { uf_key: clientKey, ugc_id: clientKey, feed_id: clientKey },
        feed_biz_type: 0,
      },
      cell_user_info: { user: { uin: user.uin, uid: user.uid ?? '', nick: user.nick ?? '' } },
      cell_summary: { summary: buildQzoneText(content) },
      cell_permission: { right },
    },
    from: 3,
  };
}

export function parseQzoneRpcResponse (value: unknown): Record<string, unknown> {
  const response = record(value);
  if (!response || response['retcode'] !== 0) {
    const code = response?.['retcode'];
    const suffix = typeof code === 'number' && Number.isSafeInteger(code) ? ` (retcode=${code})` : '';
    throw new Error(`QQ空间请求失败${suffix}`);
  }
  const data = record(response['data']);
  if (!data) throw new Error('QQ空间响应缺少有效data对象');
  return data;
}

import JSON5 from 'json5';
import { Parser } from 'htmlparser2';
import { createHash } from 'node:crypto';

export interface SlQzoneFeed {
  uin: number;
  nickname: string;
  time: number;
  appid: number;
  key: string;
  html: string;
  tid: string | null;
  content: string | null;
  content_complete: boolean | null;
  images: string[] | null;
  like_count: number | null;
  comment_count: number | null;
}

export interface SlQzoneFeedPage {
  feeds: SlQzoneFeed[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface SlQzoneFeedState {
  begintime: string;
  dayspac: string;
  pagenum: string;
  aisortEndTime: string;
  aisortOffset: string;
  aisortBeginTime: string;
  aisortNextTime: string;
  icServerTime: string;
  externparam: string;
  daylist: string;
  uinlist: string;
}

export interface SlQzoneParsedFeeds {
  feeds: SlQzoneFeed[];
  has_more: boolean;
  main: Record<string, unknown> | null;
}

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_DEPTH = 64;
const MAX_TOKENS = 200000;
const MAX_HTML_NODES = 50000;
const STATE_NUMBERS = ['begintime', 'dayspac', 'pagenum', 'aisortEndTime', 'aisortOffset', 'aisortBeginTime', 'aisortNextTime', 'icServerTime'] as const;
const STATE_STRINGS = ['externparam', 'daylist', 'uinlist'] as const;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function record (value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function count (value: unknown): number | null {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function scalar (value: unknown, label: string): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new Error(`QQ空间动态${label}格式异常`);
  return value;
}

function wireNumber (value: unknown, label: string): number {
  if (value === undefined || value === null) return 0;
  const result = count(value);
  if (result === null) throw new Error(`QQ空间动态${label}格式异常`);
  return result;
}

/** Only adapt data syntax that JSON5 lacks: undefined values and elided array slots. */
function json5DataSource (source: string, undefinedMarker: string): string {
  const chunks: string[] = [];
  const nesting: Array<{ array: boolean; awaiting: boolean; }> = [];
  let offset = 0;
  let tokens = 0;
  const statusKeys = new Set<string>();
  const markValue = () => {
    const parent = nesting[nesting.length - 1];
    if (parent?.array) parent.awaiting = false;
  };
  const nextSignificant = (start: number): number => {
    let index = start;
    while (index < source.length) {
      if (/\s/.test(source[index]!)) index++;
      else if (source.startsWith('//', index)) {
        const end = source.indexOf('\n', index + 2);
        index = end < 0 ? source.length : end + 1;
      } else if (source.startsWith('/*', index)) {
        const end = source.indexOf('*/', index + 2);
        if (end < 0) throw new Error('QQ空间动态字面量注释未结束');
        index = end + 2;
      } else break;
    }
    return index;
  };
  const checkStatusKey = (raw: string, quoted: boolean, end: number) => {
    if (nesting.length !== 1 || nesting[0]?.array || source[nextSignificant(end)] !== ':') return;
    let key: unknown = raw;
    if (quoted) key = JSON5.parse(raw);
    else if (raw.includes('\\')) key = Object.keys(JSON5.parse(`{${raw}:0}`))[0];
    if (key !== 'code' && key !== 'subcode') return;
    if (statusKeys.has(key)) throw new Error('QQ空间动态响应状态字段重复');
    statusKeys.add(key);
  };
  while (offset < source.length) {
    if (++tokens > MAX_TOKENS) throw new Error('QQ空间动态字面量节点过多');
    const char = source[offset]!;
    if (/\s/.test(char)) {
      const start = offset++;
      while (offset < source.length && /\s/.test(source[offset]!)) offset++;
      chunks.push(source.slice(start, offset));
      continue;
    }
    if (source.startsWith('//', offset) || source.startsWith('/*', offset)) {
      const start = offset;
      if (source[offset + 1] === '/') {
        const end = source.indexOf('\n', offset + 2);
        offset = end < 0 ? source.length : end + 1;
      } else {
        const end = source.indexOf('*/', offset + 2);
        if (end < 0) throw new Error('QQ空间动态字面量注释未结束');
        offset = end + 2;
      }
      chunks.push(source.slice(start, offset));
      continue;
    }
    if (char === '"' || char === "'") {
      const start = offset++;
      let closed = false;
      while (offset < source.length) {
        const current = source[offset++]!;
        if (current === '\\') offset++;
        else if (current === char) {
          closed = true;
          break;
        }
      }
      if (!closed) throw new Error('QQ空间动态字面量字符串未结束');
      const literal = source.slice(start, offset);
      checkStatusKey(literal, true, offset);
      chunks.push(literal);
      markValue();
      continue;
    }
    if (char === '[' || char === '{') {
      markValue();
      nesting.push({ array: char === '[', awaiting: true });
      if (nesting.length > MAX_DEPTH) throw new Error('QQ空间动态字面量嵌套过深');
      chunks.push(char);
      offset++;
      continue;
    }
    if (char === ']' || char === '}') {
      const current = nesting.pop();
      if (!current || current.array !== (char === ']')) throw new Error('QQ空间动态字面量括号不匹配');
      chunks.push(char);
      offset++;
      continue;
    }
    if (char === ',') {
      const current = nesting[nesting.length - 1];
      if (current?.array) {
        if (current.awaiting) chunks.push('null');
        current.awaiting = true;
      }
      chunks.push(char);
      offset++;
      continue;
    }
    if (char === ':') {
      chunks.push(char);
      offset++;
      continue;
    }
    const start = offset++;
    while (offset < source.length && !/[\s[\]{},:'"]/.test(source[offset]!) && !source.startsWith('//', offset) && !source.startsWith('/*', offset)) offset++;
    const token = source.slice(start, offset);
    checkStatusKey(token, false, offset);
    chunks.push(token === 'undefined' && source[nextSignificant(offset)] !== ':' ? JSON.stringify(undefinedMarker) : token);
    markValue();
  }
  if (nesting.length) throw new Error('QQ空间动态字面量括号未结束');
  return chunks.join('');
}

function parseDataBody (text: string): Record<string, unknown> {
  if (typeof text !== 'string' || Buffer.byteLength(text) > MAX_INPUT_BYTES) throw new Error('QQ空间动态响应过大或无效');
  let source = text.trim();
  if (!source.startsWith('{')) {
    const prefix = /^(?:_preloadCallback|_Callback|callback)\s*\(/.exec(source);
    const suffix = /\)\s*;?\s*$/.exec(source);
    if (!prefix || !suffix || suffix.index < prefix[0].length) throw new Error('QQ空间动态回调格式异常');
    source = source.slice(prefix[0].length, suffix.index).trim();
  }
  if (!source.startsWith('{')) throw new Error('QQ空间动态缺少对象响应');
  let value: unknown;
  try {
    // Content-addressed marker keeps optional object fields absent instead of changing undefined into null.
    const undefinedMarker = `\u0000qz:${createHash('sha256').update(source).digest('hex')}`;
    value = JSON5.parse(json5DataSource(source, undefinedMarker), (key, item: unknown) => {
      if (DANGEROUS_KEYS.has(key) || (typeof item === 'number' && !Number.isFinite(item))) throw new Error('Unsupported data');
      return item === undefinedMarker ? undefined : item;
    });
  } catch {
    throw new Error('QQ空间动态字面量格式异常');
  }
  if (!record(value)) throw new Error('QQ空间动态缺少对象响应');
  return value;
}

interface HtmlElement {
  tag: string;
  attributes: Record<string, string>;
  parent?: HtmlElement;
  children: Array<HtmlElement | string>;
}

function classes (element: HtmlElement): string[] {
  return (element.attributes['class'] ?? '').split(/\s+/);
}

const EXCLUDED_CLASSES = new Set(['mod-comments', 'comments-list', 'f-item-passive', 'f-ct-video']);
const EXCLUDED_TAGS = new Set(['script', 'style', 'noscript', 'template']);

function excluded (element: HtmlElement): boolean {
  return EXCLUDED_TAGS.has(element.tag) || classes(element).some(name => EXCLUDED_CLASSES.has(name));
}

function descendants (root: HtmlElement, prune: boolean): HtmlElement[] {
  const result: HtmlElement[] = [];
  const pending: HtmlElement[] = [root];
  while (pending.length) {
    const current = pending.pop()!;
    if (current !== root && prune && excluded(current)) continue;
    result.push(current);
    for (let index = current.children.length - 1; index >= 0; index--) {
      const child = current.children[index];
      if (typeof child !== 'string' && child) pending.push(child);
    }
  }
  return result;
}

function htmlTree (html: string): HtmlElement {
  if (Buffer.byteLength(html) > MAX_HTML_BYTES) throw new Error('QQ空间动态HTML过大');
  const root: HtmlElement = { tag: '#root', attributes: {}, children: [] };
  const stack = [root];
  let nodes = 0;
  const parser = new Parser({
    onopentag (tag, attributes) {
      if (++nodes > MAX_HTML_NODES || stack.length > MAX_DEPTH) throw new Error('QQ空间动态HTML结构过大');
      const parent = stack[stack.length - 1]!;
      const element: HtmlElement = { tag, attributes: { ...attributes }, parent, children: [] };
      parent.children.push(element);
      stack.push(element);
    },
    onclosetag (tag) {
      for (let index = stack.length - 1; index > 0; index--) {
        if (stack[index]?.tag === tag) {
          stack.length = index;
          break;
        }
      }
    },
    ontext (text) {
      if (++nodes > MAX_HTML_NODES) throw new Error('QQ空间动态HTML结构过大');
      stack[stack.length - 1]!.children.push(text);
    },
  }, { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true });
  parser.end(html);
  return root;
}

function contentText (element: HtmlElement): string {
  const pieces: string[] = [];
  const blocks = new Set(['p', 'div', 'li', 'section', 'article', 'blockquote', 'ul', 'ol']);
  const visit = (node: HtmlElement | string) => {
    if (typeof node === 'string') {
      pieces.push(node.replace(/\s+/g, ' '));
      return;
    }
    if (excluded(node) || node.attributes['data-cmd'] === 'qz_toggle' || classes(node).includes('load_img')) return;
    if (node.tag === 'br') pieces.push('\n');
    else if (node.tag === 'img') pieces.push(node.attributes['alt'] ?? '');
    else {
      if (blocks.has(node.tag)) pieces.push('\n');
      for (const child of node.children) visit(child);
      if (blocks.has(node.tag)) pieces.push('\n');
    }
  };
  visit(element);
  return pieces.join('').replace(/[^\S\n]*\n[^\S\n]*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function imageUrl (value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function projectHtml (feed: SlQzoneFeed): void {
  const document = htmlTree(feed.html);
  const roots = descendants(document, true).filter(node => classes(node).includes('f-item') && node.attributes['data-key'] === feed.key);
  if (!feed.key || roots.length !== 1) return;
  const root = roots[0]!;
  if (excluded(root)) return;
  const elements = descendants(root, true);
  const metadata = elements.find(node => node.attributes['name'] === 'feed_data' && node.attributes['data-fkey'] === feed.key && node.attributes['data-uin'] === String(feed.uin));
  const tid = metadata?.attributes['data-tid'];
  if (feed.appid === 311 && tid?.trim() && tid.length <= 8192) feed.tid = tid;
  const textElements = elements.filter(node => classes(node).includes('f-info'));
  const full = textElements.find(node => classes(node).includes('qz_info_complete') && contentText(node).length > 0);
  const selected = full ?? textElements.find(node => !classes(node).includes('qz_info_complete'));
  if (selected) {
    feed.content = contentText(selected);
    feed.content_complete = full !== undefined || !descendants(selected, true).some(node => node.attributes['data-cmd'] === 'qz_toggle');
  }
  const pictures = new Set<string>();
  for (const element of elements) {
    if (!classes(element).includes('img-item') || element.attributes['data-v_itemid'] !== undefined || element.attributes['data-videotype'] !== undefined) continue;
    const fullUrl = imageUrl(element.attributes['data-originurl'] ?? element.attributes['data-url3']);
    if (fullUrl) pictures.add(fullUrl);
    else {
      for (const image of descendants(element, true)) {
        if (image.tag !== 'img') continue;
        const url = imageUrl(image.attributes['truesrc'] ?? image.attributes['src']);
        if (url) pictures.add(url);
      }
    }
  }
  feed.images = [...pictures];
  if (feed.like_count === null) {
    let card = root;
    for (let parent = root.parent; parent; parent = parent.parent) {
      if (classes(parent).includes('f-single')) {
        card = parent;
        break;
      }
    }
    const button = descendants(card, true).find(node => classes(node).includes('qz_like_btn_v3'));
    feed.like_count = count(button?.attributes['data-likecnt']);
  }
}

function moreFlag (value: unknown): boolean {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  throw new Error('QQ空间动态缺少明确的分页结束标志');
}

export function parseSlQzoneFeeds (text: string): SlQzoneParsedFeeds {
  const response = parseDataBody(text);
  if (response['code'] !== 0 || (response['subcode'] !== undefined && response['subcode'] !== 0)) throw new Error('QQ空间好友动态请求失败');
  const data = response['data'];
  if (!record(data) || !Array.isArray(data['data']) || data['data'].length > 1000) throw new Error('QQ空间好友动态列表格式异常');
  const mainValue = data['main'];
  if (mainValue !== undefined && !record(mainValue)) throw new Error('QQ空间好友动态分页信息无效');
  const main = record(mainValue) ? mainValue : null;
  if (main && main['error'] !== undefined && main['error'] !== '') throw new Error('QQ空间好友动态服务端报告失败');
  const hasMore = moreFlag(main ? main['hasMoreFeeds'] : data['hasmore']);
  if (hasMore && !main) throw new Error('QQ空间好友动态缺少续页状态');
  const feeds: SlQzoneFeed[] = [];
  for (const value of data['data']) {
    if (value === null || value === undefined) continue;
    if (!record(value)) throw new Error('QQ空间好友动态条目格式异常');
    const key = scalar(value['key'] ?? value['feedskey'], '标识');
    if (key.length > 8192) throw new Error('QQ空间动态标识过长');
    const feed: SlQzoneFeed = {
      uin: wireNumber(value['uin'], '账号'),
      nickname: scalar(value['nickname'], '昵称'),
      time: wireNumber(value['abstime'], '时间'),
      appid: wireNumber(value['appid'], '应用'),
      key,
      html: scalar(value['html'], 'HTML'),
      tid: null,
      content: null,
      content_complete: null,
      images: null,
      like_count: count(value['likecnt']),
      comment_count: count(value['commentcnt']),
    };
    projectHtml(feed);
    feeds.push(feed);
  }
  return { feeds, has_more: hasMore, main };
}

export function initialSlQzoneFeedState (): SlQzoneFeedState {
  return {
    begintime: '0',
    dayspac: '0',
    pagenum: '1',
    aisortEndTime: '0',
    aisortOffset: '0',
    aisortBeginTime: '0',
    aisortNextTime: '0',
    icServerTime: '0',
    externparam: '',
    daylist: '',
    uinlist: '',
  };
}

export function advanceSlQzoneFeedState (previous: SlQzoneFeedState, main: Record<string, unknown>): SlQzoneFeedState {
  const next = { ...previous };
  for (const field of STATE_NUMBERS) {
    const value = main[field];
    if (value === undefined || value === '') continue;
    if ((typeof value !== 'number' && typeof value !== 'string') || !/^\d+$/.test(String(value)) ||
      (typeof value === 'number' && !Number.isSafeInteger(value)) || String(value).length > 32) {
      throw new Error('QQ空间动态分页数值无效');
    }
    const canonical = BigInt(value).toString();
    if (field === 'pagenum' && canonical === '0') throw new Error('QQ空间动态分页页码无效');
    next[field] = canonical;
  }
  for (const field of STATE_STRINGS) {
    const value = main[field];
    if (value === undefined || (value === '' && field !== 'uinlist')) continue;
    if (typeof value !== 'string' || value.length > 32768) throw new Error('QQ空间动态分页字符串无效');
    next[field] = value;
  }
  return next;
}

export function slQzoneFeedPosition (state: SlQzoneFeedState): string {
  const position: Record<string, string> = {};
  for (const field of Object.keys(state).sort()) {
    if (field !== 'icServerTime') position[field] = state[field as keyof SlQzoneFeedState];
  }
  return JSON.stringify(position);
}

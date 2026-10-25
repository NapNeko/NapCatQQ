export interface QzoneProfile {
  name: string;
  description: string;
}

export interface QzoneProfileUpdate {
  name?: string;
  description?: string;
}

export type QzoneUgcRight = 1 | 4 | 16 | 64 | 128;

const SUCCESS_FIELDS = ['code', 'subcode', 'retcode', 'ret'];
const MAX_PROFILE_LENGTH = 8192;
const MAX_IDENTITY_LENGTH = 8192;

export class QzoneWebError extends Error {
  constructor (public readonly field: string, public readonly code: number) {
    super(`QQ空间接口拒绝请求 (${field}=${code})`);
  }
}

function object (value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : undefined;
}

function assertUin (uin: unknown): asserts uin is string {
  if (typeof uin !== 'string' || !/^[1-9]\d{0,19}$/.test(uin)) throw new Error('QQ空间账号标识无效');
}

function assertIdentity (value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > MAX_IDENTITY_LENGTH) {
    throw new Error('QQ空间说说标识无效');
  }
}

function assertSuccess (response: Record<string, unknown>, requireCode: boolean): void {
  let acknowledged = false;
  for (const field of SUCCESS_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(response, field)) continue;
    const code = response[field];
    if (typeof code !== 'number' || !Number.isSafeInteger(code) || code !== 0) {
      // CGI messages may contain account content or tickets. Only include a numeric code.
      if (typeof code === 'number' && Number.isSafeInteger(code)) throw new QzoneWebError(field, code);
      throw new Error('QQ空间接口拒绝请求');
    }
    acknowledged = true;
  }
  if (!acknowledged || (requireCode && response['code'] !== 0)) throw new Error('QQ空间响应缺少明确成功状态');
}

/** Quote only observed bare name keys with string values, never string contents. */
function normalizeNameStringKeys (text: string): string {
  let result = '';
  let quoted = false;
  let escaped = false;
  const containers: Array<{ object: boolean; key: boolean; }> = [];
  for (let index = 0; index < text.length; index++) {
    const character = text[index]!;
    if (!quoted) {
      const container = containers[containers.length - 1];
      if (container?.object && container.key && character === 'n' && /^name(?=\s*:\s*")/.test(text.slice(index))) {
        result += '"name"';
        index += 'name'.length - 1;
        container.key = false;
        continue;
      }
      if (character === '{') containers.push({ object: true, key: true });
      else if (character === '[') containers.push({ object: false, key: false });
      else if (character === '}' || character === ']') containers.pop();
      else if (character === ',' && container?.object) container.key = true;
      else if (!/\s/.test(character) && container?.object) container.key = false;
    }
    result += character;
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') {
      quoted = true;
    }
  }
  return result;
}

function rejectDuplicateSuccessFields (text: string): void {
  const seen = new Set<string>();
  let depth = 0;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '{' || character === '[') depth++;
    else if (character === '}' || character === ']') depth--;
    else if (character === '"') {
      const start = index;
      let escaped = false;
      for (index++; index < text.length; index++) {
        const current = text[index];
        if (escaped) escaped = false;
        else if (current === '\\') escaped = true;
        else if (current === '"') break;
      }
      let next = index + 1;
      while (/\s/.test(text[next] ?? '') && next < text.length) next++;
      if (depth !== 1 || text[next] !== ':') continue;
      const field: unknown = JSON.parse(text.slice(start, index + 1));
      if (typeof field !== 'string' || !SUCCESS_FIELDS.includes(field)) continue;
      if (seen.has(field)) throw new Error('QQ空间响应包含重复状态字段');
      seen.add(field);
    }
  }
}

// FormSender's response is a data callback inside one fixed, passive HTML shell.
// Consume its observed domain setup as text; never run the returned JavaScript.
const FORM_SENDER_HTML = /^(?:<!doctype\s+html>\s*)?<html>\s*<head>\s*<meta\s+http-equiv="content-type"\s+content="text\/html;\s*charset=utf-8"\s*\/?>\s*<\/head>\s*<body>\s*<script\s+type="text\/javascript">\s*([\s\S]*?)\s*<\/script>\s*<\/body>\s*<\/html>$/i;
const DOMAIN_SETUP = 'document\\s*\\.\\s*domain\\s*=\\s*"h5\\.qzone\\.qq\\.com"\\s*;\\s*';
const CALLBACK_SETUP = 'cb\\s*=\\s*frameElement\\s*\\.\\s*callback\\s*;\\s*';
const DOMAIN_TRY_SETUP = new RegExp(
  '^var\\s+cb\\s*;\\s*try\\s*\\{\\s*' + DOMAIN_SETUP + CALLBACK_SETUP +
  '\\}\\s*catch\\s*\\(\\s*e\\s*\\)\\s*\\{\\s*try\\s*\\{\\s*' + DOMAIN_SETUP + CALLBACK_SETUP +
  '\\}\\s*catch\\s*\\(\\s*e\\s*\\)\\s*\\{\\s*' + DOMAIN_SETUP + CALLBACK_SETUP + '\\}\\s*\\}\\s*'
);
const DOMAIN_ONLY_SETUP = new RegExp('^' + DOMAIN_SETUP);

function unwrapFormSenderHtml (text: string): string | undefined {
  const html = FORM_SENDER_HTML.exec(text);
  if (!html) return undefined;
  const script = html[1]!.trim();
  const setup = DOMAIN_TRY_SETUP.exec(script) ?? DOMAIN_ONLY_SETUP.exec(script);
  if (!setup) throw new Error('QQ空间响应脚本包裹格式异常');
  const callback = script.slice(setup[0].length).trim();
  if (!/^frameElement\.callback\s*\(/.test(callback)) throw new Error('QQ空间响应脚本包裹格式异常');
  return callback;
}

/** Parse data only: no script evaluation and no first-brace/last-brace extraction. */
export function parseQzoneWebResponse (text: string, requireCode = false): Record<string, unknown> {
  if (typeof text !== 'string' || text.length > 8 * 1024 * 1024) throw new Error('QQ空间响应格式异常');
  let payload = text.trim();
  const formSender = unwrapFormSenderHtml(payload);
  if (formSender !== undefined) payload = formSender;
  // Preserve the original single-script and bare callback envelopes as well.
  const script = /^<script>\s*([\s\S]*?)\s*<\/script>$/i.exec(payload);
  if (script) {
    payload = script[1]!.trim();
    if (!/^(?:_Callback|callback|_preloadCallback|back|frameElement\.callback)\s*\(/.test(payload)) throw new Error('QQ空间响应脚本包裹格式异常');
  } else if (payload.endsWith('</script>') && payload.startsWith('frameElement.callback')) payload = payload.slice(0, -9).trim();
  if (!payload.startsWith('{')) {
    const callback = /^(?:_Callback|callback|_preloadCallback|back|frameElement\.callback)\s*\(\s*([\s\S]*)\s*\)\s*;?\s*$/.exec(payload);
    if (!callback) throw new Error('QQ空间响应格式异常');
    payload = callback[1]!.trim();
  }
  let parsed: unknown;
  try {
    payload = normalizeNameStringKeys(payload);
    rejectDuplicateSuccessFields(payload);
    parsed = JSON.parse(payload);
  } catch {
    throw new Error('QQ空间响应JSON格式异常');
  }
  const response = object(parsed);
  if (!response) throw new Error('QQ空间响应必须是对象');
  assertSuccess(response, requireCode);
  return response;
}

export function parseQzoneProfile (response: Record<string, unknown>): QzoneProfile {
  if (!object(response)) throw new Error('QQ空间资料响应格式异常');
  assertSuccess(response, true);
  const data = object(response['data']);
  if (!data || typeof data['spacename'] !== 'string' || typeof data['desc'] !== 'string') {
    throw new Error('QQ空间资料响应不完整');
  }
  return { name: data['spacename'], description: data['desc'] };
}

export function buildQzoneProfileBody (selfUin: string, profile: QzoneProfileUpdate): string {
  assertUin(selfUin);
  const fields = object(profile);
  if (!fields || Object.keys(fields).some(key => key !== 'name' && key !== 'description')) throw new Error('QQ空间资料参数无效');
  const params = new URLSearchParams({ uin: selfUin, pageindex: '3', fupdate: '1' });
  let bitmap = 0;
  for (const [field, wireName, bit] of [['name', 'spacename', 2048], ['description', 'desc', 4096]] as const) {
    const value = fields[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.length > MAX_PROFILE_LENGTH) throw new Error('QQ空间名称或说明必须是8192字以内的文本');
    params.set(wireName, value.replaceAll('\r', ''));
    bitmap |= bit;
  }
  if (bitmap === 0) throw new Error('至少提供空间名称或说明');
  params.set('mb', String(bitmap));
  return params.toString();
}

export function normalizeQzoneRight (ugcRight: number, targetUins?: string[]): { right: QzoneUgcRight; targetUins: string[]; } {
  const rights = [1, 4, 16, 64, 128];
  if (typeof ugcRight !== 'number' || !rights.includes(ugcRight)) throw new Error('ugc_right仅支持1、4、16、64、128');
  if (targetUins !== undefined && !Array.isArray(targetUins)) throw new Error('target_uins必须为QQ号数组');
  const targets: string[] = [];
  const seen = new Set<string>();
  for (const uin of targetUins ?? []) {
    assertUin(uin);
    if (!seen.has(uin)) {
      targets.push(uin);
      seen.add(uin);
    }
  }
  if ((ugcRight === 16 || ugcRight === 128) && targets.length === 0) throw new Error('ugc_right为16或128时target_uins不能为空');
  return { right: ugcRight as QzoneUgcRight, targetUins: targets };
}

function wireText (value: unknown, fallback: string): string {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') throw new Error('QQ空间说说重建字段格式异常');
  return value;
}

function wireInteger (value: unknown, fallback: string, minimum = 0, allowEmpty = false): string {
  if (value === undefined) return fallback;
  if (allowEmpty && value === '') return '';
  if ((typeof value !== 'number' || !Number.isSafeInteger(value)) && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw new Error('QQ空间说说重建数值无效');
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum) throw new Error('QQ空间说说重建数值无效');
  return String(value);
}

function firstPresent (first: unknown, second: unknown): unknown {
  return first === undefined ? second : first;
}

function hasMediaValue (value: unknown): boolean {
  if (value === undefined || value === null || value === false || value === 0 || value === '' || value === '0') return false;
  if (Array.isArray(value)) return value.length > 0;
  const record = object(value);
  return record ? Object.keys(record).length > 0 : true;
}

function hasObservedEmptyForwardContent (detail: Record<string, unknown>): boolean {
  if (detail['rt_tid'] !== '' || detail['rt_uin'] !== 0 || detail['rt_source'] !== 0) return false;
  const content = object(detail['rt_con']);
  if (!content) return false;
  const keys = Object.keys(content);
  return keys.length === 2 && keys.includes('conlist') && keys.includes('content') &&
    content['conlist'] === null && content['content'] === '';
}

function assertSupportedMedia (detail: Record<string, unknown>): void {
  for (const field of [
    'video', 'videos', 'video_info', 'video_url', 'videoid', 'video_id', 'vid',
    'music', 'music_info', 'audio', 'voice', 'voice_info',
    'rt_tid', 'rt_uin', 'rt_con', 'rt_source', 'forward', 'forward_info', 'forward_tid',
    'origin', 'origin_tid', 'origin_feed', 'cell_origin',
  ]) {
    // The legacy detail CGI supplies this exact empty object for ordinary text and image posts.
    if (field === 'rt_con' && hasObservedEmptyForwardContent(detail)) continue;
    if (hasMediaValue(detail[field])) throw new Error('该说说包含暂不支持完整重建的媒体或转发内容');
  }
  for (const field of ['appid', 'app_id']) {
    if (detail[field] !== undefined && detail[field] !== 311 && detail[field] !== '311') throw new Error('该动态不是可重建的说说');
  }
  if (wireText(detail['special_url'], '') !== '') throw new Error('暂不支持修改含特殊分享内容的说说权限');
}

function pictureBo (picture: Record<string, unknown>): string | undefined {
  for (const key of ['smallurl', 'url1', 'url2', 'url3']) {
    const value = picture[key];
    if (value === undefined || value === '') continue;
    if (typeof value !== 'string') throw new Error('QQ空间图片地址元数据无效');
    const matches = [...value.matchAll(/[?&]bo=([^&#]*)/g)];
    if (matches.length > 1) throw new Error('QQ空间图片包含歧义元数据');
    if (matches.length === 0) continue;
    try {
      const decoded = decodeURIComponent(matches[0]![1]!);
      if (!decoded || /[\t\r\n]/.test(decoded)) throw new Error('Invalid picture metadata');
      return decoded;
    } catch {
      throw new Error('QQ空间图片元数据无法完整重建');
    }
  }
  return undefined;
}

function rebuildContent (detail: Record<string, unknown>): string {
  const conlist = detail['conlist'];
  if (conlist !== undefined && conlist !== null) {
    if (!Array.isArray(conlist)) throw new Error('QQ空间说说正文分段格式异常');
    if (conlist.length > 0) {
      return conlist.map((value) => {
        const part = object(value);
        if (!part || typeof part['con'] !== 'string') throw new Error('QQ空间说说正文分段不完整');
        return part['con'];
      }).join('');
    }
  }
  if (typeof detail['content'] !== 'string') throw new Error('QQ空间说说缺少完整正文');
  return detail['content'];
}

/** Permission updates resubmit a whole post, so unsupported or partial data must fail before POST. */
export function buildQzoneRightBody (
  detail: Record<string, unknown>,
  selfUin: string,
  tid: string,
  ugcRight: number,
  targetUins?: string[]
): string {
  assertUin(selfUin);
  assertIdentity(tid);
  const source = object(detail);
  if (!source || source['tid'] !== tid) throw new Error('QQ空间详情与请求的说说标识不匹配');
  const owner = source['uin'];
  if ((typeof owner !== 'string' && !(typeof owner === 'number' && Number.isSafeInteger(owner))) || String(owner) !== selfUin) {
    throw new Error('只能修改当前账号自己的说说权限');
  }
  if (SUCCESS_FIELDS.some(field => Object.prototype.hasOwnProperty.call(source, field))) assertSuccess(source, false);
  const permission = normalizeQzoneRight(ugcRight, targetUins);
  assertSupportedMedia(source);
  const pics = source['pic'] ?? [];
  if (!Array.isArray(pics)) throw new Error('QQ空间说说图片列表格式异常');
  const richType = wireInteger(source['richtype'], pics.length ? '1' : '', 0, true);
  if (!['', '0', '1'].includes(richType)) throw new Error('该说说的媒体类型暂不支持完整重建');
  if ((pics.length > 0 && richType !== '1') || (pics.length === 0 && richType === '1')) throw new Error('QQ空间说说图片信息不完整');
  const richValues: string[] = [];
  const boValues: Array<string | undefined> = [];
  for (const value of pics) {
    const picture = object(value);
    const pictureId = picture?.['pic_id'];
    if (!picture || typeof pictureId !== 'string' || !pictureId || /[\t\r\n]/.test(pictureId)) throw new Error('QQ空间说说图片标识不完整');
    const parts = pictureId.split(',');
    const albumId = parts[1];
    const lloc = parts[2];
    if (!albumId?.trim() || !lloc?.trim()) throw new Error('QQ空间说说图片信息无法完整重建');
    // 22 is the observed legacy image default; existing image dimensions cannot be guessed.
    const pictureType = wireInteger(firstPresent(picture['pictype'], picture['type']), '22');
    const originalHeight = firstPresent(picture['height'], picture['b_height']);
    const originalWidth = firstPresent(picture['width'], picture['b_width']);
    if (originalHeight === undefined || originalWidth === undefined) throw new Error('QQ空间说说图片尺寸不完整');
    const height = wireInteger(originalHeight, '', 1);
    const width = wireInteger(originalWidth, '', 1);
    richValues.push(`,${albumId},${lloc},${lloc},${pictureType},${height},${width},,0,0`);
    boValues.push(pictureBo(picture));
  }
  if (boValues.some(value => value !== undefined) && boValues.some(value => value === undefined)) throw new Error('QQ空间图片元数据数量不完整');
  const boGroup = boValues.every(value => value !== undefined) ? boValues.join(',') : '';
  const originalRichValue = wireText(source['richval'], '');
  if (richValues.length === 0 && originalRichValue !== '') throw new Error('QQ空间说说包含无法完整重建的媒体数据');
  const subtype = wireInteger(firstPresent(source['t1_subtype'], source['subrichtype']), richValues.length ? '1' : '', 0, true);
  // Subtype 2 was observed on plain text, without either rich-type field or pictures.
  const observedPlainTextSubtype = subtype === '2' && hasObservedEmptyForwardContent(source) &&
    pics.length === 0 && source['richtype'] === undefined && source['subrichtype'] === undefined;
  if (!['', '0', '1'].includes(subtype) && !observedPlainTextSubtype) throw new Error('该说说的媒体子类型暂不支持完整重建');
  const sign = wireInteger(source['to_sign'], '0');
  if (sign !== '0' && sign !== '1') throw new Error('QQ空间说说同步标记无效');
  const rightId = wireText(source['ugcright_id'], tid);
  assertIdentity(rightId);
  const params = new URLSearchParams({
    syn_tweet_verson: '1',
    tid,
    paramstr: '1',
    pic_template: wireText(source['pic_template'], ''),
    richtype: richType,
    richval: richValues.join('\t'),
    special_url: '',
    subrichtype: subtype,
    pic_bo: boGroup ? `${boGroup}\t${boGroup}` : '',
    con: rebuildContent(source),
    feedversion: wireInteger(source['feedversion'], '1', 1),
    ver: wireInteger(source['ver'], '1', 1),
    ugc_right: String(permission.right),
    to_sign: sign,
    ugcright_id: rightId,
    hostuin: selfUin,
    code_version: wireInteger(source['code_version'], '1', 1),
    format: 'fs',
    qzreferrer: `https://user.qzone.qq.com/${selfUin}`,
  });
  if (permission.right === 16 || permission.right === 128) params.set('allow_uins', permission.targetUins.join('|'));
  return params.toString();
}

export function buildQzoneBanBody (selfUin: string, targetUin: string, enable: boolean): string {
  assertUin(selfUin);
  assertUin(targetUin);
  if (typeof enable !== 'boolean') throw new Error('空间黑名单状态必须是布尔值');
  return new URLSearchParams({
    uin: selfUin,
    act_uin: targetUin,
    action: enable ? '1' : '2',
    fupdate: '1',
    qzreferrer: `https://user.qzone.qq.com/${selfUin}/main`,
  }).toString();
}

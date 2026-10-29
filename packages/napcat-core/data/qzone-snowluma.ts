export interface SlQzoneEmotion {
  tid: string;
  content: string;
  time: number;
  comment_num: number;
  is_private: boolean;
  images: string[];
}

export interface SlQzoneMsgList {
  total: number;
  /** False means total is the legacy page-length fallback, not a measured account total. */
  total_known?: boolean;
  msglist: SlQzoneEmotion[];
}

export interface SlQzoneFlatReply {
  uin: number;
  name: string;
  time: number;
  content: string;
  comment_id: string;
  parent_comment_id: string;
  parent_comment_uin: number;
}

export interface SlQzoneFlatComment {
  uin: number;
  name: string;
  time: number;
  content: string;
  comment_id: string;
  replies: SlQzoneFlatReply[];
}

export interface SlQzoneMsgDetail {
  tid: string;
  content: string;
  comment_num: number;
  comments: SlQzoneFlatComment[];
}

export interface SlQzoneCommentResult {
  comment_id: string;
  parent_comment_id?: string;
  parent_comment_uin?: number;
}

export interface SlQzoneCommentOptions {
  imageUrls?: string[];
  comment_id?: string;
  comment_uin?: string;
  reply_uin?: string;
  reply_name?: string;
}

function object (value: unknown): Record<string, unknown> | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : undefined;
}

function requireObject (value: unknown): Record<string, unknown> {
  const result = object(value);
  if (!result) throw new Error('QQ空间兼容响应对象格式异常');
  return result;
}

function responseCodes (response: Record<string, unknown>, requireAcknowledgement = false, requireCode = false): void {
  let acknowledged = false;
  for (const field of ['code', 'subcode', 'retcode', 'ret']) {
    if (!Object.prototype.hasOwnProperty.call(response, field)) continue;
    const value = response[field];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value !== 0) {
      const code = typeof value === 'number' && Number.isSafeInteger(value) ? ` (${field}=${value})` : '';
      throw new Error(`QQ空间兼容接口拒绝请求${code}`);
    }
    acknowledged = true;
  }
  if ((requireAcknowledgement && !acknowledged) || (requireCode && response['code'] !== 0)) {
    throw new Error('QQ空间兼容响应缺少明确成功状态');
  }
}

function integer (value: unknown, minimum = 0): number {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+$/.test(value))) throw new Error('QQ空间兼容响应数值无效');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new Error('QQ空间兼容响应数值无效');
  return parsed;
}

function requiredText (value: unknown): string {
  if (typeof value !== 'string') throw new Error('QQ空间兼容响应文本字段无效');
  return value;
}

function hasControlCharacter (value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

function id (value: unknown, allowEmpty = false): string {
  if (value === undefined || value === null) {
    if (allowEmpty) return '';
    throw new Error('QQ空间兼容响应缺少标识');
  }
  if (typeof value === 'number') return String(integer(value));
  if (typeof value !== 'string' || value.length > 8192 || hasControlCharacter(value) || (!value.trim() && (!allowEmpty || value !== ''))) {
    throw new Error('QQ空间兼容响应标识无效');
  }
  return value;
}

function array (value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error('QQ空间兼容响应列表格式异常');
  return value;
}

function pictureUrls (value: unknown): string[] {
  const result: string[] = [];
  for (const picture of array(value)) {
    const fields = requireObject(picture);
    for (const key of ['url3', 'url2', 'url1', 'smallurl']) {
      const url = fields[key];
      if (url === undefined || url === null || url === '') continue;
      if (typeof url !== 'string') throw new Error('QQ空间说说图片地址格式异常');
      result.push(url);
      break;
    }
  }
  return result;
}

function privateFlag (value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'number' && !(typeof value === 'string' && /^-?\d+$/.test(value))) throw new Error('QQ空间说说私密标记无效');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error('QQ空间说说私密标记无效');
  return parsed !== 0;
}

/** Legacy zero/empty sentinels apply only to absent fields, never malformed supplied values. */
export function parseSlQzoneMsgList (response: Record<string, unknown>): SlQzoneMsgList {
  const fields = requireObject(response);
  responseCodes(fields);
  if (!Array.isArray(fields['msglist'])) throw new Error('QQ空间兼容说说列表响应不完整');
  const msglist: SlQzoneEmotion[] = [];
  for (const entry of fields['msglist']) {
    const row = requireObject(entry);
    msglist.push({
      tid: id(row['tid'], true),
      content: row['content'] === undefined || row['content'] === null ? '' : requiredText(row['content']),
      time: row['created_time'] === undefined || row['created_time'] === null ? 0 : integer(row['created_time']),
      comment_num: row['cmtnum'] === undefined || row['cmtnum'] === null ? 0 : integer(row['cmtnum']),
      is_private: privateFlag(row['secret']),
      images: pictureUrls(row['pic']),
    });
  }
  const totalKnown = fields['total'] !== undefined && fields['total'] !== null;
  return {
    total: totalKnown ? integer(fields['total']) : msglist.length,
    total_known: totalKnown,
    msglist,
  };
}

function flatComment (value: unknown): Omit<SlQzoneFlatComment, 'replies'> {
  const fields = requireObject(value);
  return {
    comment_id: id(fields['tid']),
    uin: integer(fields['uin'], 1),
    name: requiredText(fields['name']),
    time: integer(fields['create_time']),
    content: requiredText(fields['content']),
  };
}

export function parseSlQzoneMsgDetail (response: Record<string, unknown>, tid: string): SlQzoneMsgDetail {
  assertTid(tid);
  const fields = requireObject(response);
  responseCodes(fields);
  if (typeof fields['tid'] !== 'string' || fields['tid'] !== tid) throw new Error('QQ空间兼容详情与请求的说说不匹配');
  const comments: SlQzoneFlatComment[] = [];
  for (const value of array(fields['commentlist'])) {
    const original = requireObject(value);
    const parent = flatComment(original);
    const replies: SlQzoneFlatReply[] = [];
    for (const reply of array(original['list_3'])) {
      replies.push({ ...flatComment(reply), parent_comment_id: parent.comment_id, parent_comment_uin: parent.uin });
    }
    comments.push({ ...parent, replies });
  }
  return { tid, content: requiredText(fields['content']), comment_num: integer(fields['cmtnum']), comments };
}

function assertUin (value: unknown, safeNumeric = false): asserts value is string {
  if (typeof value !== 'string' || !/^[1-9]\d{0,19}$/.test(value) || (safeNumeric && !Number.isSafeInteger(Number(value)))) {
    throw new Error('QQ空间兼容账号标识无效');
  }
}

function assertTid (value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > 8192 || hasControlCharacter(value)) throw new Error('QQ空间兼容说说标识无效');
}

export function buildSlQzoneLikeBody (self: string, target: string, tid: string, enable: boolean, abstime: number): string {
  assertUin(self);
  assertUin(target);
  assertTid(tid);
  if (typeof enable !== 'boolean' || typeof abstime !== 'number' || !Number.isSafeInteger(abstime) || abstime < 0) throw new Error('QQ空间兼容点赞参数无效');
  const resource = `http://user.qzone.qq.com/${target}/mood/${tid}`;
  const form = new URLSearchParams();
  form.set('opuin', self);
  form.set('fid', tid);
  form.set('abstime', String(abstime));
  form.set('unikey', resource);
  form.set('curkey', resource);
  for (const [key, value] of Object.entries({ appid: '311', typeid: '0', from: '1', active: '0', fupdate: '1', format: 'json' })) form.set(key, value);
  form.set('qzreferrer', `https://user.qzone.qq.com/${self}`);
  return form.toString();
}

function commentOptions (options: SlQzoneCommentOptions | undefined): { options: SlQzoneCommentOptions; reply: boolean; } {
  if (options !== undefined && !object(options)) throw new Error('QQ空间兼容评论选项无效');
  const fields: SlQzoneCommentOptions = options ?? {};
  if (Object.keys(fields).some(key => !['imageUrls', 'comment_id', 'comment_uin', 'reply_uin', 'reply_name'].includes(key))) throw new Error('QQ空间兼容评论选项无效');
  const reply = fields.comment_id !== undefined || fields.comment_uin !== undefined;
  if (reply) {
    assertTid(fields.comment_id);
    assertUin(fields.comment_uin, true);
  }
  const addressed = fields.reply_uin !== undefined || fields.reply_name !== undefined;
  if (addressed) {
    if (!reply || typeof fields.reply_name !== 'string' || !fields.reply_name.trim() || fields.reply_name.length > 8192) throw new Error('指定回复目标需要完整父评论与昵称');
    assertUin(fields.reply_uin, true);
  }
  if (fields.imageUrls !== undefined) {
    if (!Array.isArray(fields.imageUrls)) throw new Error('QQ空间评论图片地址必须为数组');
    if (reply && fields.imageUrls.length > 0) throw new Error('QQ空间楼中楼回复不支持图片');
    for (const url of fields.imageUrls) {
      if (typeof url !== 'string' || !url || url.length > 8192 || url.trim() !== url) throw new Error('QQ空间评论图片地址无效');
      try {
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || /[\t\r\n]/.test(url)) throw new Error('Invalid URL');
      } catch {
        throw new Error('QQ空间评论图片地址无效');
      }
    }
  }
  return { options: fields, reply };
}

function addressedContent (content: string, options: SlQzoneCommentOptions): string {
  if (options.reply_uin === undefined) return content;
  const escapes: Record<string, string> = { '%': '%25', ',': '%2C', '}': '%7D' };
  const name = [...options.reply_name!.trim()].map(character => escapes[character] ?? character).join('');
  return `@{uin:${options.reply_uin},nick:${name},auto:1} ${content}`;
}

export function buildSlQzoneCommentBody (self: string, target: string, tid: string, content: string, options?: SlQzoneCommentOptions): string {
  assertUin(self);
  assertUin(target);
  assertTid(tid);
  if (typeof content !== 'string' || content === '') throw new Error('QQ空间兼容评论正文不能为空');
  const branch = commentOptions(options);
  const form = new URLSearchParams({ uin: self, hostUin: target, inCharset: 'utf-8', outCharset: 'utf-8' });
  if (branch.reply) {
    if (!content.trim()) throw new Error('QQ空间兼容回复正文不能为空白');
    form.set('hostuin', self);
    form.set('topicId', `${target}_${tid}`);
    form.set('commentId', branch.options.comment_id!);
    form.set('commentUin', branch.options.comment_uin!);
    form.set('content', addressedContent(content, branch.options));
    form.set('ref', '');
    form.set('code_version', '1');
    form.set('format', 'fs');
    form.set('qzreferrer', `https://user.qzone.qq.com/${target}`);
  } else {
    form.set('topicId', `${target}_${tid}__1`);
    form.set('content', content);
    form.set('richtype', branch.options.imageUrls?.length ? '1' : '');
    form.set('richval', branch.options.imageUrls?.join('\t') ?? '');
    for (const [key, value] of Object.entries({ format: 'json', ref: 'feeds', feedsType: '100', private: '0', paramstr: '1', isSignIn: '', plat: 'qzone', source: 'ic', platformid: '52' })) form.set(key, value);
    form.set('qzreferrer', `https://user.qzone.qq.com/${self}`);
  }
  return form.toString();
}

export function parseSlQzoneComment (response: Record<string, unknown>, options?: SlQzoneCommentOptions): SlQzoneCommentResult {
  const fields = requireObject(response);
  const branch = commentOptions(options);
  responseCodes(fields, true, branch.reply);
  if (branch.reply) {
    const result = object(fields['data']);
    if (!result) throw new Error('QQ空间回复响应缺少新标识，结果未知，请查询后确认，勿自动重试');
    let replyId: string;
    try {
      replyId = id(result['id']);
    } catch {
      throw new Error('QQ空间回复响应缺少有效新标识，结果未知，请查询后确认，勿自动重试');
    }
    return { comment_id: replyId, parent_comment_id: branch.options.comment_id!, parent_comment_uin: Number(branch.options.comment_uin!) };
  }
  // An empty ID is the explicit legacy sentinel after an acknowledged ordinary comment.
  return { comment_id: id(fields['commentid'] ?? fields['commentId'], true) };
}

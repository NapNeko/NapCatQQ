/**
 * QQ空间(Qzone)发说说/上传图片相关的纯数据构造与解析函数
 * 不发起任何网络请求，方便单独测试
 */

export interface QzoneUploadImageParams {
  uin: string;
  skey: string;
  pskey: string;
  g_tk: string;
  base64: string;
}

/**
 * 构造上传图片到 QQ 空间的表单请求体 (application/x-www-form-urlencoded)
 * 对齐 https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image
 */
export function buildQzoneUploadImageBody (params: QzoneUploadImageParams): string {
  const { uin, skey, pskey, g_tk, base64 } = params;
  const backUrls = `http://upbak.photo.qzone.qq.com/cgi-bin/upload/cgi_upload_image,http://119.147.64.75/cgi-bin/upload/cgi_upload_image&url=https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=${g_tk}`;
  const query = new URLSearchParams({
    filename: 'filename',
    uin,
    skey,
    zzpaneluin: uin,
    p_uin: uin,
    p_skey: pskey,
    uploadtype: '1',
    albumtype: '7',
    exttype: '0',
    refer: 'shuoshuo',
    output_type: 'jsonhtml',
    charset: 'utf-8',
    output_charset: 'utf-8',
    upload_hd: '1',
    hd_width: '2048',
    hd_height: '10000',
    hd_quality: '96',
    backUrls,
    base64: '1',
    jsonhtml_callback: 'callback',
    picfile: base64,
    qzreferrer: `https://user.qzone.qq.com/${uin}/main`,
  });
  return query.toString();
}

export interface QzoneUploadImageData {
  albumid: string;
  lloc: string;
  type: string;
  height: string;
  width: string;
  url?: string;
}

export interface QzoneUploadImageRawResponse {
  code?: number;
  msg?: string;
  data?: QzoneUploadImageData;
}

/**
 * 解析上传图片接口返回的 `frameElement.callback({...});</script>` 包裹响应
 */
export function parseQzoneUploadImageResponseText (raw: string): QzoneUploadImageRawResponse {
  const startTag = 'frameElement.callback';
  const endTag = '</script>';
  const startIdx = raw.indexOf(startTag);
  const endIdx = raw.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('QQ空间图片上传响应格式异常');
  }
  const segment = raw.slice(startIdx + startTag.length, endIdx);
  const jsonStart = segment.indexOf('(');
  const jsonEnd = segment.lastIndexOf(')');
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('QQ空间图片上传响应解析失败');
  }
  const jsonText = segment.slice(jsonStart + 1, jsonEnd);
  try {
    return JSON.parse(jsonText) as QzoneUploadImageRawResponse;
  } catch {
    throw new Error('QQ空间图片上传响应JSON解析失败');
  }
}

/**
 * 依据上传图片返回数据拼接 richval 字段
 * 格式: ,albumid,lloc,sloc,type,height,width,,height,width (sloc 与 lloc 一致)
 */
export function toQzoneRichval (data: QzoneUploadImageData): string {
  const { albumid, lloc, type, height, width } = data;
  return `,${albumid},${lloc},${lloc},${type},${height},${width},,${height},${width}`;
}

export interface QzonePublishParams {
  hostuin: string;
  content: string;
  /** 多张图片使用 \t 拼接后的 richval，无图时不传 */
  richval?: string;
  ugcRight: number;
  /** ugc_right 为 16/128 时必填，多个QQ号使用 | 拼接 */
  allowUins?: string;
}

/**
 * 构造发表说说的表单请求体 (application/x-www-form-urlencoded)
 * 对齐 https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6
 */
export function buildQzonePublishBody (params: QzonePublishParams): string {
  const { hostuin, content, richval, ugcRight, allowUins } = params;
  const fields: Record<string, string> = {
    syn_tweet_verson: '1',
    paramstr: '1',
    con: content,
    feedversion: '1',
    ver: '1',
    ugc_right: String(ugcRight),
    to_sign: '0',
    hostuin,
    code_version: '1',
    format: 'json',
    qzreferrer: `https://user.qzone.qq.com/${hostuin}/main`,
  };
  if (richval) {
    fields['richtype'] = '1';
    fields['richval'] = richval;
  }
  if (allowUins) {
    fields['allow_uins'] = allowUins;
    fields['who'] = '1';
  }
  return new URLSearchParams(fields).toString();
}

export interface QzonePublishResponse {
  subcode?: number;
  code?: number;
  tid?: string;
  t1_tid?: string;
  message?: string;
  msg?: string;
}

/**
 * 解析发表说说接口返回的 JSON, 提取 tid
 */
export function parseQzonePublishResponse (json: QzonePublishResponse): { tid: string; } {
  const subcode = json.subcode ?? json.code;
  if (subcode !== undefined && subcode !== 0) {
    throw new Error(json.message || json.msg || `QQ空间发说说失败, subcode=${subcode}`);
  }
  const tid = json.t1_tid || json.tid;
  if (!tid) {
    throw new Error('QQ空间发说说失败, 未返回tid');
  }
  return { tid };
}

export interface QzoneDeleteParams {
  hostuin: string;
  tid: string;
}

/**
 * 构造删除说说的表单请求体 (application/x-www-form-urlencoded)
 * 对齐 https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_delete_v6
 */
export function buildQzoneDeleteBody (params: QzoneDeleteParams): string {
  const { hostuin, tid } = params;
  const fields: Record<string, string> = {
    hostuin,
    tid,
    t1_source: '1',
    code_version: '1',
    format: 'json',
    qzreferrer: `https://user.qzone.qq.com/${hostuin}`,
  };
  return new URLSearchParams(fields).toString();
}

export interface QzoneDeleteResponse {
  subcode?: number;
  code?: number;
  message?: string;
  msg?: string;
}

/**
 * 解析删除说说接口返回的 JSON
 */
export function parseQzoneDeleteResponse (json: QzoneDeleteResponse): { success: true; } {
  const subcode = json.subcode ?? json.code;
  if (subcode !== undefined && subcode !== 0) {
    throw new Error(json.message || json.msg || `QQ空间删说说失败, subcode=${subcode}`);
  }
  return { success: true };
}

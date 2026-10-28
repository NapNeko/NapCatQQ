import { Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import type { BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzonePublicObject } from '@/napcat-core/data/qzone-public';

export const QzonePublicObjectSchema = Type.Object({}, { additionalProperties: Type.Unknown() });
export const QzonePublicFeedSchema = Type.Object({}, {
  additionalProperties: Type.Unknown(),
  description: 'get_qzone_public_feeds 返回的完整 feed 对象，请保留全部字段',
});
export const QzonePublicCommentSchema = Type.Object({}, {
  additionalProperties: Type.Unknown(),
  description: '详情或评论列表返回的完整 comment 对象，请保留 like.id 等全部字段',
});
export const QzonePublicReplySchema = Type.Object({}, {
  additionalProperties: Type.Unknown(),
  description: '回复列表返回的完整 reply 对象，请保留全部字段',
});
export const QzonePublicResultSchema = Type.Object({}, {
  additionalProperties: Type.Unknown(),
  description: '上游返回的原始 JSON 对象，字段随内容类型和服务端版本变化',
});
export const QzonePublicEnableSchema = Type.Optional(Type.Union([
  Type.Boolean(), Type.Number(), Type.String(),
], { default: true, description: '是否启用，默认 true；数字非 0 为 true，文本支持 true/false、1/0、yes/no、on/off' }));
export const QzonePublicContentSchema = Type.Union([
  Type.String({ minLength: 1 }),
  Type.Array(QzonePublicObjectSchema, { minItems: 1 }),
], { description: '非空文本或非空富文本对象数组，保留每个对象的全部字段' });

// 示例仅说明对象传递方式；实际调用应直接使用上游返回的完整对象。
export const QzonePublicFeedExample = {
  cell_common: {
    union_id: { uf_key: 'example-uf-key', ugc_id: 'example-ugc-id', feed_id: 'example-feed-id', ext_ids: [] },
    cur_like_key: 'example-like-key',
    domain_type: 3,
  },
  cell_user_info: { user: { uin: '10001' } },
  cell_feed_transfer: {},
};
export const QzonePublicCommentExample = { id: 'example-comment', like: { id: 'example-comment-like' }, reply_attach_info: '' };
export const QzonePublicReplyExample = { id: 'example-reply', like: { id: 'example-reply-like' } };

export function parseQzonePublicEnable (value: boolean | number | string | undefined): boolean {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(text)) return true;
    if (['false', '0', 'no', 'off'].includes(text)) return false;
  }
  throw new Error('enable 必须为布尔值、数字或 true/false、1/0、yes/no、on/off 文本');
}

export function parseQzonePublicPageSize (value: number | string | undefined): number {
  if (value === undefined) return 20;
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error('page_size 必须为数字或数值字符串，截断后应大于等于 1');
  }
  if (typeof value === 'string' && !value.trim()) {
    throw new Error('page_size 必须为数字或数值字符串，截断后应大于等于 1');
  }
  const numericValue = Number(value);
  const pageSize = Math.trunc(numericValue);
  if (!Number.isFinite(numericValue) || pageSize < 1) {
    throw new Error('page_size 必须为数字或数值字符串，截断后应大于等于 1');
  }
  return pageSize;
}

function isObject (value: unknown): value is QzonePublicObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export abstract class QzonePublicAction<PayloadType, ReturnType = QzonePublicObject> extends OneBotAction<PayloadType, ReturnType> {
  override actionTags = ['QQ空间扩展'];
  override returnSchema = QzonePublicResultSchema;
  override returnExample = {};

  protected override async check (payload: PayloadType): Promise<BaseCheckResult> {
    // OneBot 的通用解析会转换原始类型。先校验这些透传参数，避免数字被当作文本或对象。
    if (!isObject(payload)) return { valid: false, message: '请求参数必须为 JSON 对象' };
    const parameters: QzonePublicObject = payload;
    for (const key of ['feed', 'comment', 'reply']) {
      if (parameters[key] !== undefined && !isObject(parameters[key])) {
        return { valid: false, message: `${key} 必须为上游返回的完整 JSON 对象` };
      }
    }
    for (const key of ['cursor', 'reason']) {
      const value = parameters[key];
      if (value !== undefined) {
        if (!['string', 'number', 'boolean'].includes(typeof value)) {
          return { valid: false, message: `${key} 必须为字符串、数字或布尔值` };
        }
        parameters[key] = String(value);
      }
    }
    if ('content' in parameters) {
      let content = parameters['content'];
      if (typeof content === 'string') {
        const text = content.trim();
        if (text.startsWith('[') && text.endsWith(']')) {
          try {
            const decoded: unknown = JSON.parse(text);
            if (Array.isArray(decoded)) content = decoded;
          } catch {
            // 无效 JSON 仍按原始文本处理。
          }
        }
      }
      if (typeof content === 'string' ? content.length === 0 : !Array.isArray(content) || content.length === 0 || !content.every(isObject)) {
        return { valid: false, message: 'content 必须为非空文本或非空富文本对象数组' };
      }
      parameters['content'] = content;
    }
    try {
      if ('enable' in parameters) parameters['enable'] = parseQzonePublicEnable(parameters['enable'] as boolean | number | string | undefined);
      if ('page_size' in parameters) parameters['page_size'] = parseQzonePublicPageSize(parameters['page_size'] as number | string | undefined);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return super.check(payload as PayloadType);
  }
}

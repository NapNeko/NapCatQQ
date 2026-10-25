import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneProfileUpdate } from '@/napcat-core/data/qzone-web';

const profileValueSchema = (description: string) => Type.Union([
  Type.String({ maxLength: 8192 }), Type.Number(), Type.Boolean(),
], { description });
export const SetQzoneProfilePayloadSchema = Type.Object({
  name: Type.Optional(profileValueSchema('空间名称；空字符串表示清空，省略时不修改')),
  description: Type.Optional(profileValueSchema('空间说明；空字符串表示清空，省略时不修改')),
}, { additionalProperties: false });
export type SetQzoneProfilePayload = Static<typeof SetQzoneProfilePayloadSchema>;

function profileUpdate (payload: SetQzoneProfilePayload): QzoneProfileUpdate {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => key !== 'name' && key !== 'description')) {
    throw new Error('修改空间资料只支持 name 和 description 参数');
  }
  const profile: QzoneProfileUpdate = {};
  for (const key of ['name', 'description'] as const) {
    const value = payload[key];
    if (value === undefined) continue;
    if ((typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') || (typeof value === 'number' && !Number.isFinite(value))) {
      throw new Error(`${key} 必须为字符串、有限数字或布尔值`);
    }
    const normalized = String(value);
    if (normalized.length > 8192) throw new Error(`${key} 不能超过8192个字符`);
    profile[key] = normalized;
  }
  if (profile.name === undefined && profile.description === undefined) throw new Error('name 或 description 至少提供一项');
  return profile;
}

export class SetQzoneProfile extends OneBotAction<SetQzoneProfilePayload, null> {
  override actionName = ActionName.SetQzoneProfile;
  override actionSummary = '修改QQ空间资料';
  override actionDescription = '仅修改当前账号的空间名称或说明，至少提供一项。省略字段保持不变；空字符串清空字段；数字和布尔值转换为字符串。';
  override actionTags = ['扩展接口'];
  override payloadExample = { name: '我的空间', description: '记录生活' };
  override returnExample = null;
  override payloadSchema = SetQzoneProfilePayloadSchema;
  override returnSchema = Type.Null();

  protected override async check (payload: SetQzoneProfilePayload): Promise<BaseCheckResult> {
    try {
      profileUpdate(payload);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: SetQzoneProfilePayload): Promise<null> {
    await this.core.apis.QzoneApi.setProfile(profileUpdate(payload));
    return null;
  }
}

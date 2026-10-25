import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { qzoneBoolean } from './common-snowluma';

export const SetQzoneBanPayloadSchema = Type.Object({
  user_id: Type.Union([
    Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20 }),
    Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  ], { description: '需要设置空间访问限制的QQ号' }),
  enable: Type.Optional(Type.Union([
    Type.Boolean(), Type.Integer({ minimum: 0, maximum: 1 }), Type.String({ maxLength: 128 }),
  ], { description: '默认true；支持布尔值及true/false、1/0、yes/no、on/off拼写' })),
}, { additionalProperties: false });
export type SetQzoneBanPayload = Static<typeof SetQzoneBanPayloadSchema>;

function banUpdate (payload: SetQzoneBanPayload): { uin: string; enable: boolean; } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => key !== 'user_id' && key !== 'enable')) {
    throw new Error('设置空间访问限制只支持 user_id 和 enable 参数');
  }
  const value = payload.user_id;
  if (typeof value === 'number' && (!Number.isSafeInteger(value) || value <= 0)) throw new Error('user_id 必须为有效QQ号');
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9][0-9]{0,19}$/.test(String(value))) {
    throw new Error('user_id 必须为有效QQ号');
  }
  if (typeof payload.enable === 'string' && payload.enable.length > 128) throw new Error('enable 超出允许长度');
  return { uin: String(value), enable: qzoneBoolean(payload.enable) };
}

export class SetQzoneBan extends OneBotAction<SetQzoneBanPayload, null> {
  override actionName = ActionName.SetQzoneBan;
  override actionSummary = '设置QQ空间访问限制';
  override actionDescription = '在当前账号的空间设置指定用户的访问限制；enable 默认为 true，传 false 取消禁止。';
  override actionTags = ['扩展接口'];
  override payloadExample = { user_id: '10002', enable: true };
  override returnExample = null;
  override payloadSchema = SetQzoneBanPayloadSchema;
  override returnSchema = Type.Null();

  protected override async check (payload: SetQzoneBanPayload): Promise<BaseCheckResult> {
    try {
      banUpdate(payload);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: SetQzoneBanPayload): Promise<null> {
    const normalized = banUpdate(payload);
    await this.core.apis.QzoneApi.setBan(normalized.uin, normalized.enable);
    return null;
  }
}

import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { normalizeQzoneRight } from '@/napcat-core/data/qzone-web';
import { qzoneIdentity, SlQzoneIdentitySchema } from './common-snowluma';

export const SetQzoneMsgRightPayloadSchema = Type.Object({
  tid: SlQzoneIdentitySchema,
  ugc_right: Type.Union([Type.Number(), Type.String({ maxLength: 32 })], { description: '查看权限：1所有人，4好友，16部分好友，64仅自己，128排除部分好友' }),
  target_uins: Type.Optional(Type.Array(Type.Union([
    Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20 }),
    Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  ]), { description: 'ugc_right 为16或128时的QQ号列表' })),
}, { additionalProperties: false });
export type SetQzoneMsgRightPayload = Static<typeof SetQzoneMsgRightPayloadSchema>;

const ReturnSchema = Type.Object({
  ugc_right: Type.Number({ description: '设置成功的查看权限' }),
});

function rightUpdate (payload: SetQzoneMsgRightPayload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => !['tid', 'ugc_right', 'target_uins'].includes(key))) {
    throw new Error('修改说说权限只支持 tid、ugc_right 和 target_uins 参数');
  }
  const tid = qzoneIdentity(payload.tid, 'tid');
  if ((typeof payload.ugc_right !== 'number' && typeof payload.ugc_right !== 'string') ||
    (typeof payload.ugc_right === 'string' && payload.ugc_right.length > 32)) {
    throw new Error('ugc_right 必须为有效权限数字');
  }
  const right = Number(payload.ugc_right);
  if (!Number.isFinite(right)) throw new Error('ugc_right 必须为有效权限数字');
  if (payload.target_uins !== undefined && !Array.isArray(payload.target_uins)) throw new Error('target_uins 必须为QQ号数组');
  const targets = payload.target_uins?.map(value => {
    if (typeof value === 'number' && (!Number.isSafeInteger(value) || value <= 0)) throw new Error('target_uins 包含无效QQ号');
    if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9][0-9]{0,19}$/.test(String(value))) {
      throw new Error('target_uins 包含无效QQ号');
    }
    return String(value);
  });
  return { ...normalizeQzoneRight(right, targets), tid };
}

export class SetQzoneMsgRight extends OneBotAction<SetQzoneMsgRightPayload, { ugc_right: number; }> {
  override actionName = ActionName.SetQzoneMsgRight;
  override actionSummary = '修改QQ空间说说权限';
  override actionDescription = '仅修改当前账号发表的说说。ugc_right 为16或128时 target_uins 不能为空；其他权限不使用该列表。';
  override actionTags = ['扩展接口'];
  override payloadExample = { tid: 'shuoshuo-tid', ugc_right: 4 };
  override returnExample = { ugc_right: 4 };
  override payloadSchema = SetQzoneMsgRightPayloadSchema;
  override returnSchema = ReturnSchema;

  protected override async check (payload: SetQzoneMsgRightPayload): Promise<BaseCheckResult> {
    try {
      rightUpdate(payload);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: SetQzoneMsgRightPayload): Promise<{ ugc_right: number; }> {
    const normalized = rightUpdate(payload);
    return await this.core.apis.QzoneApi.setMsgRight(normalized.tid, normalized.right, normalized.targetUins);
  }
}

import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneProfile } from '@/napcat-core/data/qzone-web';

export const GetQzoneProfilePayloadSchema = Type.Object({
  target_uin: Type.Optional(Type.Union([
    Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20 }),
    Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  ], { description: '空间所属 QQ 号；不传时为当前账号' })),
}, { additionalProperties: false });
export type GetQzoneProfilePayload = Static<typeof GetQzoneProfilePayloadSchema>;

const ReturnSchema = Type.Object({
  name: Type.String({ description: '空间名称' }),
  description: Type.String({ description: '空间说明' }),
});

function targetUin (payload: GetQzoneProfilePayload): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => key !== 'target_uin')) {
    throw new Error('获取空间资料只支持 target_uin 参数');
  }
  const value = payload.target_uin;
  if (value === undefined) return undefined;
  if (typeof value === 'number' && (!Number.isSafeInteger(value) || value <= 0)) throw new Error('target_uin 必须为有效QQ号');
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9][0-9]{0,19}$/.test(String(value))) {
    throw new Error('target_uin 必须为有效QQ号');
  }
  return String(value);
}

export class GetQzoneProfile extends OneBotAction<GetQzoneProfilePayload, QzoneProfile> {
  override actionName = ActionName.GetQzoneProfile;
  override actionSummary = '获取QQ空间资料';
  override actionDescription = '获取空间名称和空间说明；target_uin 不传时读取当前账号，空名称或说明按原值返回。';
  override actionTags = ['扩展接口'];
  override payloadExample = { target_uin: '10001' };
  override returnExample = { name: '我的空间', description: '记录生活' };
  override payloadSchema = GetQzoneProfilePayloadSchema;
  override returnSchema = ReturnSchema;

  protected override async check (payload: GetQzoneProfilePayload): Promise<BaseCheckResult> {
    try {
      targetUin(payload);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneProfilePayload): Promise<QzoneProfile> {
    return await this.core.apis.QzoneApi.getProfile(targetUin(payload));
  }
}

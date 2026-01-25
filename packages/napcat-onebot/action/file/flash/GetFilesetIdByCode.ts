import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetFilesetIdPayloadSchema = Type.Object({
  share_code: Type.String({ description: '分享码或分享链接' }),
});

export type GetFilesetIdPayload = Static<typeof GetFilesetIdPayloadSchema>;

export class GetFilesetId extends OneBotAction<GetFilesetIdPayload, any> {
  override actionName = ActionName.GetFilesetId;
  override payloadSchema = GetFilesetIdPayloadSchema;
  override returnSchema = Type.Any({ description: '文件集 ID' });
  override actionSummary = '获取文件集 ID';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    share_code: '123456'
  };
  override returnExample = {
    fileset_id: 'set_123'
  };

  async _handle (payload: GetFilesetIdPayload) {
    // 适配share_link 防止被传 Link无法解析
    const code = payload.share_code.includes('=') ? payload.share_code.split('=').slice(1).join('=') : payload.share_code;
    return await this.core.apis.FlashApi.fromShareLinkFindSetId(code);
  }
}

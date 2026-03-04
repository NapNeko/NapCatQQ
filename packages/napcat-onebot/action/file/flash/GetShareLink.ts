import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetShareLinkPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
});

export type GetShareLinkPayload = Static<typeof GetShareLinkPayloadSchema>;

export class GetShareLink extends OneBotAction<GetShareLinkPayload, any> {
  override actionName = ActionName.GetShareLink;
  override payloadSchema = GetShareLinkPayloadSchema;
  override returnSchema = Type.Any({ description: '分享链接' });
  override actionSummary = '获取文件分享链接';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    fileset_id: 'set_123'
  };
  override returnExample = 'http://example.com/share';

  async _handle (payload: GetShareLinkPayload) {
    return await this.core.apis.FlashApi.getShareLinkBySetId(payload.fileset_id);
  }
}

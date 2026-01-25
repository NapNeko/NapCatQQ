import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetFilesetInfoPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
});

export type GetFilesetInfoPayload = Static<typeof GetFilesetInfoPayloadSchema>;

export class GetFilesetInfo extends OneBotAction<GetFilesetInfoPayload, any> {
  override actionName = ActionName.GetFilesetInfo;
  override payloadSchema = GetFilesetInfoPayloadSchema;
  override returnSchema = Type.Any({ description: '文件集信息' });

  async _handle (payload: GetFilesetInfoPayload) {
    return await this.core.apis.FlashApi.getFileSetIndoBySetId(payload.fileset_id);
  }
}

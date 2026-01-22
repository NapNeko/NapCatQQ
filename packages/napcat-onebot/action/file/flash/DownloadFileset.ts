import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  fileset_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class DownloadFileset extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.DownloadFileset;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    // 默认路径 / fileset_id /为下载路径
    return await this.core.apis.FlashApi.downloadFileSetBySetId(payload.fileset_id);
  }
}

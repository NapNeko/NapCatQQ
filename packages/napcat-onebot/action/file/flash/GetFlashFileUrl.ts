import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  fileset_id: Type.String(),
  file_name: Type.Optional(Type.String()),
  file_index: Type.Optional(Type.Number()),
});

type Payload = Static<typeof SchemaData>;

export class GetFlashFileUrl extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.GetFlashFileUrl;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    // 文件的索引依旧从0开始
    return await this.core.apis.FlashApi.getFileTransUrl(payload.fileset_id, {
      fileName: payload.file_name,
      fileIndex: payload.file_index,
    });
  }
}

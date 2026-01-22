import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  fileset_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GetFilesetInfo extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.GetFilesetInfo;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    return await this.core.apis.FlashApi.getFileSetIndoBySetId(payload.fileset_id);
  }
}

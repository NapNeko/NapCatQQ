import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  share_code: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GetFilesetId extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.GetFilesetId;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    // 适配share_link 防止被传 Link无法解析
    const code = payload.share_code.includes('=') ? payload.share_code.split('=').slice(1).join('=') : payload.share_code;
    return await this.core.apis.FlashApi.fromShareLinkFindSetId(code);
  }
}

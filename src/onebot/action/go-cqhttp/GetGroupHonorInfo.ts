import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { WebHonorType } from '@/core/types';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()]),
  type: Type.Optional(Type.Enum(WebHonorType)),
});

type Payload = Static<typeof SchemaData>;

interface HonorInfo {
  group_id: number;
  current_talkative: Record<string, unknown>;
  talkative_list: unknown[];
  performer_list: unknown[];
  legend_list: unknown[];
  emotion_list: unknown[];
  strong_newbie_list: unknown[];
}

export class GetGroupHonorInfo extends OneBotAction<Payload, HonorInfo> {
  override actionName = ActionName.GetGroupHonorInfo;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    if (!payload.type) {
      payload.type = WebHonorType.ALL;
    }
    return await this.core.apis.WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
  }
}

import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { WebHonorType } from 'napcat-core/types';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  type: Type.Optional(Type.Enum(WebHonorType, { description: '荣誉类型' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  group_id: Type.Number({ description: '群号' }),
  current_talkative: Type.Record(Type.String(), Type.Unknown(), { description: '当前龙王' }),
  talkative_list: Type.Array(Type.Unknown(), { description: '龙王列表' }),
  performer_list: Type.Array(Type.Unknown(), { description: '群聊之火列表' }),
  legend_list: Type.Array(Type.Unknown(), { description: '群聊炽热列表' }),
  emotion_list: Type.Array(Type.Unknown(), { description: '快乐源泉列表' }),
  strong_newbie_list: Type.Array(Type.Unknown(), { description: '冒尖小春笋列表' }),
}, { description: '群荣誉信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupHonorInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupHonorInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '获取群荣誉信息';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetGroupHonorInfo.payload;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    if (!payload.type) {
      payload.type = WebHonorType.ALL;
    }
    return await this.core.apis.WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
  }
}

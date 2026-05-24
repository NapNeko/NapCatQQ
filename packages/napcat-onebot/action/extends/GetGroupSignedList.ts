import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.String(), Type.Number()], { description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(
  Type.Object({
    user_id: Type.Number({ description: '打卡者QQ' }),
    nick: Type.String({ description: '打卡者昵称' }),
    time: Type.Number({ description: '打卡时间' }),
    rank: Type.Number({ description: '打卡排名' }),
  }),
  { description: '群组今日打卡列表' }
);

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupSignedList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupSignedList;
  override actionSummary = '获取群组今日打卡列表';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
  };

  override returnExample = {

  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const data = await this.core.apis.WebApi.getDaySignedList(payload.group_id.toString());
    if (!data.response.page) throw new Error('无法获取该群组打卡列表');
    return data.response.page[0]?.infos?.map(info => ({
      user_id: +info.uid,
      nick: info.uidGroupNick,
      time: +info.signedTimeStamp,
      rank: (info.signInRank - 1) / 2 + 1,
    })) ?? [];
  }
}

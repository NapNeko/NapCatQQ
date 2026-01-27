import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  user_id: Type.Optional(Type.String({ description: 'QQ号' })),
  start: Type.Union([Type.Number(), Type.String()], { default: 0, description: '起始位置' }),
  count: Type.Union([Type.Number(), Type.String()], { default: 10, description: '获取数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  uid: Type.String({ description: '用户UID' }),
  time: Type.String({ description: '时间' }),
  favoriteInfo: Type.Object({
    userInfos: Type.Array(Type.Any(), { description: '点赞用户信息' }),
    total_count: Type.Number({ description: '总点赞数' }),
    last_time: Type.Number({ description: '最后点赞时间' }),
    today_count: Type.Number({ description: '今日点赞数' }),
  }),
  voteInfo: Type.Object({
    total_count: Type.Number({ description: '总点赞数' }),
    new_count: Type.Number({ description: '新增点赞数' }),
    new_nearby_count: Type.Number({ description: '新增附近点赞数' }),
    last_visit_time: Type.Number({ description: '最后访问时间' }),
    userInfos: Type.Array(Type.Any(), { description: '点赞用户信息' }),
  }),
}, { description: '点赞详情' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetProfileLike extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetProfileLike;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取资料点赞';
  override actionTags = ['用户扩展'];
  override payloadExample = {
    user_id: '123456789',
    start: 0,
    count: 10
  };
  override returnExample = {
    uid: 'u_123',
    time: '1734567890',
    favoriteInfo: {
      userInfos: [],
      total_count: 10,
      last_time: 1734567890,
      today_count: 5
    },
    voteInfo: {
      total_count: 100,
      new_count: 2,
      new_nearby_count: 0,
      last_visit_time: 1734567890,
      userInfos: []
    }
  };

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const isSelf = this.core.selfInfo.uin === payload.user_id || !payload.user_id;
    const userUid = isSelf || !payload.user_id ? this.core.selfInfo.uid : await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    const type = isSelf ? 2 : 1;
    const ret = await this.core.apis.UserApi.getProfileLike(userUid ?? this.core.selfInfo.uid, +payload.start, +payload.count, type);
    const data = ret.info.userLikeInfos[0];
    if (!data) {
      throw new Error('get info error');
    }
    for (const item of data.voteInfo.userInfos) {
      item.uin = +((await this.core.apis.UserApi.getUinByUidV2(item.uid)) ?? '');
    }
    for (const item of data.favoriteInfo.userInfos) {
      item.uin = +((await this.core.apis.UserApi.getUinByUidV2(item.uid)) ?? '');
    }
    return data;
  }
}

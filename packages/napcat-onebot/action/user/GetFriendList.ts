import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11UserSchema } from '../schemas';
import { UserActionsExamples } from '@/napcat-onebot/action/example/UserActionsExamples';

const PayloadSchema = Type.Object({
  no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否不使用缓存' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(OB11UserSchema, { description: '好友列表' });

type ReturnType = Static<typeof ReturnSchema>;

export default class GetFriendList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetFriendList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取好友列表';
  override actionDescription = '获取当前帐号的好友列表';
  override actionTags = ['用户接口'];
  override payloadExample = UserActionsExamples.GetFriendList.payload;
  override returnExample = UserActionsExamples.GetFriendList.response;

  async _handle (_payload: PayloadType) {
    const buddyMap = await this.core.apis.FriendApi.getBuddyV2SimpleInfoMap();
    const isNocache = typeof _payload.no_cache === 'string' ? _payload.no_cache === 'true' : !!_payload.no_cache;
    await Promise.all(
      Array.from(buddyMap.values()).map(async (buddyInfo) => {
        try {
          const userDetail = await this.core.apis.UserApi.getUserDetailInfo(buddyInfo.coreInfo.uid, isNocache);
          const data = buddyMap.get(buddyInfo.coreInfo.uid);
          if (data) {
            data.qqLevel = userDetail.qqLevel;
          }
        } catch (error) {
          this.core.context.logger.logError('获取好友详细信息失败', error);
        }
      })
    );
    return OB11Construct.friends(Array.from(buddyMap.values()));
  }
}

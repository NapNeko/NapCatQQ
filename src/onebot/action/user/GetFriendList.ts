import { OB11User } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class GetFriendList extends OneBotAction<Payload, OB11User[]> {
    override actionName = ActionName.GetFriendList;
    override payloadSchema = SchemaData;

    async _handle(_payload: Payload) {
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
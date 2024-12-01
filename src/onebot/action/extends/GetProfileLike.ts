import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    start: Type.Union([Type.Number(), Type.String()], { default: 0 }),
    count: Type.Union([Type.Number(), Type.String()], { default: 10 }),
    type: Type.Union([Type.Number(), Type.String()], { default: 2 }),
});

type Payload = Static<typeof SchemaData>;

export class GetProfileLike extends OneBotAction<Payload, any> {
    actionName = ActionName.GetProfileLike;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const user_uid =
            this.core.selfInfo.uin === payload.user_id || !payload.user_id ?
                this.core.selfInfo.uid :
                await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        const ret = await this.core.apis.UserApi.getProfileLike(user_uid ?? this.core.selfInfo.uid, +payload.start, +payload.count, +payload.type);
        const listdata = ret.info.userLikeInfos[0].voteInfo.userInfos;
        for (const item of listdata) {
            item.uin = +((await this.core.apis.UserApi.getUinByUidV2(item.uid)) ?? '');
        }
        return ret.info.userLikeInfos[0].voteInfo;
    }
}

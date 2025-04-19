import { NTVoteInfo } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    start: Type.Union([Type.Number(), Type.String()], { default: 0 }),
    count: Type.Union([Type.Number(), Type.String()], { default: 10 })
});

type Payload = Static<typeof SchemaData>;

export class GetProfileLike extends OneBotAction<Payload, {
    uid: string;
    time: string;
    favoriteInfo: {
        userInfos: Array<NTVoteInfo>;
        total_count: number;
        last_time: number;
        today_count: number;
    };
    voteInfo: {
        total_count: number;
        new_count: number;
        new_nearby_count: number;
        last_visit_time: number;
        userInfos: Array<NTVoteInfo>;
    };
}> {
    override actionName = ActionName.GetProfileLike;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
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
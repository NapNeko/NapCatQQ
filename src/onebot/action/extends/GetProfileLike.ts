import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        start: { type: ['number', 'string'] },
        count: { type: ['number', 'string'] },
        type: { type: ['number', 'string'] },
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetProfileLike extends OneBotAction<Payload, any> {
    actionName = ActionName.GetProfileLike;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const start = payload.start ? Number(payload.start) : 0;
        const count = payload.count ? Number(payload.count) : 10;
        const type = payload.count ? Number(payload.count) : 2;
        const user_uid =
            this.core.selfInfo.uin === payload.user_id || !payload.user_id ?
                this.core.selfInfo.uid :
                await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        const ret = await this.core.apis.UserApi.getProfileLike(user_uid ?? this.core.selfInfo.uid, start, count, type);
        const listdata = ret.info.userLikeInfos[0].voteInfo.userInfos;
        for (const item of listdata) {
            item.uin = parseInt((await this.core.apis.UserApi.getUinByUidV2(item.uid)) || '');
        }
        return ret.info.userLikeInfos[0].voteInfo;
    }
}

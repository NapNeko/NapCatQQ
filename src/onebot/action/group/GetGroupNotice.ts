import { WebApiGroupNoticeFeed } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
interface GroupNotice {
    sender_id: number;
    publish_time: number;
    notice_id: string;
    message: {
        text: string
        image: Array<{
            height: string
            width: string
            id: string
        }>
    };
}

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

type ApiGroupNotice = GroupNotice & WebApiGroupNoticeFeed;

export class GetGroupNotice extends OneBotAction<Payload, GroupNotice[]> {
    actionName = ActionName.GoCQHTTP_GetGroupNotice;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const group = payload.group_id.toString();
        const ret = await this.core.apis.WebApi.getGroupNotice(group);
        if (!ret) {
            throw new Error('获取公告失败');
        }
        const retNotices: GroupNotice[] = new Array<ApiGroupNotice>();
        for (const key in ret.feeds) {
            const retApiNotice: WebApiGroupNoticeFeed = ret.feeds[key];
            const retNotice: GroupNotice = {
                notice_id: retApiNotice.fid,
                sender_id: retApiNotice.u,
                publish_time: retApiNotice.pubt,
                message: {
                    text: retApiNotice.msg.text,
                    image: retApiNotice.msg.pics?.map((pic) => {
                        return { id: pic.id, height: pic.h, width: pic.w };
                    }) || [],
                },
            };
            retNotices.push(retNotice);
        }

        return retNotices;
    }
}

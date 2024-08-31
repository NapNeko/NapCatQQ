import { ChatType, Peer } from '@/core/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        group_id: { type: ['number', 'string'] },
    },
} as const satisfies JSONSchema;

type PlayloadType = FromSchema<typeof SchemaData>;

class MarkMsgAsRead extends BaseAction<PlayloadType, null> {
    async getPeer(payload: PlayloadType): Promise<Peer> {
        if (payload.user_id) {
            const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw `私聊${payload.user_id}不存在`;
            }
            const isBuddy = await this.core.apis.FriendApi.isBuddy(peerUid);
            return { chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid };
        }
        if (!payload.group_id) {
            throw new Error('缺少参数 group_id 或 user_id');
        }
        return { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
    }

    async _handle(payload: PlayloadType): Promise<null> {
        const ret = await this.core.apis.MsgApi.setMsgRead(await this.getPeer(payload));
        if (ret.result != 0) {
            throw new Error('设置已读失败,' + ret.errMsg);
        }
        return null;
    }
}

// 以下为非标准实现
export class MarkPrivateMsgAsRead extends MarkMsgAsRead {
    payloadSchema = SchemaData;
    actionName = ActionName.MarkPrivateMsgAsRead;
}

export class MarkGroupMsgAsRead extends MarkMsgAsRead {
    payloadSchema = SchemaData;
    actionName = ActionName.MarkGroupMsgAsRead;
}


interface Payload {
    message_id: number;
}

export class GoCQHTTPMarkMsgAsRead extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_MarkMsgAsRead;

    async _handle(payload: Payload): Promise<null> {
        return null;
    }
}

export class MarkAllMsgAsRead extends BaseAction<Payload, null> {
    actionName = ActionName._MarkAllMsgAsRead;

    async _handle(payload: Payload): Promise<null> {
        await this.core.apis.MsgApi.markAllMsgAsRead();
        return null;
    }
}

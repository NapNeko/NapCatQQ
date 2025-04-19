import { ChatType, Peer } from '@/core/types';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Optional(Type.Union([Type.String(), Type.Number()])),
    group_id: Type.Optional(Type.Union([Type.String(), Type.Number()])),
    message_id: Type.Optional(Type.Union([Type.String(), Type.Number()])),
});

type PlayloadType = Static<typeof SchemaData>;

class MarkMsgAsRead extends OneBotAction<PlayloadType, null> {
    async getPeer(payload: PlayloadType): Promise<Peer> {
        if (payload.message_id) {
            const s_peer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id)?.Peer;
            if (s_peer) {
                return s_peer;
            }
            const l_peer = MessageUnique.getPeerByMsgId(payload.message_id.toString())?.Peer;
            if (l_peer) {
                return l_peer;
            }
        }
        if (payload.user_id) {
            const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw new Error( `私聊${payload.user_id}不存在`);
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
    override payloadSchema = SchemaData;
    override actionName = ActionName.MarkPrivateMsgAsRead;
}

export class MarkGroupMsgAsRead extends MarkMsgAsRead {
    override payloadSchema = SchemaData;
    override actionName = ActionName.MarkGroupMsgAsRead;
}

export class GoCQHTTPMarkMsgAsRead extends MarkMsgAsRead {
    override actionName = ActionName.GoCQHTTP_MarkMsgAsRead;
}

export class MarkAllMsgAsRead extends OneBotAction<void, null> {
    override actionName = ActionName._MarkAllMsgAsRead;

    async _handle(): Promise<null> {
        await this.core.apis.MsgApi.markAllMsgAsRead();
        return null;
    }
}

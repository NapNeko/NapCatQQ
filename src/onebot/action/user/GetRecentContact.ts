
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { NetworkAdapterConfig } from '@/onebot/config/config';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    count: Type.Union([Type.Number(), Type.String()], { default: 10 }),
});

type Payload = Static<typeof SchemaData>;

export default class GetRecentContact extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetRecentContact;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload, _adapter: string, config: NetworkAdapterConfig) {
        const ret = await this.core.apis.UserApi.getRecentContactListSnapShot(+payload.count);
        //烘焙消息
        return await Promise.all(ret.info.changedList.map(async (t) => {
            const FastMsg = await this.core.apis.MsgApi.getMsgsByMsgId({ chatType: t.chatType, peerUid: t.peerUid }, [t.msgId]);
            if (FastMsg.msgList.length > 0 && FastMsg.msgList[0]) {
                //扩展ret.info.changedList
                const lastestMsg = await this.obContext.apis.MsgApi.parseMessage(FastMsg.msgList[0], config.messagePostFormat);
                return {
                    lastestMsg: lastestMsg,
                    peerUin: t.peerUin,
                    remark: t.remark,
                    msgTime: t.msgTime,
                    chatType: t.chatType,
                    msgId: t.msgId,
                    sendNickName: t.sendNickName,
                    sendMemberName: t.sendMemberName,
                    peerName: t.peerName,
                };
            }
            return {
                peerUin: t.peerUin,
                remark: t.remark,
                msgTime: t.msgTime,
                chatType: t.chatType,
                msgId: t.msgId,
                sendNickName: t.sendNickName,
                sendMemberName: t.sendMemberName,
                peerName: t.peerName,
            };
        }));
    }
}

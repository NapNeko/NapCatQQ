
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { AdapterConfigWrap } from '@/onebot/config/config';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    count: Type.Union([Type.Number(), Type.String()], { default: 10 }),
});

type Payload = Static<typeof SchemaData>;

export default class GetRecentContact extends OneBotAction<Payload, any> {
    actionName = ActionName.GetRecentContact;
    payloadSchema = SchemaData;

    async _handle(payload: Payload, adapter: string) {
        const ret = await this.core.apis.UserApi.getRecentContactListSnapShot(+payload.count);
        const network = Object.values(this.obContext.configLoader.configData.network) as Array<AdapterConfigWrap>;
        //烘焙消息
        const msgFormat = network.flat().find(e => e.name === adapter)?.messagePostFormat ?? 'array';
        return await Promise.all(ret.info.changedList.map(async (t) => {
            const FastMsg = await this.core.apis.MsgApi.getMsgsByMsgId({ chatType: t.chatType, peerUid: t.peerUid }, [t.msgId]);
            if (FastMsg.msgList.length > 0) {
                //扩展ret.info.changedList
                const lastestMsg = await this.obContext.apis.MsgApi.parseMessage(FastMsg.msgList[0], msgFormat);
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

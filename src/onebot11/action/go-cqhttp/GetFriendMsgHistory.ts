import BaseAction from '../BaseAction';
import { OB11Message, OB11User } from '../../types';
import { getFriend, friends, uid2UinMap, getUidByUin } from '@/common/data';
import { ActionName } from '../types';
import { ChatType } from '@/core/qqnt/entities';
import { dbUtil } from '@/common/utils/db';
import { NTQQMsgApi } from '@/core/qqnt/apis/msg';
import { OB11Constructor } from '../../constructor';


interface Payload {
    user_id: number
    message_seq: number,
    count: number
}

interface Response {
    messages: OB11Message[];
}

export default class GetFriendMsgHistory extends BaseAction<Payload, Response> {
    actionName = ActionName.GetFriendMsgHistory;
    protected async _handle(payload: Payload): Promise<Response> {
        let uid = getUidByUin(payload.user_id.toString())
        if (!uid) {
            throw `记录${payload.user_id}不存在`;
        }
        const startMsgId = (await dbUtil.getMsgByShortId(payload.message_seq))?.msgId || '0';
        let friend = await getFriend(uid);
        let historyResult = (await NTQQMsgApi.getMsgHistory({
            chatType: friend ? ChatType.friend : ChatType.temp,
            peerUid: uid
        }, startMsgId, parseInt(payload.count?.toString()) || 20));
        console.log(historyResult);
        const msgList = historyResult.msgList;
        await Promise.all(msgList.map(async msg => {
            msg.id = await dbUtil.addMsg(msg);
        }));
        const ob11MsgList = await Promise.all(msgList.map(msg => OB11Constructor.message(msg)));
        return { 'messages': ob11MsgList };
    }
}

import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

interface Notify {
    request_id: string;
    invitor_uin: number;
    invitor_nick?: string;
    group_id?: number;
    group_name?: string;
    checked: boolean;
    actor: number;
}

interface JoinRequest extends Notify {
    requester_nick?: string;
}

interface RetData {
    InvitedRequest: Notify[];
    join_requests: JoinRequest[];
}

export class GetGroupSystemMsg extends OneBotAction<void, RetData> {
    actionName = ActionName.GetGroupSystemMsg;

    async _handle(): Promise<RetData> {
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const SingleScreenNotifies = await NTQQGroupApi.getSingleScreenNotifies(false, 50);
        const retData: RetData = { InvitedRequest: [], join_requests: [] };

        const notifyPromises = SingleScreenNotifies.map(async (SSNotify) => {
            const invitorUin = SSNotify.user1?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
            const actorUin = SSNotify.user2?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user2.uid) : 0;

            if (SSNotify.type === 1) {
                retData.InvitedRequest.push({
                    request_id: `${SSNotify.group.groupCode}|${SSNotify.seq}|${SSNotify.type}`,
                    invitor_uin: invitorUin,
                    invitor_nick: SSNotify.user1?.nickName,
                    group_id: +SSNotify.group?.groupCode,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                    actor: actorUin,
                });
            } else if (SSNotify.type === 7) {
                retData.join_requests.push({
                    request_id: `${SSNotify.group.groupCode}|${SSNotify.seq}|${SSNotify.type}`,
                    invitor_uin: invitorUin,
                    requester_nick: SSNotify.user1?.nickName,
                    group_id: +SSNotify.group?.groupCode,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                    actor: actorUin,
                });
            }
        });

        await Promise.all(notifyPromises);

        return retData;
    }
}
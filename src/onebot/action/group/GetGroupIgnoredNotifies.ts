import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Notify } from '@/onebot/types';

interface RetData {
    invited_requests: Notify[];
    InvitedRequest: Notify[];
    join_requests: Notify[];
}

export class GetGroupIgnoredNotifies extends OneBotAction<void, RetData> {
    override actionName = ActionName.GetGroupIgnoredNotifies;

    async _handle(): Promise<RetData> {
        const SingleScreenNotifies = await this.core.apis.GroupApi.getSingleScreenNotifies(false, 50);
        const retData: RetData = { invited_requests: [], InvitedRequest: [], join_requests: [] };

        const notifyPromises = SingleScreenNotifies.map(async (SSNotify) => {
            const invitorUin = SSNotify.user1?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
            const actorUin = SSNotify.user2?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user2.uid) : 0;
            const commonData = {
                request_id: +SSNotify.seq,
                invitor_uin: invitorUin,
                invitor_nick: SSNotify.user1?.nickName,
                group_id: +SSNotify.group?.groupCode,
                message: SSNotify?.postscript,
                group_name: SSNotify.group?.groupName,
                checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                actor: actorUin,
                requester_nick: SSNotify.user1?.nickName,
            };

            if (SSNotify.type === 1) {
                retData.InvitedRequest.push(commonData);
            } else if (SSNotify.type === 7) {
                retData.join_requests.push(commonData);
            }
        });

        await Promise.all(notifyPromises);
        retData.invited_requests = retData.InvitedRequest;
        return retData;
    }
}
import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Notify } from '@/onebot/types';

interface RetData {
    InvitedRequest: Notify[];
    join_requests: Notify[];
}

export class GetGroupSystemMsg extends OneBotAction<void, RetData> {
    override actionName = ActionName.GetGroupSystemMsg;

    async _handle(): Promise<RetData> {
        const SingleScreenNotifies = await this.core.apis.GroupApi.getSingleScreenNotifies(false, 50);
        const retData: RetData = { InvitedRequest: [], join_requests: [] };

        const notifyPromises = SingleScreenNotifies.map(async (SSNotify) => {
            const invitorUin = SSNotify.user1?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
            // 假设user2和actionUser只能有一个。根据测试InvitedRequest和join_requests都仅actionUser有值，
            // 保留之前取user2的逻辑。问了作者也说不知道什么情况。
            const actor = SSNotify.user2?.uid ? SSNotify.user2 : SSNotify.actionUser;
            const actorUin = actor?.uid ? +await this.core.apis.UserApi.getUinByUidV2(actor.uid) : 0;
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
                status: SSNotify.status,
            };

            if (SSNotify.type === 1) {
                retData.InvitedRequest.push(commonData);
            } else if (SSNotify.type === 7) {
                retData.join_requests.push(commonData);
            }
        });

        await Promise.all(notifyPromises);

        return retData;
    }
}

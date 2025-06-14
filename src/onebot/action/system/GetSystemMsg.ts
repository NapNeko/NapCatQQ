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
            // 根据测试InvitedRequest和join_requests都仅user1与actionUser有值，
            // 需要验证的邀请，user2有值，表示邀请人。
            // 出于兼容性，被邀请人占用了invitor的字段，导致邀请人没名可用。暂且先吞了这个值
            const actorUin = SSNotify.actionUser?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.actionUser.uid) : 0;
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

            if (SSNotify.type === 1 || SSNotify.type === 5) {
                retData.InvitedRequest.push(commonData);
            } else if (SSNotify.type === 7) {
                retData.join_requests.push(commonData);
            }
        });

        await Promise.all(notifyPromises);

        return retData;
    }
}

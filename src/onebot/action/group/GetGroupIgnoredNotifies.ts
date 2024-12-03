import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
export class GetGroupIgnoredNotifies extends OneBotAction<void, any> {
    actionName = ActionName.GetGroupIgnoredNotifies;

    async _handle(payload: void) {
        const ignoredNotifies = await this.core.apis.GroupApi.getSingleScreenNotifies(true, 10);
        const retData: any = {
            join_requests: await Promise.all(
                ignoredNotifies
                    .filter(notify => notify.type === 7)
                    .map(async SSNotify => ({
                        request_id: SSNotify.group.groupCode + '|' + SSNotify.seq + '|' + SSNotify.type,
                        requester_uin: await this.core.apis.UserApi.getUinByUidV2(SSNotify.user1?.uid),
                        requester_nick: SSNotify.user1?.nickName,
                        group_id: SSNotify.group?.groupCode,
                        group_name: SSNotify.group?.groupName,
                        checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                        actor: await this.core.apis.UserApi.getUinByUidV2(SSNotify.user2?.uid) || 0,
                    }))),
        };

        return retData;
    }
}

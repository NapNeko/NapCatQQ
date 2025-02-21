import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Notify } from '@/onebot/types';

export default class GetGroupAddRequest extends OneBotAction<null, Notify[] | null> {
    override actionName = ActionName.GetGroupIgnoreAddRequest;

    async _handle(): Promise<Notify[] | null> {
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const ignoredNotifies = await NTQQGroupApi.getSingleScreenNotifies(true, 10);
        const retData: Notify[] = [];

        const notifyPromises = ignoredNotifies
            .filter(notify => notify.type === 7)
            .map(async SSNotify => {
                const invitorUin = SSNotify.user1?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
                const actorUin = SSNotify.user2?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user2.uid) : 0;
                retData.push({
                    request_id: +SSNotify.seq,
                    invitor_uin: invitorUin,
                    invitor_nick: SSNotify.user1?.nickName,
                    group_id: +SSNotify.group?.groupCode,
                    message: SSNotify?.postscript,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                    actor: actorUin,
                    requester_nick: SSNotify.user1?.nickName,
                });
            });

        await Promise.all(notifyPromises);

        return retData;
    }
}
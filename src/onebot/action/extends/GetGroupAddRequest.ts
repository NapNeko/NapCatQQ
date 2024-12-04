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
    requester_nick?: string;
    actor: number;
}

export default class GetGroupAddRequest extends OneBotAction<null, Notify[] | null> {
    actionName = ActionName.GetGroupIgnoreAddRequest;

    async _handle(payload: null): Promise<Notify[] | null> {
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
                    request_id: `${SSNotify.group.groupCode}|${SSNotify.seq}|${SSNotify.type}`,
                    invitor_uin: invitorUin,
                    requester_nick: SSNotify.user1?.nickName,
                    group_id: +SSNotify.group?.groupCode,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
                    actor: actorUin,
                });
            });

        await Promise.all(notifyPromises);

        return retData;
    }
}
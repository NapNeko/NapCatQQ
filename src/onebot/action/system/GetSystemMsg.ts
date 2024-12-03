import { GroupNotifyMsgStatus } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
export class GetGroupSystemMsg extends OneBotAction<void, any> {
    actionName = ActionName.GetGroupSystemMsg;

    async _handle() {
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        // 默认10条 该api未完整实现 包括响应数据规范化 类型规范化 
        const SingleScreenNotifies = await NTQQGroupApi.getSingleScreenNotifies(false, 10);
        const retData: any = { InvitedRequest: [], join_requests: [] };
        for (const SSNotify of SingleScreenNotifies) {
            if (SSNotify.type == 1) {
                retData.InvitedRequest.push({
                    request_id: SSNotify.group.groupCode + '|' + SSNotify.seq + '|' + SSNotify.type,
                    invitor_uin: await NTQQUserApi.getUinByUidV2(SSNotify.user1?.uid),
                    invitor_nick: SSNotify.user1?.nickName,
                    group_id: SSNotify.group?.groupCode,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status === GroupNotifyMsgStatus.KUNHANDLE ? false : true,
                    actor: await NTQQUserApi.getUinByUidV2(SSNotify.user2?.uid) || 0,
                });
            } else if (SSNotify.type == 7) {
                retData.join_requests.push({
                    request_id: SSNotify.group.groupCode + '|' + SSNotify.seq + '|' + SSNotify.type,
                    requester_uin: await NTQQUserApi.getUinByUidV2(SSNotify.user1?.uid),
                    requester_nick: SSNotify.user1?.nickName,
                    group_id: SSNotify.group?.groupCode,
                    group_name: SSNotify.group?.groupName,
                    checked: SSNotify.status === GroupNotifyMsgStatus.KUNHANDLE ? false : true,
                    actor: await NTQQUserApi.getUinByUidV2(SSNotify.user2?.uid) || 0,
                });
            }
        }

        return retData;
    }
}
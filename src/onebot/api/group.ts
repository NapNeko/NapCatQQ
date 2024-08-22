import { GrayTipElement, NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11GroupBanEvent } from '../event/notice/OB11GroupBanEvent';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';

export class OneBotGroupApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;
    GroupMemberList: Map<string, any> = new Map();//此处作为缓存 group_id->memberUin->info
    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
    async parseGroupBanEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const groupElement = grayTipElement?.groupElement;
        const NTQQGroupApi = this.coreContext.apis.GroupApi;
        if (!groupElement?.shutUp) return undefined;
        const memberUid = groupElement.shutUp!.member.uid;
        const adminUid = groupElement.shutUp!.admin.uid;
        let memberUin: string = '';
        let duration = parseInt(groupElement.shutUp!.duration);
        const subType: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
        if (memberUid) {
            memberUin = (await NTQQGroupApi.getGroupMember(GroupCode, memberUid))?.uin || '';
        } else {
            memberUin = '0';  // 0表示全员禁言
            if (duration > 0) {
                duration = -1;
            }
        }
        const adminUin = (await NTQQGroupApi.getGroupMember(GroupCode, adminUid))?.uin;
        if (memberUin && adminUin) {
            return new OB11GroupBanEvent(
                this.coreContext,
                parseInt(GroupCode),
                parseInt(memberUin),
                parseInt(adminUin),
                duration,
                subType
            );
        }
        return undefined;
    }
    async parseGroupMemberIncreaseEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const NTQQGroupApi = this.coreContext.apis.GroupApi;
        let groupElement = grayTipElement?.groupElement;
        if (!groupElement) return undefined;
        const member = await NTQQGroupApi.getGroupMember(GroupCode, groupElement.memberUid);
        const memberUin = member?.uin;
        const adminMember = await NTQQGroupApi.getGroupMember(GroupCode, groupElement.adminUid);
        if (memberUin) {
            const operatorUin = adminMember?.uin || memberUin;
            return new OB11GroupIncreaseEvent(
                this.coreContext,
                parseInt(GroupCode),
                parseInt(memberUin),
                parseInt(operatorUin)
            );
        }
        return undefined;
    }
}

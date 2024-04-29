import { OB11GroupMember } from '../../types';
import { getGroupMember } from '@/core/data';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
import { log, logDebug } from '@/common/utils/log';
import { isNull } from '../../../common/utils/helper';
import { WebApi } from '@/core/apis/webapi';


export interface PayloadType {
  group_id: number;
  user_id: number;
}

class GetGroupMemberInfo extends BaseAction<PayloadType, OB11GroupMember> {
  actionName = ActionName.GetGroupMemberInfo;

  protected async _handle(payload: PayloadType) {
    let WebGroupMember = await WebApi.getGroupMembers(payload.group_id.toString());
    const member = await getGroupMember(payload.group_id.toString(), payload.user_id.toString());
    // log(member);
    if (member) {
      logDebug('获取群成员详细信息');
      try {
        const info = (await NTQQUserApi.getUserDetailInfo(member.uid));
        logDebug('群成员详细信息结果', info);
        Object.assign(member, info);
      } catch (e) {
        logDebug('获取群成员详细信息失败, 只能返回基础信息', e);
      }
      let retMember = OB11Constructor.groupMember(payload.group_id.toString(), member);
      for (let i = 0, len = WebGroupMember.length; i < len; i++) {
        if (WebGroupMember[i]?.uin && WebGroupMember[i].uin === retMember.user_id) {
          retMember.join_time = WebGroupMember[i]?.join_time;
          retMember.last_sent_time = WebGroupMember[i]?.last_speak_time;
          retMember.qage = WebGroupMember[i]?.qage;
          retMember.level = WebGroupMember[i]?.lv.level;
        }

      }
      return retMember;
    } else {
      throw (`群成员${payload.user_id}不存在`);
    }
  }
}

export default GetGroupMemberInfo;

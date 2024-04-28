import { getGroup } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore, NTQQGroupApi } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { logDebug } from '@/common/utils/log';

export interface PayloadType {
  group_id: number
}


class GetGroupMemberList extends BaseAction<PayloadType, OB11GroupMember[]> {
  actionName = ActionName.GetGroupMemberList;

  protected async _handle(payload: PayloadType) {
    // logDebug(await WebApi.getGroupMembers(payload.group_id.toString()));
    // await NTQQGroupApi.getGroupMembers(payload.group_id.toString());
    const group = await getGroup(payload.group_id.toString());
    if (group) {
      return OB11Constructor.groupMembers(group);
    } else {
      throw (`群${payload.group_id}不存在`);
    }
  }
}

export default GetGroupMemberList;

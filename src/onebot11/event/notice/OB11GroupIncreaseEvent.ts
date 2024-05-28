import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { dbUtil } from '@/common/utils/db';
import { ob11Config } from '@/onebot11/config';

type GroupIncreaseSubType = 'approve' | 'invite';
export class OB11GroupIncreaseEvent extends OB11GroupNoticeEvent {
  notice_type = 'group_increase';
  operator_id: number;
  sub_type: GroupIncreaseSubType;
  constructor(groupId: number, userId: number, operatorId: number, subType: GroupIncreaseSubType = 'approve') {
    super();
    this.group_id = groupId;
    this.operator_id = operatorId;
    this.user_id = userId;
    this.sub_type = subType;

    if((ob11Config.GroupLocalTimeRecord[0] == -1 || ob11Config.GroupLocalTimeRecord.includes(groupId)))
      dbUtil.insertJoinTime(groupId, userId, Math.floor(Date.now() / 1000))
    
  }
}

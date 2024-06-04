import { GroupNotify, GroupNotifyStatus } from '@/core/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { uid2UinMap } from '@/core/data';
import { NTQQUserApi } from '@/core/apis/user';
import { NTQQGroupApi } from '@/core/apis/group';

interface OB11GroupRequestNotify {
  group_id: number,
  user_id: number,
  flag: string
}

export default class GetGroupAddRequest extends BaseAction<null, OB11GroupRequestNotify[] | null> {
  actionName = ActionName.GetGroupIgnoreAddRequest;

  protected async _handle(payload: null): Promise<OB11GroupRequestNotify[] | null> {
    const data = await NTQQGroupApi.getGroupIgnoreNotifies();
    // log(data);
    // const notifies: GroupNotify[] = data.notifies.filter(notify => notify.status === GroupNotifyStatus.WAIT_HANDLE);
    // const returnData: OB11GroupRequestNotify[] = [];
    // for (const notify of notifies) {
    //   const uin = uid2UinMap[notify.user1.uid] || (await NTQQUserApi.getUserDetailInfo(notify.user1.uid))?.uin;
    //   returnData.push({
    //     group_id: parseInt(notify.group.groupCode),
    //     user_id: parseInt(uin),
    //     flag: notify.seq
    //   });
    // }
    return null;
  }
}

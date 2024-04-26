import BaseAction from '../BaseAction';
import { GroupRequestOperateTypes } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { groupNotifies } from '@/common/data';

interface Payload {
  flag: string,
  // sub_type: "add" | "invite",
  // type: "add" | "invite"
  approve: boolean,
  reason: string
}

export default class SetGroupAddRequest extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupAddRequest;

  protected async _handle(payload: Payload): Promise<null> {
    const flag = payload.flag.toString();
    const approve = payload.approve.toString() === 'true';
    const notify = groupNotifies[flag];
    if (!notify) {
      throw `${flag}对应的加群通知不存在`;
    }
    await NTQQGroupApi.handleGroupRequest(notify,
      approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
      payload.reason
    );
    return null;
  }
}

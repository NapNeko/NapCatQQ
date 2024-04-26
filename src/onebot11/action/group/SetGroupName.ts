import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';

interface Payload {
    group_id: number,
    group_name: string
}

export default class SetGroupName extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupName;

  protected async _handle(payload: Payload): Promise<null> {

    await NTQQGroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
    return null;
  }
}

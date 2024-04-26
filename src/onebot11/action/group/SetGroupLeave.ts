import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { log, logError } from '@/common/utils/log';

interface Payload {
    group_id: number,
    is_dismiss: boolean
}

export default class SetGroupLeave extends BaseAction<Payload, any> {
  actionName = ActionName.SetGroupLeave;

  protected async _handle(payload: Payload): Promise<any> {
    try {
      await NTQQGroupApi.quitGroup(payload.group_id.toString());
    } catch (e) {
      logError('退群失败', e);
      throw e;
    }
  }
}

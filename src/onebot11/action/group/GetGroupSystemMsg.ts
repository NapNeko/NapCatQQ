import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis/msg';


export class GetGroupSystemMsg extends BaseAction<void, void> {
  actionName = ActionName.GetGroupSystemMsg;
  protected async _handle(payload: void) {

  }
}

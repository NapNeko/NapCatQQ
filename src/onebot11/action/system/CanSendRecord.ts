import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface ReturnType {
  yes: boolean
}

export default class CanSendRecord extends BaseAction<any, ReturnType> {
  actionName = ActionName.CanSendRecord;

  protected async _handle(payload): Promise<ReturnType> {
    return {
      yes: true
    };
  }
}

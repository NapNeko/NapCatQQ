
import { OB11User } from '../../types';
import { OB11Constructor } from '../../helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

class GetLoginInfo extends BaseAction<null, OB11User> {
  actionName = ActionName.GetLoginInfo;

  protected async _handle(payload: null) {
    return OB11Constructor.selfInfo(this.CoreContext.selfInfo);
  }
}

export default GetLoginInfo;

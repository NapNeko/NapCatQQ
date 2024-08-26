import { OB11User } from '../../types';
import { OB11Constructor } from '@/onebot/helper/converter';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

class GetLoginInfo extends BaseAction<null, OB11User> {
    actionName = ActionName.GetLoginInfo;

    async _handle(payload: null) {
        return OB11Constructor.selfInfo(this.core.selfInfo);
    }
}

export default GetLoginInfo;

import { OB11User } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '../types';

class GetLoginInfo extends OneBotAction<null, OB11User> {
    actionName = ActionName.GetLoginInfo;

    async _handle(payload: null) {
        return OB11Entities.selfInfo(this.core.selfInfo);
    }
}

export default GetLoginInfo;

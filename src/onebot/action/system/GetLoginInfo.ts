import { OB11User } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

class GetLoginInfo extends OneBotAction<null, OB11User> {
    override actionName = ActionName.GetLoginInfo;

    async _handle() {
        return OB11Construct.selfInfo(this.core.selfInfo);
    }
}

export default GetLoginInfo;

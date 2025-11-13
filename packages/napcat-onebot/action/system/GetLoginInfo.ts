import { OB11User } from '@/napcat-onebot/index';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

class GetLoginInfo extends OneBotAction<null, OB11User> {
  override actionName = ActionName.GetLoginInfo;

  async _handle () {
    return OB11Construct.selfInfo(this.core.selfInfo);
  }
}

export default GetLoginInfo;

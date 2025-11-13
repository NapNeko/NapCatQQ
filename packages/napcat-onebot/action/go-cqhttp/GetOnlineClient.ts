import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { sleep } from 'napcat-common/src/helper';

export class GetOnlineClient extends OneBotAction<void, Array<void>> {
  override actionName = ActionName.GetOnlineClient;
  async _handle () {
    // 注册监听
    this.core.apis.SystemApi.getOnlineDev();
    await sleep(500);

    return [];
  }
}

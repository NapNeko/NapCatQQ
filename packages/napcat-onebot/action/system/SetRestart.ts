import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { WebUiDataRuntime } from 'napcat-webui-backend/src/helper/Data';

export class SetRestart extends OneBotAction<void, void> {
  override actionName = ActionName.Reboot;

  async _handle () {
    const result = await WebUiDataRuntime.requestRestartProcess();
    if (!result.result) {
      throw new Error(result.message || '进程重启失败');
    }
  }
}

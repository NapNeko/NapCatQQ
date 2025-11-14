import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ActionHandler } from '../auto-register';

@ActionHandler
export default class TestAutoRegister01 extends OneBotAction<void, string> {
  override actionName = ActionName.TestAutoRegister01;

  async _handle (_payload: void): Promise<string> {
    return 'AutoRegister Router Test';
  }
}

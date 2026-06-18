import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ActionHandler } from '../auto-register';
import { Type } from '@sinclair/typebox';

@ActionHandler
export default class TestAutoRegister02 extends OneBotAction<void, string> {
  override actionName = ActionName.TestAutoRegister02;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.String({ description: '测试返回内容' });

  async _handle (_payload: void): Promise<string> {
    return 'AutoRegister Router Test';
  }
}

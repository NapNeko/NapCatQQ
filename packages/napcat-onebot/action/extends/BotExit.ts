import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Type } from '@sinclair/typebox';

export class BotExit extends OneBotAction<void, void> {
  override actionName = ActionName.Exit;
  override payloadSchema = Type.Void();
  override returnSchema = Type.Void();
  override actionSummary = '退出登录';
  override actionTags = ['系统扩展'];
  override payloadExample = {};
  override returnExample = null;

  async _handle () {
    process.exit(0);
  }
}

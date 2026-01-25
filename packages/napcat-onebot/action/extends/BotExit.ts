import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Type } from '@sinclair/typebox';

export class BotExit extends OneBotAction<void, void> {
  override actionName = ActionName.Exit;
  override payloadSchema = Type.Void();
  override returnSchema = Type.Void();

  async _handle () {
    process.exit(0);
  }
}

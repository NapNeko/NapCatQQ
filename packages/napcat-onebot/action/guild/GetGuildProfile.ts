import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';

export class GetGuildProfile extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildProfile;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();

  async _handle (): Promise<void> {

  }
}

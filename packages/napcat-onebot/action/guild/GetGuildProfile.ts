import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';

export class GetGuildProfile extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildProfile;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionDescription = '获取频道个人信息';
  override actionTags = ['频道接口'];

  async _handle (): Promise<void> {

  }
}

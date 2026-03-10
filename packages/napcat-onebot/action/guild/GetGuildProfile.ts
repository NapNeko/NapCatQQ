import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';

export class GetGuildProfile extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildProfile;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '获取频道个人信息';
  override actionDescription = '兼容接口，当前版本未实现 get_guild_service_profile';
  override actionTags = ['频道接口'];
  override payloadExample = {};
  override returnExample = null;
  override supported = false;
  override unsupportedReason = '当前版本未实现 get_guild_service_profile';

  async _handle (): Promise<void> {
    throw new Error('当前版本未实现 get_guild_service_profile');
  }
}

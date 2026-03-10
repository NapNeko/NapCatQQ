import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';

export class GetGuildList extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildList;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '获取频道列表';
  override actionDescription = '兼容接口，当前版本未实现 get_guild_list';
  override actionTags = ['频道接口'];
  override payloadExample = {};
  override returnExample = null;

  async _handle (): Promise<void> {
    throw new Error('当前版本未实现 get_guild_list');
  }
}

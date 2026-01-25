import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';
import { GuildActionsExamples } from './examples';

export class GetGuildList extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildList;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '获取频道列表';
  override actionDescription = '获取当前帐号已加入的频道列表';
  override actionTags = ['频道接口'];
  override payloadExample = GuildActionsExamples.GetGuildList.payload;
  override returnExample = GuildActionsExamples.GetGuildList.response;

  async _handle (): Promise<void> {

  }
}

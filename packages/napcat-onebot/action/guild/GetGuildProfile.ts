import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';
import { GuildActionsExamples } from './examples';

export class GetGuildProfile extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildProfile;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '获取频道个人信息';
  override actionDescription = '获取当前帐号在频道中的个人资料';
  override actionTags = ['频道接口'];
  override payloadExample = GuildActionsExamples.GetGuildProfile.payload;
  override returnExample = GuildActionsExamples.GetGuildProfile.response;

  async _handle (): Promise<void> {

  }
}

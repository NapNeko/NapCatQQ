import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Type } from '@sinclair/typebox';

export class GetGuildList extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildList;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionDescription = '获取频道列表';
  override actionTags = ['频道接口'];

  async _handle (): Promise<void> {

  }
}

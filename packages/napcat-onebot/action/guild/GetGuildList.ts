import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null();

type ReturnType = Static<typeof ReturnSchema>;

export class GetGuildList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGuildList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取频道列表';
  override actionDescription = '获取当前帐号已加入的频道列表；当前兼容实现返回空结果';
  override actionTags = ['频道接口'];
  override payloadExample = {};
  override returnExample = null;

  async _handle (): Promise<ReturnType> {
    return null;
  }
}

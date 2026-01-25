import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Type, Static } from '@sinclair/typebox';

import { ExtendsActionsExamples } from './examples';

const ReturnSchema = Type.Array(Type.Any(), { description: 'Rkey列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetRkey extends GetPacketStatusDepends<void, ReturnType> {
  override actionName = ActionName.GetRkey;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;
  override actionSummary = '获取Rkey';
  override actionDescription = '获取用于媒体资源的Rkey列表';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.GetRkey.payload;
  override returnExample = ExtendsActionsExamples.GetRkey.response;

  async _handle () {
    return await this.core.apis.PacketApi.pkt.operation.FetchRkey();
  }
}

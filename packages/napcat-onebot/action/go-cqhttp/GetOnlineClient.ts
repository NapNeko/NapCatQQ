import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({}, { description: '在线客户端负载' });

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '当前版本未实现该兼容接口' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetOnlineClient extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetOnlineClient;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取在线客户端';
  override actionDescription = '兼容接口，当前版本未实现 get_online_clients';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {};
  override returnExample = null;

  async _handle (): Promise<null> {
    throw new Error('当前版本未实现 get_online_clients');
  }
}

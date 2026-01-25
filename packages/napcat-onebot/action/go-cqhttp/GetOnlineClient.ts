import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { sleep } from 'napcat-common/src/helper';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({}, { description: '在线客户端负载' });

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Any(), { description: '在线客户端列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetOnlineClient extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetOnlineClient;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle () {
    // 注册监听
    this.core.apis.SystemApi.getOnlineDev();
    await sleep(500);

    return [];
  }
}

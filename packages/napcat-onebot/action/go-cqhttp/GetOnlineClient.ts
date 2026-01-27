import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { sleep } from 'napcat-common/src/helper';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

const PayloadSchema = Type.Object({}, { description: '在线客户端负载' });

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Any(), { description: '在线客户端列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetOnlineClient extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetOnlineClient;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取在线客户端';
  override actionDescription = '获取当前登录账号的在线客户端列表';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetOnlineClient.payload;
  override returnExample = GoCQHTTPActionsExamples.GetOnlineClient.response;

  async _handle () {
    // 注册监听
    this.core.apis.SystemApi.getOnlineDev();
    await sleep(500);

    return [];
  }
}

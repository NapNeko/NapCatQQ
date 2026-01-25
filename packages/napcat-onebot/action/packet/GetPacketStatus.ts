import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { Type } from '@sinclair/typebox';

export abstract class GetPacketStatusDepends<PT, RT> extends OneBotAction<PT, RT> {
  protected override async check (payload: PT): Promise<BaseCheckResult> {
    if (!this.core.apis.PacketApi.packetStatus) {
      return {
        valid: false,
        message: 'packetBackend不可用，请参照文档 https://napneko.github.io/config/advanced 和启动日志检查packetBackend状态或进行配置！' +
          '错误堆栈信息：' + this.core.apis.PacketApi.clientLogStack,
      };
    }
    return await super.check(payload);
  }
}

export class GetPacketStatus extends GetPacketStatusDepends<void, void> {
  override actionName = ActionName.GetPacketStatus;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionDescription = '获取 Packet 状态';
  override actionTags = ['系统接口'];

  async _handle () {

  }
}

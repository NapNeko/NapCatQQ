import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Type, Static } from '@sinclair/typebox';

export const GetRkeyServerReturnSchema = Type.Object({
  private_rkey: Type.Optional(Type.String({ description: '私聊 RKey' })),
  group_rkey: Type.Optional(Type.String({ description: '群聊 RKey' })),
  expired_time: Type.Optional(Type.Number({ description: '过期时间' })),
  name: Type.String({ description: '名称' }),
});

export type GetRkeyServerReturn = Static<typeof GetRkeyServerReturnSchema>;

export class GetRkeyServer extends GetPacketStatusDepends<void, GetRkeyServerReturn> {
  override actionName = ActionName.GetRkeyServer;
  override actionSummary = '获取 RKey 服务器';
  override actionTags = ['系统扩展'];
  override payloadExample = {};
  override returnExample = {
    server: 'http://rkey-server.com'
  };
  override payloadSchema = Type.Object({});
  override returnSchema = GetRkeyServerReturnSchema;

  private rkeyCache: GetRkeyServerReturn | null = null;

  private expiryTime: number | null = null;

  async _handle () {
    // 检查缓存是否有效
    if (this.expiryTime && this.expiryTime > Math.floor(Date.now() / 1000) && this.rkeyCache) {
      return this.rkeyCache;
    }

    // 获取新的 Rkey
    const rkeys = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
    const privateRkeyItem = rkeys.filter(rkey => rkey.type === 10)[0];
    const groupRkeyItem = rkeys.filter(rkey => rkey.type === 20)[0];

    this.expiryTime = Math.floor(Date.now() / 1000) + Math.min(+groupRkeyItem!.ttl.toString(), +privateRkeyItem!.ttl.toString());

    // 更新缓存
    this.rkeyCache = {
      private_rkey: privateRkeyItem ? privateRkeyItem.rkey : undefined,
      group_rkey: groupRkeyItem ? groupRkeyItem.rkey : undefined,
      expired_time: this.expiryTime,
      name: 'NapCat 4',
    };

    return this.rkeyCache;
  }
}

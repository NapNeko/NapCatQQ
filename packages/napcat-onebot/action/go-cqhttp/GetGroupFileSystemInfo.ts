import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  file_count: Type.Number({ description: '文件总数' }),
  limit_count: Type.Number({ description: '文件上限' }),
  used_space: Type.Number({ description: '已使用空间' }),
  total_space: Type.Number({ description: '总空间' }),
}, { description: '群文件系统信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupFileSystemInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupFileSystemInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const groupFileCount = (await this.core.apis.GroupApi.getGroupFileCount([payload.group_id.toString()])).groupFileCounts[0];
    if (!groupFileCount) {
      throw new Error('Group not found');
    }
    return {
      file_count: groupFileCount,
      limit_count: 10000,
      used_space: 0,
      total_space: 10 * 1024 * 1024 * 1024,
    };
  }
}

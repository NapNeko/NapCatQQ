import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  // 兼容gocq 与name二选一
  folder_name: Type.Optional(Type.String({ description: '文件夹名称' })),
  // 兼容gocq 与folder_name二选一
  name: Type.Optional(Type.String({ description: '文件夹名称' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  result: Type.Any({ description: '操作结果' }),
  groupItem: Type.Any({ description: '群项信息' }),
}, { description: '创建文件夹结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class CreateGroupFileFolder extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '创建群文件目录';
  override actionDescription = '在群文件系统中创建新的文件夹';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {
    group_id: '123456789',
    folder_name: '新建文件夹'
  };
  override returnExample = {
    result: {},
    groupItem: {}
  };

  async _handle (payload: PayloadType) {
    const folderName = payload.folder_name || payload.name;
    return (await this.core.apis.GroupApi.creatGroupFileFolder(payload.group_id.toString(), folderName!)).resultWithGroupItem;
  }
}

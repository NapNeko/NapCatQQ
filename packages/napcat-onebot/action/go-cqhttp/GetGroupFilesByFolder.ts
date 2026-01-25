import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  folder_id: Type.Optional(Type.String({ description: '文件夹ID' })),
  folder: Type.Optional(Type.String({ description: '文件夹ID' })),
  file_count: Type.Union([Type.Number(), Type.String()], { default: 50, description: '文件数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  files: Type.Array(Type.Unknown(), { description: '文件列表' }),
  folders: Type.Array(Type.Unknown(), { description: '文件夹列表' }),
}, { description: '群文件夹文件列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupFilesByFolder extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupFilesByFolder;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '获取群文件夹文件列表';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetGroupFilesByFolder.payload;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const retRaw = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
      sortType: 1,
      fileCount: +payload.file_count,
      startIndex: 0,
      sortOrder: 2,
      showOnlinedocFolder: 0,
      folderId: payload.folder ?? payload.folder_id ?? '',
    });
    const ret = Array.isArray(retRaw) ? retRaw : [];
    return {
      files: ret.filter(item => item.fileInfo)
        .map(item => OB11Construct.file(item.peerId, item.fileInfo!)),
      folders: [],
    };
  }
}

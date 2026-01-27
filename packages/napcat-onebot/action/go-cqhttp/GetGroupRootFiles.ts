import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  file_count: Type.Union([Type.Number(), Type.String()], { default: 50, description: '文件数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  files: Type.Array(Type.Any(), { description: '文件列表' }),
  folders: Type.Array(Type.Any(), { description: '文件夹列表' }),
}, { description: '群根目录文件列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupRootFiles extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupRootFiles;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群根目录文件列表';
  override actionDescription = '获取群文件根目录下的所有文件和文件夹';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetGroupRootFiles.payload;
  override returnExample = GoCQHTTPActionsExamples.GetGroupRootFiles.response;

  async _handle (payload: PayloadType) {
    const ret = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
      sortType: 1,
      fileCount: +payload.file_count,
      startIndex: 0,
      sortOrder: 2,
      showOnlinedocFolder: 0,
    });

    return {
      files: ret.filter(item => item.fileInfo)
        .map(item => OB11Construct.file(item.peerId, item.fileInfo!)),
      folders: ret.filter(item => item.folderInfo)
        .map(item => OB11Construct.folder(item.peerId, item.folderInfo!)),
    };
  }
}

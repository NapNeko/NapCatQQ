import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ChatType, Peer, ElementType } from 'napcat-core/types';
import fs from 'fs';
import { uriToLocalFile } from 'napcat-common/src/file';
import { SendMessageContext } from '@/napcat-onebot/api';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

export const GoCQHTTPUploadGroupFilePayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  file: Type.String({ description: '本地文件路径' }),
  name: Type.String({ description: '文件名' }),
  folder: Type.Optional(Type.String({ description: '父目录 ID' })),
  folder_id: Type.Optional(Type.String({ description: '父目录 ID (兼容性字段)' })), // 临时扩展
  upload_file: Type.Boolean({ default: true, description: '是否执行上传' }),
});

export type GoCQHTTPUploadGroupFilePayload = Static<typeof GoCQHTTPUploadGroupFilePayloadSchema>;

export const GoCQHTTPUploadGroupFileReturnSchema = Type.Object({
  file_id: Type.Union([Type.String(), Type.Null()], { description: '文件 ID' }),
});

export type GoCQHTTPUploadGroupFileResponse = Static<typeof GoCQHTTPUploadGroupFileReturnSchema>;

export default class GoCQHTTPUploadGroupFile extends OneBotAction<GoCQHTTPUploadGroupFilePayload, GoCQHTTPUploadGroupFileResponse> {
  override actionName = ActionName.GoCQHTTP_UploadGroupFile;
  override payloadSchema = GoCQHTTPUploadGroupFilePayloadSchema;
  override returnSchema = GoCQHTTPUploadGroupFileReturnSchema;
  override actionDescription = '上传群文件';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.UploadGroupFile.payload;

  async _handle (payload: GoCQHTTPUploadGroupFilePayload): Promise<GoCQHTTPUploadGroupFileResponse> {
    let file = payload.file;
    if (fs.existsSync(file)) {
      file = `file://${file}`;
    }
    const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, file);
    const peer: Peer = {
      chatType: ChatType.KCHATTYPEGROUP,
      peerUid: payload.group_id.toString(),
    };
    if (!downloadResult.success) {
      throw new Error(downloadResult.errMsg);
    }
    const msgContext: SendMessageContext = {
      peer,
      deleteAfterSentFiles: [],
    };
    const sendFileEle = await this.obContext.apis.FileApi.createValidSendFileElement(msgContext, downloadResult.path, payload.name, payload.folder ?? payload.folder_id, payload.upload_file);
    msgContext.deleteAfterSentFiles.push(downloadResult.path);
    const returnMsg = await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, [sendFileEle], msgContext.deleteAfterSentFiles);

    const fileElement = returnMsg.elements.find(ele => ele.elementType === ElementType.FILE);
    return {
      file_id: fileElement?.fileElement?.fileUuid || null,
    };
  }
}

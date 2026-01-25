import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import fs from 'fs/promises';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11MessageImage, OB11MessageVideo } from '@/napcat-onebot/types';
import { Static, Type } from '@sinclair/typebox';

export const GetFilePayloadSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '文件路径、URL或Base64' })),
  file_id: Type.Optional(Type.String({ description: '文件ID' })),
});

export type GetFilePayload = Static<typeof GetFilePayloadSchema>;

export const GetFileReturnSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '本地路径' })),
  url: Type.Optional(Type.String({ description: '下载URL' })),
  file_size: Type.Optional(Type.String({ description: '文件大小' })),
  file_name: Type.Optional(Type.String({ description: '文件名' })),
  base64: Type.Optional(Type.String({ description: 'Base64编码' })),
}, { description: '文件信息' });

export type GetFileResponse = Static<typeof GetFileReturnSchema>;

export class GetFileBase extends OneBotAction<GetFilePayload, GetFileResponse> {
  override payloadSchema = GetFilePayloadSchema;
  override returnSchema = GetFileReturnSchema;

  async _handle (payload: GetFilePayload): Promise<GetFileResponse> {
    payload.file ||= payload.file_id || '';
    // 接收消息标记模式
    const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file);
    if (contextMsgFile && contextMsgFile.msgId && contextMsgFile.elementId) {
      const { peer, msgId, elementId } = contextMsgFile;
      const downloadPath = await this.core.apis.FileApi.downloadMedia(msgId, peer.chatType, peer.peerUid, elementId, '', '');
      const rawMessage = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgId]))?.msgList
        .find(msg => msg.msgId === msgId);
      const mixElement = rawMessage?.elements.find(e => e.elementId === elementId);
      const mixElementInner = mixElement?.videoElement ?? mixElement?.fileElement ?? mixElement?.pttElement ?? mixElement?.picElement;
      if (!mixElementInner) throw new Error('element not found');
      const fileSize = mixElementInner.fileSize?.toString() ?? '';
      const fileName = mixElementInner.fileName ?? '';
      let url = '';
      if (mixElement?.picElement && rawMessage) {
        const tempData =
          await this.obContext.apis.MsgApi.rawToOb11Converters.picElement?.(mixElement?.picElement, rawMessage, mixElement, { parseMultMsg: false, disableGetUrl: false, quick_reply: true }) as OB11MessageImage | undefined;
        url = tempData?.data.url ?? '';
      }
      if (mixElement?.videoElement && rawMessage) {
        const tempData =
          await this.obContext.apis.MsgApi.rawToOb11Converters.videoElement?.(mixElement?.videoElement, rawMessage, mixElement, { parseMultMsg: false, disableGetUrl: false, quick_reply: true }) as OB11MessageVideo | undefined;
        url = tempData?.data.url ?? '';
      }
      const res: GetFileResponse = {
        file: downloadPath,
        url: url !== '' ? url : downloadPath,
        file_size: fileSize,
        file_name: fileName,
      };

      if (this.obContext.configLoader.configData.enableLocalFile2Url && downloadPath) {
        try {
          res.base64 = await fs.readFile(downloadPath, 'base64');
        } catch (e) {
          throw new Error('文件下载失败. ' + e);
        }
      }
      return res;
    }

    // 群文件模式
    const contextModelIdFile = FileNapCatOneBotUUID.decodeModelId(payload.file);
    if (contextModelIdFile && contextModelIdFile.modelId) {
      const { peer, modelId } = contextModelIdFile;
      const downloadPath = await this.core.apis.FileApi.downloadFileForModelId(peer, modelId, '');
      const res: GetFileResponse = {
        file: downloadPath,
        url: downloadPath,
        file_size: '',
        file_name: '',
      };

      if (this.obContext.configLoader.configData.enableLocalFile2Url && downloadPath) {
        try {
          res.base64 = await fs.readFile(downloadPath, 'base64');
        } catch (e) {
          throw new Error('文件下载失败. ' + e);
        }
      }
      return res;
    }

    // 搜索名字模式
    const searchResult = (await this.core.apis.FileApi.searchForFile([payload.file]));
    if (searchResult) {
      const downloadPath = await this.core.apis.FileApi.downloadFileById(searchResult.id, parseInt(searchResult.fileSize));
      const res: GetFileResponse = {
        file: downloadPath,
        url: downloadPath,
        file_size: searchResult.fileSize.toString(),
        file_name: searchResult.fileName,
      };
      if (this.obContext.configLoader.configData.enableLocalFile2Url && downloadPath) {
        try {
          res.base64 = await fs.readFile(downloadPath, 'base64');
        } catch (e) {
          throw new Error('文件下载失败. ' + e);
        }
      }
      return res;
    }

    throw new Error('file not found');
  }
}

export default class GetFile extends GetFileBase {
  override actionName = ActionName.GetFile;
}

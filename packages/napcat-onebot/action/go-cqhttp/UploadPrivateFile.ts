import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ChatType, Peer, SendFileElement, ElementType } from 'napcat-core/types';
import fs from 'fs';
import { uriToLocalFile } from 'napcat-common/src/file';
import { SendMessageContext } from '@/napcat-onebot/api';
import { ContextMode, createContext } from '@/napcat-onebot/action/msg/SendMsg';
import { Static, Type } from '@sinclair/typebox';

export const GoCQHTTPUploadPrivateFilePayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户 QQ' }),
  file: Type.String({ description: '本地文件路径' }),
  name: Type.String({ description: '文件名' }),
  upload_file: Type.Boolean({ default: true, description: '是否执行上传' }),
});

export type GoCQHTTPUploadPrivateFilePayload = Static<typeof GoCQHTTPUploadPrivateFilePayloadSchema>;

export const GoCQHTTPUploadPrivateFileReturnSchema = Type.Object({
  file_id: Type.Union([Type.String(), Type.Null()], { description: '文件 ID' }),
});

export type GoCQHTTPUploadPrivateFileResponse = Static<typeof GoCQHTTPUploadPrivateFileReturnSchema>;

export default class GoCQHTTPUploadPrivateFile extends OneBotAction<GoCQHTTPUploadPrivateFilePayload, GoCQHTTPUploadPrivateFileResponse> {
  override actionName = ActionName.GOCQHTTP_UploadPrivateFile;
  override payloadSchema = GoCQHTTPUploadPrivateFilePayloadSchema;
  override returnSchema = GoCQHTTPUploadPrivateFileReturnSchema;

  async getPeer (payload: GoCQHTTPUploadPrivateFilePayload): Promise<Peer> {
    if (payload.user_id) {
      const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
      if (!peerUid) {
        throw new Error(`私聊${payload.user_id}不存在`);
      }
      const isBuddy = await this.core.apis.FriendApi.isBuddy(peerUid);
      return { chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid };
    }
    throw new Error('缺少参数 user_id');
  }

  async _handle (payload: GoCQHTTPUploadPrivateFilePayload): Promise<GoCQHTTPUploadPrivateFileResponse> {
    let file = payload.file;
    if (fs.existsSync(file)) {
      file = `file://${file}`;
    }
    const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, file);
    if (!downloadResult.success) {
      throw new Error(downloadResult.errMsg);
    }

    const msgContext: SendMessageContext = {
      peer: await createContext(this.core, {
        user_id: payload.user_id.toString(),
      }, ContextMode.Private),
      deleteAfterSentFiles: [],
    };
    const sendFileEle: SendFileElement = await this.obContext.apis.FileApi.createValidSendFileElement(msgContext, downloadResult.path, payload.name, '', payload.upload_file);
    msgContext.deleteAfterSentFiles.push(downloadResult.path);
    const returnMsg = await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(await this.getPeer(payload), [sendFileEle], msgContext.deleteAfterSentFiles);

    const fileElement = returnMsg.elements.find(ele => ele.elementType === ElementType.FILE);
    return {
      file_id: fileElement?.fileElement?.fileUuid || null,
    };
  }
}

import BaseAction from '../BaseAction';
import fs from 'fs/promises';
import { FileNapCatOneBotUUID } from '@/common/helper';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { OB11MessageImage, OB11MessageVideo } from '@/onebot/types';

export interface GetFilePayload {
    file: string; // 文件名或者fileUuid
}

export interface GetFileResponse {
    file?: string;  // path
    url?: string;
    file_size?: string;
    file_name?: string;
    base64?: string;
}

const GetFileBase_PayloadSchema = {
    type: 'object',
    properties: {
        file: { type: 'string' },
    },
    required: ['file'],
} as const satisfies JSONSchema;

export class GetFileBase extends BaseAction<GetFilePayload, GetFileResponse> {
    payloadSchema: any = GetFileBase_PayloadSchema;

    async _handle(payload: GetFilePayload): Promise<GetFileResponse> {
        //接收消息标记模式
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file);
        if (contextMsgFile) {
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
                    await this.obContext.apis.MsgApi.rawToOb11Converters.picElement?.(mixElement?.picElement, rawMessage, mixElement) as OB11MessageImage | undefined;
                url = tempData?.data.url ?? '';
            }
            if (mixElement?.videoElement && rawMessage) {
                const tempData =
                    await this.obContext.apis.MsgApi.rawToOb11Converters.videoElement?.(mixElement?.videoElement, rawMessage, mixElement) as OB11MessageVideo | undefined;
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

        //群文件模式
        const contextModelIdFile = FileNapCatOneBotUUID.decodeModelId(payload.file);
        if (contextModelIdFile) {
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

        //搜索名字模式
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

const GetFile_PayloadSchema = {
    type: 'object',
    properties: {
        file_id: { type: 'string' },
        file: { type: 'string' },
    },
    required: ['file_id'],
} as const satisfies JSONSchema;

type GetFile_Payload_Internal = FromSchema<typeof GetFile_PayloadSchema>;

interface GetFile_Payload extends GetFile_Payload_Internal {
    file: string;
}

export default class GetFile extends GetFileBase {
    actionName = ActionName.GetFile;
    payloadSchema = GetFile_PayloadSchema;

    async _handle(payload: GetFile_Payload): Promise<GetFileResponse> {
        payload.file = payload.file_id;
        return super._handle(payload);
    }
}

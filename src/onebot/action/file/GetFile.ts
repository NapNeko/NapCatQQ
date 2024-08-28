import BaseAction from '../BaseAction';
import fs from 'fs/promises';
import { FileNapCatOneBotUUID } from '@/common/helper';
import { ActionName } from '../types';
import { ChatType, Peer, RawMessage } from '@/core/entities';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
        const NTQQMsgApi = this.core.apis.MsgApi;
        const NTQQFileApi = this.core.apis.FileApi;

        const contextFile = FileNapCatOneBotUUID.decode(payload.file);

        //接收消息标记模式
        if (contextFile) {
            const { peer, msgId, elementId } = contextFile;

            const downloadPath = await NTQQFileApi.downloadMedia(msgId, peer.chatType, peer.peerUid, elementId, '', '');

            const mixElement = (await NTQQMsgApi.getMsgsByMsgId(peer, [msgId]))?.msgList
                .find(msg => msg.msgId === msgId)?.elements.find(e => e.elementId === elementId);
            const mixElementInner = mixElement?.videoElement ?? mixElement?.fileElement ?? mixElement?.pttElement ?? mixElement?.picElement ;
            if(!mixElementInner) throw new Error('element not found');

            const fileSize = mixElementInner.fileSize?.toString() || '';
            const fileName = mixElementInner.fileName || '';

            const res: GetFileResponse = {
                file: downloadPath,
                url: downloadPath,
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
        
        //搜索名字模式
        const NTSearchNameResult = (await NTQQFileApi.searchfile([payload.file])).resultItems;
        if (NTSearchNameResult.length !== 0) {
            const MsgId = NTSearchNameResult[0].msgId;
            let peer: Peer | undefined = undefined;
            if (NTSearchNameResult[0].chatType == ChatType.KCHATTYPEGROUP) {
                peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: NTSearchNameResult[0].groupChatInfo[0].groupCode };
            }
            if (!peer) throw new Error('chattype not support');
            const msgList: RawMessage[] = (await NTQQMsgApi.getMsgsByMsgId(peer, [MsgId]))?.msgList;
            if (!msgList || msgList.length == 0) {
                throw new Error('msg not found');
            }
            const msg = msgList[0];
            const file = msg.elements.filter(e => e.elementType == NTSearchNameResult[0].elemType);
            if (file.length == 0) {
                throw new Error('file not found');
            }
            const downloadPath = await NTQQFileApi.downloadMedia(msg.msgId, msg.chatType, msg.peerUid, file[0].elementId, '', '');
            const res: GetFileResponse = {
                file: downloadPath,
                url: downloadPath,
                file_size: NTSearchNameResult[0].fileSize.toString(),
                file_name: NTSearchNameResult[0].fileName,
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

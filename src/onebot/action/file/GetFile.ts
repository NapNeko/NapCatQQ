import BaseAction from '../BaseAction';
import fs from 'fs/promises';
import { UUIDConverter } from '@/common/helper';
import { ActionName } from '../types';
import { ChatType, ElementType, Peer, RawMessage } from '@/core/entities';
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
        const NTQQFriendApi = this.core.apis.FriendApi;
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQMsgApi = this.core.apis.MsgApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const NTQQFileApi = this.core.apis.FileApi;
        try {
            const uuidData = UUIDConverter.decode(payload.file);
            const peerUin = uuidData.high;
            const msgId = uuidData.low;
            const isGroup: boolean = !!(await NTQQGroupApi.getGroups(false)).find(e => e.groupCode == peerUin);
            let peer: Peer | undefined;
            //识别Peer
            if (isGroup) {
                peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: peerUin };
            }
            const PeerUid = await NTQQUserApi.getUidByUinV2(peerUin);
            if (PeerUid) {
                const isBuddy = await NTQQFriendApi.isBuddy(PeerUid);
                if (isBuddy) {
                    peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: PeerUid };
                } else {
                    peer = { chatType: ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid: PeerUid };
                }
            }
            if (!peer) {
                throw new Error('chattype not support');
            }
            const msgList = await NTQQMsgApi.getMsgsByMsgId(peer, [msgId]);
            if (msgList.msgList.length == 0) {
                throw new Error('msg not found');
            }
            const msg = msgList.msgList[0];
            const findEle = msg.elements.find(e => e.elementType == ElementType.VIDEO || e.elementType == ElementType.FILE || e.elementType == ElementType.PTT);
            if (!findEle) {
                throw new Error('element not found');
            }
            const downloadPath = await NTQQFileApi.downloadMedia(msgId, msg.chatType, msg.peerUid, findEle.elementId, '', '');
            const fileSize = findEle?.videoElement?.fileSize || findEle?.fileElement?.fileSize || findEle?.pttElement?.fileSize || '0';
            const fileName = findEle?.videoElement?.fileName || findEle?.fileElement?.fileName || findEle?.pttElement?.fileName || '';
            const res: GetFileResponse = {
                file: downloadPath,
                url: downloadPath,
                file_size: fileSize,
                file_name: fileName,
            };
            if (/* enableLocalFile2Url && */ downloadPath) {
                try {
                    res.base64 = await fs.readFile(downloadPath, 'base64');
                } catch (e) {
                    throw new Error('文件下载失败. ' + e);
                }
            }
            //不手动删除？文件持久化了
            return res;
        } catch {
            this.core.context.logger.logDebug('GetFileBase Mode - 1 Error');
        }

        const NTSearchNameResult = (await NTQQFileApi.searchfile([payload.file])).resultItems;
        if (NTSearchNameResult.length !== 0) {
            const MsgId = NTSearchNameResult[0].msgId;
            let peer: Peer | undefined = undefined;
            if (NTSearchNameResult[0].chatType == ChatType.KCHATTYPEGROUP) {
                peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: NTSearchNameResult[0].groupChatInfo[0].groupCode };
            }
            if (!peer) {
                throw new Error('chattype not support');
            }
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
            if (/* enableLocalFile2Url && */ downloadPath) {
                try {
                    res.base64 = await fs.readFile(downloadPath, 'base64');
                } catch (e) {
                    throw new Error('文件下载失败. ' + e);
                }
            }
            //不手动删除？文件持久化了
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

import BaseAction from '../BaseAction';
import fs from 'fs/promises';
import { UUIDConverter } from '@/common/utils/helper';
import { ActionName } from '../types';
import { ChatType, ElementType, FileElement, Peer, RawMessage, VideoElement } from '@/core/entities';
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
    PayloadSchema: any = GetFileBase_PayloadSchema;

    private getElement(msg: RawMessage): { id: string, element: VideoElement | FileElement } {
        let element = msg.elements.find(e => e.fileElement);
        if (!element) {
            element = msg.elements.find(e => e.videoElement);
            if (element) {
                return { id: element.elementId, element: element.videoElement };
            } else {
                throw new Error('找不到文件');
            }
        }
        return { id: element.elementId, element: element.fileElement };
    }

    async _handle(payload: GetFilePayload): Promise<GetFileResponse> {
        const NTQQFriendApi = this.CoreContext.getApiContext().FriendApi;
        const NTQQUserApi = this.CoreContext.getApiContext().UserApi;
        const NTQQMsgApi = this.CoreContext.getApiContext().MsgApi;
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        const NTQQFileApi = this.CoreContext.getApiContext().FileApi;
        let UuidData: {
            high: string;
            low: string;
        } | undefined;
        try {
            UuidData = UUIDConverter.decode(payload.file);
            if (UuidData) {
                const peerUin = UuidData.high;
                const msgId = UuidData.low;
                const isGroup: boolean = !!(await NTQQGroupApi.getGroups(false)).find(e => e.groupCode == peerUin);
                let peer: Peer | undefined;
                //识别Peer
                if (isGroup) {
                    peer = { chatType: ChatType.group, peerUid: peerUin };
                }
                const PeerUid = await NTQQUserApi.getUidByUin(peerUin);
                if (PeerUid) {
                    const isBuddy = await NTQQFriendApi.isBuddy(PeerUid);
                    if (isBuddy) {
                        peer = { chatType: ChatType.friend, peerUid: PeerUid };
                    } else {
                        peer = { chatType: ChatType.temp, peerUid: PeerUid };
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
                if (true/*enableLocalFile2Url*/) {
                    try {
                        res.base64 = await fs.readFile(downloadPath, 'base64');
                    } catch (e) {
                        throw new Error('文件下载失败. ' + e);
                    }
                }
                //不手动删除？文件持久化了
                return res;
            }
        } catch {

        }

        const NTSearchNameResult = (await NTQQFileApi.searchfile([payload.file])).resultItems;
        if (NTSearchNameResult.length !== 0) {
            const MsgId = NTSearchNameResult[0].msgId;
            let peer: Peer | undefined = undefined;
            if (NTSearchNameResult[0].chatType == ChatType.group) {
                peer = { chatType: ChatType.group, peerUid: NTSearchNameResult[0].groupChatInfo[0].groupCode };
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
            if (true/*enableLocalFile2Url*/) {
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
        // let cache = await dbUtil.getFileCacheByName(payload.file);
        // if (!cache) {
        //   cache = await dbUtil.getFileCacheByUuid(payload.file);
        // }
        // if (!cache) {
        //   throw new Error('file not found');
        // }
        // const { enableLocalFile2Url } = ob11Config;
        // try {
        //   await fs.access(cache.path, fs.constants.F_OK);
        // } catch (e) {
        //   logDebug('local file not found, start download...');
        //   // if (cache.url) {
        //   //   const downloadResult = await uri2local(cache.url);
        //   //   if (downloadResult.success) {
        //   //     cache.path = downloadResult.path;
        //   //     dbUtil.updateFileCache(cache).then();
        //   //   } else {
        //   //     throw new Error('file download failed. ' + downloadResult.errMsg);
        //   //   }
        //   // } else {
        //   //   // 没有url的可能是私聊文件或者群文件，需要自己下载
        //   //   log('需要调用 NTQQ 下载文件api');
        //   let peer = MessageUnique.getPeerByMsgId(cache.msgId);
        //   let msg = await NTQQMsgApi.getMsgsByMsgId(peer?.Peer!,cache.msgId);
        //   // log('文件 msg', msg);
        //   if (msg) {
        //     // 构建下载函数
        //     const downloadPath = await NTQQFileApi.downloadMedia(msg.msgId, msg.chatType, msg.peerUid,
        //       cache.elementId, '', '');
        //     // await sleep(1000);

        //     // log('download result', downloadPath);
        //     let peer = MessageUnique.getPeerByMsgId(cache.msgId);
        //     msg = await NTQQMsgApi.getMsgsByMsgId(peer?.Peer!,cache.msgId);
        //     // log('下载完成后的msg', msg);
        //     cache.path = downloadPath!;
        //     dbUtil.updateFileCache(cache).then();
        //     // log('下载完成后的msg', msg);
        //     // }
        //   }

        // }
        // // log('file found', cache);
        // const res: GetFileResponse = {
        //   file: cache.path,
        //   url: cache.url,
        //   file_size: cache.size.toString(),
        //   file_name: cache.name
        // };
        // if (enableLocalFile2Url) {
        //   if (!cache.url) {
        //     try {
        //       res.base64 = await fs.readFile(cache.path, 'base64');
        //     } catch (e) {
        //       throw new Error('文件下载失败. ' + e);
        //     }
        //   }
        // }
        //return res;
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
    PayloadSchema = GetFile_PayloadSchema;

    async _handle(payload: GetFile_Payload): Promise<GetFileResponse> {
        payload.file = payload.file_id;
        return super._handle(payload);
    }
}

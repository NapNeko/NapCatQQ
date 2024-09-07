import { NapCatLaanaAdapter } from '..';
import { NapCatCore } from '@/core';
import { LaanaActionHandler } from '../action';
import fs from 'fs';

export class LaanaMessageActionHandler {
    constructor(
        public core: NapCatCore,
        public laana: NapCatLaanaAdapter,
    ) {}

    impl: LaanaActionHandler = {
        sendMessage: async (params) => {
            const { elements, fileCacheRecords } = await this.laana.utils.msg.laanaMessageToRaw(params.message!, params);

            let cacheSize = 0;
            try {
                for (const cacheRecord of fileCacheRecords) {
                    cacheSize += fs.statSync(await this.laana.utils.file.toLocalPath(cacheRecord.cacheId)).size;
                }
            } catch (e) {
                this.core.context.logger.logWarn('文件缓存大小计算失败', e);
            }
            const estimatedSendMsgTimeout =
                cacheSize / 1024 / 256 * 1000 + // file upload time
                1000 * fileCacheRecords.length + // request timeout
                10000; // fallback timeout

            const sentMsgOrEmpty = await this.core.apis.MsgApi.sendMsg(
                await this.laana.utils.msg.laanaPeerToRaw(params.targetPeer!),
                elements,
                true, // TODO: add 'wait complete' (bool) field
                estimatedSendMsgTimeout,
            );

            fileCacheRecords.forEach(record => {
                if (record.originalType !== 'cacheId') {
                    this.laana.utils.file.destroyCache(record.cacheId);
                }
            });

            if (!sentMsgOrEmpty) {
                throw Error('消息发送失败');
            }
            return {
                msgId: this.laana.utils.msg.encodeMsgToLaanaMsgId(
                    sentMsgOrEmpty.msgId,
                    sentMsgOrEmpty.chatType,
                    sentMsgOrEmpty.peerUid,
                ),
            };
        },

        getMessage: async (params) => {
            const { msgId, chatType, peerUid } = this.laana.utils.msg.decodeLaanaMsgId(params.msgId);
            const msgListWrapper = await this.core.apis.MsgApi.getMsgsByMsgId(
                {
                    chatType,
                    peerUid,
                    guildId: '',
                },
                [msgId],
            );
            if (msgListWrapper.msgList.length === 0) {
                throw new Error('消息不存在');
            }
            const msg = msgListWrapper.msgList[0];
            return {
                message: await this.laana.utils.msg.rawMessageToLaana(msg),
            };
        },

        getForwardedMessages: async (params) => {
            const { rootMsgLaanaId, currentMsgId } = this.laana.utils.msg.decodeLaanaForwardMsgRefId(params.refId);
            const decodedRootMsgId = this.laana.utils.msg.decodeLaanaMsgId(rootMsgLaanaId);
            const rawForwardedMessages = await this.core.apis.MsgApi.getMultiMsg(
                {
                    chatType: decodedRootMsgId.chatType,
                    peerUid: decodedRootMsgId.peerUid,
                    guildId: '',
                },
                decodedRootMsgId.msgId,
                currentMsgId,
            );
            if (!rawForwardedMessages || rawForwardedMessages.result !== 0 || rawForwardedMessages.msgList.length === 0) {
                throw new Error('获取转发消息失败');
            }
            return {
                forwardMessage: {
                    refId: params.refId,
                    messages: await Promise.all(
                        rawForwardedMessages.msgList.map(async msg => {
                            return await this.laana.utils.msg.rawMessageToLaana(msg, rootMsgLaanaId);
                        }),
                    ),
                }
            };
        },

        getHistoryMessages: async (params) => { // TODO: add 'reverseOrder' field
            const { msgId } = this.laana.utils.msg.decodeLaanaMsgId(params.lastMsgId);
            const msgListWrapper = await this.core.apis.MsgApi.getMsgHistory(
                await this.laana.utils.msg.laanaPeerToRaw(params.targetPeer!),
                msgId,
                params.count,
            );
            if (msgListWrapper.msgList.length === 0) {
                this.core.context.logger.logWarn('获取历史消息失败', params.targetPeer!.uin);
            }
            return { // TODO: check order
                messages: await Promise.all(
                    msgListWrapper.msgList.map(async msg => {
                        return await this.laana.utils.msg.rawMessageToLaana(msg);
                    }),
                ),
            };
        },

        withdrawMessage: async (params) => {
            const { msgId, chatType, peerUid } = this.laana.utils.msg.decodeLaanaMsgId(params.msgId);
            try {
                await this.core.apis.MsgApi.recallMsg(
                    {
                        chatType,
                        peerUid,
                        guildId: '',
                    },
                    msgId,
                );
            } catch (e) {
                throw new Error(`消息撤回失败: ${e}`);
            }
            return {
                success: true,
            };
        },
    };
}

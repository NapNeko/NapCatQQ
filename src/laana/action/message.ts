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
            const msg = await this.core.apis.MsgApi.getMsgsByMsgId(
                {
                    chatType,
                    peerUid,
                    guildId: '',
                },
                [msgId],
            );

            if (msg.msgList.length === 0) {
                throw new Error('消息不存在');
            }

            return {
                message: await this.laana.utils.msg.rawMessageToLaana(msg.msgList[0]),
            };
        },
    };
}

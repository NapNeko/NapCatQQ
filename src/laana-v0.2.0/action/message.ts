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
            const { elements, fileCacheIds } = await this.laana.utils.msg.laanaMessageToRaw(params.message!, params);
            let cacheSize = 0;
            try {
                for (const cacheId of fileCacheIds) {
                    cacheSize += fs.statSync(await this.laana.utils.file.toLocalPath(cacheId)).size;
                }
            } catch (e) {
                this.core.context.logger.logWarn('文件缓存大小计算失败', e);
            }
            const estimatedSendMsgTimeout =
                cacheSize / 1024 / 256 * 1000 + // file upload time
                1000 * fileCacheIds.length + // request timeout
                10000; // fallback timeout
            const sentMsg = await this.core.apis.MsgApi.sendMsg(
                await this.laana.utils.msg.laanaPeerToRaw(params.targetPeer!),
                elements,
                true, // TODO: add 'wait complete' (bool) field
                estimatedSendMsgTimeout,
            );
            if (!sentMsg) {
                throw Error('消息发送失败');
            }
            return {
                msgId: sentMsg.msgId
            };
        }
    };
}

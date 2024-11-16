import { IOB11NetworkAdapter, OB11EmitEventContent } from '@/onebot/network/index';
import { createHmac } from 'crypto';
import { LogWrapper } from '@/common/log';
import { QuickAction, QuickActionEvent } from '../types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '..';
import { RequestUtil } from '@/common/request';
import { HttpClientConfig } from '../config/config';
import { ActionMap } from '../action';

export class OB11ActiveHttpAdapter implements IOB11NetworkAdapter {
    logger: LogWrapper;
    isEnable: boolean = false;
    config: HttpClientConfig;
    constructor(
        public name: string,
        config: HttpClientConfig,
        public core: NapCatCore,
        public obContext: NapCatOneBot11Adapter,
        public actions: ActionMap,
    ) {
        this.logger = core.context.logger;
        this.config = structuredClone(config);
    }
    

    onEvent<T extends OB11EmitEventContent>(event: T) {
        if (!this.isEnable) {
            return;
        }
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-self-id': this.core.selfInfo.uin,
        };
        const msgStr = JSON.stringify(event);
        if (this.config.token && this.config.token.length > 0) {
            const hmac = createHmac('sha1', this.config.token);
            hmac.update(msgStr);
            const sig = hmac.digest('hex');
            headers['x-signature'] = 'sha1=' + sig;
        }
        RequestUtil.HttpGetText(this.config.url, 'POST', msgStr, headers).then(async (res) => {
            let resJson: QuickAction;
            try {
                resJson = JSON.parse(res);
                //logDebug('新消息事件HTTP上报返回快速操作: ', JSON.stringify(resJson));
            } catch (e) {
                this.logger.logDebug('[OneBot] [Http Client] 新消息事件HTTP上报没有返回快速操作，不需要处理');
                return;
            }
            try {
                this.obContext.apis.QuickActionApi
                    .handleQuickOperation(event as QuickActionEvent, resJson)
                    .catch(this.logger.logError.bind(this.logger));
            } catch (e: any) {
                this.logger.logError.bind(this.logger)('[OneBot] [Http Client] 新消息事件HTTP上报返回快速操作失败', e);
            }
        }).catch((e) => {
            this.logger.logError.bind(this.logger)('[OneBot] [Http Client] 新消息事件HTTP上报失败', e);
        });
    }

    open() {
        this.isEnable = true;
    }

    close() {
        this.isEnable = false;
    }
    async reload(config: HttpClientConfig){
        this.config = structuredClone(config);
    }
}

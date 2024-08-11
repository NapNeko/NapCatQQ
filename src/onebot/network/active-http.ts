import { IOB11NetworkAdapter, OB11EmitEventContent } from '@/onebot/network/index';
import BaseAction from '@/onebot/action/BaseAction';
import { createHmac } from 'crypto';
import { LogWrapper } from '@/common/utils/log';
import { QuickAction, QuickActionEvent } from '../types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '../main';
import { handleQuickOperation } from '../helper/quick';

export class OB11ActiveHttpAdapter implements IOB11NetworkAdapter {
    url: string;
    heartbeatInterval: number;
    secret: string | undefined;
    coreContext: NapCatCore;
    obContext: NapCatOneBot11Adapter;
    logger: LogWrapper;

    constructor(url: string, heartbeatInterval: number, secret: string | undefined, coreContext: NapCatCore, onebotContext: NapCatOneBot11Adapter) {
        this.heartbeatInterval = heartbeatInterval;
        this.url = url;
        this.secret = secret;
        this.coreContext = coreContext;
        this.obContext = onebotContext;
        this.logger = coreContext.context.logger;
    }

    registerActionMap(actionMap: Map<string, BaseAction<any, any>>) {
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        // Passive http adapter does not need to register actions
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-self-id': this.coreContext.selfInfo.uin,
        };
        const msgStr = JSON.stringify(event);
        if (this.secret && this.secret.length > 0) {
            const hmac = createHmac('sha1', this.secret);
            hmac.update(msgStr);
            const sig = hmac.digest('hex');
            headers['x-signature'] = 'sha1=' + sig;
        }
        fetch(this.url, {
            method: 'POST',
            headers,
            body: msgStr,
        }).then(async (res) => {
            let resJson: QuickAction;
            try {
                resJson = await res.json();
                //logDebug('新消息事件HTTP上报返回快速操作: ', JSON.stringify(resJson));
            } catch (e) {
                this.logger.logDebug('新消息事件HTTP上报没有返回快速操作，不需要处理');
                return;
            }
            try {
                handleQuickOperation(this.coreContext, event as QuickActionEvent, resJson).then().catch(this.logger.logError);
            } catch (e: any) {
                this.logger.logError('新消息事件HTTP上报返回快速操作失败', e);
            }
        });
    }

    async open() {
        // HTTP adapter does not need to establish a persistent connection
        //console.log('HTTP adapter is ready to send events.');
    }

    close() {
        // HTTP adapter does not need to close a persistent connection
        // console.log('HTTP adapter does not maintain a persistent connection.');
    }
}

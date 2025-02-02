import { OB11EmitEventContent, OB11NetworkReloadType } from '@/onebot/network/index';
import { createHmac } from 'crypto';
import { QuickAction, QuickActionEvent } from '@/onebot/types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '..';
import { RequestUtil } from '@/common/request';
import { HttpClientConfig } from '@/onebot/config/config';
import { ActionMap } from '@/onebot/action';
import { IOB11NetworkAdapter } from '@/onebot/network/adapter';
import json5 from 'json5';

export class OB11HttpClientAdapter extends IOB11NetworkAdapter<HttpClientConfig> {
    constructor(
        name: string, config: HttpClientConfig, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap
    ) {
        super(name, config, core, obContext, actions);
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        this.emitEventAsync(event).catch(e => this.logger.logError('[OneBot] [Http Client] 新消息事件HTTP上报返回快速操作失败', e));
    }

    async emitEventAsync<T extends OB11EmitEventContent>(event: T) {
        if (!this.isEnable) return;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-self-id': this.core.selfInfo.uin,
        };

        const msgStr = JSON.stringify(event);
        if (this.config.token) {
            const hmac = createHmac('sha1', this.config.token);
            hmac.update(msgStr);
            headers['x-signature'] = 'sha1=' + hmac.digest('hex');
        }

        const data = await RequestUtil.HttpGetText(this.config.url, 'POST', msgStr, headers);
        const resJson: QuickAction = data ? json5.parse(data) : {};

        await this.obContext.apis.QuickActionApi.handleQuickOperation(event as QuickActionEvent, resJson);
    }

    open() {
        this.isEnable = true;
    }

    close() {
        this.isEnable = false;
    }

    async reload(newConfig: HttpClientConfig) {
        const wasEnabled = this.isEnable;
        const oldUrl = this.config.url;
        this.config = newConfig;

        if (newConfig.enable && !wasEnabled) {
            this.open();
            return OB11NetworkReloadType.NetWorkOpen;
        } else if (!newConfig.enable && wasEnabled) {
            this.close();
            return OB11NetworkReloadType.NetWorkClose;
        }

        if (oldUrl !== newConfig.url) {
            return OB11NetworkReloadType.NetWorkReload;
        }

        return OB11NetworkReloadType.Normal;
    }
}

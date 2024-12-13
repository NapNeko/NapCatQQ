import { IOB11NetworkAdapter, OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { NapCatOneBot11Adapter, OB11Message } from '@/onebot';
import { NapCatCore } from '@/core';
import { AdapterConfig } from '../config/config';
import { plugin_onmessage } from '@/plugin';
import { ActionMap } from '../action';

export class OB11PluginAdapter implements IOB11NetworkAdapter {
    isEnable: boolean = true;
    public config: AdapterConfig;

    constructor(
        public name: string,
        public core: NapCatCore,
        public obCore: NapCatOneBot11Adapter,
        public actions: ActionMap,
    ) {
        // 基础配置
        this.config = {
            name: name,
            messagePostFormat: 'array',
            reportSelfMessage: false,
            enable: true,
            debug: false,
        }
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        if (event.post_type === 'message') {
             plugin_onmessage(this.config.name, this.core, this.obCore, event as OB11Message,this.actions).then().catch();
        }
    }

    open() {

    }

    async close() {

    }

    async reload() {
        return OB11NetworkReloadType.Normal;
    }
}

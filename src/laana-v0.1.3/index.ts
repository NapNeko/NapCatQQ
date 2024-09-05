import { InstanceContext, NapCatCore } from '@/core';
import { NapCatPathWrapper } from '@/common/path';
import { LaanaFileUtils } from '@/laana-v0.1.3/utils/file';
import { LaanaMessageUtils } from '@/laana-v0.1.3/utils/message';
import { LaanaActionHandler } from '@/laana-v0.1.3/action';
import { LaanaMessageActionHandler } from '@/laana-v0.1.3/action/message';
import { LaanaConfigLoader } from '@/laana-v0.1.3/config';
import { LaanaNetworkManager } from '@/laana-v0.1.3/network';
import { LaanaWsServerAdapter } from '@/laana-v0.1.3/network/ws-server';

export class NapCatLaanaAdapter {
    utils = {
        msg: new LaanaMessageUtils(this.core, this),
        file: new LaanaFileUtils(this.core, this),
    };
    actions: LaanaActionHandler;
    configLoader: LaanaConfigLoader;
    networkManager: LaanaNetworkManager;

    constructor(
        public core: NapCatCore,
        public context: InstanceContext,
        public pathWrapper: NapCatPathWrapper,
    ) {
        this.actions = {
            ...new LaanaMessageActionHandler(this.core, this).impl,
        };
        this.configLoader = new LaanaConfigLoader(this.core, this.pathWrapper.configPath);

        this.networkManager = new LaanaNetworkManager();
        if (this.configLoader.configData.network.ws.enabled) {
            this.networkManager.registerAdapterAndOpen(
                new LaanaWsServerAdapter(
                    this.configLoader.configData.network.ws.ip,
                    this.configLoader.configData.network.ws.port,
                    this.configLoader.configData.network.ws.heartbeat.enabled,
                    this.configLoader.configData.network.ws.heartbeat.interval,
                    this.configLoader.configData.network.ws.token,
                    this.core,
                    this,
                ),
            );
        }
    }
}

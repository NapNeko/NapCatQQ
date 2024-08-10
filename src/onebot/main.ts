import { InstanceContext, MsgListener, NapCatCore } from '@/core';
import { OB11Config } from './helper/config';
import { NapCatPathWrapper } from '@/common/framework/napcat';
import { OneBotApiContextType } from './types/adapter';
import { OneBotFriendApi, OneBotGroupApi, OneBotUserApi } from './api';
import { OB11NetworkManager } from '@/onebot/network';
import { OB11InputStatusEvent } from '@/onebot/event/notice/OB11InputStatusEvent';

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    config: OB11Config;
    apiContext: OneBotApiContextType;
    networkManager: OB11NetworkManager;

    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.config = new OB11Config(core, pathWrapper.configPath);
        this.apiContext = {
            GroupApi: new OneBotGroupApi(this, core),
            UserApi: new OneBotUserApi(this, core),
            FriendApi: new OneBotFriendApi(this, core),
        };
        this.networkManager = new OB11NetworkManager();
    }

    private initMsgListener() {
        const msgListener = new MsgListener();

        msgListener.onInputStatusPush = async data => {
            const uin = await this.core.ApiContext.UserApi.getUinByUidV2(data.fromUin);
            this.context.logger.log(`[Notice] [输入状态] ${uin} ${data.statusText}`);
            // this.networkManager.emitEvent(new OB11InputStatusEvent(
            //     parseInt(uin),
            //     data.eventType,
            //     data.statusText
            // ));
        };
    }
}

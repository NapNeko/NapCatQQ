import { NapCatCore, InstanceContext } from "@/core";
import { OB11Config } from "./helper/config";
import { NapCatPathWrapper } from "@/common/framework/napcat";
import { OneBotApiContextType } from "./types/adapter";
import { OneBotFriendApi, OneBotGroupApi, OneBotUserApi } from "./api";

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;
    config: OB11Config;
    apiContext: OneBotApiContextType;
    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.config = new OB11Config(core, pathWrapper.configPath);
        this.apiContext = {
            GroupApi: new OneBotGroupApi(this, core),
            UserApi: new OneBotUserApi(this, core),
            FriendApi: new OneBotFriendApi(this, core)
        };
    }
}

import { NapCatCore, InstanceContext } from "@/core";
import { OB11Config } from "./helper/config";
import { NapCatPathWrapper } from "@/common/framework/napcat";

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;
    config: OB11Config;

    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.config = new OB11Config(core, pathWrapper.configPath);
    }
}

import { NapCatCore, InstanceContext } from "@/core";


//OneBot实现类

export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    constructor(core: NapCatCore, context: InstanceContext) {
        this.core = core;
        this.context = context;
    }
}

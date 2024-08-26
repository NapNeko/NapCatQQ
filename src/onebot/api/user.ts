import { NapCatCore } from '@/core';

import { NapCatOneBot11Adapter } from '@/onebot';

export class OneBotUserApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }
}

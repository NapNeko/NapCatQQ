import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '../main';

export class OneBotUserApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
}

import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '../main';

export class OneBotFriendApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;
    friendList: Map<string, any> = new Map();//此处作为缓存 uin->info
    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
}

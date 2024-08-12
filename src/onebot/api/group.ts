import { NapCatCore } from '@/core';

import { NapCatOneBot11Adapter } from '@/onebot';

export class OneBotGroupApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;
    GroupMemberList: Map<string, any> = new Map();//此处作为缓存 group_id->memberUin->info
    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
}

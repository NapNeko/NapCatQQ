import { GrayTipElement, NapCatCore } from '@/core';

import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11FriendPokeEvent } from '../event/notice/OB11PokeEvent';

export class OneBotFriendApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    friendList: Map<string, any> = new Map();//此处作为缓存 uin->info
    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    //使用前预先判断 busiId 1061
    async parsePrivatePokeEvent(grayTipElement: GrayTipElement) {
        const json = JSON.parse(grayTipElement.jsonGrayTipElement.jsonStr);
        let pokedetail: any[] = json.items;
        //筛选item带有uid的元素
        pokedetail = pokedetail.filter(item => item.uid);
        //console.log("[NapCat] 群拍一拍 群:", pokedetail, parseInt(msg.peerUid), " ", await NTQQUserApi.getUinByUid(pokedetail[0].uid), "拍了拍", await NTQQUserApi.getUinByUid(pokedetail[1].uid));
        if (pokedetail.length == 2) {
            return new OB11FriendPokeEvent(
                this.core,
                parseInt((await this.core.apis.UserApi.getUinByUidV2(pokedetail[0].uid))!),
                parseInt((await this.core.apis.UserApi.getUinByUidV2(pokedetail[1].uid))!),
                pokedetail,
            );
        }
        return undefined;
    }
}

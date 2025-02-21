import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11ProfileLikeEvent } from '@/onebot/event/notice/OB11ProfileLikeEvent';
import { decodeProfileLikeTip } from '@/core/helper/adaptDecoder';

export class OneBotUserApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    async parseLikeEvent(wrappedBody: Uint8Array): Promise<OB11ProfileLikeEvent | undefined> {
        const likeTip = decodeProfileLikeTip(wrappedBody);
        if (likeTip?.msgType !== 0 || likeTip?.subType !== 203) return;
        this.core.context.logger.logDebug('收到点赞通知消息');
        const likeMsg = likeTip.content.msg;
        if (!likeMsg) return;
        const detail = likeMsg.detail;
        if (!detail) return;
        const times = detail.txt.match(/\d+/) ?? '0';
        return new OB11ProfileLikeEvent(
            this.core,
            Number(detail.uin),
            detail.nickname,
            parseInt(times[0], 10),
            likeMsg.time,
        );
    }
}

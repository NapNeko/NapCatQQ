import { GeneralCallResult, InstanceContext, NapCatCore } from '@/core';

export class NTQQSystemApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async hasOtherRunningQQProcess() {
        return this.core.util.hasOtherRunningQQProcess();
    }

    async ORCImage(filePath: string) {
        return this.context.session.getNodeMiscService().wantWinScreenOCR(filePath);
    }

    async translateEnWordToZn(words: string[]) {
        return this.context.session.getRichMediaService().translateEnWordToZn(words);
    }

    //调用会超时 没灯用 (好像是通知listener的) onLineDev
    async getOnlineDev() {
        return this.context.session.getMsgService().getOnLineDev();
    }

    //1-2-162b9b42-65b9-4405-a8ed-2e256ec8aa50
    async getArkJsonCollection(cid: string) {
        const ret = await this.core.eventWrapper.callNoListenerEvent<(cid: string) => Promise<GeneralCallResult & {
            arkJson: string
        }>>(
            'NodeIKernelCollectionService/collectionArkShare',
            5000,
            '1717662698058',
            );
        return ret;
    }

    async BootMiniApp(appfile: string, params: string) {
        await this.context.session.getNodeMiscService().setMiniAppVersion('2.16.4');
        const c = await this.context.session.getNodeMiscService().getMiniAppPath();

        return this.context.session.getNodeMiscService().startNewMiniApp(appfile, params);
    }
}

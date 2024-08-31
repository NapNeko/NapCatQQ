import { InstanceContext, NapCatCore } from '@/core';

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

    async ocrImage(filePath: string) {
        return this.context.session.getNodeMiscService().wantWinScreenOCR(filePath);
    }

    async translateEnWordToZn(words: string[]) {
        return this.context.session.getRichMediaService().translateEnWordToZn(words);
    }

    async getOnlineDev() {
        return this.context.session.getMsgService().getOnLineDev();
    }

    async getArkJsonCollection(cid: string) {
        return await this.core.eventWrapper.callNoListenerEvent('NodeIKernelCollectionService/collectionArkShare', '1717662698058');
    }

    async bootMiniApp(appFile: string, params: string) {
        await this.context.session.getNodeMiscService().setMiniAppVersion('2.16.4');
        return this.context.session.getNodeMiscService().startNewMiniApp(appFile, params);
    }
}

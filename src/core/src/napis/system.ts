import { GeneralCallResult } from '@/core';
import { ApiContext } from '../session';
export class NTQQSystemApi {
    private context: ApiContext;
    constructor(context: ApiContext) {
        this.context = context;
    }
    async hasOtherRunningQQProcess() {
        return this.context.util.hasOtherRunningQQProcess();
    }
    async ORCImage(filePath: string) {
        return this.context.core.session.getNodeMiscService().wantWinScreenOCR(filePath);
    }
    async translateEnWordToZn(words: string[]) {
        return this.context.core.session.getRichMediaService().translateEnWordToZn(words);
    }
    //调用会超时 没灯用 (好像是通知listener的) onLineDev
    async getOnlineDev() {
        return this.context.core.session.getMsgService().getOnLineDev();
    }
    //1-2-162b9b42-65b9-4405-a8ed-2e256ec8aa50
    async getArkJsonCollection(cid: string) {
        let ret = await this.context.event.CallNoListenerEvent
            <(cid: string) => Promise<GeneralCallResult & { arkJson: string }>>(
                'NodeIKernelCollectionService/collectionArkShare',
                5000,
                '1717662698058'
            );
        return ret;
    }
    async BootMiniApp(appfile: string, params: string) {
        await this.context.core.session.getNodeMiscService().setMiniAppVersion('2.16.4');
        let c = await this.context.core.session.getNodeMiscService().getMiniAppPath();

        return this.context.core.session.getNodeMiscService().startNewMiniApp(appfile, params);
    }
}
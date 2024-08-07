

import { NTEventDispatch } from '@/common/utils/EventTask';
import { GeneralCallResult, NTQQFileApi, NTQQUserApi, napCatCore } from '@/core';
export class NTQQSystemApi {
    static async hasOtherRunningQQProcess() {
        return napCatCore.util.hasOtherRunningQQProcess();
    }
    static async ORCImage(filePath: string) {
        return napCatCore.session.getNodeMiscService().wantWinScreenOCR(filePath);
    }
    static async translateEnWordToZn(words: string[]) {
        return napCatCore.session.getRichMediaService().translateEnWordToZn(words);
    }
    //调用会超时 没灯用 (好像是通知listener的) onLineDev
    static async getOnlineDev() {
        return napCatCore.session.getMsgService().getOnLineDev();
    }
    //1-2-162b9b42-65b9-4405-a8ed-2e256ec8aa50
    static async getArkJsonCollection(cid: string) {
        let ret = await NTEventDispatch.CallNoListenerEvent
            <(cid: string) => Promise<GeneralCallResult & { arkJson: string }>>(
                'NodeIKernelCollectionService/collectionArkShare',
                5000,
                '1717662698058'
            );
        return ret;
    }
    static async BootMiniApp(appfile: string, params: string) {
        await napCatCore.session.getNodeMiscService().setMiniAppVersion('2.16.4');
        let c = await napCatCore.session.getNodeMiscService().getMiniAppPath();

        return napCatCore.session.getNodeMiscService().startNewMiniApp(appfile, params);
    }
}
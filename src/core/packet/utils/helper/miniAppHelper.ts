import {
    MiniAppData,
    MiniAppReqParams,
    MiniAppRawData,
    MiniAppReqCustomParams,
    MiniAppReqTemplateParams
} from '@/core/packet/entities/miniApp';

type MiniAppTemplateNameList = 'bili' | 'weibo';

export abstract class MiniAppInfo {
    static readonly sdkId: string = 'V1_PC_MINISDK_99.99.99_1_APP_A';
    template: MiniAppReqTemplateParams;

    private static readonly appMap = new Map<MiniAppTemplateNameList, MiniAppInfo>();

    protected constructor(template: MiniAppReqTemplateParams) {
        this.template = template;
    }

    static get(name: MiniAppTemplateNameList): MiniAppInfo | undefined {
        return this.appMap.get(name);
    }

    static readonly Bili = new class extends MiniAppInfo {
        constructor() {
            super({
                sdkId: MiniAppInfo.sdkId,
                appId: '1109937557',
                scene: 1,
                templateType: 1,
                businessType: 0,
                verType: 3,
                shareType: 0,
                versionId: 'cfc5f7b05b44b5956502edaecf9d2240',
                withShareTicket: 0,
                iconUrl: 'https://miniapp.gtimg.cn/public/appicon/51f90239b78a2e4994c11215f4c4ba15_200.jpg'
            });
            MiniAppInfo.appMap.set('bili', this);
        }
    };

    static readonly WeiBo = new class extends MiniAppInfo {
        constructor() {
            super({
                sdkId: MiniAppInfo.sdkId,
                appId: '1109224783',
                scene: 1,
                templateType: 1,
                businessType: 0,
                verType: 3,
                shareType: 0,
                versionId: 'e482a3cc4e574d9b772e96ba6eec9ba2',
                withShareTicket: 0,
                iconUrl: 'https://miniapp.gtimg.cn/public/appicon/35bbb44dc68e65194cfacfb206b8f1f7_200.jpg'
            });
            MiniAppInfo.appMap.set('weibo', this);
        }
    };
}

export class MiniAppInfoHelper {
    static generateReq(custom: MiniAppReqCustomParams, template: MiniAppReqTemplateParams): MiniAppReqParams {
        return {
            ...custom,
            ...template
        };
    }

    static RawToSend(rawData: MiniAppRawData): MiniAppData {
        return {
            ver: rawData.ver,
            prompt: rawData.prompt,
            config: rawData.config,
            app: rawData.appName,
            view: rawData.appView,
            meta: rawData.metaData,
            miniappShareOrigin: 3,
            miniappOpenRefer: '10002',
        };
    }

    static SendToRaw(data: MiniAppData): MiniAppRawData {
        return {
            appName: data.app,
            appView: data.view,
            ver: data.ver,
            desc: data.meta.detail_1.desc,
            prompt: data.prompt,
            metaData: data.meta,
            config: data.config,
        };
    }
}

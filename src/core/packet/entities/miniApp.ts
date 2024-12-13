export interface MiniAppReqCustomParams {
    title: string;
    desc: string;
    picUrl: string;
    jumpUrl: string;
    webUrl?: string;
}

export interface MiniAppReqTemplateParams {
    sdkId: string;
    appId: string;
    scene: number;
    iconUrl: string;
    templateType: number;
    businessType: number;
    verType: number;
    shareType: number;
    versionId: string;
    withShareTicket: number;
}

export interface MiniAppReqParams extends MiniAppReqCustomParams, MiniAppReqTemplateParams {}

export interface MiniAppData {
    ver: string;
    prompt: string;
    config: Config;
    app: string;
    view: string;
    meta: MetaData;
    miniappShareOrigin: number;
    miniappOpenRefer: string;
}

export interface MiniAppRawData {
    appName: string;
    appView: string;
    ver: string;
    desc: string;
    prompt: string;
    metaData: MetaData;
    config: Config;
}

interface Config {
    type: string;
    width: number;
    height: number;
    forward: number;
    autoSize: number;
    ctime: number;
    token: string;
}

interface Host {
    uin: number;
    nick: string;
}

interface Detail {
    appid: string;
    appType: number;
    title: string;
    desc: string;
    icon: string;
    preview: string;
    url: string;
    scene: number;
    host: Host;
    shareTemplateId: string;
    shareTemplateData: Record<string, unknown>;
    showLittleTail: string;
    gamePoints: string;
    gamePointsUrl: string;
    shareOrigin: number;
}

interface MetaData {
    detail_1: Detail;
}

export interface WrapperSessionInitConfig {
    selfUin: string;
    selfUid: string;
    desktopPathConfig: {
        account_path: string;
    };
    clientVer: string;
    a2: '';
    d2: '';
    d2Key: '';
    machineId: '';
    platform: 3;
    platVer: string;
    appid: string;
    rdeliveryConfig: {
        appKey: '';
        systemId: 0;
        appId: '';
        logicEnvironment: '';
        platform: 3;
        language: '';
        sdkVersion: '';
        userId: '';
        appVersion: '';
        osVersion: '';
        bundleId: '';
        serverUrl: '';
        fixedAfterHitKeys: [''];
    };
    'defaultFileDownloadPath': string;
    'deviceInfo': {
        'guid': string;
        'buildVer': string;
        'localId': 2052;
        'devName': string;
        'devType': string;
        'vendorName': '';
        'osVer': string;
        'vendorOsName': string;
        'setMute': false;
        'vendorType': 0;
    };
    'deviceConfig': '{"appearance":{"isSplitViewMode":true},"msg":{}}';
}
export declare let sessionConfig: WrapperSessionInitConfig | null;
export declare function genSessionConfig(selfUin: string, selfUid: string, account_path: string): WrapperSessionInitConfig;

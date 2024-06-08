export declare enum PlatformType {
    KUNKNOWN = 0,
    KANDROID = 1,
    KIOS = 2,
    KWINDOWS = 3,
    KMAC = 4
}
export declare enum DeviceType {
    KUNKNOWN = 0,
    KPHONE = 1,
    KPAD = 2,
    KCOMPUTER = 3
}
export declare enum VendorType {
    KNOSETONIOS = 0,
    KSUPPORTGOOGLEPUSH = 99,
    KSUPPORTHMS = 3,
    KSUPPORTOPPOPUSH = 4,
    KSUPPORTTPNS = 2,
    KSUPPORTVIVOPUSH = 5,
    KUNSUPPORTANDROIDPUSH = 1
}
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
export declare const sessionConfig: WrapperSessionInitConfig | any;
export declare function genSessionConfig(selfUin: string, selfUid: string, account_path: string): Promise<WrapperSessionInitConfig>;

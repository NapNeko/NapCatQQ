//QQVersionType
export type QQPackageInfoType = {
    version: string;
    buildVersion: string;
    platform: string;
    eleArch: string;
}
export type QQVersionConfigType = {
    baseVersion: string;
    curVersion: string;
    prevVersion: string;
    onErrorVersions: Array<unknown>;
    buildId: string;
}
export type QQAppidTableType = {
    [key: string]: { appid: string, qua: string };
}

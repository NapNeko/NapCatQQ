interface IGlobalAdapter {
    onLog(...args: unknown[]): void;
    onGetSrvCalTime(...args: unknown[]): void;
    onShowErrUITips(...args: unknown[]): void;
    fixPicImgType(...args: unknown[]): void;
    getAppSetting(...args: unknown[]): void;
    onInstallFinished(...args: unknown[]): void;
    onUpdateGeneralFlag(...args: unknown[]): void;
    onGetOfflineMsg(...args: unknown[]): void;
}
export interface NodeIGlobalAdapter extends IGlobalAdapter {
    new (adapter: IGlobalAdapter): NodeIGlobalAdapter;
}
export declare class GlobalAdapter implements IGlobalAdapter {
    onLog(...args: unknown[]): void;
    onGetSrvCalTime(...args: unknown[]): void;
    onShowErrUITips(...args: unknown[]): void;
    fixPicImgType(...args: unknown[]): void;
    getAppSetting(...args: unknown[]): void;
    onInstallFinished(...args: unknown[]): void;
    onUpdateGeneralFlag(...args: unknown[]): void;
    onGetOfflineMsg(...args: unknown[]): void;
}
export {};

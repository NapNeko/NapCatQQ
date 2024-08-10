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
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(adapter: IGlobalAdapter): NodeIGlobalAdapter;
}

export class GlobalAdapter implements IGlobalAdapter {
    onLog(...args: unknown[]) {
    }

    onGetSrvCalTime(...args: unknown[]) {
    }

    onShowErrUITips(...args: unknown[]) {
    }

    fixPicImgType(...args: unknown[]) {
    }

    getAppSetting(...args: unknown[]) {
    }

    onInstallFinished(...args: unknown[]) {
    }

    onUpdateGeneralFlag(...args: unknown[]) {
    }

    onGetOfflineMsg(...args: unknown[]) {
    }
}

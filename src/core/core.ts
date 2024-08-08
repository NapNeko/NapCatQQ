export enum NCoreWorkMode {
    Unknown = 0,
    Shell = 1,
    LiteLoader = 2
}
export class NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.Unknown;
    public isInit: boolean = false;
}
export class NapCatShell extends NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.Shell;
    Init() {

    }
}
export class NapCatLiteLoader extends NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.LiteLoader;
    Init(LoginService: any, WrapperSession: any) {

    }
}
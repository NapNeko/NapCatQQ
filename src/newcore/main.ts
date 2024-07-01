enum NapCatCorePlatform {
    Node = 'Node',//命令行模式加载
    LiteLoader = 'LiteLoader',//LL插件模式加载
}
class NewNapCatCore {
    platform: NapCatCorePlatform; // 平台
    constructor(platform: NapCatCorePlatform) {
        this.platform = platform;
    }
}
export class NapCatCoreManger {
    static core: NewNapCatCore | undefined = undefined;
    static defaultPlatform: NapCatCorePlatform = NapCatCorePlatform.Node;
    static SetDefaultCore(platform: NapCatCorePlatform) {
        if (this.core !== undefined) {
            return;
        }
        this.defaultPlatform = platform;
    }
    static GetPlatform(): NapCatCorePlatform {
        return NapCatCoreManger.defaultPlatform;
    }
    static GetInstance(): NewNapCatCore {
        if (this.core === undefined) {
            this.core = new NewNapCatCore(NapCatCoreManger.defaultPlatform);
        }
        return this.core;
    }
}
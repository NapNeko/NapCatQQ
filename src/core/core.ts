import { NTApiContext, WrapperNodeApi } from "@/core/wrapper";
import path from "node:path";
import fs from "node:fs";
import { InstanceContext } from "./wrapper";
import { NTEventChannel } from "@/common/framework/event";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";
import { MsgListener, ProfileListener } from "./listeners";
import { sleep } from "@/common/utils/helper";
import { SelfInfo, LineDevice, SelfStatusInfo } from "./entities";
import { LegacyNTEventWrapper } from "@/common/framework/event-legacy";
import { NTQQFriendApi, NTQQGroupApi, NTQQMsgApi, NTQQUserApi, NTQQWebApi } from "./apis";
import os from "node:os";
import { NTQQCollectionApi } from "./apis/collection";
export enum NapCatCoreWorkingEnv {
    Unknown = 0,
    Shell = 1,
    LiteLoader = 2,
}

export function loadQQWrapper(QQVersion: string): WrapperNodeApi {
    let wrapperNodePath = path.resolve(path.dirname(process.execPath), './resources/app/wrapper.node');
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(path.dirname(process.execPath), `resources/app/versions/${QQVersion}/wrapper.node`);
    }
    const nativemodule: any = { exports: {} };
    process.dlopen(nativemodule, wrapperNodePath);
    return nativemodule.exports;
}

export class NapCatCore {
    readonly context: InstanceContext;
    readonly ApiContext: NTApiContext;
    readonly eventWrapper: LegacyNTEventWrapper;
    // readonly eventChannel: NTEventChannel;
    NapCatDataPath: string;
    NapCatTempPath: string;
    // runtime info, not readonly
    selfInfo: SelfInfo;
    // 通过构造器递过去的 runtime info 应该尽量少
    constructor(context: InstanceContext, selfInfo: SelfInfo) {
        this.selfInfo = selfInfo;
        this.context = context;
        this.eventWrapper = new LegacyNTEventWrapper(context.wrapper, context.session);
        this.initNapCatCoreListeners().then().catch(console.error);
        this.ApiContext = {
            CollectionApi:new NTQQCollectionApi(this.context, this),
            WebApi: new NTQQWebApi(this.context, this),
            FriendApi: new NTQQFriendApi(this.context, this),
            MsgApi: new NTQQMsgApi(this.context, this),
            UserApi: new NTQQUserApi(this.context, this),
            GroupApi: new NTQQGroupApi(this.context, this)
        };
        this.NapCatDataPath = path.join(this.dataPath, 'NapCat');
        fs.mkdirSync(this.NapCatDataPath, { recursive: true });
        this.NapCatTempPath = path.join(this.NapCatDataPath, 'temp');
        // 创建临时目录
        if (!fs.existsSync(this.NapCatTempPath)) {
            fs.mkdirSync(this.NapCatTempPath, { recursive: true });
        }
    }
    getApiContext() {
        return this.ApiContext;
    }
    get dataPath(): string {
        let result = this.context.wrapper.util.getNTUserDataInfoConfig();
        if (!result) {
            result = path.resolve(os.homedir(), './.config/QQ');
            fs.mkdirSync(result, { recursive: true });
        }
        return result;
    }

    // Renamed from 'InitDataListener'
    async initNapCatCoreListeners() {
        const msgListener = new MsgListener();
        msgListener.onRecvMsg = (msg) => {
            console.log("RecvMsg", msg);
        };
        //await sleep(2500);
        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger))
        );

        const profileListener = new ProfileListener();
        profileListener.onProfileDetailInfoChanged = (profile) => {
            if (profile.uid === this.selfInfo.uid) {
                Object.assign(this.selfInfo, profile);
            }
        };
        profileListener.onSelfStatusChanged = (Info: SelfStatusInfo) => {
            // if (Info.status == 20) {
            //   log("账号状态变更为离线")
            // }
        };
        this.context.session.getProfileService().addKernelProfileListener(
            new this.context.wrapper.NodeIKernelProfileListener(proxiedListenerOf(profileListener, this.context.logger))
        );
    }
}

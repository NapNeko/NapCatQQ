import { WrapperNodeApi } from "@/core/wrapper";
import path from "node:path";
import fs from "node:fs";
import { InstanceContext } from "./wrapper";
import { NTEventChannel } from "@/common/framework/event";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";
import { MsgListener } from "./listeners";
import { sleep } from "@/common/utils/helper";
import { SelfInfo, LineDevice } from "./entities";

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
    readonly eventChannel: NTEventChannel;

    // runtime info, not readonly
    selfInfo: SelfInfo;
    deviceList: {
        app_id: string,
        device_name: string,
        device_kind: string
    }[] = [];

    // 通过构造器递过去的 runtime info 应该尽量少
    constructor(context: InstanceContext, selfInfo: SelfInfo) {
        this.selfInfo = selfInfo;
        this.context = context;
        this.eventChannel = new NTEventChannel(context.wrapper, context.session);
        this.initNapCatCoreListeners().then().catch(console.error);
    }

    // Renamed from 'InitDataListener'
    async initNapCatCoreListeners() {
        let msgListener = new MsgListener();
        msgListener.onRecvMsg = (msg) => {
            console.log("RecvMsg", msg);
        }
        msgListener.onLineDev = (devices: LineDevice[]) => {
            this.deviceList = devices.map((device: LineDevice) => ({
                app_id: device.devUid,
                device_name: device.clientType.toString(),
                device_kind: device.clientType.toString(),
            }));
        };
        //await sleep(2500);
        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger))
        );
    }
}

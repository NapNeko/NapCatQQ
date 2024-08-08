import { WrapperNodeApi } from "./wrapper/wrapper";
import path from "node:path";
import fs from "node:fs";
import { InstanceContext } from "./wrapper";
import { NTEventChannel } from "@/common/framework/event";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";
import { MsgListener } from "./listeners";
import { sleep } from "@/common/utils/helper";

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

    constructor(context: InstanceContext) {
        this.context = context;
        this.eventChannel = new NTEventChannel(context.wrapper, context.session);
        this.initNapCatCoreListeners().then().catch(console.error);
    }

    // Renamed from 'InitDataListener'
    async initNapCatCoreListeners() {
        let msg = new MsgListener();
        msg.onRecvMsg = (msg) => {
            console.log("RecvMsg", msg);
        }
        await sleep(2500);
        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msg, this.context.logger))
        );
    }
}

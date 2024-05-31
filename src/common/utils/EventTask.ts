import { NodeIQQNTWrapperSession } from "@/core/wrapper";
import { randomUUID } from "crypto";
// export enum NTEventMode {
//     Once = 1,
//     Twice = 2
// }
// export interface NTEventType<U extends (...args: any[]) => Promise<any>> {
//     EventName: string,
//     EventFunction: U,
//     ListenerName: string,
//     ListenerFunction: Function
// }
// interface Internal_MapKey {
//     mode: NTEventMode,
//     timeout: number,
//     createtime: number,
//     func: Function
// }
// export class NTEvent<T extends (...args: any[]) => any, R = any> {
//     EventData: NTEventType<T>;
//     EventTask: Map<string, Internal_MapKey> = new Map<string, Internal_MapKey>();
//     constructor(params: NTEventType<T>) {
//         params.ListenerFunction = this.DispatcherListener.bind(this);
//         this.EventData = params;
//         this.EventData.EventFunction = params.EventFunction.bind(this) as any;
//     }
//     async DispatcherListener(...args: any[]) {
//         console.log(...args);
//         this.EventTask.forEach((task, uuid) => {
//             if (task.createtime + task.timeout > Date.now()) {
//                 this.EventTask.delete(uuid);
//                 return;
//             }
//             task.func(...args);
//         })
//     }
//     async CallTwiceEvent(timeout: number = 3000, ...args: Parameters<T>) {
//         return new Promise<R>((resolve, reject) => {
//             const id = randomUUID();
//             let complete = 0;
//             let retData: R | undefined = undefined;
//             let databack = () => {
//                 if (!complete) {
//                     this.EventTask.delete(id);
//                     reject(new Error('NTEvent EventName:' + this.EventData.EventName + ' EventListener:' + this.EventData.ListenerName + ' timeout'));
//                 } else {
//                     resolve(retData as R);
//                 }
//             }

//             let Timeouter = setTimeout(databack, timeout);

//             this.EventTask.set(id, {
//                 mode: NTEventMode.Once,
//                 timeout: timeout,
//                 createtime: Date.now(),
//                 func: (...args: any[]) => {
//                     complete++;
//                     retData = args as R;
//                     if (complete == 2) {
//                         clearTimeout(Timeouter);
//                         databack();
//                     }
//                 }
//             });
//             this.EventData.EventFunction(...args);
//         });
//     }

//     async CallOnceEvent(timeout: number = 3000, ...args: Parameters<T>) {
//         return new Promise<R>((resolve, reject) => {
//             const id = randomUUID();
//             let complete = false;
//             let retData: R | undefined = undefined;
//             let databack = () => {
//                 if (!complete) {
//                     this.EventTask.delete(id);
//                     reject(new Error('NTEvent EventName:' + this.EventData.EventName + ' EventListener:' + this.EventData.ListenerName + ' timeout'));
//                 } else {
//                     resolve(retData as R);
//                 }
//             }
//             let Timeouter = setTimeout(databack, timeout);

//             this.EventTask.set(id, {
//                 mode: NTEventMode.Once,
//                 timeout: timeout,
//                 createtime: Date.now(),
//                 func: (...args: any[]) => {
//                     clearTimeout(Timeouter);
//                     complete = true;
//                     retData = args as R;
//                     databack();
//                 }
//             });
//             this.EventData.EventFunction(...args);
//         });
//     }
// }

export class ListenerClassBase {
    [key: string]: string;
}

export class NTEventWrapper {
    private ListenerMap: Map<string, typeof ListenerClassBase>;
    private WrapperSession: NodeIQQNTWrapperSession;
    private ListenerManger: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>();
    constructor({ ListenerMap, WrapperSession }: { ListenerMap: Map<string, typeof ListenerClassBase>, WrapperSession: NodeIQQNTWrapperSession }) {
        this.ListenerMap = ListenerMap;
        this.WrapperSession = WrapperSession;
    }
    GetEvent<T extends (...args: any) => any>(eventName: string) {
        // 将 eventName 'NodeIKernelProfileLikeService/GetTest' => 转换成 this.WrapperSession.getProfileLikeService().getTest
        let eventNameArr = eventName.split('/');
        type eventType = {
            [key: string]: () => { [key: string]: (...params: Parameters<T>) => Promise<ReturnType<T>> }
        }
        if (eventNameArr.length > 1) {
            let serviceName = 'get' + eventNameArr[0].replace('NodeIKernel', '');
            let eventName = eventNameArr[1];
            let services = (this.WrapperSession as unknown as eventType)[serviceName]();
            let event = services[eventName];
            //重新绑定this
            event = event.bind(services);
            if (event) {
                return event;
            }
            return undefined;

        }

    }
    // 获取某个Listener
    GetListener(listenerName: string, uniqueCode: string = "") {
        let ListenerType = this.ListenerMap.get(listenerName);
        let Listener = this.ListenerManger.get(listenerName + uniqueCode);
        if (!Listener && ListenerType) {
            Listener = new ListenerType();
            this.ListenerManger.set(listenerName + uniqueCode, Listener);
        }
        return Listener;
    }
}
import { NodeIKernelMsgListener } from "@/core";
import { NodeIQQNTWrapperSession } from "@/core/wrapper";

import { randomUUID } from "crypto";
export enum NTEventMode {
    Once = 1,
    Twice = 2
}

interface Internal_MapKey {
    mode: NTEventMode,
    timeout: number,
    createtime: number,
    func: Function
}

export class ListenerClassBase {
    [key: string]: string;
}

export class NTEventWrapper {
    private ListenerMap: Map<string, typeof ListenerClassBase> | undefined;
    private WrapperSession: NodeIQQNTWrapperSession | undefined;
    private ListenerManger: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>();
    private EventTask: Map<string, Internal_MapKey> = new Map<string, Internal_MapKey>();
    constructor() {

    }
    init({ ListenerMap, WrapperSession }: { ListenerMap: Map<string, typeof ListenerClassBase>, WrapperSession: NodeIQQNTWrapperSession }) {
        this.ListenerMap = ListenerMap;
        this.WrapperSession = WrapperSession;
    }
    CreatEventFunction<T extends (...args: any) => any>(eventName: string): T | undefined {
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
                return event as T;
            }
            return undefined;
        }

    }
    // 获取某个Listener 存在返回 不存在创建
    CreatListenerFunction<T>(listenerName: string, uniqueCode: string = ""): T {
        let ListenerType = this.ListenerMap!.get(listenerName);
        let Listener = this.ListenerManger.get(listenerName + uniqueCode);
        if (!Listener && ListenerType) {
            Listener = new ListenerType();
            let ServiceSubName = listenerName.match(/^NodeIKernel(.*?)Listener$/);
            let Service = "NodeIKernel" + ServiceSubName + "Service/addKernel" + ServiceSubName + "Listener";
            let addfunc = this.CreatEventFunction<(listener: T) => number>(Service);
            addfunc!(Listener as T);
            this.ListenerManger.set(listenerName + uniqueCode, Listener);
        }
        return Listener as T;
    }
    // 如果存在覆盖注册 不存在则创建Listener
    RigisterListener<T extends { [key: string]: (...args: any) => any }>(listenerName: string, uniqueCode: string = "NTEvent", cb: (...args: any) => any) {
        let ListenerNameList = listenerName.split('/');
        let ListenerMain = ListenerNameList[0];
        let ListenerMethod = ListenerNameList[1];
        let Listener = this.CreatListenerFunction<T>(ListenerMain, uniqueCode); //uniqueCode NTEvent
        (Listener[ListenerMethod] as any) = cb;
    }
    //统一回调清理事件
    async DispatcherListener(...args: any[]) {
        this.EventTask.forEach((task, uuid) => {
            if (task.createtime + task.timeout > Date.now()) {
                this.EventTask.delete(uuid);
                return;
            }
            if (task.mode == NTEventMode.Once) {
                this.EventTask.delete(uuid);
            }
            task.func(...args);
        })
    }
    async CallOnceEvent<EventType extends (...args: any[]) => any, ListenerType extends (...args: any[]) => void>(EventName = '', ListenerName = '', timeout: number = 3000, ...args: Parameters<EventType>) {
        return new Promise<ArrayLike<Parameters<ListenerType>>>((resolve, reject) => {
            const id = randomUUID();
            let complete = false;
            let retData: ArrayLike<Parameters<ListenerType>> | undefined = undefined;
            let databack = () => {
                if (!complete) {
                    this.EventTask.delete(id);
                    reject(new Error('NTEvent EventName:' + EventName + ' ListenerName:' + ListenerName + ' timeout'));
                } else {
                    resolve(retData as ArrayLike<Parameters<ListenerType>>);
                }
            }
            let Timeouter = setTimeout(databack, timeout);

            this.EventTask.set(id, {
                mode: NTEventMode.Once,
                timeout: timeout,
                createtime: Date.now(),
                func: (...args: any[]) => {
                    clearTimeout(Timeouter);
                    complete = true;
                    retData = args as ArrayLike<Parameters<ListenerType>>;
                    databack();
                }
            });
            let EventFunc = this.CreatEventFunction<EventType>(EventName);
            EventFunc!(...args);
        });
    }
    async CallTwiceEvent<EventType extends (...args: any[]) => any, ListenerType extends (...args: any[]) => void>(EventName = '', ListenerName = '', timeout: number = 3000, ...args: Parameters<EventType>) {
        return new Promise<ArrayLike<Parameters<ListenerType>>>((resolve, reject) => {
            const id = randomUUID();
            let complete = 0;
            let retData: ArrayLike<Parameters<ListenerType>> | undefined = undefined;
            let databack = () => {
                if (complete < 2) {
                    this.EventTask.delete(id);
                    reject(new Error('NTEvent EventName:' + EventName + ' ListenerName:' + ListenerName + ' timeout'));
                } else {
                    resolve(retData as ArrayLike<Parameters<ListenerType>>);
                }
            }
            let Timeouter = setTimeout(databack, timeout);

            this.EventTask.set(id, {
                mode: NTEventMode.Once,
                timeout: timeout,
                createtime: Date.now(),
                func: (...args: any[]) => {
                    complete++;
                    retData = args as ArrayLike<Parameters<ListenerType>>;
                    if (complete == 2) {
                        clearTimeout(Timeouter);
                        databack();
                    }
                }
            });
            let EventFunc = this.CreatEventFunction<EventType>(EventName);
            EventFunc!(...args);
        });
    }

}
// 示例代码 快速创建事件
// let NTEvent = new NTEventWrapper();
// let TestEvent = NTEvent.CreatEventFunction<(force: boolean) => Promise<Number>>('NodeIKernelProfileLikeService/GetTest');
// if (TestEvent) {
//     TestEvent(true);
// }

// 示例代码 快速创建监听Listener类
// let NTEvent = new NTEventWrapper();
// NTEvent.CreatListenerFunction<NodeIKernelMsgListener>('NodeIKernelMsgListener', 'core')


// 初步构想
// NTEventDispatch NTEvent NTEventWrapper
// 示例

// 调用接口
// NTEventDispatch.CallSerice('NodeIKernelProfileLikeService/GetTest', true);

// 注册监听 解除监听
// NTEventDispatch.RigisterListener('NodeIKernelMsgListener/onAddSendMsg','core',cb);
// NTEventDispatch.UnRigisterListener('NodeIKernelMsgListener/onAddSendMsg','core');

// let GetTest = NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode);
// GetTest('test');

// always模式
// NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode,(...args:any[])=>{ console.log(args) });
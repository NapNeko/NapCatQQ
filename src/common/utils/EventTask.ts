import { NodeIKernelMsgListener } from "@/core";
import { NodeIQQNTWrapperSession } from "@/core/wrapper";

import { randomUUID } from "crypto";

interface Internal_MapKey {
    timeout: number,
    createtime: number,
    func: Function
}

export class ListenerClassBase {
    [key: string]: string;
}

export class NTEventWrapper {
    private ListenerMap: Map<string, typeof ListenerClassBase> | undefined;//ListenerName-Unique -> Listener构造函数
    private WrapperSession: NodeIQQNTWrapperSession | undefined;//WrapperSession
    private ListenerManger: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>(); //ListenerName-Unique -> Listener实例
    private EventTask: Map<string, Map<string, Internal_MapKey>> = new Map<string, Map<string, Internal_MapKey>>();//tasks ListenerName -> uuid -> {timeout,createtime,func}
    private ListenerInit: Map<string, boolean> = new Map<string, boolean>();
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
    //初始化Listener回调
    initNTListener(ListenerName: string) {
        if (this.ListenerInit.get(ListenerName)) {
            return;
        }
        this.RigisterListener(ListenerName, "NTEvent", (...args) => {
            console.log('wait... DispatcherListener');
            this.DispatcherListener(ListenerName, ...args).then().catch();
        })
        this.ListenerInit.set(ListenerName, true);
    }
    //统一回调清理事件
    async DispatcherListener(ListenerName: string, ...args: any[]) {
        this.EventTask.get(ListenerName)?.forEach((task, uuid) => {
            if (task.createtime + task.timeout > Date.now()) {
                this.EventTask.get(ListenerName)?.delete(uuid);
                return;
            }
            task.func(...args);
        })
    }
    async CallNoListenerEvent<EventType extends (...args: any[]) => Promise<any>,>(EventName = '', timeout: number = 3000, ...args: Parameters<EventType>) {
        return new Promise<ReturnType<EventType>>(async (resolve, reject) => {
            let EventFunc = this.CreatEventFunction<EventType>(EventName);
            let complete = false;
            let Timeouter = setTimeout(() => {
                if (!complete) {
                    reject(new Error('NTEvent EventName:' + EventName + ' timeout'));
                }
            }, timeout);
            let retData = await EventFunc!(...args);
            complete = true;
            resolve(retData);
        });
    }
    async CallNormalEvent<EventType extends (...args: any[]) => Promise<any>, ListenerType extends (...args: any[]) => void>(EventName = '', ListenerName = '', waitTimes = 1, timeout: number = 3000, ...args: Parameters<EventType>) {
        return new Promise<ArrayLike<Parameters<ListenerType>>>(async (resolve, reject) => {
            const id = randomUUID();
            let complete = 0;
            let retData: ArrayLike<Parameters<ListenerType>> | undefined = undefined;
            let databack = () => {
                if (complete < waitTimes) {
                    reject(new Error('NTEvent EventName:' + EventName + ' ListenerName:' + ListenerName + ' timeout'));
                } else {
                    resolve(retData as ArrayLike<Parameters<ListenerType>>);
                }
            }
            this.initNTListener(ListenerName);
            let Timeouter = setTimeout(databack, timeout);
            let ListenerNameList = ListenerName.split('/');
            let ListenerMain = ListenerNameList[0];
            let ListenerMethod = ListenerNameList[1];

            this.EventTask.get(ListenerMain)?.set(id, {
                timeout: timeout,
                createtime: Date.now(),
                func: (...args: any[]) => {
                    complete++;
                    retData = args as ArrayLike<Parameters<ListenerType>>;
                    if (complete == waitTimes) {
                        clearTimeout(Timeouter);
                        databack();
                    }
                }
            });
            let EventFunc = this.CreatEventFunction<EventType>(EventName);
            await EventFunc!(...args);
        });
    }

}
// 示例代码 快速创建事件
//let NTEvent = new NTEventWrapper();
// let TestEvent = NTEvent.CreatEventFunction<(force: boolean) => Promise<Number>>('NodeIKernelProfileLikeService/GetTest');
// if (TestEvent) {
//     TestEvent(true);
// }

// 示例代码 快速创建监听Listener类
// let NTEvent = new NTEventWrapper();
// NTEvent.CreatListenerFunction<NodeIKernelMsgListener>('NodeIKernelMsgListener', 'core')


// 调用接口
let NTEvent = new NTEventWrapper();
NTEvent.CallNormalEvent<(force: boolean) => Promise<Number>, (data1: string, data2: number) => void>('NodeIKernelProfileLikeService/GetTest', 'NodeIKernelMsgListener/onAddSendMsg', 1, 3000, true);

// 注册监听 解除监听
// NTEventDispatch.RigisterListener('NodeIKernelMsgListener/onAddSendMsg','core',cb);
// NTEventDispatch.UnRigisterListener('NodeIKernelMsgListener/onAddSendMsg','core');

// let GetTest = NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode);
// GetTest('test');

// always模式
// NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode,(...args:any[])=>{ console.log(args) });
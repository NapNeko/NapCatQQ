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

export interface ListenerIBase {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(listener: any): ListenerClassBase;
}

export class NTEventWrapper {

    private ListenerMap: { [key: string]: ListenerIBase } | undefined;//ListenerName-Unique -> Listener构造函数
    private WrapperSession: NodeIQQNTWrapperSession | undefined;//WrapperSession
    private ListenerManger: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>(); //ListenerName-Unique -> Listener实例
    private EventTask = new Map<string, Map<string, Map<string, Internal_MapKey>>>();//tasks ListenerMainName -> ListenerSubName-> uuid -> {timeout,createtime,func}
    constructor() {

    }
    createProxyDispatch(ListenerMainName: string) {
        let current = this;
        return new Proxy({}, {
            get(target: any, prop: any, receiver: any) {
                // console.log('get', prop, typeof target[prop]);
                if (typeof target[prop] === 'undefined') {
                    // 如果方法不存在，返回一个函数，这个函数调用existentMethod
                    return (...args: any[]) => {
                        current.DispatcherListener.apply(current, [ListenerMainName, prop, ...args]).then();
                    };
                }
                // 如果方法存在，正常返回
                return Reflect.get(target, prop, receiver);
            }
        });
    }
    init({ ListenerMap, WrapperSession }: { ListenerMap: { [key: string]: typeof ListenerClassBase }, WrapperSession: NodeIQQNTWrapperSession }) {
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
            //getNodeIKernelGroupListener,GroupService
            //console.log('2', eventName);
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
    CreatListenerFunction<T>(listenerMainName: string, uniqueCode: string = ""): T {
        let ListenerType = this.ListenerMap![listenerMainName];
        let Listener = this.ListenerManger.get(listenerMainName + uniqueCode);
        if (!Listener && ListenerType) {
            Listener = new ListenerType(this.createProxyDispatch(listenerMainName));
            let ServiceSubName = listenerMainName.match(/^NodeIKernel(.*?)Listener$/)![1];
            let Service = "NodeIKernel" + ServiceSubName + "Service/addKernel" + ServiceSubName + "Listener";
            let addfunc = this.CreatEventFunction<(listener: T) => number>(Service);
            addfunc!(Listener as T);
            //console.log(addfunc!(Listener as T));
            this.ListenerManger.set(listenerMainName + uniqueCode, Listener);
        }
        return Listener as T;
    }
    //统一回调清理事件
    async DispatcherListener(ListenerMainName: string, ListenerSubName: string, ...args: any[]) {
        //console.log(ListenerMainName, this.EventTask.get(ListenerMainName), ListenerSubName, this.EventTask.get(ListenerMainName)?.get(ListenerSubName));
        this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.forEach((task, uuid) => {
            //console.log(task.func, uuid, task.createtime, task.timeout);
            if (task.createtime + task.timeout < Date.now()) {
                this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.delete(uuid);
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
        return new Promise<[EventRet: Awaited<ReturnType<EventType>>, ...Parameters<ListenerType>]>(async (resolve, reject) => {
            const id = randomUUID();
            let complete = 0;
            let retData: ArrayLike<Parameters<ListenerType>> | undefined = undefined;
            let retEvent: any = {};
            let databack = () => {
                if (complete < waitTimes) {
                    reject(new Error('NTEvent EventName:' + EventName + ' ListenerName:' + ListenerName + ' timeout'));
                } else {

                    resolve([retEvent, ...(retData as Parameters<ListenerType>)]);
                }
            }
            let Timeouter = setTimeout(databack, timeout);

            let ListenerNameList = ListenerName.split('/');
            let ListenerMainName = ListenerNameList[0];
            let ListenerSubName = ListenerNameList[1];
            let eventCallbak = {
                timeout: timeout,
                createtime: Date.now(),
                func: (...args: any[]) => {
                    complete++;
                    //console.log('func', ...args);
                    retData = args as ArrayLike<Parameters<ListenerType>>;
                    if (complete >= waitTimes) {
                        clearTimeout(Timeouter);
                        databack();
                    }
                }
            }
            if (!this.EventTask.get(ListenerMainName)) {
                this.EventTask.set(ListenerMainName, new Map());
            }
            if (!(this.EventTask.get(ListenerMainName)?.get(ListenerSubName))) {
                this.EventTask.get(ListenerMainName)?.set(ListenerSubName, new Map());
            }
            this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.set(id, eventCallbak);
            this.CreatListenerFunction(ListenerMainName);
            let EventFunc = this.CreatEventFunction<EventType>(EventName);
            retEvent = await EventFunc!(...args);
        });
    }

}
export const NTEventDispatch = new NTEventWrapper();

// 示例代码 快速创建事件
// let NTEvent = new NTEventWrapper();
// let TestEvent = NTEvent.CreatEventFunction<(force: boolean) => Promise<Number>>('NodeIKernelProfileLikeService/GetTest');
// if (TestEvent) {
//     TestEvent(true);
// }

// 示例代码 快速创建监听Listener类
// let NTEvent = new NTEventWrapper();
// NTEvent.CreatListenerFunction<NodeIKernelMsgListener>('NodeIKernelMsgListener', 'core')


// 调用接口
//let NTEvent = new NTEventWrapper();
//let ret = await NTEvent.CallNormalEvent<(force: boolean) => Promise<Number>, (data1: string, data2: number) => void>('NodeIKernelProfileLikeService/GetTest', 'NodeIKernelMsgListener/onAddSendMsg', 1, 3000, true);

// 注册监听 解除监听
// NTEventDispatch.RigisterListener('NodeIKernelMsgListener/onAddSendMsg','core',cb);
// NTEventDispatch.UnRigisterListener('NodeIKernelMsgListener/onAddSendMsg','core');

// let GetTest = NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode);
// GetTest('test');

// always模式
// NTEventDispatch.CreatEvent('NodeIKernelProfileLikeService/GetTest','NodeIKernelMsgListener/onAddSendMsg',Mode,(...args:any[])=>{ console.log(args) });
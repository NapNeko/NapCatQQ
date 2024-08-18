import { NodeIQQNTWrapperSession } from '@/core/wrapper/wrapper';
import { randomUUID } from 'crypto';

interface Internal_MapKey {
    timeout: number;
    createtime: number;
    func: (...arg: any[]) => any;
    checker: ((...args: any[]) => boolean) | undefined;
}

export type ListenerClassBase = Record<string, string>;

export interface ListenerIBase {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(listener: any): ListenerClassBase;
}

export class LegacyNTEventWrapper {
    private listenerMapping: Record<string, ListenerIBase>; //ListenerName-Unique -> Listener构造函数
    private WrapperSession: NodeIQQNTWrapperSession | undefined; //WrapperSession
    private listenerManager: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>(); //ListenerName-Unique -> Listener实例
    private EventTask = new Map<string, Map<string, Map<string, Internal_MapKey>>>(); //tasks ListenerMainName -> ListenerSubName-> uuid -> {timeout,createtime,func}

    constructor(
        listenerMapping: Record<string, ListenerIBase>,
        wrapperSession: NodeIQQNTWrapperSession,
    ) {
        this.listenerMapping = listenerMapping;
        this.WrapperSession = wrapperSession;
    }

    createProxyDispatch(ListenerMainName: string) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const current = this;
        return new Proxy(
            {},
            {
                get(target: any, prop: any, receiver: any) {
                    // console.log('get', prop, typeof target[prop]);
                    if (typeof target[prop] === 'undefined') {
                        // 如果方法不存在，返回一个函数，这个函数调用existentMethod
                        return (...args: any[]) => {
                            current.dispatcherListener.apply(current, [ListenerMainName, prop, ...args]).then();
                        };
                    }
                    // 如果方法存在，正常返回
                    return Reflect.get(target, prop, receiver);
                },
            },
        );
    }

    createEventFunction<T extends (...args: any) => any>(eventName: string): T | undefined {
        const eventNameArr = eventName.split('/');
        type eventType = {
            [key: string]: () => { [key: string]: (...params: Parameters<T>) => Promise<ReturnType<T>> };
        };
        if (eventNameArr.length > 1) {
            const serviceName = 'get' + eventNameArr[0].replace('NodeIKernel', '');
            const eventName = eventNameArr[1];
            //getNodeIKernelGroupListener,GroupService
            //console.log('2', eventName);
            const services = (this.WrapperSession as unknown as eventType)[serviceName]();
            let event = services[eventName];
            //重新绑定this
            event = event.bind(services);
            if (event) {
                return event as T;
            }
            return undefined;
        }
    }

    createListenerFunction<T>(listenerMainName: string, uniqueCode: string = ''): T {
        const ListenerType = this.listenerMapping![listenerMainName];
        let Listener = this.listenerManager.get(listenerMainName + uniqueCode);
        if (!Listener && ListenerType) {
            Listener = new ListenerType(this.createProxyDispatch(listenerMainName));
            const ServiceSubName = listenerMainName.match(/^NodeIKernel(.*?)Listener$/)![1];
            const Service = 'NodeIKernel' + ServiceSubName + 'Service/addKernel' + ServiceSubName + 'Listener';
            const addfunc = this.createEventFunction<(listener: T) => number>(Service);
            addfunc!(Listener as T);
            //console.log(addfunc!(Listener as T));
            this.listenerManager.set(listenerMainName + uniqueCode, Listener);
        }
        return Listener as T;
    }

    //统一回调清理事件
    async dispatcherListener(ListenerMainName: string, ListenerSubName: string, ...args: any[]) {
        //console.log("[EventDispatcher]",ListenerMainName, ListenerSubName, ...args);
        this.EventTask.get(ListenerMainName)
            ?.get(ListenerSubName)
            ?.forEach((task, uuid) => {
                //console.log(task.func, uuid, task.createtime, task.timeout);
                if (task.createtime + task.timeout < Date.now()) {
                    this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.delete(uuid);
                    return;
                }
                if (task.checker && task.checker(...args)) {
                    task.func(...args);
                }
            });
    }

    async callNoListenerEvent<EventType extends (...args: any[]) => Promise<any> | any>(
        EventName = '',
        timeout: number = 3000,
        ...args: Parameters<EventType>
    ) {
        return new Promise<Awaited<ReturnType<EventType>>>(async (resolve, reject) => {
            const EventFunc = this.createEventFunction<EventType>(EventName);
            let complete = false;
            setTimeout(() => {
                if (!complete) {
                    reject(new Error('NTEvent EventName:' + EventName + ' timeout'));
                }
            }, timeout);
            const retData = await EventFunc!(...args);
            complete = true;
            resolve(retData);
        });
    }

    async RegisterListen<ListenerType extends (...args: any[]) => void>(
        ListenerName = '',
        waitTimes = 1,
        timeout = 5000,
        checker: (...args: Parameters<ListenerType>) => boolean,
    ) {
        return new Promise<Parameters<ListenerType>>((resolve, reject) => {
            const ListenerNameList = ListenerName.split('/');
            const ListenerMainName = ListenerNameList[0];
            const ListenerSubName = ListenerNameList[1];
            const id = randomUUID();
            let complete = 0;
            let retData: Parameters<ListenerType> | undefined = undefined;
            const databack = () => {
                if (complete == 0) {
                    reject(new Error(' ListenerName:' + ListenerName + ' timeout'));
                } else {
                    resolve(retData!);
                }
            };
            const timeoutRef = setTimeout(databack, timeout);
            const eventCallbak = {
                timeout: timeout,
                createtime: Date.now(),
                checker: checker,
                func: (...args: Parameters<ListenerType>) => {
                    complete++;
                    retData = args;
                    if (complete >= waitTimes) {
                        clearTimeout(timeoutRef);
                        databack();
                    }
                },
            };
            if (!this.EventTask.get(ListenerMainName)) {
                this.EventTask.set(ListenerMainName, new Map());
            }
            if (!this.EventTask.get(ListenerMainName)?.get(ListenerSubName)) {
                this.EventTask.get(ListenerMainName)?.set(ListenerSubName, new Map());
            }
            this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.set(id, eventCallbak);
            this.createListenerFunction(ListenerMainName);
        });
    }

    async CallNormalEvent<
        EventType extends (...args: any[]) => Promise<any>,
        ListenerType extends (...args: any[]) => void
    >(
        EventName = '',
        ListenerName = '',
        waitTimes = 1,
        timeout: number = 3000,
        checker: (...args: Parameters<ListenerType>) => boolean,
        ...args: Parameters<EventType>
    ) {
        return new Promise<[EventRet: Awaited<ReturnType<EventType>>, ...Parameters<ListenerType>]>(
            async (resolve, reject) => {
                const id = randomUUID();
                let complete = 0;
                let retData: Parameters<ListenerType> | undefined = undefined;
                let retEvent: any = {};
                const databack = () => {
                    if (complete == 0) {
                        reject(
                            new Error(
                                'Timeout: NTEvent EventName:' +
                                EventName +
                                ' ListenerName:' +
                                ListenerName +
                                ' EventRet:\n' +
                                JSON.stringify(retEvent, null, 4) +
                                '\n',
                            ),
                        );
                    } else {
                        resolve([retEvent as Awaited<ReturnType<EventType>>, ...retData!]);
                    }
                };

                const ListenerNameList = ListenerName.split('/');
                const ListenerMainName = ListenerNameList[0];
                const ListenerSubName = ListenerNameList[1];

                const Timeouter = setTimeout(databack, timeout);

                const eventCallbak = {
                    timeout: timeout,
                    createtime: Date.now(),
                    checker: checker,
                    func: (...args: any[]) => {
                        complete++;
                        //console.log('func', ...args);
                        retData = args as Parameters<ListenerType>;
                        if (complete >= waitTimes) {
                            clearTimeout(Timeouter);
                            databack();
                        }
                    },
                };
                if (!this.EventTask.get(ListenerMainName)) {
                    this.EventTask.set(ListenerMainName, new Map());
                }
                if (!this.EventTask.get(ListenerMainName)?.get(ListenerSubName)) {
                    this.EventTask.get(ListenerMainName)?.set(ListenerSubName, new Map());
                }
                this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.set(id, eventCallbak);
                this.createListenerFunction(ListenerMainName);
                const EventFunc = this.createEventFunction<EventType>(EventName);
                retEvent = await EventFunc!(...(args as any[]));
                // 120271006: TaskGetGroupMemberList 0x899_EMPTY_RSP_BODY  查找群内不存在的成员返回
                if (typeof retEvent === 'object' && retEvent?.result !== 0) {
                    clearTimeout(Timeouter);
                    databack();
                };
            },
        );
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

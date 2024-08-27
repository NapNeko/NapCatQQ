import type { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper/wrapper';
import EventEmitter from 'node:events';

export type ListenerClassBase = Record<string, string>;

export interface ListenerIBase {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(listener: any): ListenerClassBase;

    [key: string]: any;
}

export class NTEventWrapperV2 extends EventEmitter {
    private wrapperApi: WrapperNodeApi;
    private wrapperSession: NodeIQQNTWrapperSession;
    private listenerRefStorage = new Map<string, ListenerIBase>();

    constructor(WrapperApi: WrapperNodeApi, WrapperSession: NodeIQQNTWrapperSession) {
        super();
        this.on('error', () => {
        });
        this.wrapperApi = WrapperApi;
        this.wrapperSession = WrapperSession;
    }

    dispatcherListener(ListenerEvent: string, ...args: any[]) {
        this.emit(ListenerEvent, ...args);
    }

    createProxyDispatch(ListenerMainName: string) {
        const dispatcherListener = this.dispatcherListener.bind(this);
        return new Proxy({}, {
            get(_target: any, prop: any, _receiver: any) {
                return (...args: any[]) => {
                    dispatcherListener(ListenerMainName + '/' + prop, ...args);
                };
            },
        });
    }

    async getOrInitListener<T>(listenerMainName: string): Promise<T> {
        const ListenerType = this.wrapperApi[listenerMainName];
        //获取NTQQ 外部 Listener包装
        if (!ListenerType) throw new Error('Init Listener not found');
        let Listener = this.listenerRefStorage.get(listenerMainName);
        //判断是否已创建 创建则跳过
        if (!Listener && ListenerType) {
            Listener = new ListenerType(this.createProxyDispatch(listenerMainName));
            if (!Listener) throw new Error('Init Listener failed');
            //实例化NTQQ Listener外包装
            const ServiceSubName = /^NodeIKernel(.*?)Listener$/.exec(listenerMainName)![1];
            const Service = 'NodeIKernel' + ServiceSubName + 'Service/addKernel' + ServiceSubName + 'Listener';
            const addfunc = this.createEventFunction<(listener: T) => number>(Service);
            //添加Listener到NTQQ
            addfunc!(Listener as T);
            this.listenerRefStorage.set(listenerMainName, Listener);
            //保存Listener实例
        }
        return Listener as T;
    }

    async createEventWithListener<EventType extends (...args: any) => any, ListenerType extends (...args: any) => any>
    (
        eventName: string,
        listenerName: string,
        waitTimes = 1,
        timeout: number = 3000,
        checker: (...args: Parameters<ListenerType>) => boolean,
        ...eventArg: Parameters<EventType>
    ) {
        return new Promise<[EventRet: Awaited<ReturnType<EventType>>, ...Parameters<ListenerType>]>(async (resolve, reject) => {
            const ListenerNameList = listenerName.split('/');
            const ListenerMainName = ListenerNameList[0];
            //const ListenerSubName = ListenerNameList[1];
            this.getOrInitListener<ListenerType>(ListenerMainName);
            let complete = 0;
            const retData: Parameters<ListenerType> | undefined = undefined;
            let retEvent: any = {};
            const databack = () => {
                if (complete == 0) {
                    reject(new Error('Timeout: NTEvent EventName:' + eventName + ' ListenerName:' + listenerName + ' EventRet:\n' + JSON.stringify(retEvent, null, 4) + '\n'));
                } else {
                    resolve([retEvent as Awaited<ReturnType<EventType>>, ...retData!]);
                }
            };
            const Timeouter = setTimeout(databack, timeout);
            const callback = (...args: Parameters<ListenerType>) => {
                if (checker(...args)) {
                    complete++;
                    if (complete >= waitTimes) {
                        clearTimeout(Timeouter);
                        this.removeListener(listenerName, callback);
                        databack();
                    }
                }
            };
            this.on(listenerName, callback);
            const EventFunc = this.createEventFunction<EventType>(eventName);
            retEvent = await EventFunc!(...(eventArg as any[]));
        });
    }

    private createEventFunction<T extends (...args: any) => any>(eventName: string): T | undefined {
        const eventNameArr = eventName.split('/');
        type eventType = {
            [key: string]: () => { [key: string]: (...params: Parameters<T>) => Promise<ReturnType<T>> }
        }
        if (eventNameArr.length > 1) {
            const serviceName = 'get' + eventNameArr[0].replace('NodeIKernel', '');
            const eventName = eventNameArr[1];
            //getNodeIKernelGroupListener,GroupService
            //console.log('2', eventName);
            const services = (this.wrapperSession as unknown as eventType)[serviceName]();
            const event = services[eventName]
                //重新绑定this
                .bind(services);
            if (event) {
                return event as T;
            }
            return undefined;
        }
    }

    async callEvent<EventType extends (...args: any[]) => Promise<any> | any>(
        EventName = '', timeout: number = 3000, ...args: Parameters<EventType>) {
        return new Promise<Awaited<ReturnType<EventType>>>((resolve) => {
            const EventFunc = this.createEventFunction<EventType>(EventName);
            EventFunc!(...args).then((retData: Awaited<ReturnType<EventType>> | PromiseLike<Awaited<ReturnType<EventType>>>) => resolve(retData));
        });
    }
}

//NTEvent2.0

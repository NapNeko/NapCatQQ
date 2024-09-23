import { NodeIQQNTWrapperSession } from '@/core/wrapper';
import { randomUUID } from 'crypto';
import { ListenerNamingMapping, ServiceNamingMapping } from '@/core';

interface InternalMapKey {
    timeout: number;
    createtime: number;
    func: (...arg: any[]) => any;
    checker: ((...args: any[]) => boolean) | undefined;
}

export type ListenerClassBase = Record<string, string>;

export class NTEventWrapper {
    private WrapperSession: NodeIQQNTWrapperSession | undefined; //WrapperSession
    private listenerManager: Map<string, ListenerClassBase> = new Map<string, ListenerClassBase>(); //ListenerName-Unique -> Listener实例
    private EventTask = new Map<string, Map<string, Map<string, InternalMapKey>>>(); //tasks ListenerMainName -> ListenerSubName-> uuid -> {timeout,createtime,func}

    constructor(
        wrapperSession: NodeIQQNTWrapperSession,
    ) {
        this.WrapperSession = wrapperSession;
    }

    createProxyDispatch(ListenerMainName: string) {
        const dispatcherListenerFunc = this.dispatcherListener.bind(this);
        return new Proxy(
            {},
            {
                get(target: any, prop: any, receiver: any) {
                    if (typeof target[prop] === 'undefined') {
                        // 如果方法不存在，返回一个函数，这个函数调用existentMethod
                        return (...args: any[]) => {
                            dispatcherListenerFunc(ListenerMainName, prop, ...args).then();
                        };
                    }
                    // 如果方法存在，正常返回
                    return Reflect.get(target, prop, receiver);
                },
            },
        );
    }

    createEventFunction<
        Service extends keyof ServiceNamingMapping,
        ServiceMethod extends Exclude<keyof ServiceNamingMapping[Service], symbol>,
        // eslint-disable-next-line
        // @ts-ignore
        T extends (...args: any) => any = ServiceNamingMapping[Service][ServiceMethod],
    >(eventName: `${Service}/${ServiceMethod}`): T | undefined {
        const eventNameArr = eventName.split('/');
        type eventType = {
            [key: string]: () => { [key: string]: (...params: Parameters<T>) => Promise<ReturnType<T>> };
        };
        if (eventNameArr.length > 1) {
            const serviceName = 'get' + eventNameArr[0].replace('NodeIKernel', '');
            const eventName = eventNameArr[1];
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
        const existListener = this.listenerManager.get(listenerMainName + uniqueCode);
        if (!existListener) {
            const Listener = this.createProxyDispatch(listenerMainName);
            const ServiceSubName = /^NodeIKernel(.*?)Listener$/.exec(listenerMainName)![1];
            const Service = `NodeIKernel${ServiceSubName}Service/addKernel${ServiceSubName}Listener`;
            // eslint-disable-next-line
            // @ts-ignore
            this.createEventFunction(Service)(Listener as T);
            this.listenerManager.set(listenerMainName + uniqueCode, Listener);
            return Listener as T;
        }
        return existListener as T;
    }

    //统一回调清理事件
    async dispatcherListener(ListenerMainName: string, ListenerSubName: string, ...args: any[]) {
        this.EventTask.get(ListenerMainName)
            ?.get(ListenerSubName)
            ?.forEach((task, uuid) => {
                if (task.createtime + task.timeout < Date.now()) {
                    this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.delete(uuid);
                    return;
                }
                if (task?.checker?.(...args)) {
                    task.func(...args);
                }
            });
    }

    async callNoListenerEvent<
        Service extends keyof ServiceNamingMapping,
        ServiceMethod extends Exclude<keyof ServiceNamingMapping[Service], symbol>,
        // eslint-disable-next-line
        // @ts-ignore
        EventType extends (...args: any) => any = ServiceNamingMapping[Service][ServiceMethod],
    >(
        serviceAndMethod: `${Service}/${ServiceMethod}`,
        ...args: Parameters<EventType>
    ): Promise<Awaited<ReturnType<EventType>>> {
        return (this.createEventFunction(serviceAndMethod))!(...args);
    }

    async registerListen<
        Listener extends keyof ListenerNamingMapping,
        ListenerMethod extends Exclude<keyof ListenerNamingMapping[Listener], symbol>,
        // eslint-disable-next-line
        // @ts-ignore
        ListenerType extends (...args: any) => any = ListenerNamingMapping[Listener][ListenerMethod],
    >(
        listenerAndMethod: `${Listener}/${ListenerMethod}`,
        waitTimes = 1,
        timeout = 5000,
        checker: (...args: Parameters<ListenerType>) => boolean,
    ) {
        return new Promise<Parameters<ListenerType>>((resolve, reject) => {
            const ListenerNameList = listenerAndMethod.split('/');
            const ListenerMainName = ListenerNameList[0];
            const ListenerSubName = ListenerNameList[1];
            const id = randomUUID();
            let complete = 0;
            let retData: Parameters<ListenerType> | undefined = undefined;

            function sendDataCallback() {
                if (complete == 0) {
                    reject(new Error(' ListenerName:' + listenerAndMethod + ' timeout'));
                } else {
                    resolve(retData!);
                }
            }

            const timeoutRef = setTimeout(sendDataCallback, timeout);
            const eventCallback = {
                timeout: timeout,
                createtime: Date.now(),
                checker: checker,
                func: (...args: Parameters<ListenerType>) => {
                    complete++;
                    retData = args;
                    if (complete >= waitTimes) {
                        clearTimeout(timeoutRef);
                        sendDataCallback();
                    }
                },
            };
            if (!this.EventTask.get(ListenerMainName)) {
                this.EventTask.set(ListenerMainName, new Map());
            }
            if (!this.EventTask.get(ListenerMainName)?.get(ListenerSubName)) {
                this.EventTask.get(ListenerMainName)?.set(ListenerSubName, new Map());
            }
            this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.set(id, eventCallback);
            this.createListenerFunction(ListenerMainName);
        });
    }

    async callNormalEventV2<
        Service extends keyof ServiceNamingMapping,
        ServiceMethod extends Exclude<keyof ServiceNamingMapping[Service], symbol>,
        Listener extends keyof ListenerNamingMapping,
        ListenerMethod extends Exclude<keyof ListenerNamingMapping[Listener], symbol>,
        // eslint-disable-next-line
        // @ts-ignore
        EventType extends (...args: any) => any = ServiceNamingMapping[Service][ServiceMethod],
        // eslint-disable-next-line
        // @ts-ignore
        ListenerType extends (...args: any) => any = ListenerNamingMapping[Listener][ListenerMethod]
    >(
        serviceAndMethod: `${Service}/${ServiceMethod}`,
        listenerAndMethod: `${Listener}/${ListenerMethod}`,
        args: Parameters<EventType>,
        checkerEvent: (ret: Awaited<ReturnType<EventType>>) => boolean = () => true,
        checkerListener: (...args: Parameters<ListenerType>) => boolean = () => true,
        callbackTimesToWait = 1,
        timeout = 5000,
    ) {
        return new Promise<[EventRet: Awaited<ReturnType<EventType>>, ...Parameters<ListenerType>]>(
            async (resolve, reject) => {
                const id = randomUUID();
                let complete = 0;
                let retData: Parameters<ListenerType> | undefined = undefined;
                let retEvent: any = {};

                function sendDataCallback() {
                    if (complete == 0) {
                        reject(
                            new Error(
                                'Timeout: NTEvent serviceAndMethod:' +
                                serviceAndMethod +
                                ' ListenerName:' +
                                listenerAndMethod +
                                ' EventRet:\n' +
                                JSON.stringify(retEvent, null, 4) +
                                '\n',
                            ),
                        );
                    } else {
                        resolve([retEvent as Awaited<ReturnType<EventType>>, ...retData!]);
                    }
                }

                const ListenerNameList = listenerAndMethod.split('/');
                const ListenerMainName = ListenerNameList[0];
                const ListenerSubName = ListenerNameList[1];

                const timeoutRef = setTimeout(sendDataCallback, timeout);

                const eventCallback = {
                    timeout: timeout,
                    createtime: Date.now(),
                    checker: checkerListener,
                    func: (...args: any[]) => {
                        complete++;
                        retData = args as Parameters<ListenerType>;
                        if (complete >= callbackTimesToWait) {
                            clearTimeout(timeoutRef);
                            sendDataCallback();
                        }
                    },
                };
                if (!this.EventTask.get(ListenerMainName)) {
                    this.EventTask.set(ListenerMainName, new Map());
                }
                if (!this.EventTask.get(ListenerMainName)?.get(ListenerSubName)) {
                    this.EventTask.get(ListenerMainName)?.set(ListenerSubName, new Map());
                }
                this.EventTask.get(ListenerMainName)?.get(ListenerSubName)?.set(id, eventCallback);
                this.createListenerFunction(ListenerMainName);
                const eventFunction = this.createEventFunction(serviceAndMethod);
                retEvent = await eventFunction!(...(args));
                if (!checkerEvent(retEvent) && timeoutRef.hasRef()) {
                    clearTimeout(timeoutRef);
                    reject(
                        new Error(
                            'EventChecker Failed: NTEvent serviceAndMethod:' +
                            serviceAndMethod +
                            ' ListenerName:' +
                            listenerAndMethod +
                            ' EventRet:\n' +
                            JSON.stringify(retEvent, null, 4) +
                            '\n',
                        ),
                    );
                }

            },
        );
    }
}

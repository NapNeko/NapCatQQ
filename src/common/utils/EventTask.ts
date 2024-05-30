import { randomUUID } from "crypto";
export enum NTEventMode {
    Once = 1,
    Twice = 2
}
export interface NTEventType<U extends (...args: any[]) => any> {
    EventName: string,
    EventFunction: U,
    ListenerName: string,
    ListenerFunction: Function
}
interface Internal_MapKey {
    mode: NTEventMode,
    timeout: number,
    createtime: number,
    func: Function
}
export class NTEvent<T extends (...args: any[]) => any, R = any> {
    EventData: NTEventType<T>;
    EventTask: Map<string, Internal_MapKey> = new Map<string, Internal_MapKey>();
    constructor(params: NTEventType<T>) {
        params.ListenerFunction = this.DispatcherListener.bind(this);
        this.EventData = params;
        this.EventData.EventFunction = params.EventFunction.bind(this) as any;
    }
    async DispatcherListener(...args: any[]) {
        console.log(...args);
        this.EventTask.forEach((task, uuid) => {
            if (task.createtime + task.timeout > Date.now()) {
                this.EventTask.delete(uuid);
                return;
            }
            task.func(...args);
        })
    }
    async CallTwiceEvent(timeout: number = 3000, ...args: Parameters<T>) {
        return new Promise<R>((resolve, reject) => {
            const id = randomUUID();
            let complete = 0;
            let retData: R | undefined = undefined;
            let databack = () => {
                if (!complete) {
                    this.EventTask.delete(id);
                    reject(new Error('NTEvent EventName:' + this.EventData.EventName + ' EventListener:' + this.EventData.ListenerName + ' timeout'));
                } else {
                    resolve(retData as R);
                }
            }

            let Timeouter = setTimeout(databack, timeout);

            this.EventTask.set(id, {
                mode: NTEventMode.Once,
                timeout: timeout,
                createtime: Date.now(),
                func: (...args: any[]) => {
                    complete++;
                    retData = args as R;
                    if (complete == 2) {
                        clearTimeout(Timeouter);
                        databack();
                    }
                }
            });
            this.EventData.EventFunction(...args);
        });
    }

    async CallOnceEvent(timeout: number = 3000, ...args: Parameters<T>) {
        return new Promise<R>((resolve, reject) => {
            const id = randomUUID();
            let complete = false;
            let retData: R | undefined = undefined;
            let databack = () => {
                if (!complete) {
                    this.EventTask.delete(id);
                    reject(new Error('NTEvent EventName:' + this.EventData.EventName + ' EventListener:' + this.EventData.ListenerName + ' timeout'));
                } else {
                    resolve(retData as R);
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
                    retData = args as R;
                    databack();
                }
            });
            this.EventData.EventFunction(...args);
        });
    }
}


import { randomUUID } from "crypto";
export interface NTEventType {
    EventName: string,
    EventFunction: Function,
    ListenerName: string,
    ListenerFunction: Function
}
export class NTEvent<T> {
    EventData: NTEventType;
    EventTask: Map<string, Function> = new Map<string, Function>();
    constructor(params: NTEventType) {
        params.ListenerFunction = this.DispatcherListener;
        this.EventData = params;
    }
    async DispatcherListener(...args: any[]) {
        for (let task of this.EventTask.values()) {
            if (task instanceof Promise) {
                await task(...args);
            }
            task(...args);
        }
    }
    async Call(params: T & { checker?: Function }) {

    }
    async CallWaitTwice(params: T & { checker?: Function }) {

    }
    async CallWaitVoid(param: T & { checker?: Function }) {

    }
}


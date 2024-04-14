interface IDispatcherAdapter {
    dispatchRequest(arg: unknown): void;
    dispatchCall(arg: unknown): void;
    dispatchCallWithJson(arg: unknown): void;
}
export interface NodeIDispatcherAdapter extends IDispatcherAdapter {
    new (adapter: IDispatcherAdapter): NodeIDispatcherAdapter;
}
export declare class DispatcherAdapter implements IDispatcherAdapter {
    dispatchRequest(arg: unknown): void;
    dispatchCall(arg: unknown): void;
    dispatchCallWithJson(arg: unknown): void;
}
export {};

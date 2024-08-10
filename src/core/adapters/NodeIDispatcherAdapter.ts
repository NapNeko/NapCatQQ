interface IDispatcherAdapter {
    dispatchRequest(arg: unknown): void;

    dispatchCall(arg: unknown): void;

    dispatchCallWithJson(arg: unknown): void;
}

export interface NodeIDispatcherAdapter extends IDispatcherAdapter {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(adapter: IDispatcherAdapter): NodeIDispatcherAdapter;
}

export class DispatcherAdapter implements IDispatcherAdapter {
    dispatchRequest(arg: unknown) {
    }

    dispatchCall(arg: unknown) {
    }

    dispatchCallWithJson(arg: unknown) {
    }
}

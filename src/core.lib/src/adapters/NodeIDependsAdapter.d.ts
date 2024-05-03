interface IDependsAdapter {
    onMSFStatusChange(arg1: number, arg2: number): void;
    onMSFSsoError(args: unknown): void;
    getGroupCode(args: unknown): void;
}
export interface NodeIDependsAdapter extends IDependsAdapter {
    new (adapter: IDependsAdapter): NodeIDependsAdapter;
}
export declare class DependsAdapter implements IDependsAdapter {
    onMSFStatusChange(arg1: number, arg2: number): void;
    onMSFSsoError(args: unknown): void;
    getGroupCode(args: unknown): void;
}
export {};

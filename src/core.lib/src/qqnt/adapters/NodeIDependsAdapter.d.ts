interface IDependsAdapter {
    onMSFStatusChange(args: unknown): void;
    onMSFSsoError(args: unknown): void;
    getGroupCode(args: unknown): void;
}
export interface NodeIDependsAdapter extends IDependsAdapter {
    new (adapter: IDependsAdapter): NodeIDependsAdapter;
}
export declare class DependsAdapter implements IDependsAdapter {
    onMSFStatusChange(args: unknown): void;
    onMSFSsoError(args: unknown): void;
    getGroupCode(args: unknown): void;
}
export {};

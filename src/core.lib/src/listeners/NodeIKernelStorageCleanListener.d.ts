export interface IStorageCleanListener {
    onCleanCacheProgressChanged(args: unknown): void;
    onScanCacheProgressChanged(args: unknown): void;
    onCleanCacheStorageChanged(args: unknown): void;
    onFinishScan(args: unknown): void;
    onChatCleanDone(args: unknown): void;
}
export interface NodeIKernelStorageCleanListener extends IStorageCleanListener {
    new (adapter: IStorageCleanListener): NodeIKernelStorageCleanListener;
}
export declare class StorageCleanListener implements IStorageCleanListener {
    onCleanCacheProgressChanged(args: unknown): void;
    onScanCacheProgressChanged(args: unknown): void;
    onCleanCacheStorageChanged(args: unknown): void;
    onFinishScan(args: unknown): void;
    onChatCleanDone(args: unknown): void;
}

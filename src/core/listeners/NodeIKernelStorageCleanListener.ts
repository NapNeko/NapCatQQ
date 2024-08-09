export interface IStorageCleanListener {
    onCleanCacheProgressChanged(args: unknown): void;

    onScanCacheProgressChanged(args: unknown): void;

    onCleanCacheStorageChanged(args: unknown): void;

    onFinishScan(args: unknown): void;

    onChatCleanDone(args: unknown): void;

}
export interface NodeIKernelStorageCleanListener extends IStorageCleanListener {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(adapter: IStorageCleanListener): NodeIKernelStorageCleanListener;
}

export class StorageCleanListener implements IStorageCleanListener {
    onCleanCacheProgressChanged(args: unknown) {

    }

    onScanCacheProgressChanged(args: unknown) {

    }

    onCleanCacheStorageChanged(args: unknown) {

    }
    onFinishScan(args: unknown) {

    }

    onChatCleanDone(args: unknown) {

    }
}
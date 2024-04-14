export interface NodeIKernelProfileService {
    addKernelStorageCleanListener(listener: unknown): void;
    removeKernelStorageCleanListener(listenerId: unknown): void;
    addCacheScanedPaths(arg: unknown): unknown;
    addFilesScanedPaths(arg: unknown): unknown;
    scanCache(): unknown;
    addReportData(arg: unknown): unknown;
    reportData(): unknown;
    getChatCacheInfo(...args: unknown[]): unknown;
    getFileCacheInfo(...args: unknown[]): unknown;
    clearChatCacheInfo(...args: unknown[]): unknown;
    clearCacheDataByKeys(arg: unknown): unknown;
    setSilentScan(arg: unknown): unknown;
    closeCleanWindow(): unknown;
    clearAllChatCacheInfo(): unknown;
    endScan(arg: unknown): unknown;
    addNewDownloadOrUploadFile(arg: unknown): unknown;
    isNull(): boolean;
}

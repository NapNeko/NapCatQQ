export interface NodeIKernelFileAssistantService {
    addKernelFileAssistantListener(...args: unknown[]): unknown;
    removeKernelFileAssistantListener(...args: unknown[]): unknown;
    getFileAssistantList(...args: unknown[]): unknown;
    getMoreFileAssistantList(...args: unknown[]): unknown;
    getFileSessionList(...args: unknown[]): unknown;
    searchFile(...args: unknown[]): unknown;
    resetSearchFileSortType(...args: unknown[]): unknown;
    searchMoreFile(...args: unknown[]): unknown;
    cancelSearchFile(...args: unknown[]): unknown;
    downloadFile(...args: unknown[]): unknown;
    forwardFile(...args: unknown[]): unknown;
    cancelFileAction(...args: unknown[]): unknown;
    retryFileAction(...args: unknown[]): unknown;
    deleteFile(...args: unknown[]): unknown;
    saveAs(...args: unknown[]): unknown;
    saveAsWithRename(...args: unknown[]): unknown;
    isNull(): boolean;
}

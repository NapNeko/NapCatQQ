import { NodeIKernelFileAssistantListener } from '@/core';

export interface NodeIKernelFileAssistantService {
    addKernelFileAssistantListener(listener: NodeIKernelFileAssistantListener): unknown;

    removeKernelFileAssistantListener(arg1: unknown[]): unknown;

    getFileAssistantList(arg1: unknown[]): unknown;

    getMoreFileAssistantList(arg1: unknown[]): unknown;

    getFileSessionList(): unknown;

    searchFile(keywords: string[], params: { resultType: number, pageLimit: number }): unknown;

    resetSearchFileSortType(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    searchMoreFile(arg1: unknown[]): unknown;

    cancelSearchFile(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    downloadFile(fileIds: string[]): { result: number, errMsg: string };

    forwardFile(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    cancelFileAction(arg1: unknown[]): unknown;

    retryFileAction(arg1: unknown[]): unknown;

    deleteFile(arg1: unknown[]): unknown;

    saveAs(arg1: unknown, arg2: unknown): unknown;

    saveAsWithRename(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    isNull(): boolean;
}

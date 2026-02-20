import { NodeIKernelFileAssistantListener } from '@/napcat-core/index';

export interface NodeIKernelFileAssistantService {
  addKernelFileAssistantListener (listener: NodeIKernelFileAssistantListener): unknown;

  removeKernelFileAssistantListener (arg1: unknown[]): unknown;

  getFileAssistantList (arg1: unknown[]): unknown;

  getMoreFileAssistantList (arg1: unknown[]): unknown;

  getFileSessionList (): unknown;

  searchFile (keywords: string[], params: { resultType: number, pageLimit: number; }, resultId: number): number;

  resetSearchFileSortType (arg1: number, arg2: number, arg3: number): unknown;

  searchMoreFile (arg1: unknown[]): unknown;

  cancelSearchFile (arg1: number, arg2: number, arg3: string): unknown;

  downloadFile (fileIds: string[]): { result: number, errMsg: string; };

  forwardFile (arg1: unknown, arg2: unknown, arg3: unknown): unknown;

  cancelFileAction (arg1: unknown[]): unknown;

  retryFileAction (arg1: unknown[]): unknown;

  deleteFile (arg1: unknown[]): unknown;

  saveAs (arg1: unknown, arg2: unknown): unknown;

  saveAsWithRename (arg1: string, arg2: string, arg3: string): unknown;

  getFilePathCount (arg: unknown): unknown;

  updateRecentOperateForMsg (arg: unknown): unknown;

  isNull (): boolean;
}

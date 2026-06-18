export interface NodeIKernelFileBridgeClientService {
  addKernelFileBridgeClientListener (listener: unknown): number;

  removeKernelFileBridgeClientListener (listenerId: number): void;

  getPageContent (arg1: boolean, arg2: string): unknown;

  getThumbnail (arg1: boolean, arg2: string, arg3: unknown): unknown;

  searchFolderForFiles (arg1: string, arg2: string, arg3: string): unknown;

  isNull (): boolean;
}

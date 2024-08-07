import { NodeIKernelStorageCleanListener } from "@/core/listeners";
import { GeneralCallResult } from "./common";

export interface NodeIKernelStorageCleanService {

  addKernelStorageCleanListener(Listener: NodeIKernelStorageCleanListener): number;

  removeKernelStorageCleanListener(ListenerId: number): void;

  addCacheScanedPaths(arg: unknown): unknown;

  addFilesScanedPaths(arg: unknown): unknown;

  scanCache(): Promise<GeneralCallResult & {
    size: string[]
  }>;

  addReportData(arg: unknown): unknown;

  reportData(): unknown;

  getChatCacheInfo(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown): unknown;

  getFileCacheInfo(arg1: unknown, arg2: unknown, arg3: unknown, arg44: unknown, args5: unknown): unknown;

  clearChatCacheInfo(arg1: unknown, arg2: unknown): unknown;

  clearCacheDataByKeys(arg: unknown): unknown;

  setSilentScan(arg: unknown): unknown;

  closeCleanWindow(): unknown;

  clearAllChatCacheInfo(): unknown;

  endScan(arg: unknown): unknown;

  addNewDownloadOrUploadFile(arg: unknown): unknown;

  isNull(): boolean;
}

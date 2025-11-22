import { NodeIKernelStorageCleanListener } from '@/napcat-core/listeners';
import { GeneralCallResult } from './common';

export interface NodeIKernelStorageCleanService {

  addKernelStorageCleanListener (listener: NodeIKernelStorageCleanListener): number;

  removeKernelStorageCleanListener (listenerId: number): void;
  // [
  // "hotUpdate",
  // [
  //   "C:\\Users\\nanaeo\\AppData\\Roaming\\QQ\\packages"
  // ]
  // ],
  // [
  // "tmp",
  // [
  //   "C:\\Users\\nanaeo\\AppData\\Roaming\\QQ\\tmp"
  // ]
  // ],
  // [
  // "SilentCacheappSessionPartation9212",
  // [
  //   "C:\\Users\\nanaeo\\AppData\\Roaming\\QQ\\Partitions\\qqnt_9212"
  // ]
  // ]
  addCacheScanedPaths (paths: Map<`tmp` | `SilentCacheappSessionPartation9212` | `hotUpdate`, unknown>): unknown;

  addFilesScanedPaths (arg: unknown): unknown;

  scanCache (): Promise<GeneralCallResult & {
    size: string[];
  }>;

  addReportData (arg: unknown): unknown;

  reportData (): unknown;

  getChatCacheInfo (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown): unknown;

  getFileCacheInfo (arg1: unknown, arg2: unknown, arg3: unknown, arg44: unknown, args5: unknown): unknown;

  clearChatCacheInfo (arg1: unknown, arg2: unknown): unknown;

  clearCacheDataByKeys (keys: Array<string>): Promise<GeneralCallResult>;

  setSilentScan (is_silent: boolean): unknown;

  closeCleanWindow (): unknown;

  clearAllChatCacheInfo (): unknown;

  endScan (arg: unknown): unknown;

  addNewDownloadOrUploadFile (arg: unknown): unknown;

  isNull (): boolean;
}

export interface NodeIKernelMsgBackupService {
  addKernelMsgBackupListener (listener: unknown): number;

  removeKernelMsgBackupListener (listenerId: number): void;

  getMsgBackupLocation (): unknown;// needs 0 arguments

  setMsgBackupLocation (arg: unknown): unknown;// needs 1 arguments

  requestMsgBackup (): unknown;// needs 0 arguments

  requestMsgRestore (arg: unknown): unknown;// needs 1 arguments

  requestMsgMigrate (arg: unknown): unknown;// needs 1 arguments

  getLocalStorageBackup (): unknown;// needs 0 arguments

  deleteLocalBackup (arg: unknown): unknown;// needs 1 arguments

  clearCache (): unknown;// needs 0 arguments

  start (arg: unknown): unknown;// needs 1 arguments

  stop (arg: unknown): unknown;// needs 1 arguments

  pause (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments
}

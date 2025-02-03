export interface NodeIKernelMsgBackupService {
    addKernelMsgBackupListener(listener: unknown): number;

    removeKernelMsgBackupListener(listenerId: number): void;

    getMsgBackupLocation(...args: unknown[]): unknown;// needs 0 arguments

    setMsgBackupLocation(...args: unknown[]): unknown;// needs 1 arguments

    requestMsgBackup(...args: unknown[]): unknown;// needs 0 arguments

    requestMsgRestore(...args: unknown[]): unknown;// needs 1 arguments

    requestMsgMigrate(...args: unknown[]): unknown;// needs 1 arguments

    getLocalStorageBackup(...args: unknown[]): unknown;// needs 0 arguments

    deleteLocalBackup(...args: unknown[]): unknown;// needs 1 arguments

    clearCache(...args: unknown[]): unknown;// needs 0 arguments

    start(...args: unknown[]): unknown;// needs 1 arguments

    stop(...args: unknown[]): unknown;// needs 1 arguments

    pause(...args: unknown[]): unknown;// needs 2 arguments
}

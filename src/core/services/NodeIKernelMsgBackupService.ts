export interface NodeIKernelMsgBackupService {
    addKernelMsgBackupListener(listener: unknown): number;

    removeKernelMsgBackupListener(listenerId: number): void;

    getMsgBackupLocation(...args: any[]): unknown;// needs 0 arguments

    setMsgBackupLocation(...args: any[]): unknown;// needs 1 arguments

    requestMsgBackup(...args: any[]): unknown;// needs 0 arguments

    requestMsgRestore(...args: any[]): unknown;// needs 1 arguments

    requestMsgMigrate(...args: any[]): unknown;// needs 1 arguments

    getLocalStorageBackup(...args: any[]): unknown;// needs 0 arguments

    deleteLocalBackup(...args: any[]): unknown;// needs 1 arguments

    clearCache(...args: any[]): unknown;// needs 0 arguments

    start(...args: any[]): unknown;// needs 1 arguments

    stop(...args: any[]): unknown;// needs 1 arguments

    pause(...args: any[]): unknown;// needs 2 arguments
}

export interface NodeIKernelMsgBackupService {
    addKernelMsgBackupListener(...args: any[]): unknown;
    removeKernelMsgBackupListener(...args: any[]): unknown;
    getMsgBackupLocation(...args: any[]): unknown;
    setMsgBackupLocation(...args: any[]): unknown;
    requestMsgBackup(...args: any[]): unknown;
    requestMsgRestore(...args: any[]): unknown;
    requestMsgMigrate(...args: any[]): unknown;
    getLocalStorageBackup(...args: any[]): unknown;
    deleteLocalBackup(...args: any[]): unknown;
    clearCache(...args: any[]): unknown;
    start(...args: any[]): unknown;
    stop(...args: any[]): unknown;
    pause(...args: any[]): unknown;
}

interface NodeIKernelDbToolsService {
    depositDatabase: (...args: unknown[]) => void;
    backupDatabase: (...args: unknown[]) => void;
    retrieveDatabase: (...args: unknown[]) => void;
}

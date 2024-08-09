export interface NodeIKernelUixConvertService {
    getUin(uid: string[]): Promise<{ uinInfo: Map<string, string> }>;

    getUid(uin: string[]): Promise<{ uidInfo: Map<string, string> }>;
}
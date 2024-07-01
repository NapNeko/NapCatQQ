export interface NodeIKernelUixConvertService {
    getUin(uid: string[]): Promise<{ uidInfo: Map<string, string> }>;

    getUid(uin: string[]): Promise<{ uinInfo: Map<string, string> }>;
}
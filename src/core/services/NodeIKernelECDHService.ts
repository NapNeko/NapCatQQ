export interface NodeIKernelECDHService {
    sendOIDBECRequest: (data: Uint8Array) => Promise<Uint8Array>;
}

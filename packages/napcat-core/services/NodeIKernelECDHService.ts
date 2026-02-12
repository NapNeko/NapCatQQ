export interface NodeIKernelECDHService {
  sendOIDBECRequest: (data: Uint8Array) => Promise<Uint8Array>;

  init (): unknown;

  setIsDebug (isDebug: boolean): unknown;

  setGuid (guid: string): unknown;

  sendOIDBRequest (cmd: number, serviceType: number, subCmd: number, data: string, extraData: unknown): Promise<unknown>;

  sendSSORequest (cmd: string, serviceType: number, data: string, extraData: unknown): Promise<unknown>;
}

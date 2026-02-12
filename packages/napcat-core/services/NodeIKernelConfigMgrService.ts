export interface NodeIKernelConfigMgrService {
  addKernelConfigMgrListener (listener: unknown): number;

  removeKernelConfigMgrListener (listenerId: number): void;

  isNull (): boolean;
}

export interface NodeIKernelMiniAppService {
  addKernelMiniAppListener (listener: unknown): number;

  removeKernelMiniAppListener (listenerId: number): void;

  isNull (): boolean;
}

export interface NodeIKernelFileBridgeHostService {
  addKernelFileBridgeHostListener (listener: unknown): number;

  removeKernelFileBridgeHostListener (listenerId: number): void;

  isNull (): boolean;
}

export interface NodeIKernelLockService {
  addKernelLockListener (listener: unknown): number;

  removeKernelLockListener (listenerId: number): void;

  isNull (): boolean;
}

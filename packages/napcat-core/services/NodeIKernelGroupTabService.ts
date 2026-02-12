export interface NodeIKernelGroupTabService {
  addListener (listener: unknown): number;

  removeListener (listenerId: number): void;

  getGroupTab (arg1: unknown, arg2: unknown): unknown;

  isNull (): boolean;
}

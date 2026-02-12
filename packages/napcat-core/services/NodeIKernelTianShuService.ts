export interface NodeIKernelTianShuService {
  addKernelTianShuListener (listener: unknown): number;

  removeKernelTianShuListener (listenerId: number): void;

  reportTianShuNumeralRed (arg: unknown): unknown;// needs 1 arguments

}

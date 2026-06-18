export interface NodeIKernelBdhUploadService {
  addKernelBdhUploadListener (listener: unknown): number;

  removeKernelBdhUploadListener (listenerId: number): void;

  setBdhTestEnv (arg1: string, arg2: number): unknown;

  isNull (): boolean;
}

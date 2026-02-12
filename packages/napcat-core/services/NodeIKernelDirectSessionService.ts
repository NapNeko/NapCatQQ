export interface NodeIKernelDirectSessionService {
  addKernelDirectSessionListener (listener: unknown): number;

  removeKernelDirectSessionListener (listenerId: number): void;

  isNull (): boolean;
}

export interface NodeIKernelRemotingService {
  addKernelRemotingListener (listener: unknown): number;

  removeKernelRemotingListener (listenerId: number): void;

  accept (arg1: string, arg2: boolean): unknown;

  setPenetrateBuffer (arg1: number, arg2: number, arg3: string): unknown;

  startRemotingClient (arg: unknown): unknown;

  startRemotingInvite (arg: unknown): unknown;

  stopRemoting (arg: unknown): unknown;

  isNull (): boolean;
}

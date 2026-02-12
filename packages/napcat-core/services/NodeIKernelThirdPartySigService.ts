export interface NodeIKernelThirdPartySigService {
  addOnSigChangeListener (listener: unknown): number;

  removeSigChangeListener (listenerId: number): void;

  initConfig (arg: unknown): unknown;

  delThirdPartySigByUin (arg: unknown): unknown;

  getOpenIDByUin (arg1: string, arg2: number, arg3: string): unknown;

  getPT4tokenByUin (arg1: string, arg2: number, arg3: Array<unknown>[]): unknown;

  getThirdPartySigByUin (arg1: string, arg2: number, arg3: number, arg4: number, arg5: string, arg6: string): unknown;

  isNull (): boolean;
}

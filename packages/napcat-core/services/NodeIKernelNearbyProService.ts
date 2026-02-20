export interface NodeIKernelNearbyProService {
  addKernelNearbyProListener (listener: unknown): number;

  removeKernelNearbyProListener (listenerId: number): void;

  fetchNearbyProUserInfo (arg1: unknown[], arg2: unknown, arg3: boolean): unknown;

  setCommonExtInfo (arg: unknown): unknown;

  isNull (): boolean;
}

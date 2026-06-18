export interface NodeIKernelQQPlayService {
  addKernelQQPlayListener (listener: unknown): number;

  removeKernelQQPlayListener (listenerId: number): void;

  createLnkShortcut (arg1: string, arg2: string, arg3: string, arg4: string): unknown;

  getSystemRegValue (arg1: number, arg2: string, arg3: string): unknown;

  setSystemRegValue (arg1: number, arg2: string, arg3: string, arg4: string): unknown;

  sendMsg2Simulator (arg1: unknown, arg2: unknown): unknown;

  setForegroundWindow (arg: unknown): unknown;

  startSimulator (arg: unknown): unknown;

  isNull (): boolean;
}

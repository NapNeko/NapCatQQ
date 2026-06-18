export interface NodeIKernelHandOffService {
  addKernelHandOffListener (listener: unknown): number;

  removeKernelHandOffListener (listenerId: number): void;

  changeHandOffActivities (arg: unknown): unknown;

  deleteRecentHandOffActivities (arg: unknown): unknown;

  getHandOffActivities (arg: unknown): unknown;

  sendCapsulePanelActivities (arg1: string, arg2: unknown): unknown;

  isNull (): boolean;
}

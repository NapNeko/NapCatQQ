export interface NodeIKernelQiDianService {
  addKernelQiDianListener (listener: unknown): number;

  removeKernelQiDianListener (listenerId: number): void;

  requestExtUinForRemoteControl (arg1: string, arg2: string, arg3: number): unknown;

  requestMainUinForRemoteControl (arg: unknown): unknown;

  requestNaviConfig (arg: unknown): unknown;

  requestQidianUidFromUin (arg: unknown): unknown;

  requestWpaCorpInfo (arg: unknown): unknown;

  requestWpaSigT (arg1: unknown, arg2: unknown): unknown;

  requestWpaUserInfo (arg: unknown): unknown;

  isNull (): boolean;
}

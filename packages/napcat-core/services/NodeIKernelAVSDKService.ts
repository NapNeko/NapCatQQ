export interface NodeIKernelAVSDKService {
  addKernelAVSDKListener (listener: unknown): number;

  removeKernelAVSDKListener (listenerId: number): void;

  isNull (): boolean;
}

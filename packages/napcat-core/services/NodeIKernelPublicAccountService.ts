export interface NodeIKernelPublicAccountService {
  addListener (listener: unknown): number;

  removeListener (listenerId: number): void;

  follow (arg: unknown): unknown;

  queryTemplateInfo (arg: unknown): unknown;

  subscribeTemplate (arg: unknown): unknown;

  unfollow (arg: unknown): unknown;

  isNull (): boolean;
}

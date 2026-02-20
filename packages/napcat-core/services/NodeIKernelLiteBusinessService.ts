export interface NodeIKernelLiteBusinessService {
  addListener (listener: unknown): number;

  removeListener (listenerId: number): void;

  clearLiteBusiness (arg1: string, arg2: unknown): unknown;

  clickLiteAction (arg1: unknown, arg2: unknown): unknown;

  exposeLiteAction (arg1: unknown, arg2: unknown): unknown;

  getLiteBusiness (arg1: string, arg2: unknown): unknown;

  getRevealTofuAuthority (arg: unknown): unknown;

  recentRevealExposure (arg: unknown): unknown;

  isNull (): boolean;
}

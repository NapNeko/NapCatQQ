export interface NodeIKernelUnitedConfigService {

  addKernelUnitedConfigListener (listener: unknown): number;

  removeKernelUnitedConfigListener (listenerId: number): void;

  fetchUnitedSwitchConfig (configIds: string[]): void;

  isUnitedConfigSwitchOn (configId: string): boolean;

  registerUnitedConfigPushGroupList (groupList: string[]): void;

  fetchUnitedCommendConfig (ids: string[]): void;

  loadUnitedConfig (id: string): Promise<unknown>;

}

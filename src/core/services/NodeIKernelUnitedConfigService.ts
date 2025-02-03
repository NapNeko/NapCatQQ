export interface NodeIKernelUnitedConfigService {

    addKernelUnitedConfigListener(listener:unknown): number;

    removeKernelUnitedConfigListener(listenerId:number): void;

    fetchUnitedSwitchConfig(...args: unknown[]): unknown;// needs 1 arguments

    isUnitedConfigSwitchOn(...args: unknown[]): unknown;// needs 1 arguments

    registerUnitedConfigPushGroupList(...args: unknown[]): unknown;// needs 1 arguments

    fetchUnitedCommendConfig(ids: `${string}`[]): void

    loadUnitedConfig(id: string): Promise<unknown>

}

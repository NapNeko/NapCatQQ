export interface NodeIKernelUnitedConfigService {

    addKernelUnitedConfigListener(listener:unknown): number;

    removeKernelUnitedConfigListener(listenerId:number): void;

    fetchUnitedSwitchConfig(...args: any[]): unknown;// needs 1 arguments

    isUnitedConfigSwitchOn(...args: any[]): unknown;// needs 1 arguments

    registerUnitedConfigPushGroupList(...args: any[]): unknown;// needs 1 arguments

    fetchUnitedCommendConfig(ids: `${string}`[]): void

    loadUnitedConfig(id: string): Promise<unknown>

}

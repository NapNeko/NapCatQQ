export interface NodeIKernelUnitedConfigService {

    addKernelUnitedConfigListener(listener:unknown): number;

    removeKernelUnitedConfigListener(listenerId:number): void;

    fetchUnitedCommendConfig(...args: any[]): unknown;// needs 1 arguments

    fetchUnitedSwitchConfig(...args: any[]): unknown;// needs 1 arguments

    loadUnitedConfig(...args: any[]): unknown;// needs 1 arguments

    isUnitedConfigSwitchOn(...args: any[]): unknown;// needs 1 arguments

    registerUnitedConfigPushGroupList(...args: any[]): unknown;// needs 1 arguments

}

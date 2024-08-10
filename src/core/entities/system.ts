import { SelfInfo } from './user';

export interface LineDevice {
    instanceId: number;
    clientType: number;
    devUid: string;
}

export interface OBLineDevice {
    app_id: string;
    device_name: string;
    device_kind: string;
}

export interface CoreCache {
    selfInfo: SelfInfo,
    DeviceList: OBLineDevice[]
}

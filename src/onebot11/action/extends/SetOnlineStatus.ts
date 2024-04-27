import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '../../../common/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
// 设置在线状态
interface Payload {
    status: number;
    extStatus: number;
    batteryStatus: number;
}
export class SetOnlineStatus extends BaseAction<Payload, null> {
    actionName = ActionName.SetOnlineStatus;

    protected async _handle(payload: Payload) {
        // 可设置状态
        // { status: 10, extStatus: 1027, batteryStatus: 0 }
        // { status: 30, extStatus: 0, batteryStatus: 0 }
        // { status: 50, extStatus: 0, batteryStatus: 0 }
        // { status: 60, extStatus: 0, batteryStatus: 0 }
        // { status: 70, extStatus: 0, batteryStatus: 0 }
        let ret = await NTQQUserApi.setSelfOnlineStatus(payload.status, payload.extStatus, payload.batteryStatus);
        if (ret.result !== 0) {
            throw new Error("设置在线状态失败");
        }
        return null;
    }
}

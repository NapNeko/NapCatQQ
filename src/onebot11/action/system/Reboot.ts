import { rebootWithQuickLogin } from '@/common/utils/reboot';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { selfInfo } from '@/core/data';

interface Payload {
    delay: number
}

export default class Reboot extends BaseAction<Payload, null> {
    actionName = ActionName.Reboot;

    protected async _handle(payload: Payload): Promise<null> {
        if (payload.delay) {
            setTimeout(() => {
                rebootWithQuickLogin(selfInfo.uin);
            }, payload.delay);
        } else {
            rebootWithQuickLogin(selfInfo.uin);
        }
        return null;
    }
}

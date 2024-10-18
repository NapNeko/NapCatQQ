import BaseAction from '../BaseAction';
import {ActionName, BaseCheckResult} from '../types';


export abstract class GetPacketStatusDepends<PT, RT> extends BaseAction<PT, RT> {
    actionName = ActionName.GetPacketStatus;

    protected async check(): Promise<BaseCheckResult>{
        if (!this.core.apis.PacketApi.available) {
            return {
                valid: false,
                message: "PacketClient is not available!",
            }
        }
        return {
            valid: true,
        }
    }
}

export class GetPacketStatus extends GetPacketStatusDepends<any, null> {
    async _handle(payload: any) {
        return null
    }
}

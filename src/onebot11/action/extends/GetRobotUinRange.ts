import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '../../../common/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
export class GetRobotUinRange extends BaseAction<void, Array<any>> {
    actionName = ActionName.GetRobotUinRange;

    protected async _handle(payload: void) {
       // console.log(await NTQQUserApi.getRobotUinRange());
        return await NTQQUserApi.getRobotUinRange();
    }
}

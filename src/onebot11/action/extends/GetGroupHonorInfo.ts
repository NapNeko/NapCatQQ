import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi, WebApi } from '@/core/apis';
interface Payload {
    groud_id: string
}
export class GetGroupHonorInfo extends BaseAction<Payload, Array<any>> {
  actionName = ActionName.GetGroupHonorInfo;

  protected async _handle(payload: Payload) {
    // console.log(await NTQQUserApi.getRobotUinRange());
    return await WebApi.getGroupHonorInfo(payload.groud_id);
  }
}

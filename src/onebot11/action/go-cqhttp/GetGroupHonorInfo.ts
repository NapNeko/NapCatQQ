import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi, WebApi, WebHonorType } from '@/core/apis';
interface Payload {
  group_id: number,
  type?: WebHonorType
}
export class GetGroupHonorInfo extends BaseAction<Payload, Array<any>> {
  actionName = ActionName.GetGroupHonorInfo;

  protected async _handle(payload: Payload) {
    // console.log(await NTQQUserApi.getRobotUinRange());
    if (!payload.group_id) {
      throw '缺少参数group_id';
    }
    if (!payload.type) {
      payload.type = WebHonorType.ALL;
    }
    return await WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
  }
}

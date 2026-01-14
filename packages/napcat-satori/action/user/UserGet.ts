import { SatoriAction } from '../SatoriAction';
import { SatoriUser } from '../../types';

interface UserGetPayload {
  user_id: string;
}

export class UserGetAction extends SatoriAction<UserGetPayload, SatoriUser> {
  actionName = 'user.get';

  async handle (payload: UserGetPayload): Promise<SatoriUser> {
    const { user_id } = payload;

    const uid = await this.core.apis.UserApi.getUidByUinV2(user_id);
    const userInfo = await this.core.apis.UserApi.getUserDetailInfo(uid, false);

    return {
      id: user_id,
      name: userInfo.nick,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${user_id}&s=640`,
    };
  }
}

import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriUser } from '../../types';

const SchemaData = Type.Object({
  user_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class UserGetAction extends SatoriAction<Payload, SatoriUser> {
  actionName = SatoriActionName.UserGet;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriUser> {
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

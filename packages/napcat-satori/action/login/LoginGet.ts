import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriLogin, SatoriLoginStatus } from '../../types';

const SchemaData = Type.Object({});

type Payload = Static<typeof SchemaData>;

export class LoginGetAction extends SatoriAction<Payload, SatoriLogin> {
  actionName = SatoriActionName.LoginGet;
  override payloadSchema = SchemaData;

  protected async _handle (_payload: Payload): Promise<SatoriLogin> {
    return {
      user: {
        id: this.selfInfo.uin,
        name: this.selfInfo.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.selfInfo.uin}&s=640`,
      },
      self_id: this.selfInfo.uin,
      platform: this.platform,
      status: SatoriLoginStatus.ONLINE,
    };
  }
}

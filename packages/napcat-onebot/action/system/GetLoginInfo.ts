import { OB11User } from '@/napcat-onebot/index';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11UserSchema } from '../schemas';
import { Type } from '@sinclair/typebox';

class GetLoginInfo extends OneBotAction<void, OB11User> {
  override actionName = ActionName.GetLoginInfo;
  override payloadSchema = Type.Object({});
  override returnSchema = OB11UserSchema;

  async _handle () {
    return OB11Construct.selfInfo(this.core.selfInfo);
  }
}

export default GetLoginInfo;

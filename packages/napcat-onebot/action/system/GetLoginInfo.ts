import { OB11User } from '@/napcat-onebot/index';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11UserSchema } from '../schemas';
import { Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

class GetLoginInfo extends OneBotAction<void, OB11User> {
  override actionName = ActionName.GetLoginInfo;
  override payloadSchema = Type.Object({});
  override returnSchema = OB11UserSchema;
  override actionSummary = '获取登录号信息';
  override actionDescription = '获取当前登录帐号的信息';
  override actionTags = ['系统接口'];
  override payloadExample = ActionExamples.GetLoginInfo.payload;
  override returnExample = ActionExamples.GetLoginInfo.return;

  async _handle () {
    return OB11Construct.selfInfo(this.core.selfInfo);
  }
}

export default GetLoginInfo;

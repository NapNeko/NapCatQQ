import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11GroupSchema } from '../schemas';

const PayloadSchema = Type.Object({
  no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否不使用缓存' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(OB11GroupSchema, { description: '群列表' });

type ReturnType = Static<typeof ReturnSchema>;

class GetGroupList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return OB11Construct.groups(
      await this.core.apis.GroupApi.getGroups(
        typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache));
  }
}

export default GetGroupList;

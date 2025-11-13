import { OB11Group } from '@/napcat-onebot/index';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

class GetGroupList extends OneBotAction<Payload, OB11Group[]> {
  override actionName = ActionName.GetGroupList;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    return OB11Construct.groups(
      await this.core.apis.GroupApi.getGroups(
        typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache));
  }
}

export default GetGroupList;

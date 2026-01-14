import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriGuild, SatoriPageResult } from '../../types';

const SchemaData = Type.Object({
  next: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class GuildListAction extends SatoriAction<Payload, SatoriPageResult<SatoriGuild>> {
  actionName = SatoriActionName.GuildList;
  override payloadSchema = SchemaData;

  protected async _handle (_payload: Payload): Promise<SatoriPageResult<SatoriGuild>> {
    const groups = await this.core.apis.GroupApi.getGroups(true);

    const guilds: SatoriGuild[] = groups.map((group) => ({
      id: group.groupCode,
      name: group.groupName,
      avatar: `https://p.qlogo.cn/gh/${group.groupCode}/${group.groupCode}/640`,
    }));

    return {
      data: guilds,
    };
  }
}

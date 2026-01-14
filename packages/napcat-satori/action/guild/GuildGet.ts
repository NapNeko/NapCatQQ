import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriGuild } from '../../types';

const SchemaData = Type.Object({
  guild_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GuildGetAction extends SatoriAction<Payload, SatoriGuild> {
  actionName = SatoriActionName.GuildGet;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriGuild> {
    const { guild_id } = payload;

    // 先从群列表缓存中查找
    const groups = await this.core.apis.GroupApi.getGroups();
    const group = groups.find((e) => e.groupCode === guild_id);

    if (!group) {
      // 如果缓存中没有，尝试获取详细信息
      const data = await this.core.apis.GroupApi.fetchGroupDetail(guild_id);
      return {
        id: guild_id,
        name: data.groupName,
        avatar: `https://p.qlogo.cn/gh/${guild_id}/${guild_id}/640`,
      };
    }

    return {
      id: guild_id,
      name: group.groupName,
      avatar: `https://p.qlogo.cn/gh/${guild_id}/${guild_id}/640`,
    };
  }
}

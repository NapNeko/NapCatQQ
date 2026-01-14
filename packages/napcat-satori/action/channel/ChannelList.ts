import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriChannel, SatoriChannelType, SatoriPageResult } from '../../types';

const SchemaData = Type.Object({
  guild_id: Type.String(),
  next: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class ChannelListAction extends SatoriAction<Payload, SatoriPageResult<SatoriChannel>> {
  actionName = SatoriActionName.ChannelList;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriPageResult<SatoriChannel>> {
    const { guild_id } = payload;

    // 在 QQ 中，群组只有一个文本频道
    // 先从群列表缓存中查找
    const groups = await this.core.apis.GroupApi.getGroups();
    const group = groups.find((e) => e.groupCode === guild_id);
    let groupName: string;

    if (!group) {
      // 如果缓存中没有，尝试获取详细信息
      const data = await this.core.apis.GroupApi.fetchGroupDetail(guild_id);
      groupName = data.groupName;
    } else {
      groupName = group.groupName;
    }

    const channel: SatoriChannel = {
      id: `group:${guild_id}`,
      type: SatoriChannelType.TEXT,
      name: groupName,
    };

    return {
      data: [channel],
    };
  }
}

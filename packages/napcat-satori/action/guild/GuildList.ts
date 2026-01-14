import { SatoriAction } from '../SatoriAction';
import { SatoriGuild, SatoriPageResult } from '@/napcat-satori/types';

interface GuildListPayload {
  next?: string;
}

export class GuildListAction extends SatoriAction<GuildListPayload, SatoriPageResult<SatoriGuild>> {
  actionName = 'guild.list';

  async handle (_payload: GuildListPayload): Promise<SatoriPageResult<SatoriGuild>> {
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

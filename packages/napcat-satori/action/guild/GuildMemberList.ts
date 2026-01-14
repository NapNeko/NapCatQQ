import { SatoriAction } from '../SatoriAction';
import { SatoriGuildMember, SatoriPageResult } from '../../types';
import { GroupMember } from 'napcat-core';

interface GuildMemberListPayload {
  guild_id: string;
  next?: string;
}

export class GuildMemberListAction extends SatoriAction<GuildMemberListPayload, SatoriPageResult<SatoriGuildMember>> {
  actionName = 'guild.member.list';

  async handle (payload: GuildMemberListPayload): Promise<SatoriPageResult<SatoriGuildMember>> {
    const { guild_id } = payload;

    // 使用 getGroupMemberAll 获取所有群成员
    const result = await this.core.apis.GroupApi.getGroupMemberAll(guild_id, true);
    const members: Map<string, GroupMember> = result.result.infos;

    const memberList: SatoriGuildMember[] = Array.from(members.values()).map((member: GroupMember) => ({
      user: {
        id: member.uin,
        name: member.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${member.uin}&s=640`,
      },
      nick: member.cardName || member.nick,
      joined_at: member.joinTime ? Number(member.joinTime) * 1000 : undefined,
    }));

    return {
      data: memberList,
    };
  }
}

import { SatoriAction } from '../SatoriAction';
import { SatoriGuildMember } from '@/napcat-satori/types';

interface GuildMemberGetPayload {
  guild_id: string;
  user_id: string;
}

export class GuildMemberGetAction extends SatoriAction<GuildMemberGetPayload, SatoriGuildMember> {
  actionName = 'guild.member.get';

  async handle (payload: GuildMemberGetPayload): Promise<SatoriGuildMember> {
    const { guild_id, user_id } = payload;

    const memberInfo = await this.core.apis.GroupApi.getGroupMember(guild_id, user_id);

    if (!memberInfo) {
      throw new Error('群成员不存在');
    }

    return {
      user: {
        id: memberInfo.uin,
        name: memberInfo.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${memberInfo.uin}&s=640`,
      },
      nick: memberInfo.cardName || memberInfo.nick,
      joined_at: memberInfo.joinTime ? memberInfo.joinTime * 1000 : undefined,
    };
  }
}

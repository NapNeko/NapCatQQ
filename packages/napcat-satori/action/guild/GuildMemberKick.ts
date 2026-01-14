import { SatoriAction } from '../SatoriAction';

interface GuildMemberKickPayload {
  guild_id: string;
  user_id: string;
  permanent?: boolean;
}

export class GuildMemberKickAction extends SatoriAction<GuildMemberKickPayload, void> {
  actionName = 'guild.member.kick';

  async handle (payload: GuildMemberKickPayload): Promise<void> {
    const { guild_id, user_id, permanent } = payload;

    await this.core.apis.GroupApi.kickMember(
      guild_id,
      [await this.core.apis.UserApi.getUidByUinV2(user_id)],
      permanent ?? false,
      ''
    );
  }
}

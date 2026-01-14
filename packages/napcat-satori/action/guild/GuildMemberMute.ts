import { SatoriAction } from '../SatoriAction';

interface GuildMemberMutePayload {
  guild_id: string;
  user_id: string;
  duration?: number; // 禁言时长（毫秒），0 表示解除禁言
}

export class GuildMemberMuteAction extends SatoriAction<GuildMemberMutePayload, void> {
  actionName = 'guild.member.mute';

  async handle (payload: GuildMemberMutePayload): Promise<void> {
    const { guild_id, user_id, duration } = payload;

    // 将毫秒转换为秒
    const durationSeconds = duration ? Math.floor(duration / 1000) : 0;

    await this.core.apis.GroupApi.banMember(
      guild_id,
      [{ uid: await this.core.apis.UserApi.getUidByUinV2(user_id), timeStamp: durationSeconds }]
    );
  }
}

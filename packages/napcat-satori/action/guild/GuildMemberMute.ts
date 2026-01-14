import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';

const SchemaData = Type.Object({
  guild_id: Type.String(),
  user_id: Type.String(),
  duration: Type.Optional(Type.Number({ default: 0 })), // 禁言时长（毫秒），0 表示解除禁言
});

type Payload = Static<typeof SchemaData>;

export class GuildMemberMuteAction extends SatoriAction<Payload, void> {
  actionName = SatoriActionName.GuildMemberMute;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<void> {
    const { guild_id, user_id, duration } = payload;

    // 将毫秒转换为秒
    const durationSeconds = duration ? Math.floor(duration / 1000) : 0;

    await this.core.apis.GroupApi.banMember(
      guild_id,
      [{ uid: await this.core.apis.UserApi.getUidByUinV2(user_id), timeStamp: durationSeconds }]
    );
  }
}

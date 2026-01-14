import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';

const SchemaData = Type.Object({
  guild_id: Type.String(),
  user_id: Type.String(),
  permanent: Type.Optional(Type.Boolean({ default: false })),
});

type Payload = Static<typeof SchemaData>;

export class GuildMemberKickAction extends SatoriAction<Payload, void> {
  actionName = SatoriActionName.GuildMemberKick;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<void> {
    const { guild_id, user_id, permanent } = payload;

    await this.core.apis.GroupApi.kickMember(
      guild_id,
      [await this.core.apis.UserApi.getUidByUinV2(user_id)],
      permanent ?? false,
      ''
    );
  }
}

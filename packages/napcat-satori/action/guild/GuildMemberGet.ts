import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriGuildMember } from '../../types';

const SchemaData = Type.Object({
  guild_id: Type.String(),
  user_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GuildMemberGetAction extends SatoriAction<Payload, SatoriGuildMember> {
  actionName = SatoriActionName.GuildMemberGet;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriGuildMember> {
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
      joined_at: memberInfo.joinTime ? Number(memberInfo.joinTime) * 1000 : undefined,
    };
  }
}

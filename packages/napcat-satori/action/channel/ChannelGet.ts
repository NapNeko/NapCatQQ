import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriChannel, SatoriChannelType } from '../../types';

const SchemaData = Type.Object({
  channel_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class ChannelGetAction extends SatoriAction<Payload, SatoriChannel> {
  actionName = SatoriActionName.ChannelGet;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriChannel> {
    const { channel_id } = payload;

    const parts = channel_id.split(':');
    const type = parts[0];
    const id = parts[1];

    if (!type || !id) {
      throw new Error(`无效的频道ID格式: ${channel_id}`);
    }

    if (type === 'private') {
      const uid = await this.core.apis.UserApi.getUidByUinV2(id);
      const userInfo = await this.core.apis.UserApi.getUserDetailInfo(uid, false);

      return {
        id: channel_id,
        type: SatoriChannelType.DIRECT,
        name: userInfo.nick || id,
      };
    } else if (type === 'group') {
      // 先从群列表缓存中查找
      const groups = await this.core.apis.GroupApi.getGroups();
      const group = groups.find((e) => e.groupCode === id);

      if (!group) {
        // 如果缓存中没有，尝试获取详细信息
        const data = await this.core.apis.GroupApi.fetchGroupDetail(id);
        return {
          id: channel_id,
          type: SatoriChannelType.TEXT,
          name: data.groupName,
        };
      }

      return {
        id: channel_id,
        type: SatoriChannelType.TEXT,
        name: group.groupName,
      };
    }

    throw new Error(`不支持的频道类型: ${type}`);
  }
}

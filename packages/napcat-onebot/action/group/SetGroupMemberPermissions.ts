import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';
import { assertGroupManagementResults } from './GroupOperationHelpers';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  allow_member_upload_album: Type.Optional(Type.Boolean({ description: '允许成员上传群相册' })),
  allow_member_temporary_session: Type.Optional(Type.Boolean({ description: '允许成员发起临时会话' })),
  allow_member_create_group: Type.Optional(Type.Boolean({ description: '允许成员发起新的群聊' })),
});
type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });
type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupMemberPermissions extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupMemberPermissions;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群成员功能权限';
  override actionDescription = '设置群成员上传相册、发起临时会话和发起新群聊的权限；未传入的项目保持不变';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupMemberPermissions.payload;
  override returnExample = GroupActionsExamples.SetGroupMemberPermissions.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const permissions = {
      allowMemberUploadAlbum: payload.allow_member_upload_album,
      allowMemberTemporarySession: payload.allow_member_temporary_session,
      allowMemberCreateGroup: payload.allow_member_create_group,
    };
    if (Object.values(permissions).every(value => value === undefined)) {
      throw new Error('至少需要提供一个群成员功能权限');
    }

    const results = await this.core.apis.GroupApi.setGroupMemberPermissions(payload.group_id, permissions);
    assertGroupManagementResults('设置群成员功能权限', results);
    return null;
  }
}

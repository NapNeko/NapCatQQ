import { describe, expect, test } from 'vitest';
import {
  applyGroupManagementSettings,
  createGroupDetailInfoV2Param,
  createGroupManagementRequests,
} from '../napcat-core/data/group';
import { assertGroupManagementResults } from '../napcat-onebot/action/group/GroupOperationHelpers';

describe('NTQQ group operations', () => {
  test('reports the exact native setting that failed', () => {
    expect(() => assertGroupManagementResults('设置群成员功能权限', [{
      setting: 'allow_member_create_group',
      result: { result: 1006, errMsg: '未知错误' },
    }])).toThrow(/allow_member_create_group.*1006.*未知错误/);
    expect(() => assertGroupManagementResults('设置群成员功能权限', []))
      .not.toThrow();
  });

  test('builds the NTQQ permission masks without changing unrelated flags', async () => {
    const request = createGroupDetailInfoV2Param('123456');
    expect(applyGroupManagementSettings(request, {
      memberInvite: 'no_approval',
      allowMemberUploadAlbum: false,
      allowMemberTemporarySession: true,
      allowMemberCreateGroup: false,
      newMembersSeeRecentHistory: true,
    })).toBe(true);
    expect(request.groupCode).toBe('123456');
    expect(request.filter).toMatchObject({
      allowMemberInvite: 1,
      appPrivilegeFlag: 1,
      appPrivilegeMask: 1,
      groupFlagExt4: 1,
      groupFlagExt4Mask: 1,
    });
    expect(request.modifyInfo).toMatchObject({
      allowMemberInvite: 1,
      appPrivilegeFlag: 0x00108001,
      appPrivilegeMask: 0x06118001,
      groupFlagExt3: 0,
      groupFlagExt3Mask: 0,
      groupFlagExt4: 0x4,
      groupFlagExt4Mask: 0x4,
    });
  });

  test('maps every member invite policy to the native app privilege value', async () => {
    const expected = {
      disabled: 0x04000000,
      require_approval: 0,
      no_approval: 0x00100000,
      no_approval_under_100: 0x02000000,
    } as const;

    for (const [memberInvite, privilegeFlag] of Object.entries(expected)) {
      const request = createGroupDetailInfoV2Param('123456');
      applyGroupManagementSettings(request, { memberInvite: memberInvite as keyof typeof expected });
      expect(request.modifyInfo.allowMemberInvite).toBe(memberInvite === 'disabled' ? 0 : 1);
      expect(request.modifyInfo.appPrivilegeFlag).toBe(privilegeFlag);
      expect(request.modifyInfo.appPrivilegeMask).toBe(0x06100000);
    }
  });

  test('uses NTQQ privilege operation type 8 for album, temporary-session, and create-group flags', () => {
    const requests = createGroupManagementRequests('123456', {
      memberInvite: 'require_approval',
      allowMemberUploadAlbum: true,
      allowMemberTemporarySession: true,
      allowMemberCreateGroup: true,
    }, 0x18001);

    expect(requests.map(request => request.operationType)).toEqual([0, 8, 8, 8]);
    expect(requests.map(request => request.setting)).toEqual([
      'member_invite',
      'allow_member_upload_album',
      'allow_member_temporary_session',
      'allow_member_create_group',
    ]);
    expect(requests.slice(1).map(request => request.param.modifyInfo.appPrivilegeMask))
      .toEqual([0x1, 0x10000, 0x8000]);
    expect(requests[1]?.param.modifyInfo).toMatchObject({
      appPrivilegeFlag: 0x18000,
      appPrivilegeMask: 0x1,
      groupFlagExt3: 0,
      groupFlagExt3Mask: 0,
    });
    expect(requests[2]?.param.modifyInfo).toMatchObject({
      appPrivilegeFlag: 0x8000,
      appPrivilegeMask: 0x10000,
      groupFlagExt3: 0,
      groupFlagExt3Mask: 0,
    });
    expect(requests[3]?.param.modifyInfo).toMatchObject({
      appPrivilegeFlag: 0,
      appPrivilegeMask: 0x8000,
      groupFlagExt3: 0,
      groupFlagExt3Mask: 0,
    });
  });

  test('preserves the complete privilege value when clearing Linux NTQQ permission bits', () => {
    const requests = createGroupManagementRequests('123456', {
      allowMemberUploadAlbum: false,
      allowMemberTemporarySession: false,
      allowMemberCreateGroup: false,
    }, 0);

    expect(requests.map(request => request.param.modifyInfo.appPrivilegeFlag))
      .toEqual([0x1, 0x10001, 0x18001]);
    expect(requests.map(request => request.param.modifyInfo.appPrivilegeMask))
      .toEqual([0x1, 0x10000, 0x8000]);
  });

  test('skips privilege requests whose effective value is already current', () => {
    const requests = createGroupManagementRequests('123456', {
      allowMemberUploadAlbum: true,
      allowMemberTemporarySession: true,
      allowMemberCreateGroup: true,
      newMembersSeeRecentHistory: true,
    }, 0x00100000, 0x4);

    expect(requests).toEqual([]);
  });
});

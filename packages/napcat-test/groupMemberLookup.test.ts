// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { ChatType, type GroupMember, type RawMessage } from 'napcat-core';
import { NTQQGroupApi } from '../napcat-core/apis/group';
import { NTQQUserApi } from '../napcat-core/apis/user';
import { OneBotMsgApi } from '../napcat-onebot/api/msg';

vi.mock('../napcat-webui-backend/index', () => ({
  pendingTokenToSend: undefined,
}));

vi.mock('../napcat-webui-backend/src/helper/Data', () => ({
  WebUiDataRuntime: {},
}));

vi.mock('@/napcat-onebot/network', () => ({
  OB11HttpClientAdapter: class {},
  OB11WebSocketClientAdapter: class {},
  OB11NetworkManager: class {},
  OB11NetworkReloadType: {},
  OB11HttpServerAdapter: class {},
  OB11WebSocketServerAdapter: class {},
}));

vi.mock('@/napcat-onebot/api', () => ({
  OneBotFriendApi: class {},
  OneBotGroupApi: class {},
  OneBotMsgApi: class {},
  OneBotQuickActionApi: class {},
  OneBotUserApi: class {},
}));

vi.mock('@/napcat-onebot/action', () => ({
  createActionMap: vi.fn(),
}));

vi.mock('@/napcat-onebot/network/http-server-sse', () => ({
  OB11HttpSSEServerAdapter: class {},
}));

vi.mock('@/napcat-onebot/network/plugin-manger', () => ({
  OB11PluginMangerAdapter: class {},
}));

// msg.ts 按目录导入 proto，vitest 解析不了；这里用不到，给个空模块
vi.mock('napcat-core/packet/transformer/proto', () => ({}));

function member (uid: string, uin: string, nick: string) {
  return { uid, uin, nick, cardName: '', role: 2 } as unknown as GroupMember;
}

function memberList (...members: GroupMember[]) {
  return {
    errCode: 0,
    errMsg: '',
    result: { ids: [], infos: new Map(members.map(m => [m.uid, m])), finish: true, hasRobot: false },
  };
}

function createGroupApi (getAllMemberList: ReturnType<typeof vi.fn>) {
  const context = {
    session: { getGroupService: () => ({ getAllMemberList }) },
    logger: { logError: vi.fn() },
  };
  return new NTQQGroupApi(context as never, {} as never);
}

describe('group member lookup', () => {
  test('returns undefined instead of throwing when the member list of a new group cannot be fetched', async () => {
    const getAllMemberList = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ errCode: 1, errMsg: 'not ready', result: undefined });
    const groupApi = createGroupApi(getAllMemberList);

    await expect(groupApi.getGroupMember('1053882091', '2060875951')).resolves.toBeUndefined();
    await expect(groupApi.getGroupMember('1053882091', 'u_member')).resolves.toBeUndefined();
    // 拉不到的结果不能写进缓存，否则之后一直拿到空成员表
    expect(groupApi.groupMemberCache.has('1053882091')).toBe(false);
    // 每次调用只拉一次，不会为同一条消息重复强制刷新
    expect(getAllMemberList).toHaveBeenCalledTimes(2);
  });

  test('refreshes a cached group once when a new member is not in the cache yet', async () => {
    const oldMember = member('u_old', '10001', 'old');
    const newMember = member('u_new', '10002', 'new');
    const getAllMemberList = vi.fn().mockResolvedValue(memberList(oldMember, newMember));
    const groupApi = createGroupApi(getAllMemberList);
    groupApi.groupMemberCache.set('123', new Map([[oldMember.uid, oldMember]]));

    await expect(groupApi.getGroupMember('123', '10002')).resolves.toBe(newMember);
    await expect(groupApi.getGroupMember('123', 'u_new')).resolves.toBe(newMember);
    expect(getAllMemberList).toHaveBeenCalledTimes(1);
  });

  test('uin to uid falls back to the cached group members before the network lookup', async () => {
    const groupApi = createGroupApi(vi.fn());
    groupApi.groupMemberCache.set('123', new Map([['u_new', member('u_new', '3680714873', 'new')]]));
    const callNoListenerEvent = vi.fn();
    const context = {
      session: {
        getUixConvertService: () => ({ getUid: vi.fn().mockResolvedValue({ uidInfo: new Map() }) }),
        getProfileService: () => ({ getUidByUin: vi.fn().mockReturnValue(new Map()) }),
        getGroupService: () => ({ getUidByUins: vi.fn().mockResolvedValue({ uids: new Map() }) }),
      },
    };
    const userApi = new NTQQUserApi(context as never, {
      apis: { GroupApi: groupApi },
      eventWrapper: { callNoListenerEvent },
    } as never);

    await expect(userApi.getUidByUinV2('3680714873')).resolves.toBe('u_new');
    expect(callNoListenerEvent).not.toHaveBeenCalled();
  });

  test('temp messages look up the sender in the source group instead of using the sender QQ as group', async () => {
    const getGroupMember = vi.fn().mockResolvedValue(member('u_temp', '3680714873', 'temp sender'));
    const msgApi = new OneBotMsgApi(undefined as never, {
      apis: {
        MsgApi: { getTempChatInfo: vi.fn().mockResolvedValue({ result: 0, tmpChatInfo: { groupCode: '603036233' } }) },
        GroupApi: { getGroupMember },
      },
    } as never);
    const resMsg = { sender: {} } as Record<string, unknown> & { sender: Record<string, unknown>; };
    const msg = {
      chatType: ChatType.KCHATTYPETEMPC2CFROMGROUP,
      senderUid: 'u_temp',
      senderUin: '3680714873',
      peerUid: 'u_temp',
      peerUin: '3680714873',
    } as RawMessage;

    await (msgApi as unknown as { handleTempGroupMessage (r: unknown, m: RawMessage): Promise<void>; })
      .handleTempGroupMessage(resMsg, msg);

    expect(getGroupMember).toHaveBeenCalledWith('603036233', 'u_temp');
    expect(resMsg).toMatchObject({ sub_type: 'group', group_id: 603036233, sender: { nickname: 'temp sender' } });
  });
});

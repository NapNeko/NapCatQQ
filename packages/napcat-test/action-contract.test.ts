import { describe, expect, test, vi } from 'vitest';

import { GetOnlineClient } from '../napcat-onebot/action/go-cqhttp/GetOnlineClient';
import { GoCQHTTPCheckUrlSafely } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPCheckUrlSafely';
import { GoCQHTTPSetModelShow } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPSetModelShow';
import GetFriendMsgHistory from '../napcat-onebot/action/go-cqhttp/GetFriendMsgHistory';
import { GoCQHTTPSendForwardMsgBase } from '../napcat-onebot/action/go-cqhttp/SendForwardMsg';
import { SendGroupNotice } from '../napcat-onebot/action/go-cqhttp/SendGroupNotice';
import SetGroupAddRequest from '../napcat-onebot/action/group/SetGroupAddRequest';
import SendGroupMsg from '../napcat-onebot/action/group/SendGroupMsg';
import { GetGuildList } from '../napcat-onebot/action/guild/GetGuildList';
import { GetGuildProfile } from '../napcat-onebot/action/guild/GetGuildProfile';
import SetGroupLeave from '../napcat-onebot/action/group/SetGroupLeave';
import SendPrivateMsg from '../napcat-onebot/action/msg/SendPrivateMsg';
import SendLike from '../napcat-onebot/action/user/SendLike';
import { OneBotAction } from '../napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';

vi.mock('napcat-core', () => ({
  ChatType: {
    KCHATTYPEGROUP: 2,
    KCHATTYPEC2C: 1,
    KCHATTYPETEMPC2CFROMGROUP: 3,
  },
  ElementType: {
    TEXT: 'text',
    PIC: 'pic',
    REPLY: 'reply',
    FILE: 'file',
    VIDEO: 'video',
    ARK: 'ark',
    PTT: 'ptt',
  },
  NapCatCore: class {},
}));

vi.mock('napcat-core/types', () => ({
  ChatType: {
    KCHATTYPEGROUP: 2,
    KCHATTYPEC2C: 1,
    KCHATTYPETEMPC2CFROMGROUP: 3,
  },
  NTGroupRequestOperateTypes: {
    KAGREE: 'agree',
    KREFUSE: 'refuse',
  },
}));

function createCoreStub (overrides: Record<string, unknown> = {}) {
  return {
    context: {
      logger: {
        logError: vi.fn(),
        logDebug: vi.fn(),
        logWarn: vi.fn(),
      },
    },
    selfInfo: {
      uin: '10001',
      uid: 'u_10001',
    },
    apis: {},
    ...overrides,
  };
}

class ForwardMessagesOnlyAction extends GoCQHTTPSendForwardMsgBase {
  override async _handle (payload: any) {
    return {
      message_id: 1,
      normalized_message: payload.message,
    } as any;
  }
}

class ForwardMixedNodeAction extends GoCQHTTPSendForwardMsgBase {
  calls = 0;

  override async _handle () {
    this.calls += 1;
    return { message_id: 1 } as any;
  }
}

const DefaultedActionPayloadSchema = Type.Object({
  count: Type.Optional(Type.Number({ default: 20 })),
  enabled: Type.Optional(Type.Boolean({ default: false })),
});

type DefaultedActionPayload = Static<typeof DefaultedActionPayloadSchema>;

class DefaultedPayloadAction extends OneBotAction<DefaultedActionPayload, DefaultedActionPayload> {
  override payloadSchema = DefaultedActionPayloadSchema;
  override returnSchema = DefaultedActionPayloadSchema;

  override async _handle (payload: DefaultedActionPayload) {
    return {
      count: payload.count!,
      enabled: payload.enabled!,
    };
  }
}

describe('NapCat Action Contracts', () => {
  test('send_private_msg should reject payloads without message during websocket validation', async () => {
    const action = new SendPrivateMsg({} as any, createCoreStub() as any);

    const response = await action.websocketHandle(
      { user_id: '123456789' } as any,
      null,
      'ws',
      {} as any
    );

    expect(response.retcode).toBe(1400);
  });

  test('send_group_msg should reject payloads without group_id during websocket validation', async () => {
    const action = new SendGroupMsg({} as any, createCoreStub() as any);

    const response = await action.websocketHandle(
      { message: 'hello' } as any,
      null,
      'ws',
      {} as any
    );

    expect(response.retcode).toBe(1400);
    expect(response.message).toContain('group_id');
  });

  test('send_forward_msg should accept messages as the only message field', async () => {
    const action = new ForwardMessagesOnlyAction({} as any, createCoreStub() as any);
    const payload: Record<string, unknown> = {
      group_id: '123456',
      messages: [{
        type: 'node',
        data: {
          id: '654321',
        },
      }],
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(Array.isArray(payload['message'])).toBe(true);
    expect(payload['message']).toEqual([{
      type: 'node',
      data: {
        id: '654321',
      },
    }]);
  });

  test('send_forward_msg should copy parsed reference node ids into message', async () => {
    const action = new ForwardMessagesOnlyAction({} as any, createCoreStub() as any);
    const payload: Record<string, unknown> = {
      group_id: '123456',
      messages: [{
        type: 'node',
        data: {
          id: 654321,
        },
      }],
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(payload['message']).toEqual([{
      type: 'node',
      data: {
        id: '654321',
      },
    }]);
    expect((response.data as any).normalized_message).toEqual([{
      type: 'node',
      data: {
        id: '654321',
      },
    }]);
  });

  test('send_forward_msg should normalize nested reference node ids recursively', async () => {
    const action = new ForwardMessagesOnlyAction({} as any, createCoreStub() as any);
    const payload: Record<string, unknown> = {
      group_id: '123456',
      messages: [{
        type: 'node',
        data: {
          nickname: 'outer',
          content: [{
            type: 'node',
            data: {
              id: 654321,
            },
          }],
        },
      }],
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(payload['message']).toEqual([{
      type: 'node',
      data: {
        nickname: 'outer',
        content: [{
          type: 'node',
          data: {
            id: '654321',
          },
        }],
      },
    }]);
    expect((response.data as any).normalized_message).toEqual(payload['message']);
  });

  test('send_forward_msg should fail mixed node payloads during check before _handle', async () => {
    const action = new ForwardMixedNodeAction({} as any, createCoreStub() as any);

    const response = await action.websocketHandle({
      messages: [
        { type: 'node', data: { id: '123' } },
        { type: 'text', data: { text: 'hello' } },
      ],
    } as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(1400);
    expect(action.calls).toBe(0);
  });

  test('OneBotAction should pass TypeBox-defaulted payloads into _handle', async () => {
    const action = new DefaultedPayloadAction({} as any, createCoreStub() as any);
    const payload: Record<string, unknown> = {};

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(response.data).toEqual({
      count: 20,
      enabled: false,
    });
    expect(payload).toEqual({
      count: 20,
      enabled: false,
    });
  });

  test('send_like should inject default times before _handle uses non-null assertion', async () => {
    const getUidByUinV2 = vi.fn().mockResolvedValue('u_123456');
    const like = vi.fn().mockResolvedValue({ result: 0, errMsg: '' });
    const action = new SendLike({} as any, createCoreStub({
      apis: {
        UserApi: {
          getUidByUinV2,
          like,
        },
      },
    }) as any);
    const payload: Record<string, unknown> = {
      user_id: '123456',
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(like).toHaveBeenCalledWith('u_123456', 1);
    expect(payload['times']).toBe(1);
  });

  test('send_group_notice should inject all default fields before _handle uses non-null assertions', async () => {
    const setGroupNotice = vi.fn().mockResolvedValue({ ec: 0, em: '' });
    const action = new SendGroupNotice({} as any, createCoreStub({
      apis: {
        WebApi: {
          setGroupNotice,
        },
      },
    }) as any);
    const payload: Record<string, unknown> = {
      group_id: '123456',
      content: 'hello',
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(setGroupNotice).toHaveBeenCalledWith(
      '123456',
      'hello',
      0,
      1,
      0,
      0,
      1,
      undefined,
      undefined,
      undefined
    );
    expect(payload).toMatchObject({
      pinned: 0,
      type: 1,
      confirm_required: 1,
      is_show_edit_card: 0,
      tip_window_type: 0,
    });
  });

  test('get_friend_msg_history should inject default booleans and count before _handle uses non-null assertions', async () => {
    const getUidByUinV2 = vi.fn().mockResolvedValue('u_123456');
    const isBuddy = vi.fn().mockResolvedValue(true);
    const getAioFirstViewLatestMsgs = vi.fn().mockResolvedValue({
      msgList: [{
        chatType: 1,
        peerUid: 'u_123456',
        msgId: 'msg-1',
      }],
    });
    const parseMessage = vi.fn().mockResolvedValue({ type: 'text', data: { text: 'hello' } });
    const action = new GetFriendMsgHistory({
      apis: {
        MsgApi: {
          parseMessage,
        },
      },
    } as any, createCoreStub({
      apis: {
        UserApi: {
          getUidByUinV2,
        },
        FriendApi: {
          isBuddy,
        },
        MsgApi: {
          getAioFirstViewLatestMsgs,
        },
      },
    }) as any);
    const payload: Record<string, unknown> = {
      user_id: '123456',
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', { messagePostFormat: 'array' } as any);

    expect(response.retcode).toBe(0);
    expect(getAioFirstViewLatestMsgs).toHaveBeenCalledWith({
      chatType: 1,
      peerUid: 'u_123456',
    }, 20);
    expect(parseMessage).toHaveBeenCalledWith(
      expect.objectContaining({ msgId: 'msg-1' }),
      'array',
      true,
      false
    );
    expect(payload).toMatchObject({
      count: 20,
      reverse_order: false,
      disable_get_url: false,
      parse_mult_msg: true,
      quick_reply: false,
      reverseOrder: false,
    });
  });

  test('set_group_add_request should inject default count and reason before notify lookup', async () => {
    const notify = {
      seq: 'flag-1',
      type: 1,
      group: {
        groupCode: '123456',
      },
    };
    const getSingleScreenNotifies = vi.fn().mockResolvedValue([notify]);
    const handleGroupRequest = vi.fn().mockResolvedValue(undefined);
    const action = new SetGroupAddRequest({
      apis: {
        MsgApi: {
          notifyGroupInvite: new Map(),
        },
      },
    } as any, createCoreStub({
      apis: {
        GroupApi: {
          getSingleScreenNotifies,
          handleGroupRequest,
        },
      },
    }) as any);
    const payload: Record<string, unknown> = {
      flag: 'flag-1',
    };

    const response = await action.websocketHandle(payload as any, null, 'ws', {} as any);

    expect(response.retcode).toBe(0);
    expect(getSingleScreenNotifies).toHaveBeenCalledWith(false, 100);
    expect(handleGroupRequest).toHaveBeenCalledWith(false, notify, 'agree', ' ');
    expect(payload).toMatchObject({
      count: 100,
      reason: ' ',
    });
  });

  test('set_group_leave should call quitGroup unless is_dismiss is truthy', async () => {
    const quitGroup = vi.fn();
    const destroyGroup = vi.fn();
    const action = new SetGroupLeave({} as any, createCoreStub({
      apis: {
        GroupApi: {
          quitGroup,
          destroyGroup,
        },
      },
    }) as any);

    await action._handle({ group_id: '123456', is_dismiss: false } as any);
    expect(quitGroup).toHaveBeenCalledWith('123456');
    expect(destroyGroup).not.toHaveBeenCalled();

    await action._handle({ group_id: '123456', is_dismiss: 'true' } as any);
    expect(destroyGroup).toHaveBeenCalledWith('123456');
  });

  test('compatibility actions should keep returning successful placeholder responses', async () => {
    const getOnlineClient = new GetOnlineClient({} as any, createCoreStub() as any);
    const checkUrlSafely = new GoCQHTTPCheckUrlSafely({} as any, createCoreStub() as any);
    const setModelShow = new GoCQHTTPSetModelShow({} as any, createCoreStub() as any);
    const getGuildList = new GetGuildList({} as any, createCoreStub() as any);
    const getGuildProfile = new GetGuildProfile({} as any, createCoreStub() as any);

    await expect(getOnlineClient.websocketHandle({} as any, null, 'ws', {} as any)).resolves.toMatchObject({
      retcode: 0,
      data: [],
    });
    await expect(checkUrlSafely.websocketHandle({ url: 'https://example.com' } as any, null, 'ws', {} as any)).resolves.toMatchObject({
      retcode: 0,
      data: { level: 1 },
    });
    await expect(setModelShow.websocketHandle({} as any, null, 'ws', {} as any)).resolves.toMatchObject({
      retcode: 0,
      data: null,
    });
    await expect(getGuildList.websocketHandle({} as any, null, 'ws', {} as any)).resolves.toMatchObject({
      retcode: 0,
      data: null,
    });
    await expect(getGuildProfile.websocketHandle({} as any, null, 'ws', {} as any)).resolves.toMatchObject({
      retcode: 0,
      data: null,
    });
  });
});

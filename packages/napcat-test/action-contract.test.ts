import { describe, expect, test, vi } from 'vitest';

import { GetOnlineClient } from '../napcat-onebot/action/go-cqhttp/GetOnlineClient';
import { GoCQHTTPCheckUrlSafely } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPCheckUrlSafely';
import { GoCQHTTPSetModelShow } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPSetModelShow';
import { GoCQHTTPSendForwardMsgBase } from '../napcat-onebot/action/go-cqhttp/SendForwardMsg';
import SendGroupMsg from '../napcat-onebot/action/group/SendGroupMsg';
import { GetGuildList } from '../napcat-onebot/action/guild/GetGuildList';
import { GetGuildProfile } from '../napcat-onebot/action/guild/GetGuildProfile';
import SetGroupLeave from '../napcat-onebot/action/group/SetGroupLeave';
import SendPrivateMsg from '../napcat-onebot/action/msg/SendPrivateMsg';

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

import { describe, expect, test, vi } from 'vitest';

import { GoCQHTTPSendForwardMsgBase } from '../napcat-onebot/action/go-cqhttp/SendForwardMsg';
import SendGroupMsg from '../napcat-onebot/action/group/SendGroupMsg';
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
});

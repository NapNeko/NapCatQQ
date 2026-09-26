// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { NetworkAdapterConfig } from '../napcat-onebot/config/config';

import GetFriendMsgHistory from '../napcat-onebot/action/go-cqhttp/GetFriendMsgHistory';

// `GetFriendMsgHistory` imports `napcat-core/types` via the bare package subpath,
// which Node exports resolution cannot map in this workspace (`./*` pattern cannot
// target an extensionless directory). Remap it onto the aliased source tree.
vi.mock('napcat-core/types', async () => await vi.importActual('@/napcat-core/types/index'));
vi.mock('napcat-common/src/message-unique', async () => await vi.importActual('@/napcat-common/src/message-unique'));

const SAMPLE_MSG = {
  msgId: '100',
  msgSeq: '1',
  chatType: 1,
  peerUid: 'friend-uid',
  peerUin: '42',
  senderUin: '42',
  msgTime: '1700000000',
  msgRandom: '1',
  elements: [],
} as never;

const TEST_ADAPTER = 'test';
const TEST_CONFIG = { messagePostFormat: 'array' } as NetworkAdapterConfig;

function createHistoryAction () {
  const parseMessage = vi.fn().mockResolvedValue({ message: [], raw_message: '' });
  const core = {
    selfInfo: { uid: 'self-uid', uin: '1' },
    apis: {
      UserApi: { getUidByUinV2: vi.fn().mockResolvedValue('friend-uid') },
      FriendApi: { isBuddy: vi.fn().mockResolvedValue(true) },
      MsgApi: {
        getAioFirstViewLatestMsgs: vi.fn().mockResolvedValue({ msgList: [SAMPLE_MSG] }),
      },
    },
  };
  const obContext = {
    apis: { MsgApi: { parseMessage } },
  };
  const action = new GetFriendMsgHistory(obContext as never, core as never);
  return { action, parseMessage };
}

describe('get_friend_msg_history quick_reply forwarding', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('forwards quick_reply: true to parseMessage', async () => {
    const { action, parseMessage } = createHistoryAction();

    await action._handle(
      { user_id: '42', count: 20, reverse_order: false, disable_get_url: false, parse_mult_msg: true, quick_reply: true, reverseOrder: false },
      TEST_ADAPTER,
      TEST_CONFIG
    );

    expect(parseMessage).toHaveBeenCalledWith(
      SAMPLE_MSG,
      'array',
      true,
      false,
      true
    );
  });

  test('forwards quick_reply: false (default) to parseMessage', async () => {
    const { action, parseMessage } = createHistoryAction();

    await action._handle(
      { user_id: '42', count: 20, reverse_order: false, disable_get_url: false, parse_mult_msg: true, quick_reply: false, reverseOrder: false },
      TEST_ADAPTER,
      TEST_CONFIG
    );

    expect(parseMessage).toHaveBeenCalledWith(
      SAMPLE_MSG,
      'array',
      true,
      false,
      false
    );
  });
});

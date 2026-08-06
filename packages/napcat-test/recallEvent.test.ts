import { describe, expect, test, vi } from 'vitest';
import { ChatType, NTMsgType, type RawMessage } from 'napcat-core';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';

vi.mock('../napcat-webui-backend/index', () => ({
  pendingTokenToSend: undefined,
}));

vi.mock('../napcat-webui-backend/src/helper/Data', () => ({
  WebUiDataRuntime: {},
}));

vi.mock('@/napcat-onebot/config', () => ({
  OB11ConfigLoader: class {},
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

vi.mock('@/napcat-onebot/network/adapter', () => ({
  IOB11NetworkAdapter: class {},
}));

vi.mock('@/napcat-onebot/network/http-server-sse', () => ({
  OB11HttpSSEServerAdapter: class {},
}));

vi.mock('@/napcat-onebot/network/plugin-manger', () => ({
  OB11PluginMangerAdapter: class {},
}));

vi.mock('@/napcat-onebot/api/file', () => ({
  OneBotFileApi: class {},
}));

interface TestMsgListener {
  onMsgRecall (chatType: ChatType, uid: string, msgSeq: string): Promise<void> | void;
  onMsgInfoListUpdate (messages: RawMessage[]): Promise<void> | void;
}

const friendUid = 'u_friend';
const friendUin = '123456';
const recalledMsgId = 'recalled-message-id';
const recalledMsgSeq = '100';
const botUin = '999999';

function createMessage (overrides: Partial<RawMessage>): RawMessage {
  return {
    msgId: 'message-id',
    msgRandom: '1',
    msgSeq: '101',
    cntSeq: '101',
    chatType: ChatType.KCHATTYPEC2C,
    msgType: NTMsgType.KMSGTYPEUNKNOWN,
    subMsgType: 0,
    sendStatus: 2,
    senderUid: friendUid,
    senderUin: friendUin,
    peerUid: friendUid,
    peerUin: friendUin,
    peerName: 'friend',
    sendNickName: 'friend',
    sendRemarkName: 'friend',
    msgTime: '1',
    recallTime: '0',
    elements: [],
    records: [],
    sourceType: 0,
    isOnlineMsg: true,
    ...overrides,
  } as RawMessage;
}

function createRecallGrayTip (): RawMessage {
  return createMessage({
    msgId: recalledMsgId,
    msgSeq: recalledMsgSeq,
    msgType: NTMsgType.KMSGTYPEGRAYTIPS,
    recallTime: Math.floor(Date.now() / 1000).toString(),
    elements: [{
      elementType: 8,
      elementId: 'recall-element',
      grayTipElement: {
        revokeElement: {
          operatorRole: '0',
          operatorUid: friendUid,
          operatorNick: 'friend',
          operatorRemark: '',
          isSelfOperate: false,
          wording: '',
        },
      },
    } as unknown as RawMessage['elements'][number]],
  });
}

function createHarness (queryResult: RawMessage[], operatorUin = '654321') {
  let listener: TestMsgListener | undefined;
  const emitEvent = vi.fn(async (_event: unknown): Promise<void> => undefined);
  const queryMsgsWithFilterExWithSeq = vi.fn(async () => ({ msgList: queryResult }));
  const registerListen = vi.fn();
  const logger = {
    logDebug: vi.fn(),
    logError: vi.fn(),
    logMessage: vi.fn(),
  };
  const context = {
    logger,
    session: {
      getMsgService: () => ({
        addKernelMsgListener: (registeredListener: TestMsgListener) => {
          listener = registeredListener;
        },
      }),
    },
  };
  const core = {
    selfInfo: { uin: botUin },
    apis: {
      MsgApi: { queryMsgsWithFilterExWithSeq },
      UserApi: { getUinByUidV2: vi.fn(async () => operatorUin) },
    },
    eventWrapper: { registerListen },
  };
  const adapter = Object.create(NapCatOneBot11Adapter.prototype) as NapCatOneBot11Adapter;

  Object.assign(adapter, {
    core,
    context,
    networkManager: { emitEvent },
    bootTime: Date.now() / 1000,
    recallEventCache: new Map(),
    reportedRecallEventCache: new Map(),
    processingRecallEvents: new Map(),
  });

  (adapter as unknown as { initMsgListener (): void }).initMsgListener();

  if (!listener) {
    throw new Error('message listener was not registered');
  }

  return { adapter, listener, emitEvent, logger, queryMsgsWithFilterExWithSeq, registerListen };
}

describe('friend recall reporting', () => {
  test('reports a recalled non-latest private message from its gray-tip update', async () => {
    const botReply = createMessage({
      msgId: 'bot-reply-id',
      msgSeq: '101',
      senderUid: 'u_bot',
      senderUin: botUin,
    });
    const grayTip = createRecallGrayTip();
    const { listener, emitEvent } = createHarness([botReply]);

    await listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);
    await listener.onMsgInfoListUpdate([grayTip]);

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(expect.objectContaining({
      notice_type: 'friend_recall',
      user_id: Number(friendUin),
    }));
  });

  test('deduplicates the same recall from the gray-tip update and recall callback', async () => {
    const grayTip = createRecallGrayTip();
    const { listener, emitEvent } = createHarness([grayTip]);

    await listener.onMsgInfoListUpdate([grayTip]);
    await listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);
    await listener.onMsgInfoListUpdate([grayTip]);

    expect(emitEvent).toHaveBeenCalledTimes(1);
  });

  test('deduplicates concurrent update and callback processing', async () => {
    const grayTip = createRecallGrayTip();
    const { listener, emitEvent } = createHarness([grayTip]);
    let finishEmit: (() => void) | undefined;
    emitEvent.mockImplementationOnce(() => new Promise<void>((resolve) => {
      finishEmit = resolve;
    }));

    const updateTask = listener.onMsgInfoListUpdate([grayTip]);
    await vi.waitFor(() => expect(emitEvent).toHaveBeenCalledTimes(1));
    const callbackTask = listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);

    finishEmit?.();
    await Promise.all([updateTask, callbackTask]);

    expect(emitEvent).toHaveBeenCalledTimes(1);
  });

  test('uses a concurrent duplicate callback to retry a failed report', async () => {
    const grayTip = createRecallGrayTip();
    const { listener, emitEvent, logger } = createHarness([grayTip]);
    let failFirstEmit: (() => void) | undefined;
    emitEvent
      .mockImplementationOnce(() => new Promise<void>((_resolve, reject) => {
        failFirstEmit = () => reject(new Error('network unavailable'));
      }))
      .mockResolvedValueOnce(undefined);

    const updateTask = listener.onMsgInfoListUpdate([grayTip]);
    await vi.waitFor(() => expect(emitEvent).toHaveBeenCalledTimes(1));
    const callbackTask = listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);

    failFirstEmit?.();
    await Promise.all([updateTask, callbackTask]);

    expect(emitEvent).toHaveBeenCalledTimes(2);
    expect(logger.logError).toHaveBeenCalledWith('处理消息撤回失败', expect.any(Error));
  });

  test('reports one self recall without waiting for a duplicate callback', async () => {
    const grayTip = createRecallGrayTip();
    const revokeElement = grayTip.elements[0]?.grayTipElement?.revokeElement;
    if (!revokeElement) throw new Error('missing revoke element');
    revokeElement.isSelfOperate = true;

    const { adapter, listener, emitEvent, registerListen } = createHarness([grayTip]);
    const originTimeout = setTimeout(() => undefined, 60_000);
    adapter.recallEventCache.set(recalledMsgId, originTimeout);

    await listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);
    await listener.onMsgRecall(ChatType.KCHATTYPEC2C, friendUid, recalledMsgSeq);

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(adapter.recallEventCache.has(recalledMsgId)).toBe(false);
    expect(registerListen).not.toHaveBeenCalled();
  });

  test('retries reporting when the first network emission fails', async () => {
    const grayTip = createRecallGrayTip();
    const { listener, emitEvent, logger } = createHarness([grayTip]);
    emitEvent
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(undefined);

    await listener.onMsgInfoListUpdate([grayTip]);
    await listener.onMsgInfoListUpdate([grayTip]);

    expect(emitEvent).toHaveBeenCalledTimes(2);
    expect(logger.logError).toHaveBeenCalledWith('处理消息撤回失败', expect.any(Error));
  });

  test('ignores historical recall rows replayed during startup sync', async () => {
    const grayTip = createRecallGrayTip();
    grayTip.recallTime = Math.floor(Date.now() / 1000 - 120).toString();
    const { listener, emitEvent } = createHarness([]);

    await listener.onMsgInfoListUpdate([grayTip]);

    expect(emitEvent).not.toHaveBeenCalled();
  });

  test('ignores ordinary message updates', async () => {
    const ordinaryMessage = createMessage({ recallTime: Math.floor(Date.now() / 1000).toString() });
    const { listener, emitEvent } = createHarness([]);

    await listener.onMsgInfoListUpdate([ordinaryMessage]);

    expect(emitEvent).not.toHaveBeenCalled();
  });
});

describe('group recall reporting', () => {
  test('preserves group, sender and operator fields', async () => {
    const grayTip = createRecallGrayTip();
    const groupUin = '112233';
    const senderUin = '223344';
    grayTip.chatType = ChatType.KCHATTYPEGROUP;
    grayTip.peerUid = groupUin;
    grayTip.peerUin = groupUin;
    grayTip.senderUin = senderUin;

    const { listener, emitEvent } = createHarness([], '334455');

    await listener.onMsgInfoListUpdate([grayTip]);

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(expect.objectContaining({
      notice_type: 'group_recall',
      group_id: Number(groupUin),
      user_id: Number(senderUin),
      operator_id: 334455,
    }));
  });
});

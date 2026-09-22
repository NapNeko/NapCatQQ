// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { MessageUnique } from '../napcat-common/src/message-unique';
import DelEssenceMsg from '../napcat-onebot/action/group/DelEssenceMsg';

function createAction (essenceLRUValue: string | undefined) {
  const removeGroupEssenceBySeq = vi.fn().mockResolvedValue({ result: 0 });
  const action = new DelEssenceMsg(
    undefined as never,
    {
      apis: {
        GroupApi: {
          essenceLRU: { getValue: vi.fn().mockReturnValue(essenceLRUValue) },
          removeGroupEssenceBySeq,
        },
      },
    } as never
  );
  return { action, removeGroupEssenceBySeq };
}

describe('delete_essence_msg argument order', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('passes msg_random before msg_seq for explicitly supplied parameters', async () => {
    const { action, removeGroupEssenceBySeq } = createAction(undefined);

    await action._handle({ group_id: '33', msg_seq: '11', msg_random: '22' });

    // GroupApi.removeGroupEssenceBySeq(groupCode, msgRandom, msgSeq)
    expect(removeGroupEssenceBySeq).toHaveBeenCalledWith('33', '22', '11');
  });

  test('passes msg_random before msg_seq for the essence LRU fallback', async () => {
    // get_essence_msg_list stores this payload under a synthetic message_id when the
    // original message can no longer be resolved from the local message cache.
    const { action, removeGroupEssenceBySeq } = createAction(JSON.stringify({
      msg_seq: '11',
      msg_random: '22',
      group_id: '33',
    }));
    vi.spyOn(MessageUnique, 'getMsgIdAndPeerByShortId').mockReturnValue(undefined);

    await action._handle({ message_id: 12345 });

    // GroupApi.removeGroupEssenceBySeq(groupCode, msgRandom, msgSeq)
    expect(removeGroupEssenceBySeq).toHaveBeenCalledWith('33', '22', '11');
  });
});

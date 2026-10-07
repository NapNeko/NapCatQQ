// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import SetGroupLeave from '../napcat-onebot/action/group/SetGroupLeave';

function createAction () {
  const quitGroup = vi.fn().mockResolvedValue(undefined);
  const destroyGroup = vi.fn().mockResolvedValue(undefined);
  const action = new SetGroupLeave(
    undefined as never,
    {
      apis: {
        GroupApi: { quitGroup, destroyGroup },
      },
    } as never
  );
  return { action, quitGroup, destroyGroup };
}

describe('set_group_leave is_dismiss', () => {
  test('leaves the group when is_dismiss is absent', async () => {
    const { action, quitGroup, destroyGroup } = createAction();

    await action._handle({ group_id: '123' });

    expect(quitGroup).toHaveBeenCalledWith('123');
    expect(destroyGroup).not.toHaveBeenCalled();
  });

  test('leaves the group when is_dismiss is false', async () => {
    const { action, quitGroup, destroyGroup } = createAction();

    await action._handle({ group_id: '123', is_dismiss: false });

    expect(quitGroup).toHaveBeenCalledWith('123');
    expect(destroyGroup).not.toHaveBeenCalled();
  });

  test("leaves the group when is_dismiss is the string 'false'", async () => {
    const { action, quitGroup, destroyGroup } = createAction();

    await action._handle({ group_id: '123', is_dismiss: 'false' });

    expect(quitGroup).toHaveBeenCalledWith('123');
    expect(destroyGroup).not.toHaveBeenCalled();
  });

  test('destroys the group when is_dismiss is true', async () => {
    const { action, quitGroup, destroyGroup } = createAction();

    await action._handle({ group_id: '123', is_dismiss: true });

    expect(destroyGroup).toHaveBeenCalledWith('123');
    expect(quitGroup).not.toHaveBeenCalled();
  });

  test("destroys the group when is_dismiss is the string 'true'", async () => {
    const { action, quitGroup, destroyGroup } = createAction();

    await action._handle({ group_id: '123', is_dismiss: 'true' });

    expect(destroyGroup).toHaveBeenCalledWith('123');
    expect(quitGroup).not.toHaveBeenCalled();
  });
});

// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SetQQProfile } from '../napcat-onebot/action/go-cqhttp/SetQQProfile';

const OLD_PROFILE = {
  sex: 1,
  longNick: 'old note',
  birthday_year: 2000,
  birthday_month: 1,
  birthday_day: 1,
};

function createAction () {
  const modifySelfProfile = vi.fn().mockResolvedValue({});
  const action = new SetQQProfile(undefined as never, {
    selfInfo: { uid: 'u1' },
    apis: {
      UserApi: {
        getUserDetailInfo: vi.fn().mockResolvedValue(OLD_PROFILE),
        modifySelfProfile,
      },
    },
  } as never);
  return { action, modifySelfProfile };
}

describe('set_qq_profile sex handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // NTSex.GENDER_UNKOWN === 0, and the payload schema documents "0: 未知".
  test('forwards sex: 0 instead of falling back to the current profile', async () => {
    const { action, modifySelfProfile } = createAction();

    await action._handle({ nickname: 'newnick', sex: 0 });

    expect(modifySelfProfile).toHaveBeenCalledWith(expect.objectContaining({ nick: 'newnick', sex: 0 }));
  });

  test('forwards sex: 2', async () => {
    const { action, modifySelfProfile } = createAction();

    await action._handle({ nickname: 'newnick', sex: 2 });

    expect(modifySelfProfile).toHaveBeenCalledWith(expect.objectContaining({ sex: 2 }));
  });

  test('falls back to the current profile when sex is omitted', async () => {
    const { action, modifySelfProfile } = createAction();

    await action._handle({ nickname: 'newnick' });

    expect(modifySelfProfile).toHaveBeenCalledWith(expect.objectContaining({ sex: OLD_PROFILE.sex }));
  });

  test('falls back to the current profile when sex is an empty string', async () => {
    const { action, modifySelfProfile } = createAction();

    await action._handle({ nickname: 'newnick', sex: '' });

    expect(modifySelfProfile).toHaveBeenCalledWith(expect.objectContaining({ sex: OLD_PROFILE.sex }));
  });
});

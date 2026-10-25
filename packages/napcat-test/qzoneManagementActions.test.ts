// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, it, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { GetQzoneProfile } from '@/napcat-onebot/action/extends/qzone/GetQzoneProfile';
import { SetQzoneProfile } from '@/napcat-onebot/action/extends/qzone/SetQzoneProfile';
import { SetQzoneMsgRight } from '@/napcat-onebot/action/extends/qzone/SetQzoneMsgRight';
import { SetQzoneBan } from '@/napcat-onebot/action/extends/qzone/SetQzoneBan';

function createCore () {
  const QzoneApi = {
    getProfile: vi.fn().mockResolvedValue({ name: '', description: '' }),
    setProfile: vi.fn().mockResolvedValue(undefined),
    setMsgRight: vi.fn().mockImplementation(async (_tid: string, right: number) => ({ ugc_right: right })),
    setBan: vi.fn().mockResolvedValue(undefined),
  };
  return { apis: { QzoneApi }, context: { logger: { logError: vi.fn() } } };
}

describe('QQ空间资料和权限 actions', () => {
  it('reads the current profile by default and preserves large decimal target strings', async () => {
    const core = createCore();
    const action = new GetQzoneProfile(undefined as never, core as never);

    const result = await action.handle({}, 'test', {} as never);
    await action.handle({ target_uin: 10002 }, 'test', {} as never);
    await action.handle({ target_uin: '9007199254740993' }, 'test', {} as never);

    expect(result).toMatchObject({ status: 'ok', data: { name: '', description: '' } });
    expect(core.apis.QzoneApi.getProfile.mock.calls).toEqual([
      [undefined], ['10002'], ['9007199254740993'],
    ]);
  });

  it('distinguishes omitted profile fields from explicit empty strings through handle parsing', async () => {
    const core = createCore();
    const action = new SetQzoneProfile(undefined as never, core as never);

    const result = await action.handle({ name: '' }, 'test', {} as never);
    await action.handle({ description: '' }, 'test', {} as never);
    await action.handle({ name: undefined, description: '说明' }, 'test', {} as never);

    expect(JSON.parse(JSON.stringify(result))).toMatchObject({ status: 'ok', retcode: 0, data: null });
    expect(core.apis.QzoneApi.setProfile.mock.calls).toEqual([
      [{ name: '' }], [{ description: '' }], [{ description: '说明' }],
    ]);
    expect(Object.keys(core.apis.QzoneApi.setProfile.mock.calls[0]?.[0] ?? {})).toEqual(['name']);
  });

  it('normalizes supported profile scalars to strings without trimming content', async () => {
    const core = createCore();
    const action = new SetQzoneProfile(undefined as never, core as never);

    await action.handle({ name: 0, description: false }, 'test', {} as never);
    await action.handle({ name: true, description: '  保留空白\r\n ' }, 'test', {} as never);

    expect(core.apis.QzoneApi.setProfile.mock.calls).toEqual([
      [{ name: '0', description: 'false' }],
      [{ name: 'true', description: '  保留空白\r\n ' }],
    ]);
  });

  it('normalizes right codes and target IDs before a single own-post permission request', async () => {
    const core = createCore();
    const action = new SetQzoneMsgRight(undefined as never, core as never);

    const result = await action.handle({
      tid: 'existing-tid',
      ugc_right: '16',
      target_uins: [10002, '9007199254740993', '10002'],
    }, 'test', {} as never);

    expect(core.apis.QzoneApi.setMsgRight).toHaveBeenCalledExactlyOnceWith(
      'existing-tid', 16, ['10002', '9007199254740993']
    );
    expect(result).toMatchObject({ status: 'ok', data: { ugc_right: 16 } });
  });

  it('keeps enable false and serializes successful ban writes with explicit null data', async () => {
    const core = createCore();
    const action = new SetQzoneBan(undefined as never, core as never);

    const disabled = await action.handle({ user_id: '9007199254740993', enable: false }, 'test', {} as never);
    const enabled = await action.handle({ user_id: 10002 }, 'test', {} as never);

    expect(core.apis.QzoneApi.setBan.mock.calls).toEqual([
      ['9007199254740993', false], ['10002', true],
    ]);
    expect(JSON.parse(JSON.stringify(disabled))).toMatchObject({ status: 'ok', data: null });
    expect(JSON.parse(JSON.stringify(enabled))).toMatchObject({ status: 'ok', data: null });
  });

  it('normalizes safe numeric permission-update IDs without accepting lossy values', async () => {
    const core = createCore();
    const result = await new SetQzoneMsgRight(undefined as never, core as never).handle({ tid: 0, ugc_right: '4' }, 'test', {} as never);

    expect(result).toMatchObject({ status: 'ok', data: { ugc_right: 4 } });
    expect(core.apis.QzoneApi.setMsgRight).toHaveBeenCalledExactlyOnceWith('0', 4, []);
  });

  it('normalizes supported SnowLuma boolean spellings without treating arbitrary text as true', async () => {
    const core = createCore();
    const action = new SetQzoneBan(undefined as never, core as never);
    for (const enable of ['false', '0', ' NO ', 'Off', 0]) {
      const result = await action.handle({ user_id: '10002', enable }, 'test', {} as never);
      expect(result.status).toBe('ok');
      expect(core.apis.QzoneApi.setBan).toHaveBeenLastCalledWith('10002', false);
    }
    for (const enable of ['true', '1', ' YES ', 'On', 1]) {
      const result = await action.handle({ user_id: '10002', enable }, 'test', {} as never);
      expect(result.status).toBe('ok');
      expect(core.apis.QzoneApi.setBan).toHaveBeenLastCalledWith('10002', true);
    }
  });

  it('rejects malformed or lossy values before any core call', async () => {
    const cases = [
      [GetQzoneProfile, { target_uin: Number.MAX_SAFE_INTEGER + 1 }],
      [GetQzoneProfile, { target_uin: false }],
      [GetQzoneProfile, { target_uin: 'bad-uin' }],
      [SetQzoneProfile, {}],
      [SetQzoneProfile, { name: undefined }],
      [SetQzoneProfile, { name: null }],
      [SetQzoneProfile, { name: ['text'] }],
      [SetQzoneProfile, { description: { content: 'text' } }],
      [SetQzoneProfile, { name: Infinity }],
      [SetQzoneProfile, { name: NaN }],
      [SetQzoneProfile, { name: 'x'.repeat(8193) }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 2 }],
      [SetQzoneMsgRight, { tid: '', ugc_right: 1 }],
      [SetQzoneMsgRight, { tid: ' ', ugc_right: 1 }],
      [SetQzoneMsgRight, { tid: true, ugc_right: 1 }],
      [SetQzoneMsgRight, { tid: Number.MAX_SAFE_INTEGER + 1, ugc_right: 1 }],
      [SetQzoneMsgRight, { tid: Infinity, ugc_right: 1 }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: true }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 16 }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 128, target_uins: [] }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 16, target_uins: [Number.MAX_SAFE_INTEGER + 1] }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 16, target_uins: ['10002', false] }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 16, target_uins: '10002' }],
      [SetQzoneBan, { user_id: 0 }],
      [SetQzoneBan, { user_id: Number.MAX_SAFE_INTEGER + 1 }],
      [SetQzoneBan, { user_id: '10002', enable: 'unknown' }],
      [SetQzoneBan, { user_id: '10002', enable: 2 }],
      [SetQzoneBan, { user_id: '10002', enable: null }],
    ] as const;
    for (const [Action, payload] of cases) {
      const core = createCore();
      const result = await new Action(undefined as never, core as never).handle(payload as never, 'test', {} as never);

      expect(result.status).toBe('failed');
      for (const method of Object.values(core.apis.QzoneApi)) expect(method).not.toHaveBeenCalled();
    }
  });

  it('rejects unknown parameters and current-account overrides before any core call', async () => {
    const cases = [
      [GetQzoneProfile, { target_uin: '10002', unknown: true }],
      [SetQzoneProfile, { name: 'text', target_uin: '10002' }],
      [SetQzoneMsgRight, { tid: 'tid', ugc_right: 1, target_uin: '10002' }],
      [SetQzoneBan, { user_id: '10002', unknown: true }],
    ] as const;
    for (const [Action, payload] of cases) {
      const core = createCore();
      const result = await new Action(undefined as never, core as never).handle(payload as never, 'test', {} as never);

      expect(result.status).toBe('failed');
      for (const method of Object.values(core.apis.QzoneApi)) expect(method).not.toHaveBeenCalled();
    }
  });

  it('surfaces a failed write without retrying or claiming null success', async () => {
    const core = createCore();
    core.apis.QzoneApi.setProfile.mockRejectedValue(new Error('QQ空间未明确确认资料修改成功'));
    const result = await new SetQzoneProfile(undefined as never, core as never).handle({ name: 'text' }, 'test', {} as never);

    expect(result.status).toBe('failed');
    expect(result.message).toContain('未明确确认');
    expect(core.apis.QzoneApi.setProfile).toHaveBeenCalledTimes(1);
  });

  it('has complete API metadata and schema-valid examples for all four actions', () => {
    const core = createCore();
    const actions = [
      new GetQzoneProfile(undefined as never, core as never),
      new SetQzoneProfile(undefined as never, core as never),
      new SetQzoneMsgRight(undefined as never, core as never),
      new SetQzoneBan(undefined as never, core as never),
    ];

    expect(actions.map(action => action.actionName)).toEqual([
      'get_qzone_profile', 'set_qzone_profile', 'set_qzone_msg_right', 'set_qzone_ban',
    ]);
    for (const action of actions) {
      expect(action.actionSummary.length).toBeGreaterThan(0);
      expect(action.actionDescription.length).toBeGreaterThan(0);
      expect(action.actionTags).toContain('扩展接口');
      expect(TypeCompiler.Compile(action.payloadSchema).Check(action.payloadExample)).toBe(true);
      expect(TypeCompiler.Compile(action.returnSchema).Check(action.returnExample)).toBe(true);
    }
  });
});

// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SendQzoneMsg } from '@/napcat-onebot/action/extends/SendQzoneMsg';
import { DeleteQzoneMsg } from '@/napcat-onebot/action/extends/DeleteQzoneMsg';

const tempDirs: string[] = [];

function createCore () {
  const directory = mkdtempSync(join(tmpdir(), 'napcat-qzone-compat-'));
  tempDirs.push(directory);
  return {
    NapCatTempPath: directory,
    apis: {
      QzoneApi: { publishMsg: vi.fn().mockResolvedValue({ tid: 'modern-tid' }) },
      WebApi: {
        uploadImageToQzone: vi.fn().mockResolvedValue('legacy-richval'),
        publishQzoneMsg: vi.fn().mockResolvedValue({ tid: 'legacy-tid' }),
        deleteQzoneMsg: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('Qzone existing action compatibility', () => {
  it('keeps send_qzone_msg parameters and tid response for pure text', async () => {
    const core = createCore();
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: '朋友可见', ugc_right: '16', target_uins: ['10002'] }))
      .resolves.toEqual({ tid: 'modern-tid' });
    expect(core.apis.QzoneApi.publishMsg).toHaveBeenCalledExactlyOnceWith('朋友可见', 16, ['10002']);
    expect(core.apis.WebApi.publishQzoneMsg).not.toHaveBeenCalled();
  });

  it('does not retry an uncertain modern publish through the legacy CGI', async () => {
    const core = createCore();
    core.apis.QzoneApi.publishMsg.mockRejectedValue(new Error('发表结果未知，请查询后确认'));
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: '仅发送一次', images: [] })).rejects.toThrow('结果未知');
    expect(core.apis.QzoneApi.publishMsg).toHaveBeenCalledTimes(1);
    expect(core.apis.WebApi.publishQzoneMsg).not.toHaveBeenCalled();
  });

  it('preserves decimal target identifiers without a lossy numeric conversion', async () => {
    const core = createCore();
    const action = new SendQzoneMsg(undefined as never, core as never);

    await action._handle({ content: '指定好友', ugc_right: 16, target_uins: ['9007199254740993'] });

    expect(core.apis.QzoneApi.publishMsg).toHaveBeenCalledExactlyOnceWith('指定好友', 16, ['9007199254740993']);
  });

  it.each([{ images: [] }, { images: ['base64://aGVsbG8='] }])('rejects an invalid exclusion list before any write ($images)', async ({ images }) => {
    const core = createCore();
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: '排除指定好友', ugc_right: 128, target_uins: ['10002', 'invalid'], images }))
      .rejects.toThrow('target_uins 必须为有效QQ号数组');
    expect(core.apis.QzoneApi.publishMsg).not.toHaveBeenCalled();
    expect(core.apis.WebApi.uploadImageToQzone).not.toHaveBeenCalled();
    expect(core.apis.WebApi.publishQzoneMsg).not.toHaveBeenCalled();
  });

  it('keeps legacy image publishing and cleans decoded images without deleting user files', async () => {
    const core = createCore();
    const localImage = join(core.NapCatTempPath, 'user-image.png');
    writeFileSync(localImage, 'user image');
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({
      content: '带图说说',
      images: ['base64://aGVsbG8=', pathToFileURL(localImage).href],
      ugc_right: 64,
    })).resolves.toEqual({ tid: 'legacy-tid' });

    expect(core.apis.QzoneApi.publishMsg).not.toHaveBeenCalled();
    expect(core.apis.WebApi.uploadImageToQzone.mock.calls.map(args => args[0])).toEqual([
      Buffer.from('hello').toString('base64'),
      Buffer.from('user image').toString('base64'),
    ]);
    expect(core.apis.WebApi.publishQzoneMsg).toHaveBeenCalledExactlyOnceWith(
      '带图说说', ['legacy-richval', 'legacy-richval'], 64, undefined
    );
    expect(readdirSync(core.NapCatTempPath)).toEqual(['user-image.png']);
    expect(readFileSync(localImage, 'utf8')).toBe('user image');
  });

  it('cleans temporary images and does not publish after an upload failure', async () => {
    const core = createCore();
    core.apis.WebApi.uploadImageToQzone.mockRejectedValue(new Error('upload failed'));
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: '带图', images: ['base64://aGVsbG8='] })).rejects.toThrow('upload failed');
    expect(core.apis.WebApi.publishQzoneMsg).not.toHaveBeenCalled();
    expect(core.apis.QzoneApi.publishMsg).not.toHaveBeenCalled();
    expect(readdirSync(core.NapCatTempPath)).toEqual([]);
  });

  it('validates existing selective visibility before uploading or publishing', async () => {
    const core = createCore();
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: '指定好友', ugc_right: 128, images: ['base64://aGVsbG8='] }))
      .rejects.toThrow('target_uins 不能为空');
    expect(core.apis.QzoneApi.publishMsg).not.toHaveBeenCalled();
    expect(core.apis.WebApi.uploadImageToQzone).not.toHaveBeenCalled();
  });

  it('keeps delete_qzone_msg on its existing tid-based CGI path', async () => {
    const core = createCore();
    const action = new DeleteQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ tid: 'existing-tid' })).resolves.toBeUndefined();
    expect(core.apis.WebApi.deleteQzoneMsg).toHaveBeenCalledExactlyOnceWith('existing-tid');
  });
});

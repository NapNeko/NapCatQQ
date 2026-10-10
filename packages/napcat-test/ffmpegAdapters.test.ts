import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import { FFmpegAdapterFactory } from '@/napcat-core/helper/ffmpeg/ffmpeg-adapter-factory';
import { FFmpegAddonAdapter } from '@/napcat-core/helper/ffmpeg/ffmpeg-addon-adapter';
import { FFmpegExecAdapter } from '@/napcat-core/helper/ffmpeg/ffmpeg-exec-adapter';
import { FFmpegService, getFFmpegPath } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import type { LogWrapper } from '@/napcat-core/helper/log';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  dlopen: vi.fn(),
  exists: vi.fn(),
}));

vi.mock('fs', async (importOriginal) => {
  const original = await importOriginal<typeof import('fs')>();
  return { ...original, existsSync: mocks.exists };
});

vi.mock('child_process', async (importOriginal) => {
  const original = await importOriginal<typeof import('child_process')>();
  return {
    ...original,
    execFile: Object.assign(vi.fn(), {
      [Symbol.for('nodejs.util.promisify.custom')]: mocks.execute,
    }),
  };
});

vi.mock('node:process', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:process')>();
  return { ...original, dlopen: mocks.dlopen };
});

const logger = { log: vi.fn(), logError: vi.fn() } as unknown as LogWrapper;
const platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!;
const archDescriptor = Object.getOwnPropertyDescriptor(process, 'arch')!;

beforeEach(() => {
  FFmpegAdapterFactory.reset();
  vi.stubEnv('FFMPEG_PATH', '');
  vi.stubEnv('FFPROBE_PATH', '');
  mocks.execute.mockReset().mockResolvedValue({ stdout: '', stderr: '' });
  mocks.dlopen.mockReset();
  mocks.exists.mockReset().mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  Object.defineProperty(process, 'platform', platformDescriptor);
  Object.defineProperty(process, 'arch', archDescriptor);
});

describe('FFmpeg platform paths', () => {
  it.each(['arm64', 'x64'])('finds Homebrew for macOS %s outside GUI PATH', (arch) => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    Object.defineProperty(process, 'arch', { value: arch });
    vi.stubEnv('PATH', '/usr/bin:/bin');
    const prefix = arch === 'arm64' ? '/opt/homebrew/bin' : '/usr/local/bin';
    mocks.exists.mockImplementation(candidate => String(candidate).startsWith(path.join(prefix)));
    expect(getFFmpegPath('ffmpeg')).toBe(path.join(prefix, 'ffmpeg'));
    expect(getFFmpegPath('ffprobe')).toBe(path.join(prefix, 'ffprobe'));
  });

  it('preserves explicit paths containing spaces without searching alternatives', () => {
    vi.stubEnv('FFMPEG_PATH', '/private/My Tools/ffmpeg');
    vi.stubEnv('FFPROBE_PATH', '/private/My Tools/ffprobe');
    const exists = mocks.exists.mockReturnValue(true);
    expect(getFFmpegPath('ffmpeg', '/app')).toBe('/private/My Tools/ffmpeg');
    expect(getFFmpegPath('ffprobe', '/app')).toBe('/private/My Tools/ffprobe');
    expect(exists).not.toHaveBeenCalled();
  });

  it('uses packaged Windows executables before PATH', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    mocks.exists.mockReturnValue(true);
    expect(getFFmpegPath('ffmpeg', '/app')).toBe(path.join('/app', 'ffmpeg', 'ffmpeg.exe'));
  });
});

describe('FFmpeg adapter selection', () => {
  it.each(['arm64', 'x64'])('loads the packaged macOS %s addon', async (arch) => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    Object.defineProperty(process, 'arch', { value: arch });
    mocks.exists.mockReturnValue(true);
    mocks.dlopen.mockImplementation(module => { module.exports = {}; });
    const adapter = await FFmpegAdapterFactory.getAdapter(logger, 'ffmpeg', 'ffprobe', '/app');
    expect(adapter.name).toBe('FFmpegAddon');
    expect(mocks.dlopen).toHaveBeenCalledWith(expect.anything(), path.join('/app', 'native/ffmpeg', 'ffmpegAddon.darwin.' + arch + '.node'));
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('does not hide a broken packaged addon behind another adapter', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.exists.mockReturnValue(true);
    mocks.dlopen.mockImplementation(() => { throw new Error('wrong architecture'); });
    await expect(FFmpegAdapterFactory.getAdapter(logger, 'ffmpeg', 'ffprobe', '/app')).rejects.toThrow('Native Addon');
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(FFmpegAdapterFactory.getCurrentAdapter()).toBeNull();
  });

  it('honors an explicit command line configuration', async () => {
    vi.stubEnv('FFMPEG_PATH', '/tools/ffmpeg');
    mocks.exists.mockReturnValue(true);
    const adapter = await FFmpegAdapterFactory.getAdapter(logger, '/tools/ffmpeg', '/tools/ffprobe', '/app');
    expect(adapter.name).toBe('FFmpegExec');
    expect(mocks.dlopen).not.toHaveBeenCalled();
    expect(mocks.execute).toHaveBeenCalledWith('/tools/ffmpeg', ['-version'], expect.objectContaining({ timeout: 10000 }));
    expect(mocks.execute).toHaveBeenCalledWith('/tools/ffprobe', ['-version'], expect.objectContaining({ timeout: 10000 }));
  });

  it('rejects a missing ffprobe and allows a corrected configuration', async () => {
    mocks.exists.mockReturnValue(false);
    mocks.execute.mockImplementation(async command => {
      if (command === 'ffprobe') throw new Error('ENOENT');
      return { stdout: '', stderr: '' };
    });
    await expect(FFmpegAdapterFactory.getAdapter(logger)).rejects.toThrow('ffprobe');
    expect(FFmpegAdapterFactory.getCurrentAdapter()).toBeNull();
    mocks.execute.mockResolvedValue({ stdout: '', stderr: '' });
    expect((await FFmpegAdapterFactory.getAdapter(logger)).name).toBe('FFmpegExec');
  });

  it('validates replacement paths before changing the active adapter', async () => {
    const adapter = await FFmpegAdapterFactory.getAdapter(logger);
    mocks.execute.mockRejectedValue(new Error('EACCES'));
    await expect(FFmpegAdapterFactory.updateFFmpegPath(logger, '/bad/ffmpeg', '/bad/ffprobe')).rejects.toThrow('/bad/ffprobe');
    expect(FFmpegAdapterFactory.getCurrentAdapter()).toBe(adapter);
  });
});

describe('FFmpeg media operations', () => {
  it('transcodes encoded audio without treating its bytes as raw PCM', async () => {
    mocks.exists.mockReturnValue(true);
    await new FFmpegExecAdapter().convertFile('/record.wav', '/record.mp3', 'mp3');
    expect(mocks.execute).toHaveBeenCalledWith('ffmpeg', [
      '-i', '/record.wav', '-vn', '-ac', '1', '-y', '/record.mp3',
    ], expect.objectContaining({ timeout: 120000, windowsHide: true }));
  });

  it('reports a corrupt video instead of inventing dimensions and duration', async () => {
    mocks.execute.mockRejectedValue(new Error('invalid video'));
    await expect(new FFmpegExecAdapter().getVideoInfo('/video.mp4')).rejects.toThrow('invalid video');
  });

  it('reads actual video metadata and JPEG bytes without a shared temporary file', async () => {
    const thumbnail = Buffer.from([255, 216, 255, 217]);
    mocks.execute.mockImplementation(async command => command === 'ffprobe'
      ? { stdout: JSON.stringify({ streams: [{ width: 360, height: 480 }], format: { duration: '0.5', format_name: 'mov,mp4' } }) }
      : { stdout: thumbnail });
    await expect(new FFmpegExecAdapter().getVideoInfo('/clip with spaces.mp4')).resolves.toEqual({
      width: 360, height: 480, duration: 0.5, format: 'mov,mp4', thumbnail,
    });
  });

  it('uses the native PNG encoder for legacy videos on macOS', async () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const adapter = new FFmpegAddonAdapter('/app');
    const extract = vi.spyOn(adapter, 'extractThumbnail').mockResolvedValue();
    vi.spyOn(FFmpegAdapterFactory, 'getAdapter').mockResolvedValue(adapter);
    await FFmpegService.init('/app', logger);
    await FFmpegService.extractLegacyVideoThumbnail('/video.mp4', '/thumbnail.png');
    expect(extract).toHaveBeenCalledWith('/video.mp4', '/thumbnail.png', 'png');
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('keeps startup available and reports unavailable media until paths are corrected', async () => {
    vi.resetModules();
    const { FFmpegService: service } = await import('@/napcat-core/helper/ffmpeg/ffmpeg');
    mocks.exists.mockReturnValue(false);
    mocks.execute.mockRejectedValue(new Error('ENOENT'));
    await expect(service.init('/app', logger)).resolves.toBeUndefined();
    await expect(service.getDuration('/audio.wav')).rejects.toThrow('ffprobe');
    expect(logger.logError).toHaveBeenCalled();
    mocks.execute.mockResolvedValue({ stdout: '1.5', stderr: '' });
    await service.setFfmpegPath('/installed tools', logger);
    await expect(service.getDuration('/audio.wav')).resolves.toBe(1.5);
  });
});

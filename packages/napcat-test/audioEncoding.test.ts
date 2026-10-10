import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeSilk } from '@/napcat-core/helper/audio';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import type { LogWrapper } from '@/napcat-core/helper/log';

vi.mock('@/napcat-core/helper/ffmpeg/ffmpeg', () => ({
  FFmpegService: { isSilk: vi.fn(), convertToNTSilkTct: vi.fn(), getDuration: vi.fn() },
}));

const logger = { log: vi.fn() } as unknown as LogWrapper;

beforeEach(() => vi.resetAllMocks());

describe('SILK encoding', () => {
  it('reads duration from the encoded output including the final packet', async () => {
    vi.mocked(FFmpegService.isSilk).mockResolvedValue(false);
    vi.mocked(FFmpegService.getDuration).mockResolvedValue(0.02);
    const result = await encodeSilk('/short.wav', '/temp', logger);
    expect(result.converted).toBe(true);
    expect(FFmpegService.convertToNTSilkTct).toHaveBeenCalledWith('/short.wav', result.path);
    expect(FFmpegService.getDuration).toHaveBeenCalledWith(result.path);
    expect(result.duration).toBe(0.02);
  });

  it('propagates a corrupt SILK error without estimating its duration', async () => {
    vi.mocked(FFmpegService.isSilk).mockResolvedValue(true);
    vi.mocked(FFmpegService.getDuration).mockRejectedValue(new Error('corrupt SILK packet'));
    await expect(encodeSilk('/corrupt.silk', '/temp', logger)).rejects.toThrow('corrupt SILK packet');
    expect(FFmpegService.convertToNTSilkTct).not.toHaveBeenCalled();
  });

  it('propagates conversion errors to the caller', async () => {
    vi.mocked(FFmpegService.isSilk).mockResolvedValue(false);
    vi.mocked(FFmpegService.convertToNTSilkTct).mockRejectedValue(new Error('encoder unavailable'));
    await expect(encodeSilk('/audio.wav', '/temp', logger)).rejects.toThrow('encoder unavailable');
    expect(FFmpegService.getDuration).not.toHaveBeenCalled();
  });
});

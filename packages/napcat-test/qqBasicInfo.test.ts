import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QQBasicInfoWrapper } from '@/napcat-core/helper/qq-basic-info';

vi.mock('@/napcat-core/index', () => ({ getMajorPath: vi.fn() }));

describe('QQ AppID lookup', () => {
  let info: QQBasicInfoWrapper;
  const archDescriptor = Object.getOwnPropertyDescriptor(process, 'arch')!;

  beforeEach(() => {
    Object.defineProperty(process, 'arch', { ...archDescriptor, value: 'x64' });
    info = Object.create(QQBasicInfoWrapper.prototype);
    info.context = { logger: { log: vi.fn() } } as QQBasicInfoWrapper['context'];
    vi.spyOn(info, 'getFullQQVersion');
    vi.spyOn(info, 'getAppidV2ByMajor').mockReturnValue('537999999');
  });

  afterEach(() => {
    Object.defineProperty(process, 'arch', archDescriptor);
    vi.restoreAllMocks();
  });

  it.each([
    ['3.2.30-50969', 'x64', 537376344],
    ['3.2.30-50969', 'arm64', 537376345],
    ['3.2.32-52194', 'x64', 537379447],
    ['3.2.32-52194', 'arm64', 537379448],
    ['3.2.33-52892', 'x64', 537382855],
    ['3.2.33-52892', 'arm64', 537382856],
  ] as const)('uses the scanned AppID for Linux %s %s', (version, arch, appid) => {
    Object.defineProperty(process, 'arch', { ...archDescriptor, value: arch });
    vi.mocked(info.getFullQQVersion).mockReturnValue(version);

    expect(info.getAppidV2()).toEqual({
      appid,
      qua: `V1_LNX_NQ_${version.replace('-', '_')}_GW_B`,
    });
    expect(info.getAppidV2ByMajor).not.toHaveBeenCalled();
  });

  it.each([
    ['9.9.33-52230', 537379411],
    ['9.9.35-52892', 537382819],
  ] as const)('finds Windows %s by its actual package version', (version, appid) => {
    vi.mocked(info.getFullQQVersion).mockReturnValue(version);

    expect(info.getAppidV2()).toEqual({
      appid,
      qua: `V1_WIN_NQ_${version.replace('-', '_')}_GW_B`,
    });
    expect(info.getAppidV2ByMajor).not.toHaveBeenCalled();
  });

  it('preserves version-only entries when an architecture override is absent', () => {
    Object.defineProperty(process, 'arch', { ...archDescriptor, value: 'arm64' });
    vi.mocked(info.getFullQQVersion).mockReturnValue('3.2.29-49738');

    expect(info.getAppidV2()).toEqual({
      appid: 537355867,
      qua: 'V1_LNX_NQ_3.2.29_49738_GW_B',
    });
    expect(info.getAppidV2ByMajor).not.toHaveBeenCalled();
  });

  it('still scans major.node for an unknown version', () => {
    vi.mocked(info.getFullQQVersion).mockReturnValue('3.2.99-99999');
    vi.spyOn(info, 'getQUAFallback').mockReturnValue('fallback-qua');

    expect(info.getAppidV2()).toEqual({ appid: '537999999', qua: 'fallback-qua' });
    expect(info.getAppidV2ByMajor).toHaveBeenCalledWith('3.2.99-99999');
  });
});

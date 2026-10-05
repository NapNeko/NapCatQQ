import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import { loadQQWrapper } from '../napcat-core/index';

describe('loadQQWrapper', () => {
  const originalWrapperPath = process.env['NAPCAT_WRAPPER_PATH'];

  beforeEach(() => {
    process.env['NAPCAT_WRAPPER_PATH'] = 'E:\\NapCat\\wrapper.node';
    vi.spyOn(process, 'dlopen').mockImplementation(() => {
      throw new Error('The specified module could not be found.\r\n\\\\?\\E:\\NapCat\\wrapper.node');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWrapperPath === undefined) {
      delete process.env['NAPCAT_WRAPPER_PATH'];
    } else {
      process.env['NAPCAT_WRAPPER_PATH'] = originalWrapperPath;
    }
  });

  test('explains the missing Media Foundation feature on Windows Server', () => {
    vi.spyOn(os, 'platform').mockReturnValue('win32');
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(() => loadQQWrapper(undefined, '9.9.33-52230'))
      .toThrow(/媒体基础.*Install-WindowsFeature Server-Media-Foundation.*The specified module could not be found/s);
  });

  test('keeps the original error when Media Foundation is installed', () => {
    vi.spyOn(os, 'platform').mockReturnValue('win32');
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    expect(() => loadQQWrapper(undefined, '9.9.33-52230')).toThrow(/^The specified module could not be found/);
  });

  test('keeps the original error on other platforms', () => {
    vi.spyOn(os, 'platform').mockReturnValue('linux');
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(() => loadQQWrapper(undefined, '3.2.32-52194')).toThrow(/^The specified module could not be found/);
  });
});

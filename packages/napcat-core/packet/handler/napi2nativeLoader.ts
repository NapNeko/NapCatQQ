import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { constants } from 'node:os';
import { LogWrapper } from '../../helper/log';

export interface BypassOptions {
  hook?: boolean;
  window?: boolean;
  module?: boolean;
  process?: boolean;
  container?: boolean;
  js?: boolean;
}

export interface Napi2NativeExportType {
  initHook?: (send: string, recv: string) => boolean;
  setVerbose?: (verbose: boolean) => void; // 默认关闭日志
  enableAllBypasses?: (options?: BypassOptions) => boolean;
}

export class Napi2NativeLoader {
  private readonly supportedPlatforms = ['win32.x64', 'linux.x64', 'linux.arm64', 'darwin.x64', 'darwin.arm64'];
  private readonly exports: { exports: Napi2NativeExportType; } = { exports: {} };
  protected readonly logger: LogWrapper;
  private _loaded: boolean = false;

  constructor ({ logger }: { logger: LogWrapper; }) {
    this.logger = logger;
    this.load();
  }

  private load (): void {
    const platform = process.platform + '.' + process.arch;

    if (!this.supportedPlatforms.includes(platform)) {
      this.logger.logWarn(`Napi2NativeLoader: 不支持的平台: ${platform}`);
      this._loaded = false;
      return;
    }

    const nativeModulePath = path.join(
      dirname(fileURLToPath(import.meta.url)),
      './native/napi2native/napi2native.' + platform + '.node'
    );

    if (!fs.existsSync(nativeModulePath)) {
      this.logger.logWarn(`Napi2NativeLoader: 缺失运行时文件: ${nativeModulePath}`);
      this._loaded = false;
      return;
    }

    try {
      process.dlopen(this.exports, nativeModulePath, constants.dlopen.RTLD_LAZY);
      this._loaded = true;
      this.logger.log('[Napi2NativeLoader] 加载成功');
    } catch (error) {
      this.logger.logError('Napi2NativeLoader 加载出错:', error);
      this._loaded = false;
    }
  }

  get loaded (): boolean {
    return this._loaded;
  }

  get nativeExports (): Napi2NativeExportType {
    return this.exports.exports;
  }

  /**
   * 初始化 Hook
   * @param send send 偏移地址
   * @param recv recv 偏移地址
   * @returns 是否初始化成功
   */
  initHook (send: string, recv: string): boolean {
    if (!this._loaded) {
      this.logger.logWarn('Napi2NativeLoader 未成功加载，无法初始化 Hook');
      return false;
    }

    try {
      return this.nativeExports.initHook?.(send, recv) ?? false;
    } catch (error) {
      this.logger.logError('Napi2NativeLoader initHook 出错:', error);
      return false;
    }
  }
}

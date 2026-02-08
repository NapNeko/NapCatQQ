/**
 * 插件文件监听器 — 类似 Karin 的 HMR 机制
 *
 * 监听插件目录的文件变化，自动触发热重载。
 * 与 Karin 的 chokidar 监听方案类似，但后端使用进程隔离重载。
 *
 * 参考 Karin: packages/core/src/plugin/admin/hmr.ts
 *   - Karin: 监听 → 卸载旧模块 → 清除缓存 → 重新 import
 *   - NapCat: 监听 → 终止旧 worker → 启动新 worker（彻底隔离）
 */

import fs from 'node:fs';
import path from 'node:path';
import type { LogWrapper } from 'napcat-core/helper/log';

/**
 * 文件变更类型
 */
export type FileChangeAction = 'add' | 'change' | 'unlink';

/**
 * 文件变更事件
 */
export interface FileChangeEvent {
  /** 变更的文件绝对路径 */
  filePath: string;
  /** 插件目录名 */
  pluginDirName: string;
  /** 插件 ID（如果能解析 package.json） */
  pluginId?: string;
  /** 变更类型 */
  action: FileChangeAction;
}

/**
 * 监听器选项
 */
export interface PluginWatcherOptions {
  /** 插件目录路径 */
  pluginPath: string;
  /** 日志器 */
  logger: LogWrapper;
  /** 文件变更回调 */
  onPluginChange: (event: FileChangeEvent) => void | Promise<void>;
  /** 监听的文件扩展名 */
  watchExtensions?: string[];
  /** 防抖延迟（ms） */
  debounceDelay?: number;
}

/**
 * 插件目录文件监听器
 *
 * 使用 Node.js 原生 fs.watch（避免额外依赖 chokidar），
 * 监听插件目录下的文件变化，触发热重载。
 */
export class PluginFileWatcher {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private _isWatching = false;

  private readonly pluginPath: string;
  private readonly logger: LogWrapper;
  private readonly onPluginChange: (event: FileChangeEvent) => void | Promise<void>;
  private readonly watchExtensions: Set<string>;
  private readonly debounceDelay: number;

  constructor (options: PluginWatcherOptions) {
    this.pluginPath = options.pluginPath;
    this.logger = options.logger;
    this.onPluginChange = options.onPluginChange;
    this.watchExtensions = new Set(options.watchExtensions ?? ['.js', '.mjs', '.cjs', '.ts', '.mts', '.json']);
    this.debounceDelay = options.debounceDelay ?? 500;
  }

  get isWatching (): boolean {
    return this._isWatching;
  }

  /**
   * 启动监听
   */
  start (): void {
    if (this._isWatching) return;

    if (!fs.existsSync(this.pluginPath)) {
      this.logger.logWarn(`[PluginWatcher] Plugin directory does not exist: ${this.pluginPath}`);
      return;
    }

    this._isWatching = true;

    // 获取当前所有插件子目录
    const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        this.watchPluginDir(item.name);
      }
    }

    // 同时监听插件根目录（检测新插件目录的添加/删除）
    try {
      const rootWatcher = fs.watch(this.pluginPath, { persistent: false }, (_eventType, filename) => {
        if (!filename) return;
        const dirPath = path.join(this.pluginPath, filename);

        // 检查是否为目录
        try {
          if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            // 新目录添加
            if (!this.watchers.has(filename)) {
              this.watchPluginDir(filename);
              this.emitChange(filename, path.join(dirPath, 'package.json'), 'add');
            }
          }
        } catch {
          // 目录可能已删除
          if (this.watchers.has(filename)) {
            this.unwatchPluginDir(filename);
            this.emitChange(filename, dirPath, 'unlink');
          }
        }
      });

      this.watchers.set('__root__', rootWatcher);
    } catch (error) {
      this.logger.logWarn('[PluginWatcher] Failed to watch root plugin directory:', error);
    }

    this.logger.log(`[PluginWatcher] Watching ${this.watchers.size - 1} plugin directories`);
  }

  /**
   * 停止监听
   */
  stop (): void {
    if (!this._isWatching) return;

    this._isWatching = false;

    // 清除所有防抖定时器
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // 关闭所有 watcher
    for (const [, watcher] of this.watchers) {
      try {
        watcher.close();
      } catch {
        // 忽略关闭错误
      }
    }
    this.watchers.clear();

    this.logger.log('[PluginWatcher] Stopped watching');
  }

  /**
   * 监听单个插件目录
   */
  private watchPluginDir (dirname: string): void {
    const dirPath = path.join(this.pluginPath, dirname);

    try {
      const watcher = fs.watch(dirPath, { recursive: true, persistent: false }, (_eventType, filename) => {
        if (!filename) return;

        // 检查文件扩展名
        const ext = path.extname(filename);
        if (!this.watchExtensions.has(ext)) return;

        // 忽略 node_modules 和隐藏文件
        if (filename.includes('node_modules') || filename.startsWith('.')) return;

        const filePath = path.join(dirPath, filename);
        const action: FileChangeAction = fs.existsSync(filePath) ? 'change' : 'unlink';

        this.emitChange(dirname, filePath, action);
      });

      this.watchers.set(dirname, watcher);
      this.logger.logDebug(`[PluginWatcher] Watching: ${dirname}`);
    } catch (error) {
      this.logger.logWarn(`[PluginWatcher] Failed to watch ${dirname}:`, error);
    }
  }

  /**
   * 停止监听单个插件目录
   */
  private unwatchPluginDir (dirname: string): void {
    const watcher = this.watchers.get(dirname);
    if (watcher) {
      try {
        watcher.close();
      } catch {
        // 忽略
      }
      this.watchers.delete(dirname);
    }
  }

  /**
   * 发射变更事件（带防抖）
   */
  private emitChange (pluginDirName: string, filePath: string, action: FileChangeAction): void {
    // 使用目录名作为防抖 key，同一个插件的多次变更合并
    const debounceKey = pluginDirName;

    const existingTimer = this.debounceTimers.get(debounceKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    this.debounceTimers.set(debounceKey, setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);

      // 尝试读取 plugin id
      let pluginId: string | undefined;
      try {
        const pkgPath = path.join(this.pluginPath, pluginDirName, 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          pluginId = pkg.name;
        }
      } catch {
        // 忽略
      }

      const event: FileChangeEvent = {
        filePath,
        pluginDirName,
        pluginId: pluginId ?? pluginDirName,
        action,
      };

      this.logger.log(`[PluginWatcher] ${action}: ${pluginDirName} → ${path.basename(filePath)}`);

      try {
        await this.onPluginChange(event);
      } catch (error) {
        this.logger.logError(`[PluginWatcher] Error handling change for ${pluginDirName}:`, error);
      }
    }, this.debounceDelay));
  }
}

import fs from 'fs';
import path from 'path';
import { LogWrapper } from 'napcat-core/helper/log';
import {
  PluginPackageJson,
  PluginModule,
  PluginEntry,
  PluginStatusConfig,
} from './types';

/**
 * 插件加载器
 * 负责扫描、加载和导入插件模块
 */
export class PluginLoader {
  constructor (
    private readonly pluginPath: string,
    private readonly configPath: string,
    private readonly logger: LogWrapper
  ) { }

  /**
   * 加载插件状态配置
   */
  loadPluginStatusConfig (): PluginStatusConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch (e) {
        this.logger.logWarn('[PluginLoader] Error parsing plugins.json', e);
      }
    }
    return {};
  }

  /**
   * 保存插件状态配置
   */
  savePluginStatusConfig (config: PluginStatusConfig): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      this.logger.logError('[PluginLoader] Error saving plugins.json', e);
    }
  }

  /**
   * 扫描插件目录，收集所有有效插件条目（异步版本，验证模块有效性）
   * 只有包含有效 plugin_init 函数的插件才会被收集
   */
  async scanPlugins (): Promise<PluginEntry[]> {
    const entries: PluginEntry[] = [];

    // 确保插件目录存在
    if (!fs.existsSync(this.pluginPath)) {
      this.logger.logWarn(`[PluginLoader] Plugin directory does not exist: ${this.pluginPath}`);
      fs.mkdirSync(this.pluginPath, { recursive: true });
      return entries;
    }

    const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });
    const statusConfig = this.loadPluginStatusConfig();

    for (const item of items) {
      if (!item.isDirectory()) {
        continue;
      }

      const entry = this.scanDirectoryPlugin(item.name, statusConfig);
      if (!entry) {
        continue;
      }

      // 如果没有入口文件，跳过
      if (!entry.entryPath) {
        this.logger.logWarn(`[PluginLoader] Skipping ${item.name}: no entry file found`);
        continue;
      }

      // 如果插件被禁用，跳过模块验证，直接添加到列表
      if (!entry.enable) {
        entries.push(entry);
        continue;
      }

      // 验证模块有效性（仅对启用的插件）
      const validation = await this.validatePluginEntry(entry.entryPath);
      if (!validation.valid) {
        this.logger.logWarn(`[PluginLoader] Skipping ${item.name}: ${validation.error}`);
        continue;
      }

      entries.push(entry);
    }

    return entries;
  }

  /**
   * 扫描单个目录插件
   */
  private scanDirectoryPlugin (dirname: string, statusConfig: PluginStatusConfig): PluginEntry | null {
    const pluginDir = path.join(this.pluginPath, dirname);

    try {
      // 尝试读取 package.json
      let packageJson: PluginPackageJson | undefined;
      const packageJsonPath = path.join(pluginDir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
          packageJson = JSON.parse(packageContent);
        } catch (error) {
          this.logger.logWarn(`[PluginLoader] Invalid package.json in ${dirname}:`, error);
        }
      }

      // 获取插件 ID（包名或目录名）
      const pluginId = packageJson?.name || dirname;

      // 确定入口文件
      const entryFile = this.findEntryFile(pluginDir, packageJson);
      const entryPath = entryFile ? path.join(pluginDir, entryFile) : undefined;

      // 获取启用状态（默认启用）
      const enable = statusConfig[pluginId] !== false;

      // 创建插件条目
      const entry: PluginEntry = {
        id: pluginId,
        fileId: dirname,
        name: packageJson?.name,
        version: packageJson?.version,
        description: packageJson?.description,
        author: packageJson?.author,
        pluginPath: pluginDir,
        entryPath,
        packageJson,
        enable,
        loaded: false,
        runtime: {
          status: 'unloaded',
        },
      };

      // 如果没有入口文件，标记为错误
      if (!entryPath) {
        entry.runtime = {
          status: 'error',
          error: `No valid entry file found for plugin directory: ${dirname}`,
        };
      }

      return entry;
    } catch (error: any) {
      // 创建错误条目
      return {
        id: dirname, // 使用目录名作为 ID
        fileId: dirname,
        pluginPath: path.join(this.pluginPath, dirname),
        enable: statusConfig[dirname] !== false,
        loaded: false,
        runtime: {
          status: 'error',
          error: error.message || 'Unknown error during scan',
        },
      };
    }
  }

  /**
   * 查找插件目录的入口文件
   */
  private findEntryFile (pluginDir: string, packageJson?: PluginPackageJson): string | null {
    const possibleEntries = [
      packageJson?.main,
      'index.mjs',
      'index.js',
      'main.mjs',
      'main.js',
    ].filter(Boolean) as string[];

    for (const entry of possibleEntries) {
      const entryPath = path.join(pluginDir, entry);
      if (fs.existsSync(entryPath) && fs.statSync(entryPath).isFile()) {
        return entry;
      }
    }

    return null;
  }

  /**
   * 动态导入模块
   */
  async importModule (filePath: string): Promise<any> {
    const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
    const fileUrlWithQuery = `${fileUrl}?t=${Date.now()}`;
    return await import(fileUrlWithQuery);
  }

  /**
   * 加载插件模块
   */
  async loadPluginModule (entry: PluginEntry): Promise<PluginModule | null> {
    if (!entry.entryPath) {
      entry.runtime = {
        status: 'error',
        error: 'No entry path specified',
      };
      return null;
    }

    try {
      const module = await this.importModule(entry.entryPath);

      if (!this.isValidPluginModule(module)) {
        entry.runtime = {
          status: 'error',
          error: 'Invalid plugin module: missing plugin_init function',
        };
        return null;
      }

      return module;
    } catch (error: any) {
      entry.runtime = {
        status: 'error',
        error: error.message || 'Failed to import module',
      };
      return null;
    }
  }

  /**
   * 检查模块是否为有效的插件模块
   */
  isValidPluginModule (module: any): module is PluginModule {
    return module && typeof module.plugin_init === 'function';
  }

  /**
   * 验证插件入口文件是否包含有效的 plugin_init 函数
   * 用于扫描阶段快速验证
   */
  async validatePluginEntry (entryPath: string): Promise<{ valid: boolean; error?: string; }> {
    try {
      const module = await this.importModule(entryPath);
      if (this.isValidPluginModule(module)) {
        return { valid: true };
      }
      return { valid: false, error: 'Missing plugin_init function' };
    } catch (error: any) {
      return { valid: false, error: error.message || 'Failed to import module' };
    }
  }

  /**
   * 重新扫描单个插件
   */
  rescanPlugin (dirname: string): PluginEntry | null {
    const statusConfig = this.loadPluginStatusConfig();
    return this.scanDirectoryPlugin(dirname, statusConfig);
  }

  /**
   * 通过 ID 查找插件目录名
   */
  findPluginDirById (pluginId: string): string | null {
    if (!fs.existsSync(this.pluginPath)) {
      return null;
    }

    const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const packageJsonPath = path.join(this.pluginPath, item.name, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.name === pluginId) {
            return item.name;
          }
        } catch (e) { }
      }

      // 如果目录名就是 ID
      if (item.name === pluginId) {
        return item.name;
      }
    }

    return null;
  }
}

// 导出类型
export type {
  PluginPackageJson,
  PluginConfigItem,
  PluginConfigSchema,
  INapCatConfigStatic,
  NapCatConfigClass,
  IPluginManager,
  PluginConfigUIController,
  PluginLogger,
  NapCatPluginContext,
  PluginModule,
  PluginRuntimeStatus,
  PluginRuntime,
  PluginEntry,
  PluginStatusConfig,
} from './types';

// 导出配置构建器
export { NapCatConfig } from './config';

// 导出加载器
export { PluginLoader } from './loader';

// 导出进程隔离运行器
export { PluginProcessRunner } from './plugin-process';
export type { IsolatedPluginStatus, PluginProcessOptions, PluginModuleCapabilities } from './plugin-process';

// 导出文件监听器
export { PluginFileWatcher } from './plugin-watcher';
export type { FileChangeEvent, FileChangeAction, PluginWatcherOptions } from './plugin-watcher';

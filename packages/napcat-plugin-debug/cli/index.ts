#!/usr/bin/env node
/**
 * napcat-plugin-debug CLI
 *
 * 连接 NapCat 调试服务 WebSocket，提供：
 * - 插件热重载 (HMR) — 监听文件变更自动重载
 * - 插件管理 — 查看/加载/卸载/重载
 * - 实时事件监听 — 查看 NapCat 消息和通知
 *
 * 用法：
 *   npx napcat-plugin-debug [ws-url] [options]
 *
 * 示例：
 *   npx napcat-plugin-debug                          # 默认连接 ws://127.0.0.1:8998
 *   npx napcat-plugin-debug ws://192.168.1.100:8998  # 连接远程
 *   npx napcat-plugin-debug --token mySecret         # 带认证连接
 *   npx napcat-plugin-debug --watch ./my-plugin      # 监听指定目录并热重载
 *   npx napcat-plugin-debug --watch-all              # 监听所有插件目录
 */

import WebSocket from 'ws';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import { MessageTransport, createDeepProxy } from 'napcat-rpc';

// ======================== 类型定义 ========================

/** 远程插件信息 */
interface RemotePluginInfo {
  id: string;
  fileId: string;
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  pluginPath: string;
  entryPath?: string;
  enable: boolean;
  loaded: boolean;
  runtimeStatus: string;
  runtimeError?: string;
}

/** 远程调试 API（通过 RPC 代理调用） */
interface PluginDebugAPI {
  getPluginPath (): Promise<string>;
  getAllPlugins (): Promise<RemotePluginInfo[]>;
  getLoadedPlugins (): Promise<Array<{ id: string; name?: string; version?: string; loaded: boolean; }>>;
  getPluginInfo (pluginId: string): Promise<RemotePluginInfo | null>;
  setPluginStatus (pluginId: string, enable: boolean): Promise<void>;
  loadPluginById (pluginId: string): Promise<boolean>;
  unregisterPlugin (pluginId: string): Promise<void>;
  reloadPlugin (pluginId: string): Promise<boolean>;
  loadDirectoryPlugin (dirname: string): Promise<void>;
  uninstallPlugin (pluginId: string, cleanData?: boolean): Promise<void>;
  getPluginDataPath (pluginId: string): Promise<string>;
  getPluginConfigPath (pluginId: string): Promise<string>;
  getPluginConfig (): Promise<Record<string, boolean>>;
  ping (): Promise<'pong'>;
  getDebugInfo (): Promise<{
    version: string;
    pluginCount: number;
    loadedCount: number;
    pluginPath: string;
    uptime: number;
  }>;
}

// ======================== 参数解析 ========================

interface CliOptions {
  wsUrl: string;
  token?: string;
  watch?: string;
  watchAll: boolean;
  verbose: boolean;
  noColor: boolean;
}

function parseArgs (): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {
    wsUrl: 'ws://127.0.0.1:8998',
    watchAll: false,
    verbose: false,
    noColor: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--token' || arg === '-t') {
      opts.token = args[++i];
    } else if (arg === '--watch' || arg === '-w') {
      opts.watch = args[++i];
    } else if (arg === '--watch-all' || arg === '-W') {
      opts.watchAll = true;
    } else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true;
    } else if (arg === '--no-color') {
      opts.noColor = true;
    } else if (arg.startsWith('ws://') || arg.startsWith('wss://')) {
      opts.wsUrl = arg;
    }
  }

  return opts;
}

function printHelp (): void {
  console.log(`
napcat-plugin-debug CLI — NapCat 插件调试 & 热重载工具

用法：
  npx napcat-plugin-debug [ws-url] [options]

选项：
  ws://host:port       调试服务 WebSocket 地址 (默认: ws://127.0.0.1:8998)
  -t, --token <token>  认证 token
  -w, --watch <dir>    监听指定插件目录并自动热重载
  -W, --watch-all      监听远程插件目录下所有插件
  -v, --verbose        详细输出
  --no-color           禁用彩色输出
  -h, --help           显示帮助信息

交互命令：
  list / ls            列出所有插件
  reload <id>          重载指定插件
  load <id>            加载指定插件
  unload <id>          卸载指定插件
  info <id>            查看插件详情
  watch <dir>          开始监听目录
  unwatch              停止文件监听
  status               查看调试服务状态
  ping                 心跳检查
  help                 显示帮助
  quit / exit          退出

示例：
  npx napcat-plugin-debug
  npx napcat-plugin-debug ws://192.168.1.100:8998 --token mySecret
  npx napcat-plugin-debug --watch ./my-plugin
  npx napcat-plugin-debug --watch-all
`);
}

// ======================== 颜色输出 ========================

let useColor = true;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function color (text: string, ...codes: string[]): string {
  if (!useColor) return text;
  return codes.join('') + text + c.reset;
}

function log (prefix: string, message: string, ...extra: unknown[]): void {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`${color(time, c.gray)} ${prefix} ${message}`, ...extra);
}

const logInfo = (msg: string, ...extra: unknown[]) => log(color('ℹ', c.blue), msg, ...extra);
const logOk = (msg: string, ...extra: unknown[]) => log(color('✓', c.green), msg, ...extra);
const logWarn = (msg: string, ...extra: unknown[]) => log(color('⚠', c.yellow), msg, ...extra);
const logErr = (msg: string, ...extra: unknown[]) => log(color('✗', c.red), msg, ...extra);
const logHmr = (msg: string, ...extra: unknown[]) => log(color('🔥', c.magenta), color(msg, c.magenta), ...extra);

// ======================== 文件监听器 ========================

interface FileWatcher {
  start (): void;
  stop (): void;
  isWatching: boolean;
  watchPath: string;
}

function createFileWatcher (
  watchPath: string,
  onPluginChange: (pluginDirName: string, filePath: string) => void,
  verbose: boolean,
): FileWatcher {
  const watchers: Map<string, fs.FSWatcher> = new Map();
  const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  let _isWatching = false;

  const WATCH_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.json']);
  const DEBOUNCE_DELAY = 500;

  function watchPluginDir (dirname: string): void {
    const dirPath = path.join(watchPath, dirname);
    try {
      const watcher = fs.watch(dirPath, { recursive: true, persistent: false }, (_eventType, filename) => {
        if (!filename) return;
        const ext = path.extname(filename);
        if (!WATCH_EXTENSIONS.has(ext)) return;
        if (filename.includes('node_modules') || filename.startsWith('.')) return;

        // 防抖
        const key = dirname;
        const existing = debounceTimers.get(key);
        if (existing) clearTimeout(existing);

        debounceTimers.set(key, setTimeout(() => {
          debounceTimers.delete(key);
          onPluginChange(dirname, path.join(dirPath, filename));
        }, DEBOUNCE_DELAY));
      });

      watchers.set(dirname, watcher);
      if (verbose) logInfo(`Watching: ${dirname}`);
    } catch (err) {
      logWarn(`Failed to watch ${dirname}: ${err}`);
    }
  }

  return {
    get isWatching () { return _isWatching; },
    get watchPath () { return watchPath; },

    start () {
      if (_isWatching) return;
      if (!fs.existsSync(watchPath)) {
        logErr(`Watch path does not exist: ${watchPath}`);
        return;
      }

      _isWatching = true;

      // 判断监听单个插件还是整个插件目录
      const hasPkgJson = fs.existsSync(path.join(watchPath, 'package.json'));
      if (hasPkgJson) {
        // 单个插件目录 — 监听其父目录中的这个子目录
        const parentDir = path.dirname(watchPath);
        const dirName = path.basename(watchPath);

        // 直接监听这个目录
        try {
          const watcher = fs.watch(watchPath, { recursive: true, persistent: false }, (_eventType, filename) => {
            if (!filename) return;
            const ext = path.extname(filename);
            if (!WATCH_EXTENSIONS.has(ext)) return;
            if (filename.includes('node_modules') || filename.startsWith('.')) return;

            const key = dirName;
            const existing = debounceTimers.get(key);
            if (existing) clearTimeout(existing);

            debounceTimers.set(key, setTimeout(() => {
              debounceTimers.delete(key);
              onPluginChange(dirName, path.join(watchPath, filename));
            }, DEBOUNCE_DELAY));
          });
          watchers.set(dirName, watcher);
        } catch (err) {
          logErr(`Failed to watch plugin directory: ${err}`);
        }

        logHmr(`Watching plugin: ${dirName} (${watchPath})`);
      } else {
        // 监听整个插件目录的所有子文件夹
        const items = fs.readdirSync(watchPath, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            watchPluginDir(item.name);
          }
        }
        logHmr(`Watching ${watchers.size} plugin(s) in ${watchPath}`);
      }
    },

    stop () {
      if (!_isWatching) return;
      _isWatching = false;
      for (const timer of debounceTimers.values()) clearTimeout(timer);
      debounceTimers.clear();
      for (const [, watcher] of watchers) {
        try { watcher.close(); } catch { /* ignore */ }
      }
      watchers.clear();
      logInfo('File watching stopped');
    },
  };
}

// ======================== 主逻辑 ========================

async function main (): Promise<void> {
  const opts = parseArgs();
  useColor = !opts.noColor && process.stdout.isTTY !== false;

  console.log(color('\n  napcat-plugin-debug CLI', c.bold, c.cyan));
  console.log(color('  NapCat 插件调试 & 热重载工具\n', c.dim));

  // 构建 WebSocket URL
  let wsUrl = opts.wsUrl;
  if (opts.token) {
    const url = new URL(wsUrl);
    url.searchParams.set('token', opts.token);
    wsUrl = url.toString();
  }

  logInfo(`Connecting to ${color(opts.wsUrl, c.cyan)}...`);

  // 建立 WebSocket 连接
  const ws = new WebSocket(wsUrl);
  let rpcClient: PluginDebugAPI | null = null;
  let transport: MessageTransport | null = null;
  let fileWatcher: FileWatcher | null = null;
  let remotePluginPath: string | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // 解析插件目录名到 ID 的映射
  const dirNameToId = new Map<string, string>();

  async function refreshDirMapping (): Promise<void> {
    if (!rpcClient) return;
    try {
      const plugins = await rpcClient.getAllPlugins();
      dirNameToId.clear();
      for (const p of plugins) {
        dirNameToId.set(p.fileId, p.id);
      }
    } catch { /* ignore */ }
  }

  async function handlePluginChange (dirName: string, filePath: string): Promise<void> {
    if (!rpcClient) return;

    await refreshDirMapping();
    const pluginId = dirNameToId.get(dirName) ?? dirName;

    logHmr(`Change detected: ${color(pluginId, c.bold)} (${path.basename(filePath)})`);

    try {
      const success = await rpcClient.reloadPlugin(pluginId);
      if (success) {
        logOk(`Plugin ${color(pluginId, c.green, c.bold)} reloaded successfully`);
      } else {
        logWarn(`Plugin ${pluginId} reload returned false (may be disabled)`);
      }
    } catch (err: any) {
      logErr(`Failed to reload ${pluginId}: ${err.message}`);
    }
  }

  ws.on('open', () => {
    logOk('Connected to debug server');
  });

  ws.on('message', async (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'welcome') {
        logOk(`Server v${msg.data.version}, ${msg.data.pluginCount} plugin(s) registered`);

        // 建立 RPC 通道
        transport = new MessageTransport({
          sendMessage: (message: string) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'rpc', data: message }));
            }
          },
          onMessage: (handler: (message: string) => void) => {
            ws.on('message', (innerRaw: Buffer) => {
              try {
                const innerMsg = JSON.parse(innerRaw.toString());
                if (innerMsg && innerMsg.type === 'rpc' && innerMsg.data) {
                  handler(innerMsg.data);
                }
              } catch { /* ignore */ }
            });
          },
        });

        rpcClient = createDeepProxy<PluginDebugAPI>({ transport });

        // 获取远程信息
        try {
          const info = await rpcClient.getDebugInfo();
          remotePluginPath = info.pluginPath;
          logInfo(`Remote plugin path: ${color(info.pluginPath, c.dim)}`);
          logInfo(`Plugins: ${info.loadedCount}/${info.pluginCount} loaded, uptime: ${Math.floor(info.uptime)}s`);
        } catch (err: any) {
          logWarn('Failed to get debug info:', err.message);
        }

        // 启动文件监听
        if (opts.watch) {
          const watchPath = path.resolve(opts.watch);
          fileWatcher = createFileWatcher(watchPath, handlePluginChange, opts.verbose);
          fileWatcher.start();
        } else if (opts.watchAll && remotePluginPath) {
          fileWatcher = createFileWatcher(remotePluginPath, handlePluginChange, opts.verbose);
          fileWatcher.start();
        }

        // 启动交互式命令
        startInteractiveMode(rpcClient, {
          getFileWatcher: () => fileWatcher,
          setFileWatcher: (w) => { fileWatcher = w; },
          remotePluginPath,
          verbose: opts.verbose,
          handlePluginChange,
        });

      } else if (msg.type === 'event') {
        if (opts.verbose) {
          const eventType = msg.data?.eventType || 'unknown';
          logInfo(`Event [${eventType}]:`, JSON.stringify(msg.data).substring(0, 120));
        }
      }
    } catch { /* ignore malformed messages */ }
  });

  ws.on('close', (code: number, reason: Buffer) => {
    logWarn(`Disconnected (code: ${code}, reason: ${reason.toString() || 'none'})`);
    fileWatcher?.stop();
    transport?.close();
    rpcClient = null;

    if (code !== 1000) {
      logInfo('Reconnecting in 3s...');
      reconnectTimer = setTimeout(() => {
        logInfo('Attempting reconnection...');
        // 简单的重连策略：退出并提示用户重启
        logErr('Auto-reconnect not implemented, please restart CLI');
        process.exit(1);
      }, 3000);
    } else {
      process.exit(0);
    }
  });

  ws.on('error', (err: Error) => {
    logErr(`Connection error: ${err.message}`);
  });

  // 退出清理
  process.on('SIGINT', () => {
    console.log('');
    logInfo('Shutting down...');
    fileWatcher?.stop();
    transport?.close();
    ws.close(1000);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    process.exit(0);
  });
}

// ======================== 交互模式 ========================

interface InteractiveContext {
  getFileWatcher (): FileWatcher | null;
  setFileWatcher (w: FileWatcher | null): void;
  remotePluginPath: string | null;
  verbose: boolean;
  handlePluginChange: (dirName: string, filePath: string) => Promise<void>;
}

function startInteractiveMode (api: PluginDebugAPI, ctx: InteractiveContext): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: color('napcat-debug> ', c.cyan),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    const [cmd, ...args] = input.split(/\s+/);

    try {
      switch (cmd.toLowerCase()) {
        case 'list':
        case 'ls': {
          const plugins = await api.getAllPlugins();
          if (plugins.length === 0) {
            logInfo('No plugins found');
          } else {
            console.log('');
            console.log(color('  ID', c.bold) + ' '.repeat(30) + color('Version', c.bold) + '   ' + color('Status', c.bold));
            console.log('  ' + '─'.repeat(60));
            for (const p of plugins) {
              const id = (p.id || p.fileId).padEnd(32);
              const ver = (p.version || '-').padEnd(10);
              const status = p.loaded
                ? color('● loaded', c.green)
                : p.enable
                  ? color('○ enabled', c.yellow)
                  : color('○ disabled', c.dim);
              console.log(`  ${id}${ver}${status}`);
            }
            console.log('');
          }
          break;
        }

        case 'reload': {
          const pluginId = args[0];
          if (!pluginId) { logErr('Usage: reload <plugin-id>'); break; }
          logInfo(`Reloading ${pluginId}...`);
          const ok = await api.reloadPlugin(pluginId);
          ok ? logOk(`${pluginId} reloaded`) : logWarn(`${pluginId} reload returned false`);
          break;
        }

        case 'load': {
          const pluginId = args[0];
          if (!pluginId) { logErr('Usage: load <plugin-id>'); break; }
          logInfo(`Loading ${pluginId}...`);
          const ok = await api.loadPluginById(pluginId);
          ok ? logOk(`${pluginId} loaded`) : logWarn(`${pluginId} load returned false`);
          break;
        }

        case 'unload': {
          const pluginId = args[0];
          if (!pluginId) { logErr('Usage: unload <plugin-id>'); break; }
          logInfo(`Unloading ${pluginId}...`);
          await api.unregisterPlugin(pluginId);
          logOk(`${pluginId} unloaded`);
          break;
        }

        case 'info': {
          const pluginId = args[0];
          if (!pluginId) { logErr('Usage: info <plugin-id>'); break; }
          const info = await api.getPluginInfo(pluginId);
          if (!info) {
            logErr(`Plugin ${pluginId} not found`);
          } else {
            console.log('');
            console.log(`  ${color('ID:', c.bold)}          ${info.id}`);
            console.log(`  ${color('Name:', c.bold)}        ${info.name || '-'}`);
            console.log(`  ${color('Version:', c.bold)}     ${info.version || '-'}`);
            console.log(`  ${color('Description:', c.bold)} ${info.description || '-'}`);
            console.log(`  ${color('Author:', c.bold)}      ${info.author || '-'}`);
            console.log(`  ${color('Path:', c.bold)}        ${info.pluginPath}`);
            console.log(`  ${color('Entry:', c.bold)}       ${info.entryPath || '-'}`);
            console.log(`  ${color('Enabled:', c.bold)}     ${info.enable}`);
            console.log(`  ${color('Loaded:', c.bold)}      ${info.loaded}`);
            console.log(`  ${color('Status:', c.bold)}      ${info.runtimeStatus}`);
            if (info.runtimeError) {
              console.log(`  ${color('Error:', c.bold)}       ${color(info.runtimeError, c.red)}`);
            }
            console.log('');
          }
          break;
        }

        case 'watch': {
          const watchDir = args[0];
          if (!watchDir) { logErr('Usage: watch <directory>'); break; }

          // 停止现有监听
          ctx.getFileWatcher()?.stop();

          const watchPath = path.resolve(watchDir);
          const watcher = createFileWatcher(watchPath, ctx.handlePluginChange, ctx.verbose);
          watcher.start();
          ctx.setFileWatcher(watcher);
          break;
        }

        case 'unwatch': {
          const watcher = ctx.getFileWatcher();
          if (watcher?.isWatching) {
            watcher.stop();
            ctx.setFileWatcher(null);
            logOk('File watching stopped');
          } else {
            logInfo('Not currently watching any files');
          }
          break;
        }

        case 'status': {
          const info = await api.getDebugInfo();
          const watcher = ctx.getFileWatcher();
          console.log('');
          console.log(`  ${color('Server:', c.bold)}      v${info.version}`);
          console.log(`  ${color('Plugins:', c.bold)}     ${info.loadedCount}/${info.pluginCount} loaded`);
          console.log(`  ${color('Plugin Path:', c.bold)} ${info.pluginPath}`);
          console.log(`  ${color('Uptime:', c.bold)}      ${Math.floor(info.uptime)}s`);
          console.log(`  ${color('HMR:', c.bold)}         ${watcher?.isWatching ? color('active', c.green) + ` (${watcher.watchPath})` : color('inactive', c.dim)}`);
          console.log('');
          break;
        }

        case 'ping': {
          const start = Date.now();
          const result = await api.ping();
          const latency = Date.now() - start;
          logOk(`${result} (${latency}ms)`);
          break;
        }

        case 'help': {
          console.log(`
  ${color('命令列表:', c.bold)}
    list, ls           列出所有插件
    reload <id>        重载插件
    load <id>          加载插件
    unload <id>        卸载插件
    info <id>          查看插件详情
    watch <dir>        监听目录并自动热重载
    unwatch            停止文件监听
    status             查看服务状态
    ping               心跳检查
    help               显示帮助
    quit, exit         退出
`);
          break;
        }

        case 'quit':
        case 'exit':
        case 'q': {
          logInfo('Bye!');
          ctx.getFileWatcher()?.stop();
          process.exit(0);
          break;
        }

        default:
          logWarn(`Unknown command: ${cmd}. Type 'help' for available commands.`);
      }
    } catch (err: any) {
      logErr(`Command failed: ${err.message}`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    ctx.getFileWatcher()?.stop();
    process.exit(0);
  });
}

// ======================== 入口 ========================

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { constants } from 'node:os';
import { LogWrapper } from 'napcat-common/src/log';
import offset from '@/napcat-core/external/packet.json';
interface OffsetType {
  [key: string]: {
    recv: string;
    send: string;
  };
}

const typedOffset: OffsetType = offset;
// 0 send 1 recv
export interface NativePacketExportType {
  initHook?: (send: string, recv: string, callback: (type: PacketType, uin: string, cmd: string, seq: number, hex_data: string) => void, o3_hook: boolean) => boolean;
}

export type PacketType = 0 | 1; // 0: send, 1: recv
export type PacketCallback = (data: { type: PacketType, uin: string, cmd: string, seq: number, hex_data: string; }) => void;

interface ListenerEntry {
  callback: PacketCallback;
  once: boolean;
}

export class NativePacketHandler {
  private readonly supportedPlatforms = ['win32.x64', 'linux.x64', 'linux.arm64', 'darwin.x64', 'darwin.arm64'];
  private readonly MoeHooExport: { exports: NativePacketExportType; } = { exports: {} };
  protected readonly logger: LogWrapper;
  private loaded: boolean = false;

  // 统一的监听器存储 - key: 'all' | 'type:0' | 'type:1' | 'cmd:xxx' | 'exact:type:cmd'
  private readonly listeners: Map<string, Set<ListenerEntry>> = new Map();

  constructor ({ logger }: { logger: LogWrapper; }) {
    this.logger = logger;
    try {
      const platform = process.platform + '.' + process.arch;
      const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './native/packet/MoeHoo.' + platform + '.node');
      if (!fs.existsSync(moehoo_path)) {
        this.logger.logWarn(`NativePacketClient: 缺失运行时文件: ${moehoo_path}`);
        this.loaded = false;
      }
      process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
      this.loaded = true;
      this.logger.log('[PacketHandler] 加载成功');
    } catch (error) {
      this.logger.logError('NativePacketClient 加载出错:', error);
      this.loaded = false;
    }

  }

  /**
     * 添加监听器的通用方法
     */
  private addListener (key: string, callback: PacketCallback, once: boolean = false): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    const entry: ListenerEntry = { callback, once };
    this.listeners.get(key)!.add(entry);
    return () => this.removeListener(key, callback);
  }

  /**
     * 移除监听器的通用方法
     */
  private removeListener (key: string, callback: PacketCallback): boolean {
    const entries = this.listeners.get(key);
    if (!entries) return false;

    for (const entry of entries) {
      if (entry.callback === callback) {
        return entries.delete(entry);
      }
    }
    return false;
  }

  // ===== 永久监听器 =====

  /** 监听所有数据包 */
  onAll (callback: PacketCallback): () => void {
    return this.addListener('all', callback);
  }

  /** 监听特定类型的数据包 (0: send, 1: recv) */
  onType (type: PacketType, callback: PacketCallback): () => void {
    return this.addListener(`type:${type}`, callback);
  }

  /** 监听所有发送的数据包 */
  onSend (callback: PacketCallback): () => void {
    return this.onType(0, callback);
  }

  /** 监听所有接收的数据包 */
  onRecv (callback: PacketCallback): () => void {
    return this.onType(1, callback);
  }

  /** 监听特定cmd的数据包(不限type) */
  onCmd (cmd: string, callback: PacketCallback): () => void {
    return this.addListener(`cmd:${cmd}`, callback);
  }

  /** 监听特定type和cmd的数据包(精确匹配) */
  onExact (type: PacketType, cmd: string, callback: PacketCallback): () => void {
    return this.addListener(`exact:${type}:${cmd}`, callback);
  }

  // ===== 一次性监听器 =====

  /** 一次性监听所有数据包 */
  onceAll (callback: PacketCallback): () => void {
    return this.addListener('all', callback, true);
  }

  /** 一次性监听特定类型的数据包 */
  onceType (type: PacketType, callback: PacketCallback): () => void {
    return this.addListener(`type:${type}`, callback, true);
  }

  /** 一次性监听所有发送的数据包 */
  onceSend (callback: PacketCallback): () => void {
    return this.onceType(0, callback);
  }

  /** 一次性监听所有接收的数据包 */
  onceRecv (callback: PacketCallback): () => void {
    return this.onceType(1, callback);
  }

  /** 一次性监听特定cmd的数据包 */
  onceCmd (cmd: string, callback: PacketCallback): () => void {
    return this.addListener(`cmd:${cmd}`, callback, true);
  }

  /** 一次性监听特定type和cmd的数据包 */
  onceExact (type: PacketType, cmd: string, callback: PacketCallback): () => void {
    return this.addListener(`exact:${type}:${cmd}`, callback, true);
  }

  // ===== 移除监听器 =====

  /** 移除特定的全局监听器 */
  off (key: string, callback: PacketCallback): boolean {
    return this.removeListener(key, callback);
  }

  /** 移除特定key下的所有监听器 */
  offAll (key: string): void {
    this.listeners.delete(key);
  }

  /** 移除所有监听器 */
  removeAllListeners (): void {
    this.listeners.clear();
  }

  /**
     * 触发监听器 - 按优先级触发: 精确匹配 > cmd匹配 > type匹配 > 全局
     */
  private emitPacket (type: PacketType, uin: string, cmd: string, seq: number, hex_data: string): void {
    const keys = [
      `exact:${type}:${cmd}`,  // 精确匹配
      `cmd:${cmd}`,            // cmd匹配
      `type:${type}`,          // type匹配
      'all',                    // 全局
    ];

    for (const key of keys) {
      const entries = this.listeners.get(key);
      if (!entries) continue;

      const toRemove: ListenerEntry[] = [];
      for (const entry of entries) {
        try {
          entry.callback({ type, uin, cmd, seq, hex_data });
          if (entry.once) {
            toRemove.push(entry);
          }
        } catch (error) {
          this.logger.logError('监听器回调执行出错:', error);
        }
      }

      // 移除一次性监听器
      for (const entry of toRemove) {
        entries.delete(entry);
      }
    }
  }

  async init (version: string): Promise<boolean> {
    const version_arch = version + '-' + process.arch;
    try {
      if (!this.loaded) {
        this.logger.logWarn('NativePacketClient 未成功加载，无法初始化');
        return false;
      }
      const send = typedOffset[version_arch]?.send;
      const recv = typedOffset[version_arch]?.recv;
      if (!send || !recv) {
        this.logger.logWarn(`NativePacketClient: 未找到对应版本的偏移数据: ${version_arch}`);
        return false;
      }
      const platform = process.platform + '.' + process.arch;
      if (!this.supportedPlatforms.includes(platform)) {
        this.logger.logWarn(`NativePacketClient: 不支持的平台: ${platform}`);
        return false;
      }

      this.MoeHooExport.exports.initHook?.(send, recv, (type: PacketType, uin: string, cmd: string, seq: number, hex_data: string) => {
        this.emitPacket(type, uin, cmd, seq, hex_data);
      }, true);
      this.logger.log('[PacketHandler] 初始化成功');
      return true;
    } catch (error) {
      this.logger.logError('NativePacketClient 初始化出错:', error);
      return false;
    }
  }
}

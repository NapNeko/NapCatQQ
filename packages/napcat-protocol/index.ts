/**
 * NapCat Protocol Manager
 *
 * 统一管理 OneBot 和 Satori 协议适配器
 *
 * @example
 * ```typescript
 * import { ProtocolManager } from 'napcat-protocol';
 *
 * const protocolManager = new ProtocolManager(core, context, pathWrapper);
 *
 * // 初始化所有协议
 * await protocolManager.initAllProtocols();
 *
 * // 或者只初始化特定协议
 * await protocolManager.initProtocol('onebot11');
 * await protocolManager.initProtocol('satori');
 *
 * // 获取协议适配器
 * const onebotAdapter = protocolManager.getOneBotAdapter();
 * const satoriAdapter = protocolManager.getSatoriAdapter();
 *
 * // 获取原始适配器实例
 * const rawOneBot = onebotAdapter?.getRawAdapter();
 * const rawSatori = satoriAdapter?.getRawAdapter();
 * ```
 */

export * from './types';
export * from './manager';
export * from './adapters';

// 重新导出原始适配器类型，方便使用
export { NapCatOneBot11Adapter } from 'napcat-onebot/index';
export { NapCatSatoriAdapter } from 'napcat-satori/index';

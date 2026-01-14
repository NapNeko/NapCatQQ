import { InstanceContext, NapCatCore } from 'napcat-core';
import { NapCatPathWrapper } from 'napcat-common/src/path';

/**
 * 协议适配器基础接口
 */
export interface IProtocolAdapter {
  /** 协议名称 */
  readonly name: string;
  /** 协议ID */
  readonly id: string;
  /** 协议版本 */
  readonly version: string;
  /** 协议描述 */
  readonly description: string;

  /** 初始化协议适配器 */
  init (): Promise<void>;
  /** 销毁协议适配器 */
  destroy (): Promise<void>;
  /** 重载配置 */
  reloadConfig (prevConfig: unknown, newConfig: unknown): Promise<void>;
}

/**
 * 协议适配器工厂接口
 */
export interface IProtocolAdapterFactory<T extends IProtocolAdapter = IProtocolAdapter> {
  /** 协议ID */
  readonly protocolId: string;
  /** 协议名称 */
  readonly protocolName: string;
  /** 协议版本 */
  readonly protocolVersion: string;
  /** 协议描述 */
  readonly protocolDescription: string;

  /** 创建协议适配器实例 */
  create (
    core: NapCatCore,
    context: InstanceContext,
    pathWrapper: NapCatPathWrapper
  ): T;
}

/**
 * 协议信息
 */
export interface ProtocolInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}

/**
 * 协议管理器配置变更回调
 */
export type ProtocolConfigChangeCallback = (
  protocolId: string,
  prevConfig: unknown,
  newConfig: unknown
) => Promise<void>;

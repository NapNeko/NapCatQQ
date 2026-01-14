// 协议管理器 - 用于统一管理多协议适配

export interface ProtocolInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
}

export interface ProtocolConfig {
  protocols: {
    [key: string]: {
      enabled: boolean;
      config: unknown;
    };
  };
}

export const SUPPORTED_PROTOCOLS: ProtocolInfo[] = [
  {
    id: 'onebot11',
    name: 'OneBot 11',
    description: 'OneBot 11 协议适配器，兼容 go-cqhttp',
    version: '11.0.0',
    enabled: true,
  },
  {
    id: 'satori',
    name: 'Satori',
    description: 'Satori 协议适配器，跨平台机器人协议',
    version: '1.0.0',
    enabled: false,
  },
];

export function getProtocolInfo (protocolId: string): ProtocolInfo | undefined {
  return SUPPORTED_PROTOCOLS.find((p) => p.id === protocolId);
}

export function getSupportedProtocols (): ProtocolInfo[] {
  return SUPPORTED_PROTOCOLS;
}

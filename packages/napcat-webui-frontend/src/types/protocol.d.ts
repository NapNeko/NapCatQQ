// 协议相关类型定义

interface ProtocolInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
}

// Satori 配置类型
interface SatoriAdapterConfig {
  name: string;
  enable: boolean;
  debug: boolean;
  token: string;
}

interface SatoriWebSocketServerConfig extends SatoriAdapterConfig {
  host: string;
  port: number;
  path: string;
  heartInterval: number;
}

interface SatoriHttpServerConfig extends SatoriAdapterConfig {
  host: string;
  port: number;
  path: string;
}

interface SatoriWebHookClientConfig extends SatoriAdapterConfig {
  url: string;
}

interface SatoriNetworkConfig {
  websocketServers: SatoriWebSocketServerConfig[];
  httpServers: SatoriHttpServerConfig[];
  webhookClients: SatoriWebHookClientConfig[];
}

interface SatoriConfig {
  network: SatoriNetworkConfig;
  platform: string;
  selfId: string;
}

type SatoriNetworkConfigKey = keyof SatoriNetworkConfig;
